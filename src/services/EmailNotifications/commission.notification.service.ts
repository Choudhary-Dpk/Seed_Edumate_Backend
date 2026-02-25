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
      `🔔 New Partner Onboarded — ${data.partnerName || "Unknown"} | Action Required: Upload Bank Details`,

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
        `💰 New Commission Entry — ${data.studentName || "Student"} | ${amount} Disbursed | Review on Portal`
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
      `⚠️ Objection Raised — ${data.studentName || "Student"} | ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"}`,

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
      `📄 Invoice Submitted — ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"} | Review Required`,

    getHtml: (data, cfg) =>
      buildGenericApprovalTemplate(data, cfg, {
        headerColor: "#1B4F72,#2E86C1",
        icon: "📄",
        title: "Invoice Submitted for Review",
        subtitle:
          "A partner has submitted an invoice for commission settlement",
        bodyText:
          "Please review the invoice details and proceed with verification.",
        ctaUrl: `${cfg.portalBaseUrl}/admin/commissions/${data.settlementId}`,
      }),
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

    getHtml: (data, cfg) =>
      buildGenericApprovalTemplate(data, cfg, {
        headerColor: "#27AE60,#2ECC71",
        icon: "",
        title: "L1 Verification Complete — Awaiting Your Approval",
        subtitle: `Approved by ${data.approverName || "L1 Reviewer"}`,
        bodyText:
          "This settlement has passed L1 verification and requires your final approval to proceed with payment.",
        ctaUrl: `${cfg.portalBaseUrl}/admin/commissions/${data.settlementId}`,
      }),
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
      `❌ Settlement Returned — ${data.studentName || "Student"} | ${data.settlementRefNumber || "N/A"} | Action Required`,

    getHtml: (data, cfg) =>
      buildGenericApprovalTemplate(data, cfg, {
        headerColor: "#DC2626,#EF4444",
        icon: "❌",
        title: "Settlement Returned by L1 Reviewer",
        subtitle: data.rejectionReason
          ? `Reason: ${data.rejectionReason}`
          : "Please review and resubmit",
        bodyText:
          "Your commission settlement has been returned during L1 review. Please check the details and take corrective action.",
        ctaUrl: `${cfg.portalBaseUrl}/partners/commissions`,
      }),
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
      `🎉 L2 Approved — ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"} | Ready for Payout`,

    getHtml: (data, cfg) =>
      buildGenericApprovalTemplate(data, cfg, {
        headerColor: "#059669,#10B981",
        icon: "🎉",
        title: "Final Approval Complete — Ready for Payout",
        subtitle: `Approved by ${data.approverName || "Business Head"}`,
        bodyText:
          "This settlement has received final business approval. Please proceed with payment initiation.",
        ctaUrl: `${cfg.portalBaseUrl}/admin/commissions/${data.settlementId}`,
      }),
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
      `🔙 L2 Sent Back — ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"} | Re-review Required`,

    getHtml: (data, cfg) =>
      buildGenericApprovalTemplate(data, cfg, {
        headerColor: "#D97706,#F59E0B",
        icon: "🔙",
        title: "Settlement Sent Back by Business Head",
        subtitle: data.rejectionReason
          ? `Reason: ${data.rejectionReason}`
          : "Sent back for re-review",
        bodyText:
          "This settlement was sent back during L2 business approval and requires your re-review before resubmission.",
        ctaUrl: `${cfg.portalBaseUrl}/admin/commissions/${data.settlementId}`,
      }),
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
      `❌ Settlement Rejected — ${data.studentName || "Student"} | ${data.settlementRefNumber || "N/A"} | Re-upload Required`,

    getHtml: (data, cfg) =>
      buildGenericApprovalTemplate(data, cfg, {
        headerColor: "#DC2626,#EF4444",
        icon: "❌",
        title: "Settlement Rejected by Business Head",
        subtitle: data.rejectionReason
          ? `Reason: ${data.rejectionReason}`
          : "Please re-upload your invoice",
        bodyText:
          "Your commission settlement has been rejected during L2 review. Please check the details and re-upload your invoice.",
        ctaUrl: `${cfg.portalBaseUrl}/partners/commissions`,
      }),
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

    getHtml: (data, cfg) =>
      buildGenericApprovalTemplate(data, cfg, {
        headerColor: "#059669,#10B981",
        icon: "",
        title: "Dispute Resolved",
        subtitle: data.disputeResolution
          ? `Resolution: ${data.disputeResolution}`
          : "Your objection has been reviewed and resolved",
        bodyText:
          "The admin team has reviewed and resolved the dispute on your commission settlement. Please log in to the portal to check the updated status.",
        ctaUrl: `${cfg.portalBaseUrl}/partners/commissions`,
      }),
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
  cfg: ResolvedNotificationConfig,
): string {
  const partnerPortalUrl = `${cfg.portalBaseUrl}/admin/partners/${data.partnerId}`;
  const onboardedDate = data.onboardedAt
    ? moment(data.onboardedAt).format("DD MMM YYYY, hh:mm A")
    : moment().format("DD MMM YYYY, hh:mm A");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1B4F72 0%,#2E86C1 100%);padding:28px 32px;">
  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">🔔 New Partner Onboarded</h1>
  <p style="margin:6px 0 0;color:#D6EAF8;font-size:13px;">Action Required: Upload Bank Details in HubSpot</p>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Finance Team,</p>
  <p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A new B2B partner has been onboarded. Please review their details and ensure bank information is uploaded in HubSpot for future commission payouts.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:20px;"><tr><td style="padding:18px 20px;">
    <h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Partner Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner Name</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">${esc(data.partnerName)}</td></tr>
      ${row("Partner Type", data.partnerType)}${row("Business Type", data.businessType)}${row("GST Number", data.gstNumber)}${row("PAN Number", data.panNumber)}${row("City", data.city)}${row("State", data.state)}${row("Country", data.country)}${row("Commission Applicable", data.isCommissionApplicable)}${row("Contact Email", data.contactEmail)}${row("Contact Phone", data.contactPhone)}
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Onboarded At</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">${onboardedDate}</td></tr>
    </table>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 16px;">
    <a href="${partnerPortalUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#1B4F72 0%,#2E86C1 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">View Partner Details →</a>
  </td></tr></table>
</td></tr>
${footerRow(cfg)}
</table></td></tr></table></body></html>`;
}

function buildPartnerCommissionTemplate(
  data: CommissionNotificationData,
  cfg: ResolvedNotificationConfig,
  recipientName?: string | null,
): string {
  const portalUrl = `${cfg.portalBaseUrl}/partners/commissions`;
  const greeting = recipientName
    ? recipientName.charAt(0).toUpperCase() + recipientName.slice(1)
    : "Partner";
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
  const fmtDate = (d: Date | null | undefined) =>
    d ? moment(d).format("DD MMM YYYY") : "—";
  const fmtPct = (v: number | null | undefined) => (v != null ? `${v}%` : "—");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#27AE60 0%,#2ECC71 100%);padding:28px 32px;">
  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">💰 New Commission Entry</h1>
  <p style="margin:6px 0 0;color:#D5F5E3;font-size:13px;">A new disbursement entry is available for your review</p>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi ${esc(greeting)},</p>
  <p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A new commission settlement entry has been created for your review. Please log in to the partner portal to verify the details and proceed accordingly.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FFF4;border:1px solid #C6F6D5;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;">
    <h3 style="margin:0 0 14px;color:#276749;font-size:15px;font-weight:600;border-bottom:1px solid #C6F6D5;padding-bottom:10px;">Settlement Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row("Reference Number", data.settlementRefNumber, true)}
      ${data.settlementMonth && data.settlementYear ? `<tr><td width="180" style="padding:6px 0;color:#718096;font-size:13px;">Settlement Period</td><td style="padding:6px 0;color:#2D3748;font-size:13px;">${esc(data.settlementMonth)} ${data.settlementYear}</td></tr>` : ""}
      ${data.settlementDate ? `<tr><td style="padding:6px 0;color:#718096;font-size:13px;">Settlement Date</td><td style="padding:6px 0;color:#2D3748;font-size:13px;">${fmtDate(data.settlementDate)}</td></tr>` : ""}
    </table>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;">
    <h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Disbursement Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student Name</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">${esc(data.studentName || "—")}</td></tr>
      ${row("Student ID", data.studentId)}${row("Lender", data.lenderName)}${row("Loan Product", data.loanProductName)}
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">${fmtCurrency(data.loanAmountDisbursed)}</td></tr>
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursement Date</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">${fmtDate(data.disbursementDate)}</td></tr>
      ${row("University", data.universityName)}${row("Course", data.courseName)}${row("Destination", data.destinationCountry)}
    </table>
  </td></tr></table>
  ${
    data.grossCommissionAmount != null
      ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#EBF8FF 0%,#DBEAFE 100%);border:1px solid #93C5FD;border-radius:8px;margin-bottom:20px;"><tr><td align="center" style="padding:20px;">
    <p style="margin:0 0 4px;color:#1E40AF;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Estimated Commission</p>
    <p style="margin:0;color:#1E3A5F;font-size:28px;font-weight:700;">${fmtCurrency(data.grossCommissionAmount)}</p>
    ${data.commissionRate != null ? `<p style="margin:4px 0 0;color:#3B82F6;font-size:12px;">@ ${fmtPct(data.commissionRate)} commission rate</p>` : ""}
  </td></tr></table>`
      : ""
  }
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF7ED;border:1px solid #FDBA74;border-radius:8px;margin-bottom:20px;"><tr><td style="padding:16px 20px;">
    <h4 style="margin:0 0 8px;color:#9A3412;font-size:14px;">📋 What to do next</h4>
    <ol style="margin:0;padding:0 0 0 18px;color:#9A3412;font-size:13px;line-height:1.8;">
      <li>Log in to the partner portal</li><li>Review the disbursement entry (student name, amount, date)</li><li>Approve or raise an objection if any discrepancy found</li>
    </ol>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 16px;">
    <a href="${portalUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#27AE60 0%,#2ECC71 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Review on Partner Portal →</a>
  </td></tr></table>
</td></tr>
<tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;">
  <p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from ${esc(cfg.companyName)}.<br/>For support, reach out to your account manager or email ${esc(cfg.supportEmail)}<br/>© ${CURRENT_YEAR} ${esc(cfg.companyName)}. All rights reserved.</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildObjectionNotificationTemplate(
  data: CommissionNotificationData,
  cfg: ResolvedNotificationConfig,
): string {
  const portalUrl = `${cfg.portalBaseUrl}/admin/commissions/${data.settlementId}`;
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#DC2626 0%,#EF4444 100%);padding:28px 32px;">
  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">⚠️ Objection Raised</h1>
  <p style="margin:6px 0 0;color:#FEE2E2;font-size:13px;">A partner has disputed a commission settlement — Action Required</p>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p>
  <p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A partner has raised an objection on a commission settlement. Please review the details and take appropriate action.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;">
    <h3 style="margin:0 0 14px;color:#991B1B;font-size:15px;font-weight:600;border-bottom:1px solid #FECACA;padding-bottom:10px;">Settlement Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row("Reference", data.settlementRefNumber, true)}
      <tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">${esc(data.partnerName || "—")}</td></tr>
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">${esc(data.studentName || "—")}</td></tr>
      ${row("Lender", data.lenderName)}
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">${fmtCurrency(data.loanAmountDisbursed)}</td></tr>
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">${fmtCurrency(data.grossCommissionAmount)}</td></tr>
    </table>
  </td></tr></table>
  ${
    data.objectionReason
      ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF7ED;border:1px solid #FDBA74;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;">
    <h3 style="margin:0 0 10px;color:#9A3412;font-size:15px;font-weight:600;">Reason for Objection</h3>
    <p style="margin:0;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(data.objectionReason)}</p>
    ${data.triggeredBy?.name ? `<p style="margin:10px 0 0;color:#7F8C8D;font-size:12px;">Raised by: ${esc(data.triggeredBy.name)}</p>` : ""}
  </td></tr></table>`
      : ""
  }
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 16px;">
    <a href="${portalUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#DC2626 0%,#EF4444 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Review &amp; Resolve Dispute →</a>
  </td></tr></table>
</td></tr>
${footerRow(cfg)}
</table></td></tr></table></body></html>`;
}

interface ApprovalTemplateOpts {
  headerColor: string;
  icon: string;
  title: string;
  subtitle: string;
  bodyText: string;
  ctaText?: string;
  ctaUrl: string;
}

function buildGenericApprovalTemplate(
  data: CommissionNotificationData,
  cfg: ResolvedNotificationConfig,
  opts: ApprovalTemplateOpts,
): string {
  const [colorFrom, colorTo] = opts.headerColor.split(",");
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,${colorFrom} 0%,${colorTo} 100%);padding:28px 32px;">
  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">${opts.icon} ${esc(opts.title)}</h1>
  <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${esc(opts.subtitle)}</p>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p>
  <p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">${esc(opts.bodyText)}</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;">
    <h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row("Reference", data.settlementRefNumber, true)}
      <tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">${esc(data.partnerName || "—")}</td></tr>
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">${esc(data.studentName || "—")}</td></tr>
      ${row("Lender", data.lenderName)}
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">${fmtCurrency(data.loanAmountDisbursed)}</td></tr>
      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">${fmtCurrency(data.grossCommissionAmount)}</td></tr>
      ${data.invoiceNumber ? row("Invoice #", data.invoiceNumber, true) : ""}
      ${data.invoiceAmount != null ? `<tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Invoice Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">${fmtCurrency(data.invoiceAmount)}</td></tr>` : ""}
    </table>
  </td></tr></table>
  ${
    data.rejectionReason
      ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:16px 20px;">
    <h4 style="margin:0 0 8px;color:#991B1B;font-size:14px;">Rejection Reason</h4>
    <p style="margin:0;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(data.rejectionReason)}</p>
  </td></tr></table>`
      : ""
  }
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 16px;">
    <a href="${opts.ctaUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,${colorFrom} 0%,${colorTo} 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${esc(opts.ctaText || "View Details →")}</a>
  </td></tr></table>
</td></tr>
${footerRow(cfg)}
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

function row(label: string, value?: string | null, mono = false): string {
  if (!value) return "";
  return `<tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;vertical-align:top;">${label}</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;${mono ? "font-family:monospace;" : ""}">${esc(value)}</td></tr>`;
}

function footerRow(cfg: ResolvedNotificationConfig): string {
  return `<tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;">
  <p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from ${esc(cfg.companyName)} Commission System.<br/>Do not reply to this email. For queries, contact the tech team.<br/>© ${CURRENT_YEAR} ${esc(cfg.companyName)}. All rights reserved.</p>
</td></tr>`;
}
