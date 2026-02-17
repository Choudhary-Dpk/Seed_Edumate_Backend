import moment from "moment";
import prisma from "../../config/prisma";
import { queueEmail } from "../email-queue.service";
import logger from "../../utils/logger";
import { EmailType, EmailCategory, SenderType } from "../email-log.service";

// ============================================================================
// CONSTANTS
// ============================================================================

const FINANCE_EMAIL =
  process.env.COMMISSION_FINANCE_EMAIL || "riyaz@seedglobaleducation.com";
const BDM_EMAIL = process.env.COMMISSION_BDM_EMAIL || "tech@edumateglobal.com";
const OPS_EMAIL =
  process.env.COMMISSION_OPS_EMAIL || "riyaz@seedglobaleducation.com";
const L2_APPROVER_EMAIL =
  process.env.COMMISSION_L2_APPROVER_EMAIL || "riyaz@seedglobaleducation.com";
const PORTAL_BASE_URL =
  process.env.FRONTEND_URL || "https://portal.edumateglobal.com";
const COMPANY_NAME = "Edumate Global";
const CURRENT_YEAR = moment().format("YYYY");

// ============================================================================
// NOTIFICATION TYPES — Add new types here as you build more phases
// ============================================================================

export type CommissionNotificationType =
  | "FINANCE_PARTNER_ONBOARDED" // Phase 1: New partner → Finance
  | "PARTNER_COMMISSION_CREATED" // Phase 2: Commission entry → Partner
  | "PARTNER_OBJECTION_RAISED" // Phase 3: Partner raises objection → Admin/Ops
  | "ADMIN_DISPUTE_RESOLVED" // Phase 3: Admin resolves dispute → Partner
  | "INVOICE_SUBMITTED" // Phase 3: Invoice submitted → Finance
  | "L1_APPROVED" // Phase 4: L1 approved → L2 Business Head
  | "L1_REJECTED" // Phase 4: L1 rejected → Partner
  | "L2_APPROVED" // Phase 4: L2 approved → Partner + Finance
  | "L2_REJECTED_TO_L1" // Phase 4: L2 rejected → L1
  | "L2_REJECTED_TO_PARTNER"; // Phase 4: L2 rejected → Partner
// | "REMINDER_APPROVER_SLA"         // Phase 6: Reminder → Approver
// | "ESCALATION_BUSINESS_HEAD"      // Phase 6: Escalation → Business Head

// ============================================================================
// NOTIFICATION DATA — Single flexible interface for all types
// ============================================================================

export interface CommissionNotificationData {
  // ── Who triggered this ──
  triggeredBy?: {
    userId?: number;
    name?: string;
    type?: "system" | "admin" | "partner";
  };

  // ── Partner info (used by most notification types) ──
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

  // ── Settlement / Commission info ──
  settlementId?: number;
  settlementRefNumber?: string | null;
  settlementMonth?: string | null;
  settlementYear?: number | null;
  settlementDate?: Date | null;

  // ── Student & Loan details ──
  studentName?: string | null;
  studentId?: string | null;
  lenderName?: string | null;
  loanProductName?: string | null;
  loanAmountDisbursed?: number | null;
  disbursementDate?: Date | null;
  universityName?: string | null;
  courseName?: string | null;
  destinationCountry?: string | null;

  // ── Commission calculation ──
  commissionRate?: number | null;
  grossCommissionAmount?: number | null;

  // ── Phase 3: Objection / Dispute ──
  objectionReason?: string | null;
  disputeResolution?: string | null;
  disputeResolvedBy?: string | null;

  // ── Phase 3: Invoice ──
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
  invoiceAmount?: number | null;
  invoiceUrl?: string | null;
  settlementsCount?: number;

  // ── Phase 4: Approval workflow ──
  approverName?: string | null;
  approverNotes?: string | null;
  rejectionReason?: string | null;
  rejectedBy?: string | null;
  rejectTo?: "l1" | "partner";

  // ── Overrides (optional) ──
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
// NOTIFICATION CONFIG — Each type's behavior defined here
// ============================================================================

interface NotificationConfig {
  emailType: EmailType;
  category: EmailCategory;
  referenceType: string;
  priority: number;
  getRecipient: (data: CommissionNotificationData) => Promise<{
    to: string;
    cc?: string[];
    recipientUserId?: number;
  }>;
  getSubject: (data: CommissionNotificationData) => string;
  getHtml: (
    data: CommissionNotificationData,
    recipientName?: string | null,
  ) => string;
  getReferenceId: (data: CommissionNotificationData) => number | undefined;
  afterSend?: (
    data: CommissionNotificationData,
    recipientEmail: string,
  ) => Promise<void>;
}

const NOTIFICATION_CONFIGS: Record<
  CommissionNotificationType,
  NotificationConfig
> = {
  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1: Notify Finance — New Partner Onboarded
  // ──────────────────────────────────────────────────────────────────────────
  FINANCE_PARTNER_ONBOARDED: {
    emailType: EmailType.COMMISSION_FINANCE_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "partner",
    priority: 5,

    getRecipient: async (data) => ({
      to: data.overrideRecipient || FINANCE_EMAIL,
      cc: data.overrideCc || [BDM_EMAIL],
    }),

    getSubject: (data) =>
      data.overrideSubject ||
      `🔔 New Partner Onboarded — ${data.partnerName || "Unknown"} | Action Required: Upload Bank Details`,

    getHtml: (data) => buildFinanceNotificationTemplate(data),

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

      if (!partnerUsers.length) {
        throw new Error(`No active users found for partner B2B ID ${b2bId}`);
      }

      const primary = partnerUsers[0];

      return {
        to: primary.email,
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

    getHtml: (data, recipientName) =>
      buildPartnerCommissionTemplate(data, recipientName),

    getReferenceId: (data) => data.settlementId,

    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;

      try {
        await prisma.hSCommissionSettlementsCommunication.upsert({
          where: { settlement_id: data.settlementId },
          update: {
            notification_date: new Date(),
            notification_method: "Email",
            partner_notification_sent: "Yes",
            last_communication_date: new Date(),
            email_sent_count: { increment: 1 },
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Commission notification sent to ${recipientEmail}`,
          },
          create: {
            settlement_id: data.settlementId,
            notification_date: new Date(),
            notification_method: "Email",
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
  // PHASE 3: Notify Finance — Partner Raised Objection
  // ──────────────────────────────────────────────────────────────────────────
  PARTNER_OBJECTION_RAISED: {
    emailType: EmailType.COMMISSION_OBJECTION_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data) => ({
      to: data.overrideRecipient || FINANCE_EMAIL,
      cc: data.overrideCc || [BDM_EMAIL],
    }),

    getSubject: (data) =>
      data.overrideSubject ||
      `⚠️ Objection Raised — ${data.studentName || "Student"} | ${data.partnerName || "Partner"} | ${data.settlementRefNumber || "N/A"}`,

    getHtml: (data) => buildObjectionRaisedTemplate(data),

    getReferenceId: (data) => data.settlementId,

    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      try {
        await prisma.hSCommissionSettlementsCommunication.upsert({
          where: { settlement_id: data.settlementId },
          update: {
            last_communication_date: new Date(),
            email_sent_count: { increment: 1 },
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Objection notification sent to ${recipientEmail}`,
          },
          create: {
            settlement_id: data.settlementId,
            notification_date: new Date(),
            notification_method: "Email",
            last_communication_date: new Date(),
            email_sent_count: 1,
            sms_sent_count: 0,
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Objection notification sent to ${recipientEmail}`,
          },
        });
      } catch (err: any) {
        logger.warn(
          "Failed to update settlement communication after objection",
          {
            error: err.message,
            settlementId: data.settlementId,
          },
        );
      }
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: Notify Partner — Admin Resolved Dispute
  // ──────────────────────────────────────────────────────────────────────────
  ADMIN_DISPUTE_RESOLVED: {
    emailType: EmailType.COMMISSION_DISPUTE_RESOLVED_NOTIFY,
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

      if (!partnerUsers.length) {
        throw new Error(`No active users found for partner B2B ID ${b2bId}`);
      }

      const primary = partnerUsers[0];
      return {
        to: primary.email,
        recipientUserId: primary.id,
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `✅ Dispute Resolved — ${data.studentName || "Student"} | Review Updated Entry on Portal`,

    getHtml: (data, recipientName) =>
      buildDisputeResolvedTemplate(data, recipientName),

    getReferenceId: (data) => data.settlementId,

    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      try {
        await prisma.hSCommissionSettlementsCommunication.upsert({
          where: { settlement_id: data.settlementId },
          update: {
            last_communication_date: new Date(),
            email_sent_count: { increment: 1 },
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Dispute resolved notification sent to ${recipientEmail}`,
          },
          create: {
            settlement_id: data.settlementId,
            notification_date: new Date(),
            notification_method: "Email",
            last_communication_date: new Date(),
            email_sent_count: 1,
            sms_sent_count: 0,
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Dispute resolved notification sent to ${recipientEmail}`,
          },
        });
      } catch (err: any) {
        logger.warn(
          "Failed to update settlement communication after dispute resolution",
          {
            error: err.message,
            settlementId: data.settlementId,
          },
        );
      }
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: Notify Finance — Invoice Submitted by Partner
  // ──────────────────────────────────────────────────────────────────────────
  INVOICE_SUBMITTED: {
    emailType: EmailType.COMMISSION_INVOICE_SUBMITTED_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 3,

    getRecipient: async (data) => ({
      to: data.overrideRecipient || FINANCE_EMAIL,
      cc: data.overrideCc || [BDM_EMAIL],
    }),

    getSubject: (data) => {
      const count = data.settlementsCount || 1;
      return (
        data.overrideSubject ||
        `📄 Invoice Submitted — ${data.partnerName || "Partner"} | ${data.invoiceNumber || "N/A"} | ${count} Settlement(s)`
      );
    },

    getHtml: (data) => buildInvoiceSubmittedTemplate(data),

    getReferenceId: (data) => data.settlementId,

    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      try {
        await prisma.hSCommissionSettlementsCommunication.upsert({
          where: { settlement_id: data.settlementId },
          update: {
            last_communication_date: new Date(),
            email_sent_count: { increment: 1 },
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Invoice submitted notification sent to ${recipientEmail}`,
          },
          create: {
            settlement_id: data.settlementId,
            notification_date: new Date(),
            notification_method: "Email",
            last_communication_date: new Date(),
            email_sent_count: 1,
            sms_sent_count: 0,
            communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] Invoice submitted notification sent to ${recipientEmail}`,
          },
        });
      } catch (err: any) {
        logger.warn(
          "Failed to update settlement communication after invoice submission",
          {
            error: err.message,
            settlementId: data.settlementId,
          },
        );
      }
    },
  },

  // ===================== PHASE 4: APPROVAL WORKFLOW =====================

  L1_APPROVED: {
    emailType: EmailType.COMMISSION_L1_APPROVED_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 3,

    getRecipient: async (data) => ({
      to: data.overrideRecipient || L2_APPROVER_EMAIL,
      cc: data.overrideCc || [BDM_EMAIL],
    }),

    getSubject: (data) =>
      data.overrideSubject ||
      `✅ L1 Approved — ${data.studentName || "Student"} | ${data.partnerName || "Partner"}`,

    getHtml: (data) =>
      buildApprovalEmailTemplate({
        action: "L1 Approved",
        actionColor: "#27AE60",
        studentName: data.studentName || "N/A",
        partnerName: data.partnerName || "N/A",
        settlementRef: data.settlementRefNumber || "N/A",
        performedBy: data.approverName || "Reviewer",
        notes: data.approverNotes || null,
        message:
          "This settlement has been approved at L1 and is now pending L2 (Business Head) approval.",
        nextAction: "Please review and provide final approval.",
      }),

    getReferenceId: (data) => data.settlementId,
    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      await updateCommunicationLog(
        data.settlementId,
        `L1 approved notification sent to ${recipientEmail}`,
      );
    },
  },

  L1_REJECTED: {
    emailType: EmailType.COMMISSION_L1_REJECTED_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data) => {
      const partnerEmail = await getPartnerEmailByB2BId(data.partnerB2BId);
      return {
        to: data.overrideRecipient || partnerEmail || FINANCE_EMAIL,
        cc: data.overrideCc || [OPS_EMAIL],
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `❌ Invoice Rejected — ${data.studentName || "Student"} | Review Required`,

    getHtml: (data) =>
      buildApprovalEmailTemplate({
        action: "Invoice Rejected (L1)",
        actionColor: "#E74C3C",
        studentName: data.studentName || "N/A",
        partnerName: data.partnerName || "N/A",
        settlementRef: data.settlementRefNumber || "N/A",
        performedBy: data.rejectedBy || "Reviewer",
        notes: data.rejectionReason || null,
        message:
          "Your invoice has been rejected. Please review the reason below and re-upload a corrected invoice.",
        nextAction:
          "Please log into the partner portal to re-upload your invoice.",
      }),

    getReferenceId: (data) => data.settlementId,
    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      await updateCommunicationLog(
        data.settlementId,
        `L1 rejected notification sent to ${recipientEmail}`,
      );
    },
  },

  L2_APPROVED: {
    emailType: EmailType.COMMISSION_L2_APPROVED_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data) => {
      const partnerEmail = await getPartnerEmailByB2BId(data.partnerB2BId);
      return {
        to: data.overrideRecipient || partnerEmail || FINANCE_EMAIL,
        cc: data.overrideCc || [FINANCE_EMAIL, BDM_EMAIL],
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `✅ Commission Approved — ${data.studentName || "Student"} | ${data.partnerName || "Partner"} | Ready for Payout`,

    getHtml: (data) =>
      buildApprovalEmailTemplate({
        action: "Commission Approved (Final)",
        actionColor: "#27AE60",
        studentName: data.studentName || "N/A",
        partnerName: data.partnerName || "N/A",
        settlementRef: data.settlementRefNumber || "N/A",
        performedBy: data.approverName || "Approver",
        notes: data.approverNotes || null,
        message:
          "Your commission has been fully approved and is now ready for payout processing.",
        nextAction:
          "Payout will be initiated shortly. You will receive a notification once payment is completed.",
      }),

    getReferenceId: (data) => data.settlementId,
    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      await updateCommunicationLog(
        data.settlementId,
        `L2 approved notification sent to ${recipientEmail}`,
      );
    },
  },

  L2_REJECTED_TO_L1: {
    emailType: EmailType.COMMISSION_L2_REJECTED_TO_L1_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 3,

    getRecipient: async (data) => ({
      to: data.overrideRecipient || FINANCE_EMAIL,
      cc: data.overrideCc || [OPS_EMAIL],
    }),

    getSubject: (data) =>
      data.overrideSubject ||
      `🔄 Sent Back for Re-review — ${data.studentName || "Student"} | ${data.partnerName || "Partner"}`,

    getHtml: (data) =>
      buildApprovalEmailTemplate({
        action: "Sent Back to L1",
        actionColor: "#F39C12",
        studentName: data.studentName || "N/A",
        partnerName: data.partnerName || "N/A",
        settlementRef: data.settlementRefNumber || "N/A",
        performedBy: data.rejectedBy || "Approver",
        notes: data.rejectionReason || null,
        message:
          "This settlement has been sent back for L1 re-review by the Business Head.",
        nextAction:
          "Please re-review this settlement and take appropriate action.",
      }),

    getReferenceId: (data) => data.settlementId,
    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      await updateCommunicationLog(
        data.settlementId,
        `L2 rejected-to-L1 notification sent to ${recipientEmail}`,
      );
    },
  },

  L2_REJECTED_TO_PARTNER: {
    emailType: EmailType.COMMISSION_L2_REJECTED_TO_PARTNER_NOTIFY,
    category: EmailCategory.NOTIFICATION,
    referenceType: "commission_settlement",
    priority: 2,

    getRecipient: async (data) => {
      const partnerEmail = await getPartnerEmailByB2BId(data.partnerB2BId);
      return {
        to: data.overrideRecipient || partnerEmail || FINANCE_EMAIL,
        cc: data.overrideCc || [OPS_EMAIL],
      };
    },

    getSubject: (data) =>
      data.overrideSubject ||
      `❌ Commission Rejected — ${data.studentName || "Student"} | Action Required`,

    getHtml: (data) =>
      buildApprovalEmailTemplate({
        action: "Commission Rejected (L2)",
        actionColor: "#E74C3C",
        studentName: data.studentName || "N/A",
        partnerName: data.partnerName || "N/A",
        settlementRef: data.settlementRefNumber || "N/A",
        performedBy: data.rejectedBy || "Approver",
        notes: data.rejectionReason || null,
        message:
          "Your commission has been rejected by the Business Head. Please review the reason and re-upload a corrected invoice.",
        nextAction:
          "Please log into the partner portal to re-upload your invoice.",
      }),

    getReferenceId: (data) => data.settlementId,
    afterSend: async (data, recipientEmail) => {
      if (!data.settlementId) return;
      await updateCommunicationLog(
        data.settlementId,
        `L2 rejected-to-partner notification sent to ${recipientEmail}`,
      );
    },
  },
};

/**
 * Send a commission-related notification email.
 *
 * ONE function for everything. The `type` parameter decides:
 *   - Who receives the email
 *   - What subject/template to use
 *   - What email type / category to log
 *   - What to do after sending (update communication tables, etc.)
 *
 * @param type - Notification type (e.g., "FINANCE_PARTNER_ONBOARDED")
 * @param data - All the data needed for the notification
 * @returns Result with success status and email log ID
 *
 * @example
 *   // Phase 1: Notify finance
 *   await sendCommissionNotification("FINANCE_PARTNER_ONBOARDED", { partnerId: 1, partnerName: "ABC Corp", ... });
 *
 *   // Phase 2: Notify partner
 *   await sendCommissionNotification("PARTNER_COMMISSION_CREATED", { settlementId: 5, partnerB2BId: 1, ... });
 *
 *   // Future Phase 4: L1 approved
 *   await sendCommissionNotification("L1_APPROVED", { settlementId: 5, ... });
 */
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

    // ── Step 1: Resolve recipient ──
    const { to, cc, recipientUserId } = await config.getRecipient(data);

    // ── Step 2: Get recipient name for greeting ──
    let recipientName: string | null = null;
    if (recipientUserId) {
      const user = await prisma.b2BPartnersUsers.findUnique({
        where: { id: recipientUserId },
        select: { full_name: true },
      });
      recipientName = user?.full_name || null;
    }

    // ── Step 3: Build subject & HTML ──
    const subject = config.getSubject(data);
    const html = config.getHtml(data, recipientName);

    // ── Step 4: Queue the email ──
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

    // ── Step 5: Post-send actions (non-blocking) ──
    if (config.afterSend) {
      config.afterSend(data, to).catch((err) =>
        logger.warn(`[Commission Notification] afterSend failed for ${type}`, {
          error: err.message,
        }),
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

/**
 * Fetch full settlement details from DB and send partner notification.
 * Use when you only have the settlement ID (e.g., after HubSpot sync).
 */
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
// CONVENIENCE: Notify Finance when invoice is submitted
// ============================================================================

/**
 * Send invoice submission notification to finance.
 * Use from uploadInvoiceController after successful upload.
 */
export async function notifyFinanceForInvoice(
  settlementIds: number[],
  invoiceData: {
    invoiceNumber?: string;
    invoiceDate?: Date;
    invoiceAmount?: number;
    invoiceUrl?: string;
  },
  partnerData: {
    partnerB2BId?: number;
    partnerName?: string;
  },
  triggeredBy?: {
    userId?: number;
    name?: string;
    type?: "system" | "admin" | "partner";
  },
): Promise<CommissionNotificationResult> {
  try {
    // Use first settlement as the primary reference
    const firstSettlement = await prisma.hSCommissionSettlements.findUnique({
      where: { id: settlementIds[0] },
      include: {
        b2b_partner: {
          select: { id: true, partner_name: true, partner_display_name: true },
        },
        loan_details: true,
        calculation_details: true,
      },
    });

    if (!firstSettlement) {
      return {
        success: false,
        error: `Settlement ${settlementIds[0]} not found`,
      };
    }

    const partnerName =
      partnerData.partnerName ||
      firstSettlement.b2b_partner?.partner_display_name ||
      firstSettlement.b2b_partner?.partner_name ||
      firstSettlement.partner_name ||
      "Partner";

    return sendCommissionNotification("INVOICE_SUBMITTED", {
      settlementId: firstSettlement.id,
      settlementRefNumber: firstSettlement.settlement_reference_number,
      partnerB2BId:
        partnerData.partnerB2BId || firstSettlement.b2b_partner_id || undefined,
      partnerName,
      studentName: firstSettlement.student_name,
      lenderName: firstSettlement.loan_details?.lender_name,
      loanAmountDisbursed: firstSettlement.loan_details?.loan_amount_disbursed
        ? Number(firstSettlement.loan_details.loan_amount_disbursed)
        : null,
      grossCommissionAmount: firstSettlement.calculation_details
        ?.gross_commission_amount
        ? Number(firstSettlement.calculation_details.gross_commission_amount)
        : null,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      invoiceAmount: invoiceData.invoiceAmount,
      invoiceUrl: invoiceData.invoiceUrl,
      settlementsCount: settlementIds.length,
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
): string {
  const partnerPortalUrl = `${PORTAL_BASE_URL}/admin/partners/${data.partnerId}`;
  const onboardedDate = data.onboardedAt
    ? moment(data.onboardedAt).format("DD MMM YYYY, hh:mm A")
    : moment().format("DD MMM YYYY, hh:mm A");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Partner Onboarded</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B4F72 0%,#2980B9 100%);padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">🔔 New Partner Onboarded</h1>
              <p style="margin:6px 0 0;color:#D6EAF8;font-size:13px;">Action Required: Upload Bank Details & Configure Payout</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Finance Team,</p>
              <p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A new B2B partner has been onboarded and synced to the web portal. Please review the details below and complete the required actions.</p>

              <!-- Partner Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:20px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Partner Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td width="160" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner Name</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">${esc(data.partnerName)}</td></tr>
                      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner ID</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">#${data.partnerId}</td></tr>
                      ${row("Partner Type", data.partnerType)}
                      ${row("Business Type", data.businessType)}
                      ${row("GST Number", data.gstNumber, true)}
                      ${row("PAN Number", data.panNumber, true)}
                      ${data.city || data.state ? `<tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Location</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">${[data.city, data.state, data.country].filter(Boolean).join(", ")}</td></tr>` : ""}
                      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Applicable</td><td style="padding:6px 0;"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600;${data.isCommissionApplicable === "Yes" ? "background-color:#D5F5E3;color:#27AE60;" : "background-color:#FECACA;color:#DC2626;"}">${data.isCommissionApplicable || "Not Set"}</span></td></tr>
                      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Onboarded At</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">${onboardedDate}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;">
              <p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from ${COMPANY_NAME} Commission System.<br/>Do not reply to this email. For queries, contact the tech team.<br/>© ${CURRENT_YEAR} ${COMPANY_NAME}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPartnerCommissionTemplate(
  data: CommissionNotificationData,
  recipientName?: string | null,
): string {
  const portalUrl = `${PORTAL_BASE_URL}/partners/commissions`;
  const greeting = recipientName
    ? recipientName.charAt(0).toUpperCase() + recipientName.slice(1)
    : "Partner";

  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
  const fmtDate = (d: Date | null | undefined) =>
    d ? moment(d).format("DD MMM YYYY") : "—";
  const fmtPct = (v: number | null | undefined) => (v != null ? `${v}%` : "—");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Commission Entry Available</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#27AE60 0%,#2ECC71 100%);padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">💰 New Commission Entry</h1>
              <p style="margin:6px 0 0;color:#D5F5E3;font-size:13px;">A new disbursement entry is available for your review</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi ${esc(greeting)},</p>
              <p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A new commission settlement entry has been created for your review. Please log in to the partner portal to verify the details and proceed accordingly.</p>

              <!-- Settlement Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FFF4;border:1px solid #C6F6D5;border-radius:8px;margin-bottom:16px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <h3 style="margin:0 0 14px;color:#276749;font-size:15px;font-weight:600;border-bottom:1px solid #C6F6D5;padding-bottom:10px;">Settlement Summary</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${row("Reference Number", data.settlementRefNumber, true)}
                      ${data.settlementMonth && data.settlementYear ? `<tr><td width="180" style="padding:6px 0;color:#718096;font-size:13px;">Settlement Period</td><td style="padding:6px 0;color:#2D3748;font-size:13px;">${esc(data.settlementMonth)} ${data.settlementYear}</td></tr>` : ""}
                      ${data.settlementDate ? `<tr><td style="padding:6px 0;color:#718096;font-size:13px;">Settlement Date</td><td style="padding:6px 0;color:#2D3748;font-size:13px;">${fmtDate(data.settlementDate)}</td></tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Disbursement Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Disbursement Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student Name</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">${esc(data.studentName || "—")}</td></tr>
                      ${row("Student ID", data.studentId)}
                      ${row("Lender", data.lenderName)}
                      ${row("Loan Product", data.loanProductName)}
                      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">${fmtCurrency(data.loanAmountDisbursed)}</td></tr>
                      <tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursement Date</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">${fmtDate(data.disbursementDate)}</td></tr>
                      ${row("University", data.universityName)}
                      ${row("Course", data.courseName)}
                      ${row("Destination", data.destinationCountry)}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Commission Highlight -->
              ${
                data.grossCommissionAmount != null
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#EBF8FF 0%,#DBEAFE 100%);border:1px solid #93C5FD;border-radius:8px;margin-bottom:20px;">
                <tr><td align="center" style="padding:20px;">
                  <p style="margin:0 0 4px;color:#1E40AF;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Estimated Commission</p>
                  <p style="margin:0;color:#1E3A5F;font-size:28px;font-weight:700;">${fmtCurrency(data.grossCommissionAmount)}</p>
                  ${data.commissionRate != null ? `<p style="margin:4px 0 0;color:#3B82F6;font-size:12px;">@ ${fmtPct(data.commissionRate)} commission rate</p>` : ""}
                </td></tr>
              </table>`
                  : ""
              }

              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF7ED;border:1px solid #FDBA74;border-radius:8px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <h4 style="margin:0 0 8px;color:#9A3412;font-size:14px;">📋 What to do next</h4>
                    <ol style="margin:0;padding:0 0 0 18px;color:#9A3412;font-size:13px;line-height:1.8;">
                      <li>Log in to the partner portal</li>
                      <li>Review the disbursement entry (student name, amount, date)</li>
                      <li>Approve or raise an objection if any discrepancy found</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:8px 0 16px;">
                  <a href="${portalUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#27AE60 0%,#2ECC71 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Review on Portal →</a>
                </td></tr>
              </table>
              <p style="margin:16px 0 0;color:#7F8C8D;font-size:12px;text-align:center;line-height:1.5;">If you believe this entry is incorrect, you can raise an objection directly from the portal with a reason.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;">
              <p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from ${COMPANY_NAME}.<br/>For support, reach out to your account manager or email support@edumateglobal.com<br/>© ${CURRENT_YEAR} ${COMPANY_NAME}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Phase 3: Objection Raised Template ──────────────────────────────────────

function buildObjectionRaisedTemplate(
  data: CommissionNotificationData,
): string {
  const adminUrl = `${PORTAL_BASE_URL}/admin/commissions`;
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "N/A";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Objection Raised</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#E74C3C 0%,#C0392B 100%);padding:28px 32px;">
              <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0;">⚠️ Objection Raised on Commission Settlement</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">${moment().format("DD MMM YYYY, hh:mm A")}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="color:#2C3E50;font-size:14px;line-height:1.6;margin:0 0 20px;">A partner has raised an objection on a commission settlement entry. Please review and resolve.</p>

              <!-- Settlement Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                ${row("Partner", data.partnerName)}
                ${row("Student", data.studentName)}
                ${row("Reference #", data.settlementRefNumber, true)}
                ${row("Loan Disbursed", fmtCurrency(data.loanAmountDisbursed))}
                ${row("Commission Amount", fmtCurrency(data.grossCommissionAmount))}
                ${row("Settlement Period", data.settlementMonth && data.settlementYear ? `${data.settlementMonth} ${data.settlementYear}` : null)}
              </table>

              <!-- Objection Reason Box -->
              <div style="background-color:#FDEDEC;border-left:4px solid #E74C3C;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="color:#922B21;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 8px;">Objection Reason</p>
                <p style="color:#2C3E50;font-size:14px;line-height:1.6;margin:0;">${esc(data.objectionReason || "No reason provided")}</p>
              </div>

              <p style="color:#7F8C8D;font-size:13px;margin-bottom:24px;">Please review the objection and resolve it through the admin panel.</p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#E74C3C,#C0392B);border-radius:8px;">
                    <a href="${adminUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Review on Admin Panel →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F9FA;padding:20px 32px;border-top:1px solid #E5E8EB;">
              <p style="color:#95A5A6;font-size:11px;margin:0;text-align:center;">This is an automated notification from ${COMPANY_NAME} Commission System · ${CURRENT_YEAR}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Phase 3: Dispute Resolved Template ──────────────────────────────────────

function buildDisputeResolvedTemplate(
  data: CommissionNotificationData,
  recipientName?: string | null,
): string {
  const portalUrl = `${PORTAL_BASE_URL}/partners/commissions`;
  const greeting = recipientName
    ? recipientName.charAt(0).toUpperCase() + recipientName.slice(1)
    : "Partner";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dispute Resolved</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2980B9 0%,#3498DB 100%);padding:28px 32px;">
              <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0;">✅ Dispute Resolved</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">${moment().format("DD MMM YYYY, hh:mm A")}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="color:#2C3E50;font-size:14px;line-height:1.6;margin:0 0 20px;">Hi ${esc(greeting)},</p>
              <p style="color:#2C3E50;font-size:14px;line-height:1.6;margin:0 0 20px;">Your objection on a commission settlement has been reviewed and resolved. Please log in to verify the updated entry.</p>

              <!-- Settlement Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                ${row("Student", data.studentName)}
                ${row("Reference #", data.settlementRefNumber, true)}
                ${row("Resolved By", data.disputeResolvedBy)}
              </table>

              <!-- Resolution Box -->
              <div style="background-color:#EBF5FB;border-left:4px solid #2980B9;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="color:#1A5276;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 8px;">Resolution</p>
                <p style="color:#2C3E50;font-size:14px;line-height:1.6;margin:0;">${esc(data.disputeResolution || "Dispute has been resolved")}</p>
              </div>

              <p style="color:#7F8C8D;font-size:13px;margin-bottom:24px;">Please review the updated entry and accept if everything looks correct, or raise another objection if needed.</p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#27AE60,#2ECC71);border-radius:8px;">
                    <a href="${portalUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Review on Portal →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F9FA;padding:20px 32px;border-top:1px solid #E5E8EB;">
              <p style="color:#95A5A6;font-size:11px;margin:0;text-align:center;">This is an automated notification from ${COMPANY_NAME} Commission System · ${CURRENT_YEAR}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Phase 3: Invoice Submitted Template ─────────────────────────────────────

function buildInvoiceSubmittedTemplate(
  data: CommissionNotificationData,
): string {
  const adminUrl = `${PORTAL_BASE_URL}/admin/commissions`;
  const fmtCurrency = (v: number | null | undefined) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "N/A";
  const fmtDate = (d: Date | null | undefined) =>
    d ? moment(d).format("DD MMM YYYY") : "N/A";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice Submitted</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#E67E22 0%,#F39C12 100%);padding:28px 32px;">
              <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0;">📄 Invoice Received from Partner</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">${moment().format("DD MMM YYYY, hh:mm A")}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="color:#2C3E50;font-size:14px;line-height:1.6;margin:0 0 20px;">A partner has submitted an invoice for commission settlement. Please review and proceed with the approval process.</p>

              <!-- Invoice Details -->
              <div style="background-color:#FEF5E7;border-left:4px solid #E67E22;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
                <p style="color:#935116;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 12px;">Invoice Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${row("Invoice Number", data.invoiceNumber, true)}
                  ${row("Invoice Date", fmtDate(data.invoiceDate))}
                  ${row("Invoice Amount", fmtCurrency(data.invoiceAmount))}
                  ${row("Settlements Covered", data.settlementsCount ? `${data.settlementsCount} settlement(s)` : "1")}
                </table>
              </div>

              <!-- Partner Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${row("Partner", data.partnerName)}
                ${row("Student", data.studentName)}
                ${row("Reference #", data.settlementRefNumber, true)}
              </table>

              <p style="color:#7F8C8D;font-size:13px;margin-bottom:24px;">The settlement status has been updated to "Pending Approval". Please proceed with the review.</p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#E67E22,#F39C12);border-radius:8px;">
                    <a href="${adminUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Review Invoice →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F9FA;padding:20px 32px;border-top:1px solid #E5E8EB;">
              <p style="color:#95A5A6;font-size:11px;margin:0;text-align:center;">This is an automated notification from ${COMPANY_NAME} Commission System · ${CURRENT_YEAR}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
// ============================================================================
// PHASE 4: HELPER FUNCTIONS
// ============================================================================

async function getPartnerEmailByB2BId(b2bId?: number): Promise<string | null> {
  if (!b2bId) return null;
  try {
    const partnerUser = await prisma.b2BPartnersUsers.findFirst({
      where: { b2b_id: b2bId, is_active: true },
      select: { email: true },
    });
    return partnerUser?.email || null;
  } catch {
    return null;
  }
}

async function updateCommunicationLog(
  settlementId: number,
  message: string,
): Promise<void> {
  try {
    await prisma.hSCommissionSettlementsCommunication.upsert({
      where: { settlement_id: settlementId },
      update: {
        last_communication_date: new Date(),
        email_sent_count: { increment: 1 },
        communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] ${message}`,
      },
      create: {
        settlement_id: settlementId,
        notification_date: new Date(),
        notification_method: "Email",
        last_communication_date: new Date(),
        email_sent_count: 1,
        sms_sent_count: 0,
        communication_log: `[${moment().format("YYYY-MM-DD HH:mm")}] ${message}`,
      },
    });
  } catch (err: any) {
    logger.warn("Failed to update communication log", {
      error: err.message,
      settlementId,
    });
  }
}

function buildApprovalEmailTemplate(params: {
  action: string;
  actionColor: string;
  studentName: string;
  partnerName: string;
  settlementRef: string;
  performedBy: string;
  notes: string | null;
  message: string;
  nextAction: string;
}): string {
  const {
    action,
    actionColor,
    studentName,
    partnerName,
    settlementRef,
    performedBy,
    notes,
    message,
    nextAction,
  } = params;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F5F6FA;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <div style="background:${actionColor};padding:24px 32px;">
        <h1 style="margin:0;color:#fff;font-size:20px;">${esc(action)}</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Commission Settlement Update</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:15px;color:#2C3E50;line-height:1.6;margin:0 0 20px;">${esc(message)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          ${row("Student", studentName)}
          ${row("Partner", partnerName)}
          ${row("Reference", settlementRef, true)}
          ${row("Action By", performedBy)}
          ${notes ? row("Reason / Notes", notes) : ""}
        </table>
        <div style="background:#F0F9FF;border-left:4px solid #3498DB;padding:16px;border-radius:0 8px 8px 0;margin-top:20px;">
          <p style="margin:0;font-size:13px;color:#2C3E50;"><strong>Next Step:</strong> ${esc(nextAction)}</p>
        </div>
      </div>
      <div style="padding:16px 32px;background:#F8F9FA;border-top:1px solid #E5E8EB;text-align:center;">
        <p style="margin:0;font-size:11px;color:#95A5A6;">Edumate Global Commission System</p>
      </div>
    </div>
  </div>
</body></html>`;
}
