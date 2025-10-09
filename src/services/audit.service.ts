// services/audit.service.ts

import prisma from "../config/prisma";
import logger from "../utils/logger";

export interface AuditContext {
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Manually create audit log (if needed outside of automatic tracking)
   */
  static async createAuditLog(
    tableName: string,
    recordId: string | number,
    action: "CREATE" | "UPDATE" | "DELETE",
    oldValues: any,
    newValues: any,
    context?: AuditContext
  ): Promise<void> {
    try {
      const { fields, hasChanges } = this.getChangedFields(
        oldValues,
        newValues
      );

      // Skip if UPDATE with no actual changes
      if (action === "UPDATE" && !hasChanges) {
        return;
      }

      await (prisma as any).auditLog.create({
        data: {
          table_name: tableName,
          record_id: String(recordId),
          action,
          old_values: oldValues || null,
          new_values: newValues || null,
          changed_fields: fields,
          changed_by: context?.userId || null,
          ip_address: context?.ipAddress || null,
          user_agent: context?.userAgent || null,
        },
      });

      logger.debug(`Audit log created: ${action} on ${tableName}#${recordId}`);
    } catch (error) {
      logger.error("Failed to create audit log:", error);
    }
  }

  /**
   * Get audit history for a specific record
   */
  static async getRecordHistory(
    tableName: string,
    recordId: string | number
  ): Promise<any[]> {
    return (prisma as any).auditLog.findMany({
      where: {
        table_name: tableName,
        record_id: String(recordId),
      },
      orderBy: { changed_at: "desc" },
    });
  }

  /**
   * Get all changes by a specific user
   */
  static async getUserActivity(userId: number, limit = 100): Promise<any[]> {
    return (prisma as any).auditLog.findMany({
      where: { changed_by: userId },
      orderBy: { changed_at: "desc" },
      take: limit,
    });
  }

  /**
   * Get recent changes for a table or across all tables
   */
  static async getRecentChanges(
    tableName?: string,
    limit = 50
  ): Promise<any[]> {
    return (prisma as any).auditLog.findMany({
      where: tableName ? { table_name: tableName } : undefined,
      orderBy: { changed_at: "desc" },
      take: limit,
    });
  }

  /**
   * Get detailed change information with field-level diff
   */
  static async getDetailedRecordHistory(
    tableName: string,
    recordId: string | number
  ): Promise<any[]> {
    const logs = await (prisma as any).auditLog.findMany({
      where: {
        table_name: tableName,
        record_id: String(recordId),
      },
      orderBy: { changed_at: "desc" },
    });

    // Enhance with field-level details
    return logs.map((log: any) => ({
      ...log,
      fieldChanges: log.changed_fields.map((field: string) => ({
        field,
        oldValue: log.old_values?.[field],
        newValue: log.new_values?.[field],
      })),
    }));
  }

  /**
   * Search audit logs with advanced filters
   */
  static async searchAuditLogs(filters: {
    tableName?: string;
    recordId?: string;
    action?: string;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    searchField?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      tableName,
      recordId,
      action,
      userId,
      startDate,
      endDate,
      searchField,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    if (tableName) where.table_name = tableName;
    if (recordId) where.record_id = recordId;
    if (action) where.action = action;
    if (userId) where.changed_by = userId;

    if (startDate || endDate) {
      where.changed_at = {};
      if (startDate) where.changed_at.gte = startDate;
      if (endDate) where.changed_at.lte = endDate;
    }

    if (searchField) {
      where.changed_fields = {
        has: searchField,
      };
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      (prisma as any).auditLog.findMany({
        where,
        orderBy: { changed_at: "desc" },
        take: limit,
        skip,
      }),
      (prisma as any).auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get statistics for audit logs
   */
  static async getAuditStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalLogs, recentLogs, byAction, byTable] = await Promise.all([
      (prisma as any).auditLog.count(),
      (prisma as any).auditLog.count({
        where: { changed_at: { gte: startDate } },
      }),
      (prisma as any).auditLog.groupBy({
        by: ["action"],
        _count: true,
        where: { changed_at: { gte: startDate } },
      }),
      (prisma as any).auditLog.groupBy({
        by: ["table_name"],
        _count: true,
        where: { changed_at: { gte: startDate } },
        orderBy: { _count: { table_name: "desc" } },
        take: 10,
      }),
    ]);

    const activeUsers = await (prisma as any).auditLog.groupBy({
      by: ["changed_by"],
      _count: true,
      where: {
        changed_at: { gte: startDate },
        changed_by: { not: null },
      },
      orderBy: { _count: { changed_by: "desc" } },
      take: 10,
    });

    return {
      period: `Last ${days} days`,
      totalLogs,
      recentLogs,
      byAction,
      byTable,
      activeUsers,
    };
  }

  /**
   * Helper: Get changed fields between old and new values
   */
  private static getChangedFields(
    oldValues: any,
    newValues: any
  ): { fields: string[]; hasChanges: boolean } {
    const fields: string[] = [];

    if (!oldValues && !newValues) {
      return { fields, hasChanges: false };
    }

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
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {}),
    ]);

    allKeys.forEach((key) => {
      if (["created_at", "updated_at"].includes(key)) {
        return;
      }

      const oldValue = oldValues?.[key];
      const newValue = newValues?.[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        fields.push(key);
      }
    });

    return { fields, hasChanges: fields.length > 0 };
  }

  /**
   * Restore a record to a previous state (get data at specific point in time)
   */
  static async getRestoreData(
    tableName: string,
    recordId: string | number,
    targetDate: Date
  ): Promise<any | null> {
    const logs = await (prisma as any).auditLog.findMany({
      where: {
        table_name: tableName,
        record_id: String(recordId),
        changed_at: { lte: targetDate },
      },
      orderBy: { changed_at: "desc" },
    });

    if (logs.length === 0) return null;

    // Start with the oldest state and apply changes
    let restoredState: any = {};

    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      if (log.action === "CREATE") {
        restoredState = { ...log.new_values };
      } else if (log.action === "UPDATE") {
        restoredState = { ...restoredState, ...log.new_values };
      }
    }

    return restoredState;
  }
}

export default AuditService;
