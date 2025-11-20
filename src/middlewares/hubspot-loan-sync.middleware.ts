// src/middleware/hubspot-loan-sync.middleware.ts

import { Prisma } from "@prisma/client";
import logger from "../utils/logger";

// Tables to track for Loan Applications
const LOAN_SYNC_MODELS = [
  "HSLoanApplications",
  "HSLoanApplicationsAcademicDetails",
  "HSLoanApplicationsFinancialRequirements",
  "HSLoanApplicationsStatus",
  "HSLoanApplicationsLenderInformation",
  "HSLoanApplicationsDocumentManagement",
  "HSLoanApplicationsProcessingTimeline",
  "HSLoanApplicationsRejectionDetails",
  "HSLoanApplicationsCommunicationPreferences",
  "HSLoanApplicationsSystemTracking",
  "HSLoanApplicationsCommissionRecords",
  "HSLoanApplicationsAdditionalServices",
  "HSLoanApplicationsStatus",
];

// System fields that shouldn't trigger sync
const SYSTEM_FIELDS = [
  'hs_object_id',
  'hs_created_by_user_id',
  'hs_createdate',
  'hs_lastmodifieddate',
  'hs_updated_by_user_id',
  'hubspot_owner_id',
  'updated_at',
  'created_at',
];

/**
 * Check if only system fields are being updated
 */
function isOnlySystemFieldUpdate(args: any): boolean {
  if (!args?.data) return false;
  
  const updatingFields = Object.keys(args.data);
  
  return updatingFields.every(field => SYSTEM_FIELDS.includes(field));
}

/**
 * Check if table is normalized (child table)
 */
function isNormalizedTable(tableName: string): boolean {
  const normalizedTables = [
    "HSLoanApplicationsAcademicDetails",
    "HSLoanApplicationsFinancialRequirements",
    "HSLoanApplicationsStatus",
    "HSLoanApplicationsLenderInformation",
    "HSLoanApplicationsDocumentManagement",
    "HSLoanApplicationsProcessingTimeline",
    "HSLoanApplicationsRejectionDetails",
    "HSLoanApplicationsCommunicationPreferences",
    "HSLoanApplicationsSystemTracking",
    "HSLoanApplicationsCommissionRecords",
    "HSLoanApplicationsAdditionalServices",
    "HSLoanApplicationsStatus",
  ];
  
  return normalizedTables.includes(tableName);
}

/**
 * Prisma Extension for Loan Application HubSpot Sync
 */
export function createLoanHubSpotSyncExtension() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: "hubspot-loan-sync",
      query: {
        $allModels: {
          // Handle CREATE
          async create({ args, query, model }: any) {
            debugger;
            const result = await query(args);
            if (!LOAN_SYNC_MODELS.includes(model)) {
              return result;
            }

            try {
              await createLoanOutboxEntry(
                client,
                model,
                result.id || result.loan_application_id,
                "CREATE",
                result
              );
            } catch (error) {
              logger.error(
                `Loan sync outbox failed for CREATE ${model}:`,
                error
              );
            }

            return result;
          },

          // Handle UPDATE
          async update({ args, query, model }: any) {
            console.log("Loan Sync Middleware - UPDATE:", { model, args });
            if (!LOAN_SYNC_MODELS.includes(model)) {
              return query(args);
            }

            // ✅ Skip if only system fields
            if (isOnlySystemFieldUpdate(args)) {
              logger.debug(
                `Skipping loan sync for system field update: ${model}`
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
                `Failed to fetch old loan record for ${model}:`,
                error
              );
            }

            const result = await query(args);

            if (oldRecord) {
              try {
                await createLoanOutboxEntry(
                  client,
                  model,
                  oldRecord.id || oldRecord.loan_application_id,
                  "UPDATE",
                  result
                );
              } catch (error) {
                logger.error(
                  `Loan sync outbox failed for UPDATE ${model}:`,
                  error
                );
              }
            }

            return result;
          },

          // Handle DELETE
          async delete({ args, query, model }: any) {
            if (!LOAN_SYNC_MODELS.includes(model)) {
              return query(args);
            }

            let oldRecord = null;
            try {
              oldRecord = await (client as any)[model].findUnique({
                where: args.where,
              });
            } catch (error) {
              logger.error(
                `Failed to fetch loan record before delete for ${model}:`,
                error
              );
            }

            const result = await query(args);

            if (oldRecord) {
              try {
                await createLoanOutboxEntry(
                  client,
                  model,
                  oldRecord.id || oldRecord.loan_application_id,
                  "DELETE",
                  oldRecord
                );
              } catch (error) {
                logger.error(
                  `Loan sync outbox failed for DELETE ${model}:`,
                  error
                );
              }
            }

            return result;
          },
        },
      },
    });
  });
}

/**
 * Create outbox entry for Loan Application
 */
async function createLoanOutboxEntry(
  client: any,
  tableName: string,
  recordId: any,
  operation: "CREATE" | "UPDATE" | "DELETE",
  data: any
): Promise<void> {
  try {
    debugger;
    console.log("Creating outbox entry for:", {
      tableName,
      recordId,
      operation,
    });
    // ✅ If normalized table, handle differently
    if (isNormalizedTable(tableName)) {
      await handleNormalizedLoanTableChange(
        client,
        tableName,
        recordId,
        operation,
        data
      );
      return;
    }

    // Main loan application table entry
    await client.syncOutbox.create({
      data: {
        entity_type: tableName,
        entity_id: recordId,
        operation: operation,
        payload: sanitizeForJson(data),
        status: "PENDING",
        priority: 5,
        created_at: new Date(),
      },
    });

    logger.debug(
      `✅ Loan Outbox Entry: ${operation} ${tableName}#${recordId} created`
    );
  } catch (error) {
    logger.error(
      `Failed to create loan outbox entry for ${tableName}#${recordId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle normalized loan table changes
 */
async function handleNormalizedLoanTableChange(
  client: any,
  tableName: string,
  recordId: any,
  operation: string,
  data: any
): Promise<void> {
  try {
    const loanApplicationId = data.loan_application_id || recordId;

    if (!loanApplicationId) {
      logger.warn(`No loan_application_id found for ${tableName}#${recordId}`);
      return;
    }

    // Check for existing pending entry
    const existingEntry = await client.syncOutbox.findFirst({
      where: {
        entity_type: "HSLoanApplications",
        entity_id: loanApplicationId,
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
        `Updated pending entry for HSLoanApplications#${loanApplicationId} (${tableName} changed)`
      );
    } else {
      // Create new
      await client.syncOutbox.create({
        data: {
          entity_type: "HSLoanApplications",
          entity_id: loanApplicationId,
          operation: "UPDATE",
          payload: { triggered_by: tableName },
          status: "PENDING",
          priority: 5,
          created_at: new Date(),
        },
      });
      
      logger.debug(
        `Created outbox for HSLoanApplications#${loanApplicationId} (${tableName} ${operation})`
      );
    }
  } catch (error) {
    logger.error(`Failed to handle normalized loan table change:`, error);
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
  if (Array.isArray(obj)) return obj.map(item => sanitizeForJson(item));
  
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeForJson(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
}
