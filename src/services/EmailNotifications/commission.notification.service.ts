import moment from "moment";
import prisma from "../../config/prisma";
import { queueEmail } from "../email-queue.service";
import logger from "../../utils/logger";
import { EmailType, EmailCategory, SenderType } from "../email-log.service";
import {
  resolveNotificationConfig,
  ResolvedNotificationConfig,
} from "./notification-recipients.service";

// ============================================================================
// CONSTANTS
// ============================================================================

const CURRENT_YEAR = moment().format("YYYY");

// ============================================================================
// NOTIFICATION TYPES
//
// All recipients resolved from admin_users by role:
//   commission_reviewer  (L1) → Finance, Invoice, L1 notifications
//   commission_approver  (L2) → L2 approval + Objection notifications ← CHANGED
//   commission_viewer   (BDM) → Read-only CC notifications
//   Admin / super_admin       → Escalation notifications
// ============================================================================

export type CommissionNotificationType =
  | "FINANCE_PARTNER_ONBOARDED" // Phase 1: New partner → L1 (commission_reviewer)
  | "PARTNER_COMMISSION_CREATED" // Phase 2: Commission entry → Partner (b2b_partners_users)
  | "PARTNER_OBJECTION_RAISED" // Phase 3: Objection → L2 (commission_approver) ← CHANGED
  | "INVOICE_SUBMITTED" // Phase 3: Invoice submitted → L1 (commission_reviewer)
  | "L1_APPROVED" // Phase 4: L1 approved → L2 (commission_approver)
  | "L1_REJECTED" // Phase 4: L1 rejected → Partner + BDM (commission_viewer)
  | "L2_APPROVED" // Phase 4: L2 approved → L1 (commission_reviewer) for payout
  | "L2_REJECTED_TO_L1" // Phase 4: L2 rejected → L1 (commission_reviewer) for re-review
  | "L2_REJECTED_TO_PARTNER" // Phase 4: L2 rejected → Partner (re-upload invoice)
  | "ADMIN_DISPUTE_RESOLVED"; // Phase 3: Admin resolves dispute → Partner

// ============================================================================
// NOTIFICATION DATA
// ============================================================================

export interface CommissionNotificationData {
  triggeredBy?: {
    userId?: number;
    name?: string;
    type?: "system" | "admin" | "partner";
  };
  partnerId?: number;
  partnerB2BId?: number;
  partnerName?: string;
  partnerType?: string | null;
  businessType?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  isCommissionApplicable?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  onboardedAt?: Date;
  settlementId?: number;
  settlementRefNumber?: string | null;
  settlementMonth?: string | null;
  settlementYear?: number | null;
  settlementDate?: Date | null;
  studentName?: string | null;
  studentId?: string | null;
  lenderName?: string | null;
  loanProductName?: string | null;
  loanAmountDisbursed?: number | null;
  disbursementDate?: Date | null;
  universityName?: string | null;
  courseName?: string | null;
  destinationCountry?: string | null;
  commissionRate?: number | null;
  grossCommissionAmount?: number | null;
  objectionReason?: string;
  disputeResolution?: string;
  disputeResolvedBy?: string;
  rejectionReason?: string;
  approverName?: string;
  approverNotes?: string | null;
  rejectedBy?: string;
  rejectTo?: string;
  invoiceNumber?: string | null;
  invoiceAmount?: number | null;
  invoiceDate?: Date;
  invoiceUrl?: string;
  overrideRecipient?: string;
  overrideCc?: string[];
  overrideSubject?: string;
}

// ============================================================================
// RESULT TYPE
// ============================================================================

export interface CommissionNotificationResult {
  success: boolean;
  emailLogId?: number;
  queueItemId?: number;
  recipientEmail?: string;
  error?: string;
}

// ============================================================================
// NOTIFICATION CONFIG
// ============================================================================

interface NotificationConfig {
  emailType: EmailType;
  category: EmailCategory;
  referenceType: string;
  priority: number;
  getRecipient: (
    data: CommissionNotificationData,
    cfg: ResolvedNotificationConfig,
  ) => Promise<{ to: string; cc?: string[]; recipientUserId?: number }>;
  getSubject: (data: CommissionNotificationData) => string;
  getHtml: (
    data: CommissionNotificationData,
    cfg: ResolvedNotificationConfig,
    recipientName?: string | null,
  ) => string;
  getReferenceId: (data: CommissionNotificationData) => number | undefined;
  afterSend?: (
    data: CommissionNotificationData,
    recipientEmail: string,
  ) => Promise<void>;
}

// ── Shared afterSend for settlement communication tracking ──
const updateSettlementCommunication = async (
  data: CommissionNotificationData,
  recipientEmail: string,
  label: string,
) => {
  if (!data.settlementId) return;
  try {
    await prisma.hSCommissionSettlementsCommunication.upsert({
      where: { settlement_id: data.settlementId },
      update: {
        last_communication_date: new Date(),
        email_sent_count: { increment: 1 },
        communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] ${label} sent to ${recipientEmail}`,
      },
      create: {
        settlement_id: data.settlementId,
        notification_date: new Date(),
        notification_method: "EMAIL",
        partner_notification_sent: "Yes",
        last_communication_date: new Date(),
        email_sent_count: 1,
        sms_sent_count: 0,
        communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] ${label} sent to ${recipientEmail}`,
      },
    });
  } catch (err: any) {
    logger.warn(`Failed to update settlement communication: ${err.message}`, {
      settlementId: data.settlementId,
    });
  }
};

const NOTIFICATION_CONFIGS: Record<
  CommissionNotificationType,
  NotificationConfig
> = {
  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1: Notify Finance — New Partner Onboarded
  // Recipient: commission_reviewer (L1) → Admin → super_admin → ENV
  // ──────────────────────────────────────────────────────────────────────────
  FINANCE_PARTNER_ONBOARDED: {
    emailType: EmailType.COMMISSION_FINANCE_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "partner",
    priority: 5,

    getRecipient: async (data, cfg) => ({
      to: data.overrideRecipient || cfg.financeEmail,
      cc:
        data.overrideCc ||
        (cfg.financeCcEmails.length > 0 ? cfg.financeCcEmails : undefined),
    }),

    getSubject: (data) =>
      data.overrideSubject ||
      `New Partner Onboarded — ${data.partnerName || "Unknown"} | Action Required: Upload Bank Details`,

    getHtml: (data, cfg) => buildFinanceNotificationTemplate(data, cfg),
    getReferenceId: (data) => data.partnerId,

    afterSend: async (data, recipientEmail) => {
      logger.debug("Finance notification sent for partner onboarding", {
        partnerId: data.partnerId,
        recipientEmail,
      });
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2: Notify Partner — Commission Settlement Created
  // Recipient: partner users from b2b_partners_users
  // ──────────────────────────────────────────────────────────────────────────
  PARTNER_COMMISSION_CREATED: {
    emailType: EmailType.COMMISSION_PARTNER_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 3,

    getRecipient: async (data) => {
      if (data.overrideRecipient) {
        return { to: data.overrideRecipient, cc: data.overrideCc };
      }
      const b2bId = data.partnerB2BId || data.partnerId;
      if (!b2bId) throw new Error("partnerB2BId or partnerId is required");

      const partnerUsers = await prisma.b2BPartnersUsers.findMany({
        where: { b2b_id: b2bId, is_active: true },
        select: { id: true, email: true, full_name: true },
      });

      if (!partnerUsers.length)
        throw new Error(`No active users found for partner B2B ID ${b2bId}`);

      const primary = partnerUsers[0];
      const cc = partnerUsers.slice(1).map((u) => u.email);
      return {
        to: primary.email,
        cc: cc.length > 0 ? cc : undefined,
        recipientUserId: primary.id,
      };
    },

    getSubject: (data) => {
      const amount = data.loanAmountDisbursed
        ? `₹${Number(data.loanAmountDisbursed).toLocaleString("en-IN")}`
        : "N/A";
      return (
        data.overrideSubject ||
        `New Commission Entry — ${data.studentName || "Student"} | ${amount} Disbursed | Review on Portal`
      );
    },

    getHtml: (data, cfg, recipientName) =>
      buildPartnerCommissionTemplate(data, cfg, recipientName),
    getReferenceId: (data) => data.settlementId,

    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      try {
        await prisma.hSCommissionSettlementsCommunication.upsert({
          where: { settlement_id: data.settlementId },
          update: {
            notification_date: new Date(),
            notification_method: "EMAIL",
            partner_notification_sent: "Yes",
            last_communication_date: new Date(),
            email_sent_count: { increment: 1 },
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Commission notification sent to ${recipientEmail}`,
          },
          create: {
            settlement_id: data.settlementId,
            notification_date: new Date(),
            notification_method: "EMAIL",
            partner_notification_sent: "Yes",
            last_communication_date: new Date(),
            email_sent_count: 1,
            sms_sent_count: 0,
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Commission notification sent to ${recipientEmail}`,
          },
        });
      } catch (err: any) {
        logger.warn("Failed to update settlement communication", {
          error: err.message,
          settlementId: data.settlementId,
        });
      }
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: Notify L2 Admin — Partner Raises Objection/Dispute
  //
  // *** CHANGED ***
  // BEFORE: cfg.objectionNotifyEmail || cfg.financeEmail  (L1 / Admin)
  // AFTER : cfg.l2ApproverEmail                           (L2 commission_approver)
  //
  // When a partner raises a dispute, it goes directly to the L2 business head
  // who has authority to resolve it. L1 is CC'd via cfg.l2ApproverCcEmails
  // if configured in notification-recipients.service.
  // ──────────────────────────────────────────────────────────────────────────
  PARTNER_OBJECTION_RAISED: {
    emailType: EmailType.COMMISSION_FINANCE_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient) {
        return { to: data.overrideRecipient, cc: data.overrideCc };
      }

      // ── CHANGED: was cfg.objectionNotifyEmail || cfg.financeEmail ──
      // ── NOW    : cfg.l2ApproverEmail (commission_approver role)    ──
      const to = cfg.l2ApproverEmail;
      const cc =
        data.overrideCc ||
        (cfg.l2ApproverCcEmails.length > 0
          ? cfg.l2ApproverCcEmails
          : undefined);

      return { to, cc };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `Objection Raised — ${data.studentName || "Student"} | ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"}`,

    getHtml: (data, cfg) => buildObjectionNotificationTemplate(data, cfg),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(data, email, "Objection notification (L2)"),
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: Invoice Submitted → L1 Reviewer (commission_reviewer)
  // ──────────────────────────────────────────────────────────────────────────
  INVOICE_SUBMITTED: {
    emailType: EmailType.COMMISSION_FINANCE_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 3,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient)
        return { to: data.overrideRecipient, cc: data.overrideCc };
      return {
        to: cfg.l1ApproverEmail,
        cc:
          cfg.l1ApproverCcEmails.length > 0
            ? cfg.l1ApproverCcEmails
            : undefined,
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `Invoice Submitted — ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"} | Review Required`,

    getHtml: (data) => buildInvoiceSubmittedTemplate(data),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(
        data,
        email,
        "Invoice submitted notification",
      ),
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: L1 Approved → L2 Approver (commission_approver)
  // ──────────────────────────────────────────────────────────────────────────
  L1_APPROVED: {
    emailType: EmailType.COMMISSION_FINANCE_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient)
        return { to: data.overrideRecipient, cc: data.overrideCc };
      const cc = [
        ...cfg.l2ApproverCcEmails,
        ...(cfg.bdmEmails.length > 0 ? cfg.bdmEmails : []),
      ].filter(Boolean);
      return { to: cfg.l2ApproverEmail, cc: cc.length > 0 ? cc : undefined };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      ` L1 Approved — ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"} | Awaiting L2 Approval`,

    getHtml: (data) => buildL1ApprovedTemplate(data),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(
        data,
        email,
        "L1 approved → L2 notification",
      ),
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: L1 Rejected → Partner + BDM (commission_viewer)
  // ──────────────────────────────────────────────────────────────────────────
  L1_REJECTED: {
    emailType: EmailType.COMMISSION_PARTNER_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient)
        return { to: data.overrideRecipient, cc: data.overrideCc };

      const b2bId = data.partnerB2BId || data.partnerId;
      if (!b2bId)
        throw new Error(
          "partnerB2BId or partnerId is required for L1_REJECTED",
        );

      const partnerUsers = await prisma.b2BPartnersUsers.findMany({
        where: { b2b_id: b2bId, is_active: true },
        select: { id: true, email: true },
      });
      if (!partnerUsers.length)
        throw new Error(`No active users found for partner B2B ID ${b2bId}`);

      const cc = [
        ...partnerUsers.slice(1).map((u) => u.email),
        ...cfg.bdmEmails,
      ].filter(Boolean);
      return {
        to: partnerUsers[0].email,
        cc: cc.length > 0 ? cc : undefined,
        recipientUserId: partnerUsers[0].id,
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `Settlement Returned — ${data.studentName || "Student"} | ${data.settlementRefNumber || "N/A"} | Action Required`,

    getHtml: (data) => buildSettlementReturnedTemplate(data),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(
        data,
        email,
        "L1 rejected → Partner notification",
      ),
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: L2 Approved → L1 Reviewer (commission_reviewer) for payout
  // ──────────────────────────────────────────────────────────────────────────
  L2_APPROVED: {
    emailType: EmailType.COMMISSION_FINANCE_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 1,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient)
        return { to: data.overrideRecipient, cc: data.overrideCc };
      const cc = [...cfg.l1ApproverCcEmails, ...cfg.bdmEmails].filter(Boolean);
      return { to: cfg.l1ApproverEmail, cc: cc.length > 0 ? cc : undefined };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `L2 Approved — ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"} | Ready for Payout`,

    getHtml: (data) => buildFinalApprovalTemplate(data),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(
        data,
        email,
        "L2 approved → L1 payout notification",
      ),
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: L2 Rejected → Back to L1 (commission_reviewer) for re-review
  // ──────────────────────────────────────────────────────────────────────────
  L2_REJECTED_TO_L1: {
    emailType: EmailType.COMMISSION_FINANCE_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient)
        return { to: data.overrideRecipient, cc: data.overrideCc };
      return {
        to: cfg.l1ApproverEmail,
        cc:
          cfg.l1ApproverCcEmails.length > 0
            ? cfg.l1ApproverCcEmails
            : undefined,
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `L2 Sent Back — ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"} | Re-review Required`,

    getHtml: (data) => buildL2SentBackToL1Template(data),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(
        data,
        email,
        "L2 rejected → L1 re-review notification",
      ),
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: L2 Rejected → Partner (re-upload invoice)
  // ──────────────────────────────────────────────────────────────────────────
  L2_REJECTED_TO_PARTNER: {
    emailType: EmailType.COMMISSION_PARTNER_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient)
        return { to: data.overrideRecipient, cc: data.overrideCc };

      const b2bId = data.partnerB2BId || data.partnerId;
      if (!b2bId)
        throw new Error(
          "partnerB2BId or partnerId is required for L2_REJECTED_TO_PARTNER",
        );

      const partnerUsers = await prisma.b2BPartnersUsers.findMany({
        where: { b2b_id: b2bId, is_active: true },
        select: { id: true, email: true },
      });
      if (!partnerUsers.length)
        throw new Error(`No active users found for partner B2B ID ${b2bId}`);

      const cc = [
        ...partnerUsers.slice(1).map((u) => u.email),
        ...cfg.bdmEmails,
      ].filter(Boolean);
      return {
        to: partnerUsers[0].email,
        cc: cc.length > 0 ? cc : undefined,
        recipientUserId: partnerUsers[0].id,
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `Settlement Rejected — ${data.studentName || "Student"} | ${data.settlementRefNumber || "N/A"} | Re-upload Required`,

    getHtml: (data) => buildL2RejectedToPartnerTemplate(data),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(
        data,
        email,
        "L2 rejected → Partner re-upload notification",
      ),
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: Admin Resolves Dispute → Partner
  // Recipient: partner users from b2b_partners_users + BDM CC
  // ──────────────────────────────────────────────────────────────────────────
  ADMIN_DISPUTE_RESOLVED: {
    emailType: EmailType.COMMISSION_PARTNER_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 3,

    getRecipient: async (data, cfg) => {
      if (data.overrideRecipient)
        return { to: data.overrideRecipient, cc: data.overrideCc };

      const b2bId = data.partnerB2BId || data.partnerId;
      if (!b2bId)
        throw new Error(
          "partnerB2BId or partnerId is required for ADMIN_DISPUTE_RESOLVED",
        );

      const partnerUsers = await prisma.b2BPartnersUsers.findMany({
        where: { b2b_id: b2bId, is_active: true },
        select: { id: true, email: true },
      });
      if (!partnerUsers.length)
        throw new Error(`No active users found for partner B2B ID ${b2bId}`);

      const cc = [
        ...partnerUsers.slice(1).map((u) => u.email),
        ...cfg.bdmEmails,
      ].filter(Boolean);
      return {
        to: partnerUsers[0].email,
        cc: cc.length > 0 ? cc : undefined,
        recipientUserId: partnerUsers[0].id,
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      ` Dispute Resolved — ${data.studentName || "Student"} | ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"}`,

    getHtml: (data) => buildDisputeResolvedTemplate(data),
    getReferenceId: (data) => data.settlementId,
    afterSend: (data, email) =>
      updateSettlementCommunication(
        data,
        email,
        "Dispute resolved → Partner notification",
      ),
  },
};

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function sendCommissionNotification(
  type: CommissionNotificationType,
  data: CommissionNotificationData,
): Promise<CommissionNotificationResult> {
  const config = NOTIFICATION_CONFIGS[type];

  if (!config) {
    logger.error(`Unknown commission notification type: ${type}`);
    return { success: false, error: `Unknown notification type: ${type}` };
  }

  try {
    logger.info(`[Commission Notification] Sending ${type}`, {
      partnerId: data.partnerId || data.partnerB2BId,
      settlementId: data.settlementId,
    });

    const cfg = await resolveNotificationConfig();
    const { to, cc, recipientUserId } = await config.getRecipient(data, cfg);

    let recipientName: string | null = null;
    if (recipientUserId) {
      const user = await prisma.b2BPartnersUsers.findUnique({
        where: { id: recipientUserId },
        select: { full_name: true },
      });
      recipientName = user?.full_name || null;
    }

    const subject = config.getSubject(data);
    const html = config.getHtml(data, cfg, recipientName);

    const { emailLog, queueItem } = await queueEmail({
      to,
      cc,
      subject,
      html,
      priority: config.priority,
      email_type: config.emailType,
      category: config.category,
      sent_by_user_id: data.triggeredBy?.userId,
      sent_by_name: data.triggeredBy?.name || "System",
      sent_by_type:
        data.triggeredBy?.type === "admin"
          ? SenderType.ADMIN
          : data.triggeredBy?.type === "partner"
            ? SenderType.PARTNER
            : SenderType.SYSTEM,
      reference_type: config.referenceType,
      reference_id: config.getReferenceId(data),
      metadata: {
        notification_type: type,
        partner_id: data.partnerId,
        partner_b2b_id: data.partnerB2BId,
        partner_name: data.partnerName,
        settlement_id: data.settlementId,
        student_name: data.studentName,
        loan_amount: data.loanAmountDisbursed,
        commission_amount: data.grossCommissionAmount,
      },
    });

    if (config.afterSend) {
      config
        .afterSend(data, to)
        .catch((err) =>
          logger.warn(
            `[Commission Notification] afterSend failed for ${type}`,
            { error: err.message },
          ),
        );
    }

    logger.info(`[Commission Notification] ${type} queued successfully`, {
      emailLogId: emailLog.id,
      queueItemId: queueItem.id,
      recipient: to,
    });

    return {
      success: true,
      emailLogId: emailLog.id,
      queueItemId: queueItem.id,
      recipientEmail: to,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`[Commission Notification] Failed to send ${type}`, {
      error: errorMessage,
      partnerId: data.partnerId || data.partnerB2BId,
      settlementId: data.settlementId,
    });
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// CONVENIENCE: Auto-fetch settlement data and notify partner
// ============================================================================

export async function notifyPartnerForSettlement(
  settlementId: number,
  triggeredBy?: { userId?: number; name?: string; type?: "system" | "admin" },
): Promise<CommissionNotificationResult> {
  try {
    const settlement = await prisma.hSCommissionSettlements.findUnique({
      where: { id: settlementId },
      include: {
        b2b_partner: {
          select: { id: true, partner_name: true, partner_display_name: true },
        },
        loan_details: true,
        calculation_details: true,
      },
    });

    if (!settlement)
      return { success: false, error: `Settlement ${settlementId} not found` };
    if (!settlement.b2b_partner_id || !settlement.b2b_partner) {
      return {
        success: false,
        error: `Settlement ${settlementId} has no linked partner`,
      };
    }

    return sendCommissionNotification("PARTNER_COMMISSION_CREATED", {
      settlementId: settlement.id,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id,
      partnerName:
        settlement.b2b_partner.partner_display_name ||
        settlement.b2b_partner.partner_name ||
        settlement.partner_name ||
        "Partner",
      studentName: settlement.student_name,
      studentId: settlement.student_id,
      lenderName: settlement.loan_details?.lender_name,
      loanProductName: settlement.loan_details?.loan_product_name,
      loanAmountDisbursed: settlement.loan_details?.loan_amount_disbursed
        ? Number(settlement.loan_details.loan_amount_disbursed)
        : null,
      disbursementDate: settlement.loan_details?.loan_disbursement_date,
      universityName: settlement.loan_details?.university_name,
      courseName: settlement.loan_details?.course_name,
      destinationCountry: settlement.loan_details?.student_destination_country,
      commissionRate: settlement.calculation_details?.commission_rate_applied
        ? Number(settlement.calculation_details.commission_rate_applied)
        : null,
      grossCommissionAmount: settlement.calculation_details
        ?.gross_commission_amount
        ? Number(settlement.calculation_details.gross_commission_amount)
        : null,
      settlementMonth: settlement.settlement_month,
      settlementYear: settlement.settlement_year,
      settlementDate: settlement.settlement_date,
      triggeredBy,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to notify partner for settlement", {
      error: msg,
      settlementId,
    });
    return { success: false, error: msg };
  }
}

// ============================================================================
// CONVENIENCE: Notify finance (L1) when invoice is submitted
// ============================================================================

export async function notifyFinanceForInvoice(
  settlementIds: number | number[],
  invoiceData?: {
    invoiceNumber?: string;
    invoiceDate?: Date;
    invoiceAmount?: number;
    invoiceUrl?: string;
  },
  partnerData?: { partnerB2BId?: number; partnerName?: string },
  triggeredBy?: {
    userId?: number;
    name?: string;
    type?: "system" | "admin" | "partner";
  },
): Promise<CommissionNotificationResult> {
  try {
    const ids = Array.isArray(settlementIds) ? settlementIds : [settlementIds];
    if (ids.length === 0)
      return { success: false, error: "No settlement IDs provided" };

    const settlement = await prisma.hSCommissionSettlements.findUnique({
      where: { id: ids[0] },
      include: {
        b2b_partner: {
          select: { id: true, partner_name: true, partner_display_name: true },
        },
        loan_details: true,
        calculation_details: true,
      },
    });

    if (!settlement)
      return { success: false, error: `Settlement ${ids[0]} not found` };

    const partnerName =
      partnerData?.partnerName ||
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      "Partner";

    return sendCommissionNotification("INVOICE_SUBMITTED", {
      settlementId: settlement.id,
      settlementRefNumber:
        ids.length > 1
          ? `${settlement.settlement_reference_number} (+${ids.length - 1} more)`
          : settlement.settlement_reference_number,
      partnerId:
        partnerData?.partnerB2BId || settlement.b2b_partner_id || undefined,
      partnerB2BId:
        partnerData?.partnerB2BId || settlement.b2b_partner_id || undefined,
      partnerName,
      studentName:
        ids.length > 1
          ? `${settlement.student_name || "Student"} (+${ids.length - 1} more)`
          : settlement.student_name,
      studentId: settlement.student_id,
      lenderName: settlement.loan_details?.lender_name,
      loanAmountDisbursed: settlement.loan_details?.loan_amount_disbursed
        ? Number(settlement.loan_details.loan_amount_disbursed)
        : null,
      grossCommissionAmount: settlement.calculation_details
        ?.gross_commission_amount
        ? Number(settlement.calculation_details.gross_commission_amount)
        : null,
      settlementMonth: settlement.settlement_month,
      settlementYear: settlement.settlement_year,
      invoiceNumber: invoiceData?.invoiceNumber,
      invoiceDate: invoiceData?.invoiceDate,
      invoiceAmount: invoiceData?.invoiceAmount,
      invoiceUrl: invoiceData?.invoiceUrl,
      triggeredBy,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to notify finance for invoice", {
      error: msg,
      settlementIds,
    });
    return { success: false, error: msg };
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function buildFinanceNotificationTemplate(
  data: CommissionNotificationData,
  _cfg: ResolvedNotificationConfig,
): string {
  const onboardedDate = data.onboardedAt
    ? moment(data.onboardedAt).format("DD MMM YYYY, hh:mm A")
    : moment().format("DD MMM YYYY, hh:mm A");

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:13px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New Partner Onboarded</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#1e5fad;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">New Partner</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#132a45;">New Partner Onboarded</h1>
  <p style="margin:0;font-size:14px;color:#e87722;font-weight:500;line-height:1.5;">Action Required: Upload Bank Details in HubSpot</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Finance Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">A new B2B partner has been onboarded. Please review their details and ensure bank information is uploaded in HubSpot for future commission payouts.</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Partner Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Partner Name", data.partnerName || "—", 0, true)}
    ${tableRow("Partner Type", data.partnerType || "—", 1)}
    ${tableRow("Business Type", data.businessType || "—", 2)}
    ${tableRow("GST Number", data.gstNumber || "—", 3, false, true, true)}
    ${tableRow("PAN Number", data.panNumber || "—", 4, false, true, true)}
    ${tableRow("City", data.city || "—", 5)}
    ${tableRow("State", data.state || "—", 6)}
    ${tableRow("Country", data.country || "—", 7)}
    ${tableRow("Commission Applicable", data.isCommissionApplicable || "—", 8)}
    ${tableRow("Contact Email", data.contactEmail || "—", 9, false, false, true)}
    ${tableRow("Contact Phone", data.contactPhone || "—", 10, false, false, true)}
    ${tableRow("Onboarded At", onboardedDate, 11)}
  </table>
</td></tr>
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildPartnerCommissionTemplate(
  data: CommissionNotificationData,
  _cfg: ResolvedNotificationConfig,
  recipientName?: string | null,
): string {
  const greeting = recipientName
    ? recipientName.charAt(0).toUpperCase() + recipientName.slice(1)
    : "Partner";
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
  const fmtPct = (v: number | null | undefined) => (v != null ? `${v}%` : "—");

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New Commission Entry</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#1e5fad;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">New Entry</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#132a45;">New Commission Entry</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">A new disbursement entry is available for your review</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi ${esc(greeting)},</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">A new commission settlement entry has been created for your review. Please log in to the partner portal to verify the details and proceed accordingly.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #1e5fad;background:#f0f7ff;"><tr><td style="padding:20px 24px;">
    <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Summary</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td width="160" style="padding:8px 0;font-size:13px;color:#5d6d7e;">Reference Number</td><td style="padding:8px 0;font-size:13px;color:#1e5fad;font-weight:600;font-family:monospace;">${esc(data.settlementRefNumber || "—")}</td></tr>
      ${data.settlementMonth && data.settlementYear ? `<tr><td width="160" style="padding:8px 0;font-size:13px;color:#5d6d7e;">Settlement Period</td><td style="padding:8px 0;font-size:13px;color:#132a45;font-weight:600;">${esc(data.settlementMonth)} ${data.settlementYear}</td></tr>` : ""}
    </table>
  </td></tr></table>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Disbursement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Student Name", data.studentName || "—", 0, true)}
    ${tableRow("Student ID", data.studentId || "—", 1, false, true, true)}
    ${tableRow("Lender", data.lenderName || "—", 2)}
    ${tableRow("Loan Product", data.loanProductName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("University", data.universityName || "—", 5)}
    ${tableRow("Course", data.courseName || "—", 6)}
    ${tableRow("Destination", data.destinationCountry || "—", 7)}
  </table>
</td></tr>
${
  data.grossCommissionAmount != null
    ? `<tr><td style="padding:0 44px 24px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EBF5FF;"><tr><td align="center" style="padding:24px;">
    <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Estimated Commission</p>
    <p style="margin:0;font-size:32px;font-weight:700;color:#1e5fad;">${fmtCurrency(data.grossCommissionAmount)}</p>
    ${data.commissionRate != null ? `<p style="margin:8px 0 0;font-size:12px;color:#5d6d7e;">@ ${fmtPct(data.commissionRate)} commission rate</p>` : ""}
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:0 44px 28px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #e87722;background:#fff8f3;"><tr><td style="padding:20px 24px;">
    <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#e87722;letter-spacing:1px;text-transform:uppercase;">What to do next</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:6px 0;font-size:13px;color:#132a45;line-height:1.6;">1. Log in to the partner portal</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#132a45;line-height:1.6;">2. Review the disbursement entry (student name, amount, date)</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#132a45;line-height:1.6;">3. Approve or raise an objection if any discrepancy found</td></tr>
    </table>
  </td></tr></table>
</td></tr>
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">For support, reach out to your account manager.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildObjectionNotificationTemplate(
  data: CommissionNotificationData,
  _cfg: ResolvedNotificationConfig,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Objection Raised</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#e87722;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Action Required</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#132a45;">Objection Raised</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">A partner has disputed a commission settlement</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">A partner has raised an objection on a commission settlement. Please review the details below and take appropriate action.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("Commission Amount", fmtCurrency(data.grossCommissionAmount), 5, true, false, true)}
  </table>
</td></tr>
${
  data.objectionReason
    ? `<tr><td style="padding:0 44px 28px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #e87722;background:#f7f6f3;"><tr><td style="padding:24px 28px;">
    <p style="margin:0 0 16px 0;font-size:12px;font-weight:700;color:#e87722;letter-spacing:1px;text-transform:uppercase;">Reason for Objection</p>
    <p style="margin:0 0 16px 0;font-size:14px;color:#132a45;line-height:1.7;">${esc(data.objectionReason)}</p>
    ${data.triggeredBy?.name ? `<p style="margin:0;font-size:13px;color:#5d6d7e;">Raised by: <strong style="color:#1e5fad;">${esc(data.triggeredBy.name)}</strong></p>` : ""}
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildL1ApprovedTemplate(
  data: CommissionNotificationData,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>L1 Verification Complete</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#e87722;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Approval Required</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#132a45;">L1 Verification Complete — Awaiting Your Approval</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">Approved by <strong style="color:#1e5fad;">${esc(data.approverName || "L1 Reviewer")}</strong></p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">This settlement has passed L1 verification and requires your final approval to proceed with payment.</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("Commission Amount", fmtCurrency(data.grossCommissionAmount), 5, true, false, true)}
  </table>
</td></tr>
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildSettlementReturnedTemplate(
  data: CommissionNotificationData,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Settlement Returned</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#e87722;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Action Required</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#132a45;">Settlement Returned — Review &amp; Resubmit</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">L1 Reviewer has returned this settlement for correction</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">Your commission settlement has been returned during L1 review. Please check the details and take corrective action.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("Commission Amount", fmtCurrency(data.grossCommissionAmount), 5, true, false, true)}
  </table>
</td></tr>
${
  data.rejectionReason
    ? `<tr><td style="padding:0 44px 28px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #e87722;background:#fff8f3;"><tr><td style="padding:24px 28px;">
    <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#e87722;letter-spacing:1px;text-transform:uppercase;">Rejection Reason</p>
    <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">${esc(data.rejectionReason)}</p>
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildL2SentBackToL1Template(
  data: CommissionNotificationData,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Settlement Sent Back</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#e87722;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Re-Review Required</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#132a45;">Settlement Sent Back by Business Head</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">L2 review requires re-examination before resubmission</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">This settlement was sent back during L2 business approval and requires your re-review before resubmission.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("Commission Amount", fmtCurrency(data.grossCommissionAmount), 5, true, false, true)}
  </table>
</td></tr>
${
  data.rejectionReason
    ? `<tr><td style="padding:0 44px 28px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #e87722;background:#fff8f3;"><tr><td style="padding:24px 28px;">
    <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#e87722;letter-spacing:1px;text-transform:uppercase;">Rejection Reason</p>
    <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">${esc(data.rejectionReason)}</p>
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildL2RejectedToPartnerTemplate(
  data: CommissionNotificationData,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Settlement Rejected</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#e87722;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Rejected</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#132a45;">Settlement Rejected by Business Head</h1>
  <p style="margin:0;font-size:14px;color:#e87722;font-weight:500;line-height:1.5;">Please re-upload your invoice</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">Your commission settlement has been rejected during L2 review. Please check the details and re-upload your invoice.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("Commission Amount", fmtCurrency(data.grossCommissionAmount), 5, true, false, true)}
  </table>
</td></tr>
${
  data.rejectionReason
    ? `<tr><td style="padding:0 44px 28px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #e87722;background:#fff8f3;"><tr><td style="padding:24px 28px;">
    <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#e87722;letter-spacing:1px;text-transform:uppercase;">Rejection Reason</p>
    <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">${esc(data.rejectionReason)}</p>
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildInvoiceSubmittedTemplate(
  data: CommissionNotificationData,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Invoice Submitted for Review</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#1e5fad;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Pending Review</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#132a45;">Invoice Submitted for Review</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">A partner has submitted an invoice for commission settlement</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">Please review the invoice details and proceed with verification.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("Commission Amount", fmtCurrency(data.grossCommissionAmount), 5, true, false, true)}
  </table>
</td></tr>
${
  data.invoiceNumber || data.invoiceAmount != null
    ? `<tr><td style="padding:0 44px 28px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #1e5fad;background:#f0f7ff;"><tr><td style="padding:20px 24px;">
    <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Invoice Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${data.invoiceNumber ? `<tr><td width="140" style="padding:8px 0;font-size:13px;color:#5d6d7e;">Invoice #</td><td style="padding:8px 0;font-size:13px;color:#1e5fad;font-weight:600;font-family:monospace;">${esc(data.invoiceNumber)}</td></tr>` : ""}
      ${data.invoiceAmount != null ? `<tr><td width="140" style="padding:8px 0;font-size:13px;color:#5d6d7e;">Invoice Amount</td><td style="padding:8px 0;font-size:15px;color:#1e5fad;font-weight:700;">${fmtCurrency(data.invoiceAmount)}</td></tr>` : ""}
    </table>
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildDisputeResolvedTemplate(
  data: CommissionNotificationData,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Dispute Resolved</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#1e5fad;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Resolved</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#132a45;">Dispute Resolved</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">Your objection has been reviewed and resolved</p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">The admin team has reviewed and resolved the dispute on your commission settlement. Please log in to the portal to check the updated status.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    ${tableRow("Commission Amount", fmtCurrency(data.grossCommissionAmount), 5, true, false, true)}
  </table>
</td></tr>
${
  data.disputeResolution
    ? `<tr><td style="padding:0 44px 28px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #1e5fad;background:#f0f7ff;"><tr><td style="padding:24px 28px;">
    <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Resolution</p>
    <p style="margin:0 0 14px 0;font-size:14px;color:#132a45;line-height:1.7;">${esc(data.disputeResolution)}</p>
    ${data.disputeResolvedBy ? `<p style="margin:0;font-size:13px;color:#5d6d7e;">Resolved by: <strong style="color:#1e5fad;">${esc(data.disputeResolvedBy)}</strong></p>` : ""}
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildFinalApprovalTemplate(
  data: CommissionNotificationData,
): string {
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  const tableRow = (label: string, value: string, idx: number, bold = false, mono = false, blueText = false) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#eef0f3";
    const fontWeight = bold ? "font-weight:700;" : "font-weight:600;";
    const fontFamily = mono ? "font-family:monospace;" : "";
    const color = blueText ? "color:#1e5fad;" : "color:#132a45;";
    return `<tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:${bg};">${esc(label)}</td><td style="padding:12px 16px;font-size:${bold ? "14" : "13"}px;${color}${fontWeight}${fontFamily}background:${bg};">${esc(value)}</td></tr>`;
  };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Final Approval Complete</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef0f3;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:40px 20px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;box-shadow:0 2px 12px rgba(10,22,40,0.08);">
<tr><td style="padding:32px 44px 24px 44px;border-bottom:1px solid #d4dbe6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><span style="font-size:20px;font-weight:700;color:#1e5fad;">Edumate</span><span style="font-size:20px;font-weight:700;color:#e87722;"> Global</span></td>
    <td align="right"><span style="display:inline-block;background:#1e5fad;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;text-transform:uppercase;letter-spacing:0.5px;">Ready for Payout</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 44px 24px 44px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#132a45;">Final Approval Complete — Proceed to Payment</h1>
  <p style="margin:0;font-size:14px;color:#5d6d7e;line-height:1.5;">Approved by <strong style="color:#1e5fad;">${esc(data.approverName || "Business Head")}</strong></p>
</td></tr>
<tr><td style="padding:0 44px 28px 44px;">
  <p style="margin:0 0 12px 0;font-size:14px;color:#132a45;line-height:1.7;">Hi Team,</p>
  <p style="margin:0;font-size:14px;color:#132a45;line-height:1.7;">This settlement has received final business approval. Please proceed with payment initiation.</p>
</td></tr>
<tr><td style="padding:0 44px 24px 44px;">
  <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:#1e5fad;letter-spacing:1px;text-transform:uppercase;">Settlement Details</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Field</td><td style="background:#1e5fad;padding:12px 16px;font-size:12px;font-weight:600;color:#ffffff;">Value</td></tr>
    ${tableRow("Reference", data.settlementRefNumber || "—", 0, false, true, true)}
    ${tableRow("Partner", data.partnerName || "—", 1, true)}
    ${tableRow("Student", data.studentName || "—", 2)}
    ${tableRow("Lender", data.lenderName || "—", 3)}
    ${tableRow("Disbursed Amount", fmtCurrency(data.loanAmountDisbursed), 4, true, false, true)}
    <tr><td style="padding:12px 16px;font-size:13px;color:#132a45;background:#EBF5FF;font-weight:600;">${esc("Commission Amount")}</td><td style="padding:12px 16px;font-size:15px;color:#1e5fad;font-weight:700;background:#EBF5FF;">${esc(fmtCurrency(data.grossCommissionAmount))}</td></tr>
  </table>
</td></tr>
<tr><td style="padding:0 44px;"><div style="height:1px;background:#d4dbe6;"></div></td></tr>
<tr><td style="padding:24px 44px;background:#eef0f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <p style="margin:0 0 6px 0;font-size:12px;color:#5d6d7e;">This is an automated notification from <span style="color:#1e5fad;font-weight:600;">Edumate</span> <span style="color:#e87722;font-weight:600;">Global</span>.</p>
    <p style="margin:0 0 6px 0;font-size:11px;color:#5d6d7e;">Do not reply to this email. For queries, contact the team.</p>
    <p style="margin:0;font-size:11px;color:#5d6d7e;">&copy; ${CURRENT_YEAR} Edumate Global. All rights reserved.</p>
  </td></tr></table>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ============================================================================
// TEMPLATE UTILITIES
// ============================================================================

function esc(str?: string | null): string {
  if (!str) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replace(/[&<>"']/g, (c) => map[c] || c);
}
