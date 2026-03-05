import { Router } from "express";
import { authenticate } from "../../middlewares";
import { AuthMethod } from "../../types/auth";
import {
  getAdminUsersController,
  getAdminUserByIdController,
  getAdminRolesController,
  assignRoleController,
  toggleUserStatusController,
  getAuditLogController,
  getStatsController,
} from "../../controllers/admin/user-management.controller";

const router = Router();

// ============================================================================
// ALL ROUTES ARE PROTECTED - SUPER_ADMIN ONLY
// ============================================================================

const superAdminAuth = authenticate({
  method: AuthMethod.JWT,
  allowedRoles: ["super_admin"],
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @route   GET /admin/users/stats
 * @desc    Get user management statistics
 * @access  Super Admin only
 */
router.get("/stats", superAdminAuth, getStatsController);

/**
 * @route   GET /admin/users/roles
 * @desc    Get all available roles
 * @access  Super Admin only
 */
router.get("/roles", superAdminAuth, getAdminRolesController);

/**
 * @route   GET /admin/users/audit-log
 * @desc    Get role change audit log with pagination
 * @query   userId (optional), page, size
 * @access  Super Admin only
 */
router.get("/audit-log", superAdminAuth, getAuditLogController);

/**
 * @route   GET /admin/users
 * @desc    Get all admin users with pagination
 * @query   page, size, search, sortKey, sortDir, roleFilter, statusFilter
 * @access  Super Admin only
 */
router.get("/", superAdminAuth, getAdminUsersController);

/**
 * @route   GET /admin/users/:id
 * @desc    Get single admin user by ID
 * @access  Super Admin only
 */
router.get("/:id", superAdminAuth, getAdminUserByIdController);

/**
 * @route   PATCH /admin/users/:id/role
 * @desc    Assign/change role for a user
 * @body    { roleId: number, reason?: string }
 * @access  Super Admin only
 */
router.patch("/:id/role", superAdminAuth, assignRoleController);

/**
 * @route   PATCH /admin/users/:id/status
 * @desc    Activate/deactivate a user
 * @body    { isActive: boolean }
 * @access  Super Admin only
 */
router.patch("/:id/status", superAdminAuth, toggleUserStatusController);

export { router as userManagementRoutes };
