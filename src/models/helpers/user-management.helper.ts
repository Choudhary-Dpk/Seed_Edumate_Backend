import prisma from "../../config/prisma";
import logger from "../../utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUserWithRole {
  id: number;
  email: string;
  full_name: string | null; // Changed to allow null
  phone: string | null;
  is_active: boolean;
  logo_url: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  role: {
    id: number;
    role: string;
    display_name: string;
    description: string | null;
  } | null;
}

export interface AdminRole {
  id: number;
  role: string;
  display_name: string;
  description: string | null;
}

export interface RoleChangeAuditLog {
  id: number;
  admin_user_id: number;
  previous_role_id: number | null;
  new_role_id: number;
  changed_by_user_id: number;
  changed_by_name: string;
  reason: string | null;
  created_at: Date | null;
}

export interface PaginationParams {
  page: number;
  size: number;
  search?: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  roleFilter?: number;
  statusFilter?: "active" | "inactive" | "all";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ============================================================================
// GET ALL ADMIN USERS WITH PAGINATION
// ============================================================================

export const getAllAdminUsersWithRoles = async (
  params: PaginationParams,
): Promise<PaginatedResult<AdminUserWithRole>> => {
  const {
    page = 1,
    size = 10,
    search = "",
    sortKey = "created_at",
    sortDir = "desc",
    roleFilter,
    statusFilter = "all",
  } = params;

  logger.debug("Fetching admin users with pagination", {
    page,
    size,
    search,
    sortKey,
    sortDir,
  });

  const offset = (page - 1) * size;

  // Build where clause
  const whereClause: any = {};

  // Search filter
  if (search && search.trim()) {
    whereClause.OR = [
      { full_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Status filter
  if (statusFilter === "active") {
    whereClause.is_active = true;
  } else if (statusFilter === "inactive") {
    whereClause.is_active = false;
  }

  // Role filter
  if (roleFilter) {
    whereClause.admin_user_roles = {
      some: {
        role_id: roleFilter,
      },
    };
  }

  // Build orderBy
  const orderBy: any = {};
  const validSortKeys = [
    "full_name",
    "email",
    "created_at",
    "updated_at",
    "is_active",
  ];
  if (validSortKeys.includes(sortKey)) {
    orderBy[sortKey] = sortDir;
  } else {
    orderBy.created_at = "desc";
  }

  // Get total count
  const total = await prisma.adminUsers.count({ where: whereClause });

  // Get paginated users
  const users = await prisma.adminUsers.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      is_active: true,
      logo_url: true,
      created_at: true,
      updated_at: true,
      admin_user_roles: {
        select: {
          role: {
            select: {
              id: true,
              role: true,
              display_name: true,
              description: true,
            },
          },
        },
        take: 1,
      },
    },
    orderBy,
    skip: offset,
    take: size,
  });

  // Transform to flatten the role
  const transformedUsers: AdminUserWithRole[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    is_active: user.is_active,
    logo_url: user.logo_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role: user.admin_user_roles[0]?.role || null,
  }));

  return {
    data: transformedUsers,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
};

// ============================================================================
// GET SINGLE ADMIN USER BY ID
// ============================================================================

export const getAdminUserById = async (
  userId: number,
): Promise<AdminUserWithRole | null> => {
  logger.debug(`Fetching admin user by ID: ${userId}`);

  const user = await prisma.adminUsers.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      is_active: true,
      logo_url: true,
      created_at: true,
      updated_at: true,
      admin_user_roles: {
        select: {
          role: {
            select: {
              id: true,
              role: true,
              display_name: true,
              description: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    is_active: user.is_active,
    logo_url: user.logo_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role: user.admin_user_roles[0]?.role || null,
  };
};

// ============================================================================
// GET ALL ADMIN ROLES
// ============================================================================

export const getAllAdminRoles = async (): Promise<AdminRole[]> => {
  logger.debug("Fetching all admin roles");

  const roles = await prisma.adminRoles.findMany({
    select: {
      id: true,
      role: true,
      display_name: true,
      description: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return roles;
};

// ============================================================================
// ASSIGN ROLE TO USER (Replace existing role - One user = One role)
// ============================================================================

export const assignRoleToUser = async (
  userId: number,
  newRoleId: number,
  changedByUserId: number,
  changedByName: string,
  reason?: string,
): Promise<{ success: boolean; previousRoleId: number | null }> => {
  logger.debug(`Assigning role ${newRoleId} to user ${userId}`);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Get current role (if any)
    const currentRoleAssignment = await tx.adminUserRoles.findFirst({
      where: { user_id: userId },
      select: { id: true, role_id: true },
    });

    const previousRoleId = currentRoleAssignment?.role_id || null;

    // 2. Delete existing role assignment (if any)
    if (currentRoleAssignment) {
      await tx.adminUserRoles.delete({
        where: { id: currentRoleAssignment.id },
      });
    }

    // 3. Create new role assignment
    await tx.adminUserRoles.create({
      data: {
        user_id: userId,
        role_id: newRoleId,
        assigned_at: new Date(),
      },
    });

    // 4. Create audit log entry
    await tx.adminRoleChangeAuditLog.create({
      data: {
        admin_user_id: userId,
        previous_role_id: previousRoleId,
        new_role_id: newRoleId,
        changed_by_user_id: changedByUserId,
        changed_by_name: changedByName,
        reason: reason || null,
        created_at: new Date(),
      },
    });

    // 5. Update user's updated_at timestamp
    await tx.adminUsers.update({
      where: { id: userId },
      data: { updated_at: new Date() },
    });

    return { success: true, previousRoleId };
  });

  logger.info(
    `Role changed for user ${userId}: ${result.previousRoleId} -> ${newRoleId} by ${changedByName}`,
  );
  return result;
};

// ============================================================================
// TOGGLE USER STATUS (Activate/Deactivate)
// ============================================================================

export const toggleUserStatus = async (
  userId: number,
  isActive: boolean,
  changedByUserId: number,
  changedByName: string,
): Promise<{ success: boolean }> => {
  logger.debug(`Toggling user ${userId} status to: ${isActive}`);

  await prisma.$transaction(async (tx) => {
    await tx.adminUsers.update({
      where: { id: userId },
      data: {
        is_active: isActive,
        updated_at: new Date(),
      },
    });

    await tx.adminRoleChangeAuditLog.create({
      data: {
        admin_user_id: userId,
        previous_role_id: null,
        new_role_id: -1,
        changed_by_user_id: changedByUserId,
        changed_by_name: changedByName,
        reason: isActive ? "User activated" : "User deactivated",
        created_at: new Date(),
      },
    });

    if (!isActive) {
      await tx.adminSessions.updateMany({
        where: { user_id: userId },
        data: { is_valid: false },
      });
    }
  });

  logger.info(
    `User ${userId} status changed to ${isActive} by ${changedByName}`,
  );
  return { success: true };
};

// ============================================================================
// GET ROLE CHANGE AUDIT LOG WITH PAGINATION
// ============================================================================

export const getRoleChangeAuditLog = async (
  userId?: number,
  page: number = 1,
  size: number = 20,
): Promise<PaginatedResult<RoleChangeAuditLog>> => {
  logger.debug(
    `Fetching role change audit log${userId ? ` for user ${userId}` : ""}`,
  );

  const offset = (page - 1) * size;
  const whereClause = userId ? { admin_user_id: userId } : {};

  const total = await prisma.adminRoleChangeAuditLog.count({
    where: whereClause,
  });

  const logs = await prisma.adminRoleChangeAuditLog.findMany({
    where: whereClause,
    orderBy: { created_at: "desc" },
    skip: offset,
    take: size,
  });

  return {
    data: logs,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
};

// ============================================================================
// CHECK IF USER EXISTS
// ============================================================================

export const checkAdminUserExists = async (
  userId: number,
): Promise<boolean> => {
  const user = await prisma.adminUsers.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return !!user;
};

// ============================================================================
// CHECK IF ROLE EXISTS
// ============================================================================

export const checkRoleExists = async (roleId: number): Promise<boolean> => {
  const role = await prisma.adminRoles.findUnique({
    where: { id: roleId },
    select: { id: true },
  });
  return !!role;
};

// ============================================================================
// GET USER'S CURRENT ROLE
// ============================================================================

export const getUserCurrentRole = async (
  userId: number,
): Promise<AdminRole | null> => {
  const userRole = await prisma.adminUserRoles.findFirst({
    where: { user_id: userId },
    select: {
      role: {
        select: {
          id: true,
          role: true,
          display_name: true,
          description: true,
        },
      },
    },
  });

  return userRole?.role || null;
};

// ============================================================================
// GET STATS FOR DASHBOARD
// ============================================================================

export const getUserManagementStats = async () => {
  const [totalUsers, activeUsers, roleDistribution] = await Promise.all([
    prisma.adminUsers.count(),
    prisma.adminUsers.count({ where: { is_active: true } }),
    prisma.adminUserRoles.groupBy({
      by: ["role_id"],
      _count: { role_id: true },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    roleDistribution,
  };
};
