import { Response, NextFunction } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { AsyncLocalStorage } from "async_hooks";
import { Prisma } from "@prisma/client";
import logger from "../utils/logger";
import prisma from "../config/prisma";

export interface AuditContext {
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
}

// Async local storage for audit context
export const auditContext = new AsyncLocalStorage<AuditContext>();

/**
 * Express middleware to capture audit context
 */
export const setAuditContext = (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  const context: AuditContext = {
    userId: req.payload?.id || undefined,
    ipAddress: req.ip || req.socket?.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
  };

  auditContext.enterWith(context);
  next();
};

/**
 * Setup Prisma Client Extension for automatic audit logging
 */
export function createAuditExtension() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: "audit-logger",
      query: {
        $allModels: {
          async create({ args, query, model }: any) {
            const result = await query(args);
            if (model === "AuditLog") return result;

            const context = auditContext.getStore();

            // ✅ run logAudit OUTSIDE transaction
            logAudit(
              prisma,
              model,
              result.id,
              "CREATE",
              null,
              result,
              context
            ).catch((err) =>
              logger.error(`Audit log failed for CREATE ${model}:`, err)
            );

            return result;
          },

          async update({ args, query, model }: any) {
            if (model === "AuditLog") {
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
            const context = auditContext.getStore();

            // ✅ run logAudit OUTSIDE transaction
            if (oldRecord) {
              logAudit(
                prisma,
                model,
                oldRecord.id,
                "UPDATE",
                oldRecord,
                result,
                context
              ).catch((err) =>
                logger.error(`Audit log failed for UPDATE ${model}:`, err)
              );
            }

            return result;
          },

          async delete({ args, query, model }: any) {
            if (model === "AuditLog") {
              return query(args);
            }

            let oldRecord = null;
            try {
              oldRecord = await (client as any)[model].findUnique({
                where: args.where,
              });
            } catch (error) {
              logger.error(
                `Failed to fetch record before delete for ${model}:`,
                error
              );
            }

            const result = await query(args);
            const context = auditContext.getStore();

            // ✅ run logAudit OUTSIDE transaction
            if (oldRecord) {
              logAudit(
                prisma,
                model,
                oldRecord.id,
                "DELETE",
                oldRecord,
                null,
                context
              ).catch((err) =>
                logger.error(`Audit log failed for DELETE ${model}:`, err)
              );
            }

            return result;
          },

          async updateMany({ args, query, model }: any) {
            if (model === "AuditLog") {
              return query(args);
            }

            let affectedRecords: any[] = [];
            try {
              affectedRecords = await (client as any)[model].findMany({
                where: args.where,
              });
            } catch (error) {
              logger.error(
                `Failed to fetch records for updateMany ${model}:`,
                error
              );
            }

            const result = await query(args);

            if (affectedRecords.length > 0) {
              logger.info(
                `Audit: Updated ${affectedRecords.length} records in ${model}`
              );
            }

            return result;
          },

          async deleteMany({ args, query, model }: any) {
            if (model === "AuditLog") {
              return query(args);
            }

            let affectedRecords: any[] = [];
            try {
              affectedRecords = await (client as any)[model].findMany({
                where: args.where,
              });
            } catch (error) {
              logger.error(
                `Failed to fetch records for deleteMany ${model}:`,
                error
              );
            }

            const result = await query(args);
            const context = auditContext.getStore();

            if (affectedRecords.length > 0) {
              logger.info(
                `Audit: Deleted ${affectedRecords.length} records from ${model}`
              );

              for (const record of affectedRecords) {
                // ✅ run logAudit OUTSIDE transaction
                logAudit(
                  prisma,
                  model,
                  record.id,
                  "DELETE",
                  record,
                  null,
                  context
                ).catch((err) =>
                  logger.error(
                    `Audit log failed for DELETE ${model}#${record.id}:`,
                    err
                  )
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

// ============================================================================
// CONFIGURATION: Child table names that belong to HSEdumateContacts
// ============================================================================
const EDUMATE_CHILD_TABLES = [
  "HSEdumateContactsApplicationJourney",
  "HSEdumateContactsAcademicProfiles",
  "HSEdumateContactsFinancialInfo",
  "HSEdumateContactsLeadAttribution",
  "HSEdumateContactsLoanPreferences",
  "HSEdumateContactsPersonalInformation",
  "HSEdumateContactsSystemTracking",
];

const EDUMATE_PARENT_TABLE = "HSEdumateContacts";

// ============================================================================
// PARENT UPDATE DEBOUNCING
// ============================================================================

interface PendingParentUpdate {
  timeout: NodeJS.Timeout;
  context?: AuditContext;
  triggeredBy: Set<string>; // Track which child tables triggered this
  triggerActions: Set<"CREATE" | "UPDATE" | "DELETE">;
}

// Map to track pending parent updates: contactId -> update info
const pendingParentUpdates = new Map<number, PendingParentUpdate>();

// Debounce delay in milliseconds (adjust as needed - 200-500ms recommended)
const PARENT_UPDATE_DEBOUNCE_MS = 300;

/**
 * Schedule a parent contact update with debouncing
 * Multiple calls for the same contactId within the debounce window will be batched
 */
function scheduleParentUpdate(
  contactId: number,
  context?: AuditContext,
  triggerTable?: string,
  triggerAction?: "CREATE" | "UPDATE" | "DELETE"
): void {
  // If there's already a pending update for this contact, clear it
  const existing = pendingParentUpdates.get(contactId);

  if (existing) {
    clearTimeout(existing.timeout);
    // Accumulate the trigger information
    if (triggerTable) existing.triggeredBy.add(triggerTable);
    if (triggerAction) existing.triggerActions.add(triggerAction);
  }

  // Create or update the pending update
  const triggeredBy = existing?.triggeredBy || new Set<string>();
  const triggerActions =
    existing?.triggerActions || new Set<"CREATE" | "UPDATE" | "DELETE">();

  if (triggerTable) triggeredBy.add(triggerTable);
  if (triggerAction) triggerActions.add(triggerAction);

  // Schedule the actual update
  const timeout = setTimeout(async () => {
    // Remove from pending map
    pendingParentUpdates.delete(contactId);

    // Execute the parent update
    await executeParentUpdate(
      contactId,
      context,
      Array.from(triggeredBy),
      Array.from(triggerActions)
    );
  }, PARENT_UPDATE_DEBOUNCE_MS);

  // Store the pending update
  pendingParentUpdates.set(contactId, {
    timeout,
    context,
    triggeredBy,
    triggerActions,
  });

  logger.debug(
    `⏱️ Scheduled parent update for contact #${contactId} (triggered by: ${Array.from(
      triggeredBy
    ).join(", ")})`
  );
}

/**
 * Execute the actual parent contact update
 */
async function executeParentUpdate(
  contactId: number,
  context?: AuditContext,
  triggeredBy?: string[],
  triggerActions?: ("CREATE" | "UPDATE" | "DELETE")[]
): Promise<void> {
  try {
    const oldParent = await prisma.hSEdumateContacts.findUnique({
      where: { id: contactId },
    });

    if (!oldParent) {
      logger.warn(
        `⚠️ Parent contact #${contactId} not found for timestamp update`
      );
      return;
    }

    const updatedParent = await prisma.hSEdumateContacts.update({
      where: { id: contactId },
      data: { created_at: new Date(), updated_at: new Date() },
    });

    // ✅ IMPORTANT: use root prisma (not tx) so it never fails on closed tx
    await prisma.auditLog.create({
      data: {
        table_name: EDUMATE_PARENT_TABLE,
        record_id: String(contactId),
        action: "UPDATE",
        old_values: sanitizeForJson(oldParent),
        new_values: sanitizeForJson(updatedParent),
        changed_fields: ["created_at", "updated_at"],
        changed_by: context?.userId || null,
        ip_address: context?.ipAddress || null,
        user_agent: context?.userAgent || null,
        metadata: {
          triggered_by: triggeredBy || ["unknown"],
          trigger_actions: triggerActions || ["unknown"],
          auto_updated: true,
          batched_updates: triggeredBy ? triggeredBy.length : 1,
        },
      },
    });

    logger.info(
      `✅ Parent Updated: HSEdumateContacts#${contactId} timestamp updated (batched from ${
        triggeredBy?.length || 1
      } child table(s): ${triggeredBy?.join(", ") || "unknown"})`
    );
  } catch (error) {
    logger.error(`❌ Failed to update parent contact #${contactId}:`, error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractContactId(oldValues: any, newValues: any): number | null {
  if (newValues?.contact_id != null) {
    return Number(newValues.contact_id);
  }
  if (oldValues?.contact_id != null) {
    return Number(oldValues.contact_id);
  }
  return null;
}

// ============================================================================
// MAIN AUDIT LOGGING FUNCTION (runs OUTSIDE tx now)
// ============================================================================

async function logAudit(
  client: any,
  tableName: string,
  recordId: any,
  action: "CREATE" | "UPDATE" | "DELETE",
  oldValues: any,
  newValues: any,
  context?: AuditContext
): Promise<void> {
  try {
    const { fields, hasChanges } = getChangedFields(oldValues, newValues);
    if (action === "UPDATE" && !hasChanges) {
      logger.debug(
        `⏭️ Skipping audit for ${tableName}#${recordId} - no changes detected`
      );
      return;
    }

    await client.auditLog.create({
      data: {
        table_name: tableName,
        record_id: String(recordId),
        action,
        old_values: oldValues ? sanitizeForJson(oldValues) : null,
        new_values: newValues ? sanitizeForJson(newValues) : null,
        changed_fields: fields,
        changed_by: context?.userId || null,
        ip_address: context?.ipAddress || null,
        user_agent: context?.userAgent || null,
        metadata: null,
      },
    });

    logger.debug(
      `✅ Audit: ${action} ${tableName}#${recordId} - ${fields.length} field(s) changed`
    );

    // ✅ NEW: Use debounced parent update scheduling
    if (EDUMATE_CHILD_TABLES.includes(tableName)) {
      const contactId = extractContactId(oldValues, newValues);
      if (contactId) {
        scheduleParentUpdate(contactId, context, tableName, action);
      }
    }
  } catch (error) {
    logger.error(
      `❌ Failed to create audit log for ${tableName}#${recordId}:`,
      error
    );
  }
}

// ============================================================================
// UTILS
// ============================================================================

function getChangedFields(
  oldValues: any,
  newValues: any
): { fields: string[]; hasChanges: boolean } {
  const fields: string[] = [];

  if (!oldValues && !newValues) return { fields, hasChanges: false };

  if (!oldValues && newValues) {
    return {
      fields: Object.keys(newValues).filter(
        (key) => !["created_at", "updated_at"].includes(key)
      ),
      hasChanges: true,
    };
  }

  if (oldValues && !newValues) {
    return { fields: [], hasChanges: true };
  }

  const allKeys = new Set([
    ...Object.keys(oldValues),
    ...Object.keys(newValues),
  ]);

  allKeys.forEach((key) => {
    if (["created_at", "updated_at"].includes(key)) return;
    if (!areValuesEqual(oldValues?.[key], newValues?.[key])) {
      fields.push(key);
    }
  });

  return { fields, hasChanges: fields.length > 0 };
}

function areValuesEqual(val1: any, val2: any): boolean {
  if (val1 === val2) return true;
  if (val1 instanceof Date && val2 instanceof Date) {
    return val1.getTime() === val2.getTime();
  }
  if (typeof val1 === "object" || typeof val2 === "object") {
    return JSON.stringify(val1) === JSON.stringify(val2);
  }
  return false;
}

function sanitizeForJson(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(sanitizeForJson);
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeForJson(obj[key]);
    }
    return sanitized;
  }
  return obj;
}
