import prisma from "../../config/prisma";
import logger from "../../utils/logger";

// ============================================================================
// NOTIFICATION RECIPIENTS SERVICE
//
// Fetches email recipients from admin_users table based on their roles
// in admin_roles → admin_user_roles.
//
// Role mapping (from admin_roles table):
//   role_id=1  super_admin          → Super Admin (full access)
//   role_id=2  Admin                → Administrator
//   role_id=6  commission_reviewer  → L1: Invoice verification, payment initiation
//   role_id=7  commission_approver  → L2: Final business approval
//   role_id=8  commission_viewer    → BDM: Read-only, notification recipient
//
// Usage:
//   const cfg = await resolveNotificationConfig();
//   cfg.financeEmail        → L1 reviewer (commission_reviewer)
//   cfg.l1ApproverEmail     → L1 reviewer (commission_reviewer)
//   cfg.l2ApproverEmail     → L2 approver (commission_approver)
//   cfg.bdmEmails           → All BDMs (commission_viewer)
// ============================================================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedEmails {
  emails: { email: string; full_name: string | null; userId: number }[];
  fetchedAt: number;
}

const roleCache = new Map<string, CachedEmails>();

// ============================================================================
// CORE: Fetch active admin users by role name
// ============================================================================

/**
 * Get all active admin users with a specific role.
 * Cached for 5 minutes.
 *
 * @param roleName - Exact role string from admin_roles table
 *   e.g., "super_admin", "Admin", "commission_reviewer",
 *         "commission_approver", "commission_viewer"
 */
export async function getAdminUsersByRole(
  roleName: string,
): Promise<{ email: string; full_name: string | null; userId: number }[]> {
  const cached = roleCache.get(roleName);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.emails;
  }

  try {
    const users = await prisma.adminUsers.findMany({
      where: {
        is_active: true,
        admin_user_roles: {
          some: {
            role: { role: roleName },
          },
        },
      },
      select: { id: true, email: true, full_name: true },
      orderBy: { id: "asc" },
    });

    const result = users.map((u) => ({
      email: u.email,
      full_name: u.full_name,
      userId: u.id,
    }));

    roleCache.set(roleName, { emails: result, fetchedAt: Date.now() });
    return result;
  } catch (err: any) {
    logger.warn(
      `[NotificationRecipients] DB lookup failed for role "${roleName}": ${err.message}`,
    );
    return [];
  }
}

/**
 * Fetch users from multiple roles (fallback chain).
 * Returns users from the first role that has active users.
 *
 * Example: getAdminUsersByRoles(["commission_reviewer", "Admin", "super_admin"])
 *   → Tries commission_reviewer first, if empty tries Admin, then super_admin
 */
export async function getAdminUsersByRoles(
  roleNames: string[],
): Promise<{ email: string; full_name: string | null; userId: number }[]> {
  for (const role of roleNames) {
    const users = await getAdminUsersByRole(role);
    if (users.length > 0) return users;
  }
  return [];
}

// ============================================================================
// RESOLVED CONFIG — All dynamic recipients in one call
// ============================================================================

export interface ResolvedNotificationConfig {
  // ── Finance / general admin notifications ──
  financeEmail: string;
  financeCcEmails: string[];

  // ── Objection / dispute notifications ──
  objectionNotifyEmail: string;
  objectionCcEmails: string[];

  // ── L1: Commission Reviewer ──
  l1ApproverEmail: string;
  l1ApproverCcEmails: string[];
  l1ApproverName: string | null;

  // ── L2: Commission Approver (Business Head) ──
  l2ApproverEmail: string;
  l2ApproverCcEmails: string[];
  l2ApproverName: string | null;

  // ── BDM: Commission Viewers (read-only, notification recipients) ──
  bdmEmails: string[];

  // ── Branding / URLs (ENV only) ──
  companyName: string;
  supportEmail: string;
  portalBaseUrl: string;
}

/**
 * Resolve all notification recipients from admin_users by role.
 *
 * Priority chain for each notification type:
 *   Finance     → commission_reviewer → Admin → super_admin → ENV
 *   Objection   → Admin → super_admin → ENV
 *   L1 Approver → commission_reviewer → ENV
 *   L2 Approver → commission_approver → ENV
 *   BDM viewers → commission_viewer (all of them)
 */
export async function resolveNotificationConfig(): Promise<ResolvedNotificationConfig> {
  // ── Fetch all roles in parallel ──
  const [reviewers, approvers, viewers, admins, superAdmins] =
    await Promise.all([
      getAdminUsersByRole("commission_reviewer"), // L1
      getAdminUsersByRole("commission_approver"), // L2
      getAdminUsersByRole("commission_viewer"), // BDM
      getAdminUsersByRole("Admin"), // Administrator
      getAdminUsersByRole("super_admin"), // Super Admin
    ]);

  // ── Finance recipients: L1 reviewers → Admins → Super Admins → ENV ──
  const financeUsers =
    reviewers.length > 0 ? reviewers : admins.length > 0 ? admins : superAdmins;

  let financeEmail: string;
  let financeCcEmails: string[];

  if (financeUsers.length > 0) {
    financeEmail = financeUsers[0].email;
    financeCcEmails = financeUsers.slice(1).map((u) => u.email);
  } else {
    financeEmail =
      process.env.COMMISSION_FINANCE_EMAIL || "tech@edumateglobal.com";
    financeCcEmails = parseEmailList(process.env.COMMISSION_FINANCE_CC);
  }

  // ── Objection recipients: Admins → Super Admins → ENV ──
  const objectionUsers = admins.length > 0 ? admins : superAdmins;

  let objectionNotifyEmail: string;
  let objectionCcEmails: string[];

  if (objectionUsers.length > 0) {
    objectionNotifyEmail = objectionUsers[0].email;
    objectionCcEmails = objectionUsers.slice(1).map((u) => u.email);
  } else {
    objectionNotifyEmail =
      process.env.COMMISSION_OBJECTION_EMAIL || financeEmail;
    objectionCcEmails = parseEmailList(process.env.COMMISSION_OBJECTION_CC);
  }

  // ── L1 Approver: commission_reviewer → ENV ──
  let l1ApproverEmail: string;
  let l1ApproverCcEmails: string[];
  let l1ApproverName: string | null = null;

  if (reviewers.length > 0) {
    l1ApproverEmail = reviewers[0].email;
    l1ApproverName = reviewers[0].full_name;
    l1ApproverCcEmails = reviewers.slice(1).map((u) => u.email);
  } else {
    l1ApproverEmail = process.env.COMMISSION_L1_EMAIL || financeEmail;
    l1ApproverCcEmails = parseEmailList(process.env.COMMISSION_L1_CC);
  }

  // ── L2 Approver: commission_approver → ENV ──
  let l2ApproverEmail: string;
  let l2ApproverCcEmails: string[];
  let l2ApproverName: string | null = null;

  if (approvers.length > 0) {
    l2ApproverEmail = approvers[0].email;
    l2ApproverName = approvers[0].full_name;
    l2ApproverCcEmails = approvers.slice(1).map((u) => u.email);
  } else {
    l2ApproverEmail = process.env.COMMISSION_L2_EMAIL || financeEmail;
    l2ApproverCcEmails = parseEmailList(process.env.COMMISSION_L2_CC);
  }

  // ── BDM viewers: all commission_viewer users ──
  const bdmEmails = viewers.map((u) => u.email);

  return {
    financeEmail,
    financeCcEmails,
    objectionNotifyEmail,
    objectionCcEmails,
    l1ApproverEmail,
    l1ApproverCcEmails,
    l1ApproverName,
    l2ApproverEmail,
    l2ApproverCcEmails,
    l2ApproverName,
    bdmEmails,
    companyName: process.env.COMPANY_NAME || "Edumate Global",
    supportEmail: process.env.SUPPORT_EMAIL || "support@edumateglobal.com",
    portalBaseUrl:
      process.env.FRONTEND_URL || "https://portal.edumateglobal.com",
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function parseEmailList(csv?: string): string[] {
  if (!csv || !csv.trim()) return [];
  return csv
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes("@"));
}

/**
 * Force-clear the role cache (call after admin user/role changes).
 */
export function invalidateRecipientCache(role?: string): void {
  if (role) {
    roleCache.delete(role);
  } else {
    roleCache.clear();
  }
  logger.debug(`[NotificationRecipients] Cache invalidated: ${role || "ALL"}`);
}
