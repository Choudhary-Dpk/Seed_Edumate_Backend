import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/api";
import logger from "../../utils/logger";
import {
  getAllAdminUsersWithRoles,
  getAdminUserById,
  getAllAdminRoles,
  assignRoleToUser,
  toggleUserStatus,
  getRoleChangeAuditLog,
  checkAdminUserExists,
  checkRoleExists,
  getUserCurrentRole,
  getUserManagementStats,
} from "../../models/helpers/user-management.helper";

// ============================================================================
// GET ALL ADMIN USERS WITH PAGINATION
// GET /admin/users
// Query: page, size, search, sortKey, sortDir, roleFilter, statusFilter
// ============================================================================

export const getAdminUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page = "1",
      size = "10",
      search = "",
      sortKey = "created_at",
      sortDir = "desc",
      roleFilter,
      statusFilter = "all",
    } = req.query;

    logger.debug("Fetching admin users with pagination", req.query);

    const result = await getAllAdminUsersWithRoles({
      page: parseInt(page as string) || 1,
      size: parseInt(size as string) || 10,
      search: search as string,
      sortKey: sortKey as string,
      sortDir: sortDir as "asc" | "desc",
      roleFilter: roleFilter ? parseInt(roleFilter as string) : undefined,
      statusFilter: statusFilter as "active" | "inactive" | "all",
    });

    return sendResponse(res, 200, "Admin users fetched successfully", {
      users: result.data,
      total: result.total,
      page: result.page,
      size: result.size,
      totalPages: result.totalPages,
    });
  } catch (error) {
    logger.error("Error fetching admin users:", error);
    next(error);
  }
};

// ============================================================================
// GET STATS
// GET /admin/users/stats
// ============================================================================

export const getStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.debug("Fetching user management stats");

    const stats = await getUserManagementStats();
    const roles = await getAllAdminRoles();

    // Enrich role distribution with role names
    const roleMap = new Map(roles.map((r) => [r.id, r]));
    const enrichedDistribution = stats.roleDistribution.map((item) => ({
      role: roleMap.get(item.role_id),
      count: item._count.role_id,
    }));

    return sendResponse(res, 200, "Stats fetched successfully", {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      inactiveUsers: stats.inactiveUsers,
      totalRoles: roles.length,
      roleDistribution: enrichedDistribution,
    });
  } catch (error) {
    logger.error("Error fetching stats:", error);
    next(error);
  }
};

// ============================================================================
// GET SINGLE ADMIN USER
// GET /admin/users/:id
// ============================================================================

export const getAdminUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return sendResponse(res, 400, "Invalid user ID");
    }

    logger.debug(`Fetching admin user by ID: ${userId}`);

    const user = await getAdminUserById(userId);

    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    const auditLog = await getRoleChangeAuditLog(userId, 1, 10);

    return sendResponse(res, 200, "Admin user fetched successfully", {
      user,
      auditLog: auditLog.data,
    });
  } catch (error) {
    logger.error("Error fetching admin user:", error);
    next(error);
  }
};

// ============================================================================
// GET ALL ROLES
// GET /admin/users/roles
// ============================================================================

export const getAdminRolesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.debug("Fetching all admin roles");

    const roles = await getAllAdminRoles();

    return sendResponse(res, 200, "Roles fetched successfully", {
      roles,
    });
  } catch (error) {
    logger.error("Error fetching roles:", error);
    next(error);
  }
};

// ============================================================================
// ASSIGN ROLE TO USER
// PATCH /admin/users/:id/role
// Body: { roleId: number, reason?: string }
// ============================================================================

export const assignRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.params.id);
    const { roleId, reason } = req.body;

    if (isNaN(userId)) {
      return sendResponse(res, 400, "Invalid user ID");
    }

    if (!roleId || isNaN(parseInt(roleId))) {
      return sendResponse(res, 400, "Invalid role ID");
    }

    const roleIdNum = parseInt(roleId);

    const currentUser = req.user as {
      id: number;
      fullName: string;
      roles: string[];
    };

    if (userId === currentUser.id) {
      return sendResponse(res, 400, "You cannot change your own role");
    }

    const userExists = await checkAdminUserExists(userId);
    if (!userExists) {
      return sendResponse(res, 404, "User not found");
    }

    const roleExists = await checkRoleExists(roleIdNum);
    if (!roleExists) {
      return sendResponse(res, 404, "Role not found");
    }

    const currentRole = await getUserCurrentRole(userId);
    if (currentRole && currentRole.id === roleIdNum) {
      return sendResponse(res, 400, "User already has this role");
    }

    logger.info(
      `User ${currentUser.id} (${currentUser.fullName}) assigning role ${roleIdNum} to user ${userId}`,
    );

    const result = await assignRoleToUser(
      userId,
      roleIdNum,
      currentUser.id,
      currentUser.fullName,
      reason,
    );

    const updatedUser = await getAdminUserById(userId);

    return sendResponse(res, 200, "Role assigned successfully", {
      user: updatedUser,
      previousRoleId: result.previousRoleId,
      newRoleId: roleIdNum,
    });
  } catch (error) {
    logger.error("Error assigning role:", error);
    next(error);
  }
};

// ============================================================================
// TOGGLE USER STATUS
// PATCH /admin/users/:id/status
// Body: { isActive: boolean }
// ============================================================================

export const toggleUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive } = req.body;

    if (isNaN(userId)) {
      return sendResponse(res, 400, "Invalid user ID");
    }

    if (typeof isActive !== "boolean") {
      return sendResponse(res, 400, "isActive must be a boolean");
    }

    const currentUser = req.user as {
      id: number;
      fullName: string;
    };

    if (userId === currentUser.id) {
      return sendResponse(res, 400, "You cannot change your own status");
    }

    const userExists = await checkAdminUserExists(userId);
    if (!userExists) {
      return sendResponse(res, 404, "User not found");
    }

    logger.info(
      `User ${currentUser.id} (${currentUser.fullName}) ${
        isActive ? "activating" : "deactivating"
      } user ${userId}`,
    );

    await toggleUserStatus(
      userId,
      isActive,
      currentUser.id,
      currentUser.fullName,
    );

    const updatedUser = await getAdminUserById(userId);

    return sendResponse(
      res,
      200,
      `User ${isActive ? "activated" : "deactivated"} successfully`,
      {
        user: updatedUser,
      },
    );
  } catch (error) {
    logger.error("Error toggling user status:", error);
    next(error);
  }
};

// ============================================================================
// GET AUDIT LOG WITH PAGINATION
// GET /admin/users/audit-log
// Query: { userId?: number, page?: number, size?: number }
// ============================================================================

export const getAuditLogController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.query.userId
      ? parseInt(req.query.userId as string)
      : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    logger.debug(`Fetching audit log${userId ? ` for user ${userId}` : ""}`);

    const result = await getRoleChangeAuditLog(userId, page, size);

    const roles = await getAllAdminRoles();
    const roleMap = new Map(roles.map((r) => [r.id, r]));

    const enrichedLog = result.data.map((log) => ({
      ...log,
      previousRole: log.previous_role_id
        ? roleMap.get(log.previous_role_id)
        : null,
      newRole:
        log.new_role_id === -1
          ? { role: "status_change", display_name: "Status Change" }
          : roleMap.get(log.new_role_id),
    }));

    return sendResponse(res, 200, "Audit log fetched successfully", {
      auditLog: enrichedLog,
      total: result.total,
      page: result.page,
      size: result.size,
      totalPages: result.totalPages,
    });
  } catch (error) {
    logger.error("Error fetching audit log:", error);
    next(error);
  }
};
