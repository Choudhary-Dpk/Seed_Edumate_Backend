// ==========================================
// middlewares/audit.middleware.ts
// UPDATED FOR PRISMA v5+ (using $extends instead of $use)
// ==========================================

import { Response, NextFunction } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { AsyncLocalStorage } from "async_hooks";
import { Prisma } from "@prisma/client";
import logger from "../utils/logger";

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
    userId: req.payload?.id || undefined, // Handle undefined payload
    ipAddress: req.ip || req.socket?.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
  };

  // Run rest of request inside this context
  auditContext.enterWith(context);
  next();
};

/**
 * Setup Prisma Client Extension for automatic audit logging
 * This works with Prisma v5+
 */
export function createAuditExtension() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: "audit-logger",
      query: {
        // Apply to all models
        $allModels: {
          // Handle CREATE operations
          async create({ args, query, model }: any) {
            const result = await query(args);

            // Skip AuditLog table itself
            if (model === "AuditLog") return result;

            const context = auditContext.getStore();

            try {
              await logAudit(
                client,
                model,
                result.id,
                "CREATE",
                null,
                result,
                context
              );
            } catch (error) {
              logger.error(`Audit log failed for CREATE ${model}:`, error);
            }

            return result;
          },

          // Handle UPDATE operations
          async update({ args, query, model }: any) {
            // Skip AuditLog table itself
            if (model === "AuditLog") {
              return query(args);
            }

            const context = auditContext.getStore();

            // Fetch old record before update
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
                await logAudit(
                  client,
                  model,
                  oldRecord.id,
                  "UPDATE",
                  oldRecord,
                  result,
                  context
                );
              } catch (error) {
                logger.error(`Audit log failed for UPDATE ${model}:`, error);
              }
            }

            return result;
          },

          // Handle DELETE operations
          async delete({ args, query, model }: any) {
            // Skip AuditLog table itself
            if (model === "AuditLog") {
              return query(args);
            }

            const context = auditContext.getStore();

            // Fetch record before deletion
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

            if (oldRecord) {
              try {
                await logAudit(
                  client,
                  model,
                  oldRecord.id,
                  "DELETE",
                  oldRecord,
                  null,
                  context
                );
              } catch (error) {
                logger.error(`Audit log failed for DELETE ${model}:`, error);
              }
            }

            return result;
          },

          // Handle UPDATE MANY
          async updateMany({ args, query, model }: any) {
            if (model === "AuditLog") {
              return query(args);
            }

            // Fetch affected records before update
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

          // Handle DELETE MANY
          async deleteMany({ args, query, model }: any) {
            if (model === "AuditLog") {
              return query(args);
            }

            const context = auditContext.getStore();

            // Fetch records before deletion
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

            if (affectedRecords.length > 0) {
              logger.info(
                `Audit: Deleted ${affectedRecords.length} records from ${model}`
              );

              // Log each deletion
              for (const record of affectedRecords) {
                try {
                  await logAudit(
                    client,
                    model,
                    record.id,
                    "DELETE",
                    record,
                    null,
                    context
                  );
                } catch (error) {
                  logger.error(
                    `Audit log failed for DELETE ${model}#${record.id}:`,
                    error
                  );
                }
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
 * Helper function to log audit entry
 */
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

    // Skip if UPDATE with no actual changes
    if (action === "UPDATE" && !hasChanges) {
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
      },
    });

    logger.debug(
      `✅ Audit: ${action} ${tableName}#${recordId} - ${fields.length} fields changed`
    );
  } catch (error) {
    logger.error(
      `Failed to create audit log for ${tableName}#${recordId}:`,
      error
    );
  }
}

/**
 * Get changed fields between old and new values
 */
function getChangedFields(
  oldValues: any,
  newValues: any
): { fields: string[]; hasChanges: boolean } {
  const fields: string[] = [];

  if (!oldValues && !newValues) {
    return { fields, hasChanges: false };
  }

  // CREATE - all fields are "changed"
  if (!oldValues && newValues) {
    return {
      fields: Object.keys(newValues).filter(
        (key) => !["created_at", "updated_at"].includes(key)
      ),
      hasChanges: true,
    };
  }

  // DELETE - no field changes to track
  if (oldValues && !newValues) {
    return { fields: [], hasChanges: true };
  }

  // UPDATE - compare fields
  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ]);

  allKeys.forEach((key) => {
    if (["created_at", "updated_at"].includes(key)) {
      return;
    }

    const oldValue = oldValues?.[key];
    const newValue = newValues?.[key];

    if (!areValuesEqual(oldValue, newValue)) {
      fields.push(key);
    }
  });

  return { fields, hasChanges: fields.length > 0 };
}

/**
 * Compare two values for equality
 */
function areValuesEqual(val1: any, val2: any): boolean {
  if (val1 === null && val2 === null) return true;
  if (val1 === undefined && val2 === undefined) return true;
  if (
    (val1 === null || val1 === undefined) &&
    (val2 === null || val2 === undefined)
  )
    return true;
  if (
    val1 === null ||
    val1 === undefined ||
    val2 === null ||
    val2 === undefined
  )
    return false;

  if (val1 instanceof Date && val2 instanceof Date) {
    return val1.getTime() === val2.getTime();
  }

  if (typeof val1 === "object" || typeof val2 === "object") {
    return JSON.stringify(val1) === JSON.stringify(val2);
  }

  return val1 === val2;
}

/**
 * Sanitize object for JSON storage
 */
function sanitizeForJson(obj: any): any {
  if (obj === null || obj === undefined) return null;

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForJson(item));
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeForJson(obj[key]);
    }
    return sanitized;
  }

  return obj;
}
