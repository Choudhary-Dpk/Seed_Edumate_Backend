// src/middleware/hubspot-commission-sync.middleware.ts

import { Prisma } from "@prisma/client";
import logger from "../utils/logger";

// Tables to track for Commission Settlements
const COMMISSION_SYNC_MODELS = [
  "HSCommissionSettlements",
  "HSCommissionSettlementsCommissionCalculation",
  "HSCommissionSettlementsCommunication",
  "HSCommissionSettlementsTaxAndDeductions",
  "HSCommissionSettlementsDocumentation",
  "HSCommissionSettlementsHoldAndDisputes",
  "HSCommissionSettlementsLoanDetails",
  "HSCommissionSettlementsPaymentProcessing",
  "HSCommissionSettlementsPerformanceAnalytics",
  "HSCommissionSettlementsReconciliations",
  "HSCommissionSettlementsSettlementStatus",
  "HSCommissionSettlementsSystemTracking",
  "HSCommissionSettlementsTransactionDetails",
];

// System fields that shouldn't trigger sync
const SYSTEM_FIELDS = [
  "hs_object_id",
  "hs_created_by_user_id",
  "hs_createdate",
  "hs_lastmodifieddate",
  "hs_updated_by_user_id",
  "hubspot_owner_id",
  "updated_at",
  "created_at",
];

/**
 * Check if only system fields are being updated
 */
function isOnlySystemFieldUpdate(args: any): boolean {
  if (!args?.data) return false;

  const updatingFields = Object.keys(args.data);

  return updatingFields.every((field) => SYSTEM_FIELDS.includes(field));
}

/**
 * Check if table is normalized (child table)
 */
function isNormalizedTable(tableName: string): boolean {
  const normalizedTables = [
    "HSCommissionSettlementsCommissionCalculation",
    "HSCommissionSettlementsCommunication",
    "HSCommissionSettlementsTaxAndDeductions",
    "HSCommissionSettlementsDocumentation",
    "HSCommissionSettlementsHoldAndDisputes",
    "HSCommissionSettlementsLoanDetails",
    "HSCommissionSettlementsPaymentProcessing",
    "HSCommissionSettlementsPerformanceAnalytics",
    "HSCommissionSettlementsReconciliations",
    "HSCommissionSettlementsSettlementStatus",
    "HSCommissionSettlementsSystemTracking",
    "HSCommissionSettlementsTransactionDetails",
  ];

  return normalizedTables.includes(tableName);
}

/**
 * Prisma Extension for Commission Settlement HubSpot Sync
 */
export function createCommissionHubSpotSyncExtension() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: "hubspot-commission-sync",
      query: {
        $allModels: ({
          // Handle CREATE
          async create({ args, query, model }: any) {
            console.log("Commission Sync Middleware - CREATE:", {
              model,
              args,
            });
            
            const result = await query(args);
            if (!COMMISSION_SYNC_MODELS.includes(model)) {
              return result;
            }
            
            if (args?.data?.source === "hubspot") {
              logger.debug(
                `Skipping commission sync for HubSpot-source UPDATE: ${model}`
              );
              return result;
            }

            try {
              await createCommissionOutboxEntry(
                client,
                model,
                result.id || result.settlement_id,
                "CREATE",
                result
              );
            } catch (error) {
              logger.error(
                `Commission sync outbox failed for CREATE ${model}:`,
                error
              );
            }

            return result;
          },

          // Handle UPDATE
          async update({ args, query, model }: any) {
            console.log("Commission Sync Middleware - UPDATE:", {
              model,
              args,
            });

            if (!COMMISSION_SYNC_MODELS.includes(model)) {
              return query(args);
            }

            if (args?.data?.source === "hubspot") {
              logger.debug(
                `Skipping commission sync for HubSpot-source UPDATE: ${model}`
              );
              return query(args);
            }

            // ✅ Skip if only system fields
            if (isOnlySystemFieldUpdate(args)) {
              logger.debug(
                `Skipping commission sync for system field update: ${model}`
              );
              return query(args);
            }

            let oldRecord = null;
            try {
              oldRecord = await (client as any)[model].findUnique({
                where: args.where,
              });
            } catch (error) {
              logger.error(
                `Failed to fetch old commission record for ${model}:`,
                error
              );
            }

            const result = await query(args);

            if (oldRecord) {
              try {
                await createCommissionOutboxEntry(
                  client,
                  model,
                  oldRecord.id || oldRecord.settlement_id,
                  "UPDATE",
                  result
                );
              } catch (error) {
                logger.error(
                  `Commission sync outbox failed for UPDATE ${model}:`,
                  error
                );
              }
            }

            return result;
          },

          // Handle DELETE
          async delete({ args, query, model }: any) {
            if (!COMMISSION_SYNC_MODELS.includes(model)) {
              return query(args);
            }

            let oldRecord = null;
            try {
              oldRecord = await (client as any)[model].findUnique({
                where: args.where,
              });
            } catch (error) {
              logger.error(
                `Failed to fetch commission record before delete for ${model}:`,
                error
              );
            }

            const result = await query(args);

            if (oldRecord) {
              try {
                await createCommissionOutboxEntry(
                  client,
                  model,
                  oldRecord.id || oldRecord.settlement_id,
                  "DELETE",
                  oldRecord
                );
              } catch (error) {
                logger.error(
                  `Commission sync outbox failed for DELETE ${model}:`,
                  error
                );
              }
            }

            return result;
          },
        } as any),
      },
    });
  });
}

/**
 * Create outbox entry for Commission Settlement
 */
async function createCommissionOutboxEntry(
  client: any,
  tableName: string,
  recordId: any,
  operation: "CREATE" | "UPDATE" | "DELETE",
  data: any
): Promise<void> {
  try {
    console.log("Creating outbox entry for:", {
      tableName,
      recordId,
      operation,
    });
    // ✅ If normalized table, handle differently
    if (isNormalizedTable(tableName)) {
      await handleNormalizedCommissionTableChange(
        client,
        tableName,
        recordId,
        operation,
        data
      );
      return;
    }

    // Main commission settlement table entry
    await client.syncOutbox.create({
      data: {
        entity_type: tableName,
        entity_id: recordId, // ✅ Convert to string
        operation: operation,
        payload: sanitizeForJson(data),
        status: "PENDING",
        priority: 5,
        created_at: new Date(),
      },
    });

    logger.debug(
      `✅ Commission Outbox Entry: ${operation} ${tableName}#${recordId} created`
    );
  } catch (error) {
    logger.error(
      `Failed to create commission outbox entry for ${tableName}#${recordId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle normalized commission table changes
 */
async function handleNormalizedCommissionTableChange(
  client: any,
  tableName: string,
  recordId: any,
  operation: string,
  data: any
): Promise<void> {
  try {
    const settlementId = data.settlement_id || recordId;

    if (!settlementId) {
      logger.warn(`No settlement_id found for ${tableName}#${recordId}`);
      return;
    }

    // Check for existing pending entry
    const existingEntry = await client.syncOutbox.findFirst({
      where: {
        entity_type: "HSCommissionSettlements",
        entity_id: settlementId, // ✅ Convert to string
        status: "PENDING",
      },
    });

    if (existingEntry) {
      // Update existing
      await client.syncOutbox.update({
        where: { id: existingEntry.id },
        data: { updated_at: new Date() },
      });

      logger.debug(
        `Updated pending entry for HSCommissionSettlements#${settlementId} (${tableName} changed)`
      );
    } else {
      // Create new
      await client.syncOutbox.create({
        data: {
          entity_type: "HSCommissionSettlements",
          entity_id: settlementId,
          operation: "UPDATE",
          payload: { triggered_by: tableName },
          status: "PENDING",
          priority: 5,
          created_at: new Date(),
        },
      });

      logger.debug(
        `Created outbox for HSCommissionSettlements#${settlementId} (${tableName} ${operation})`
      );
    }
  } catch (error) {
    logger.error(`Failed to handle normalized commission table change:`, error);
    throw error;
  }
}

/**
 * Sanitize for JSON
 */
function sanitizeForJson(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map((item) => sanitizeForJson(item));

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeForJson(obj[key]);
    }
    return sanitized;
  }

  return obj;
}
