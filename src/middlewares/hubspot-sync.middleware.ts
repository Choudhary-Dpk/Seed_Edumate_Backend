// src/middleware/hubspot-sync.middleware.ts

import { Prisma } from "@prisma/client";
import logger from "../utils/logger";

// Tables to track
const SYNC_MODELS = [
  "HSEdumateContacts",
  "HSEdumateContactsPersonalInformation",
  "HSEdumateContactsAcademicProfiles",
  "HSEdumateContactsLeadAttribution",
  "HSEdumateContactsFinancialInfo",
  "HSEdumateContactsLoanPreferences",
  "HSEdumateContactsApplicationJourney",
  "HSEdumateContactsSystemTracking",
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
  'last_synced_at',
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
 * Check if table is normalized
 */
function isNormalizedTable(tableName: string): boolean {
  const normalizedTables = [
    "HSEdumateContactsPersonalInformation",
    "HSEdumateContactsAcademicProfiles",
    "HSEdumateContactsLeadAttribution",
    "HSEdumateContactsFinancialInfo",
    "HSEdumateContactsLoanPreferences",
    "HSEdumateContactsApplicationJourney",
    "HSEdumateContactsSystemTracking",
  ];
  
  return normalizedTables.includes(tableName);
}

/**
 * Prisma Extension for HubSpot Sync
 */
export function createHubSpotSyncExtension() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: "hubspot-sync",
      query: {
        $allModels: {
          // Handle CREATE
          async create({ args, query, model }: any) {
            const result = await query(args);
            if (!SYNC_MODELS.includes(model)) {
              return result;
            }

            try {
              await createOutboxEntry(
                client,
                model,
                result.id || result.contact_id,
                "CREATE",
                result
              );
            } catch (error) {
              logger.error(`Sync outbox failed for CREATE ${model}:`, error);
            }

            return result;
          },

          // Handle UPDATE
          async update({ args, query, model }: any) {
            if (!SYNC_MODELS.includes(model)) {
              return query(args);
            }

            // ✅ Skip if only system fields
            if (isOnlySystemFieldUpdate(args)) {
              logger.debug(`Skipping sync for system field update: ${model}`);
              return query(args);
            }

            let oldRecord = null;
            try {
              oldRecord = await (client as any)[model].findUnique({
                where: args.where,
              });
            } catch (error) {
              logger.error(`Failed to fetch old record for ${model}:`, error);
            }

            const result = await query(args);

            if (oldRecord) {
              try {
                await createOutboxEntry(
                  client,
                  model,
                  oldRecord.id || oldRecord.contact_id,
                  "UPDATE",
                  result
                );
              } catch (error) {
                logger.error(`Sync outbox failed for UPDATE ${model}:`, error);
              }
            }

            return result;
          },

          // Handle DELETE
          async delete({ args, query, model }: any) {
            if (!SYNC_MODELS.includes(model)) {
              return query(args);
            }

            let oldRecord = null;
            try {
              oldRecord = await (client as any)[model].findUnique({
                where: args.where,
              });
            } catch (error) {
              logger.error(`Failed to fetch record before delete for ${model}:`, error);
            }

            const result = await query(args);

            if (oldRecord) {
              try {
                await createOutboxEntry(
                  client,
                  model,
                  oldRecord.id || oldRecord.contact_id,
                  "DELETE",
                  oldRecord
                );
              } catch (error) {
                logger.error(`Sync outbox failed for DELETE ${model}:`, error);
              }
            }

            return result;
          },

          // Handle CREATE MANY
          async createMany({ args, query, model }: any) {
            if (!SYNC_MODELS.includes(model)) {
              return query(args);
            }

            const result = await query(args);
            logger.info(`CreateMany detected for ${model}: ${result.count} records`);
            
            return result;
          },
        },
      },
    });
  });
}

/**
 * Create outbox entry
 */
async function createOutboxEntry(
  client: any,
  tableName: string,
  recordId: any,
  operation: "CREATE" | "UPDATE" | "DELETE",
  data: any
): Promise<void> {
  try {
    // ✅ If normalized table, handle differently
    if (isNormalizedTable(tableName)) {
      await handleNormalizedTableChange(client, tableName, recordId, operation, data);
      return;
    }

    // Main contact table entry
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
      `✅ Outbox Entry: ${operation} ${tableName}#${recordId} created`
    );
  } catch (error) {
    logger.error(
      `Failed to create outbox entry for ${tableName}#${recordId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle normalized table changes
 */
async function handleNormalizedTableChange(
  client: any,
  tableName: string,
  recordId: any,
  operation: string,
  data: any
): Promise<void> {
  try {
    const contactId = data.contact_id || recordId;
    
    if (!contactId) {
      logger.warn(`No contact_id found for ${tableName}#${recordId}`);
      return;
    }

    // Check for existing pending entry
    const existingEntry = await client.syncOutbox.findFirst({
      where: {
        entity_type: "HSEdumateContacts",
        entity_id: contactId,
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
        `Updated pending entry for HSEdumateContacts#${contactId} (${tableName} changed)`
      );
    } else {
      // Create new
      await client.syncOutbox.create({
        data: {
          entity_type: "HSEdumateContacts",
          entity_id: contactId,
          operation: "UPDATE",
          payload: { triggered_by: tableName },
          status: "PENDING",
          priority: 5,
          created_at: new Date(),
        },
      });
      
      logger.debug(
        `Created outbox for HSEdumateContacts#${contactId} (${tableName} ${operation})`
      );
    }
  } catch (error) {
    logger.error(`Failed to handle normalized table change:`, error);
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