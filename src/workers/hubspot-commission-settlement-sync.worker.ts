import prisma from "../config/prisma";
import {
  createCommissionSettlementsOnHubspot,
  deleteCommissionSettlement,
  updateCommissionSettlementsApplication,
} from "../services/hubspot-commission-settlements.service";
import logger from "../utils/logger";

const POLL_INTERVAL = 60000; // 60 seconds
const MAX_RETRIES = 5;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mark outbox entry as completed
 */
async function markAsCompleted(entryId: string): Promise<void> {
  await prisma.syncOutbox.update({
    where: { id: entryId },
    data: {
      status: "COMPLETED",
      processed_at: new Date(),
    },
  });
}

/**
 * Start Commission Settlement HubSpot Sync Worker
 */
export async function startCommissionSettlementsHubSpotSyncWorker() {
  logger.info("Commission Settlement HubSpot Sync Worker started");

  // Continuous polling
  while (true) {
    try {
      await processCommissionSettlementsOutboxEntries();

      // Wait before next poll
      await sleep(POLL_INTERVAL);
    } catch (error) {
      logger.error("Commission settlements worker error:", error);
      await sleep(POLL_INTERVAL * 2);
    }
  }
}

/**
 * Process pending commission settlements outbox entries
 */
const processCommissionSettlementsOutboxEntries = async () => {
  // Fetch pending entries for Commission Settlements only
  const pendingEntries = await prisma.syncOutbox.findMany({
    where: {
      entity_type: "HSCommissionSettlements",
      status: "PENDING",
      attempts: {
        lt: MAX_RETRIES,
      },
    },
    orderBy: [{ priority: "asc" }, { created_at: "asc" }],
    take: 50, // Process 50 at a time (no batch operations)
  });

  if (pendingEntries.length === 0) {
    return;
  }

  logger.info(
    `Processing ${pendingEntries.length} pending commission settlements outbox entries`
  );

  // Process each entry individually
  for (const entry of pendingEntries) {
    await processSingleCommissionSettlementsSingleEntry(entry);
  }
};

const processSingleCommissionSettlementsSingleEntry = async (
  entry: any
): Promise<void> => {
  try {
    // Mark as processing
    await prisma.syncOutbox.update({
      where: { id: entry.id },
      data: {
        status: "PROCESSING",
        processing_at: new Date(),
        attempts: { increment: 1 },
      },
    });

    const { entity_type, operation, payload } = entry;

    // Only process main loan application table
    if (entity_type !== "HSCommissionSettlements") {
      await markAsCompleted(entry.id);
      return;
    }
    let hubspotId: string | undefined;

    switch (operation) {
      case "CREATE":
        hubspotId = await handleCommissionSettlementsCreate(
          payload,
          entry.entity_id
        );
        break;
      case "UPDATE":
        hubspotId = await handleCommissionSettlementsUpdate(
          payload,
          entry.entity_id
        );
        break;
      case "DELETE":
        await handleCommissionSettlementsDelete(payload?.hs_object_id);
        break;
    }

    // Mark as completed
    await prisma.syncOutbox.update({
      where: { id: entry.id },
      data: {
        status: "COMPLETED",
        hubspot_id: hubspotId,
        processed_at: new Date(),
        last_error: null,
      },
    });

    // Update loan application table with HubSpot ID
    if (hubspotId && operation === "CREATE") {
      await prisma.hSCommissionSettlements.update({
        where: { id: entry.entity_id },
        data: { hs_object_id: hubspotId },
      });
    }

    logger.debug(
      `Commission Settlement Synced: ${operation} ${entity_type}#${entry.entity_id}`
    );
  } catch (error: any) {
    await handleCommissionSettlementsSyncError(entry.id, error);
  }
};

const handleCommissionSettlementsCreate = async (
  payload: any,
  commissionId: number
): Promise<string | undefined> => {
  const commissionSettlement = await prisma.hSCommissionSettlements.findUnique({
    where: {
      id: commissionId,
    },
    include: {
      calculation_details: true,
      communication: true,
      tax_deductions: true,
      documentaion: true,
      hold_dispute: true,
      loan_details: true,
      payment_details: true,
      performance_metrics: true,
      reconciliation: true,
      status_history: true,
      system_tracking: true,
      transaction: true,
    },
  });

  if (!commissionSettlement) {
    throw new Error(`Commission Settlement ${commissionId} not found`);
  }

  // Fetch Edumate Contact, B2B Partner, Lender, and Loan Product HS Object IDs for associations
  let edumateContactHsObjectId: string | null = null;
  let b2bPartnerHsObjectId: string | null = null;
  let lenderHsObjectId: string | null = null;
  let loanProductHsObjectId: string | null = null;

  if (commissionSettlement.lead_reference_id) {
    const contact = await prisma.hSEdumateContacts.findUnique({
      where: { id: commissionSettlement.lead_reference_id },
      select: { hs_object_id: true },
    });
    if (contact?.hs_object_id) {
      edumateContactHsObjectId = contact.hs_object_id;
      logger.info("Found Edumate Contact for association", {
        contactId: commissionSettlement.lead_reference_id,
        hsObjectId: edumateContactHsObjectId,
      });
    } else {
      logger.warn("Edumate Contact found but no hs_object_id", {
        contactId: commissionSettlement.lead_reference_id,
      });
    }
  }

  if (commissionSettlement.b2b_partner_id) {
    const b2bPartner = await prisma.hSB2BPartners.findUnique({
      where: { id: commissionSettlement.b2b_partner_id },
      select: { hs_object_id: true },
    });

    if (b2bPartner?.hs_object_id) {
      b2bPartnerHsObjectId = b2bPartner.hs_object_id;
      logger.info("Found B2B Partner for association", {
        b2bPartnerId: commissionSettlement.b2b_partner_id,
        hsObjectId: b2bPartnerHsObjectId,
      });
    } else {
      logger.warn("B2B Partner found but no hs_object_id", {
        b2bPartnerId: commissionSettlement.b2b_partner_id,
      });
    }
  }

  if (commissionSettlement.lender_id) {
    const lender = await prisma.hSLenders.findUnique({
      where: { id: commissionSettlement.lender_id },
      select: { hs_object_id: true },
    });

    if (lender?.hs_object_id) {
      lenderHsObjectId = lender.hs_object_id;
      logger.info("Found Lender for association", {
        lenderId: commissionSettlement.lender_id,
        hsObjectId: lenderHsObjectId,
      });
    } else {
      logger.warn("Lender found but no hs_object_id", {
        lenderId: commissionSettlement.lender_id,
      });
    }
  }

  if (commissionSettlement.product_id) {
    const loanProduct = await prisma.hSLoanProducts.findUnique({
      where: { id: commissionSettlement.product_id },
      select: { hs_object_id: true },
    });
    if (loanProduct?.hs_object_id) {
      loanProductHsObjectId = loanProduct.hs_object_id;
      logger.info("Found Loan Product for association", {
        productId: commissionSettlement.product_id,
        hsObjectId: loanProductHsObjectId,
      });
    } else {
      logger.warn("Loan Product found but no hs_object_id", {
        productId: commissionSettlement.product_id,
      });
    }
  }

  // Transform to HubSpot format
  const hubspotPayload =
    transformCommissionSettlementsToHubSpotFormat(commissionSettlement);

  // Update in HubSpot
  const result = await createCommissionSettlementsOnHubspot(hubspotPayload);

  return result.id;
};

/**
 * Handle UPDATE operation for commission settlements
 */
async function handleCommissionSettlementsUpdate(
  payload: any,
  commissionId: number
): Promise<string | undefined> {
  // Fetch complete commission settlement data
  const loanApplication = await prisma.hSCommissionSettlements.findUnique({
    where: { id: commissionId },
    include: {
      calculation_details: true,
      communication: true,
      tax_deductions: true,
      documentaion: true,
      hold_dispute: true,
      loan_details: true,
      payment_details: true,
      performance_metrics: true,
      reconciliation: true,
      status_history: true,
      system_tracking: true,
      transaction: true,
    },
  });

  if (!loanApplication) {
    throw new Error(`Commission settlement ${commissionId} not found`);
  }

  // Get HubSpot ID
  const hubspotId = loanApplication.hs_object_id;

  if (!hubspotId) {
    // If no HubSpot ID exists, create new entry
    logger.warn(
      `No HubSpot ID for commission settlement ${commissionId}, creating new entry`
    );
    return await handleCommissionSettlementsCreate(payload, commissionId);
  }

  // Transform to HubSpot format
  const hubspotPayload =
    transformCommissionSettlementsToHubSpotFormat(loanApplication);

  // Update in HubSpot
  const result = await updateCommissionSettlementsApplication(
    hubspotId,
    hubspotPayload
  );

  return result.id;
}

/**
 * Handle DELETE operation for commission settlements
 */
async function handleCommissionSettlementsDelete(
  hs_object_id: string
): Promise<void> {
  // Try to find the loan application (might be soft-deleted)
  // const loanApplication = await prisma.hSLoanApplications.findUnique({
  //   where: { id: loanId },
  // });

  // const hubspotId = loanApplication?.hs_object_id;

  if (!hs_object_id) {
    logger.warn(
      `No HubSpot ID found for commission settlement ${hs_object_id}, skipping delete`
    );
    return;
  }

  // Delete from HubSpot
  await deleteCommissionSettlement(hs_object_id);
}

/**
 * Transform Commission Settlement data to HubSpot format
 * Maps all 13 tables (main + 12 normalized) to HubSpot properties
 */
function transformCommissionSettlementsToHubSpotFormat(
  commissionSettlement: any
): any {
  const calculation = commissionSettlement.calculation_details || {};
  const communication = commissionSettlement.communication || {};
  const documentation = commissionSettlement.documentaion || {};
  const holdDispute = commissionSettlement.hold_dispute || {};
  const loanDetails = commissionSettlement.loan_details || {};
  const paymentDetails = commissionSettlement.payment_details || {};
  const performanceMetrics = commissionSettlement.performance_metrics || {};
  const reconciliation = commissionSettlement.reconciliation || {};
  const statusHistory = commissionSettlement.status_history || {};
  const systemTracking = commissionSettlement.system_tracking || {};
  const taxDeductions = commissionSettlement.tax_deductions || {};
  const transaction = commissionSettlement.transaction || {};

  return {
    // ========================================
    // MAIN COMMISSION SETTLEMENT FIELDS
    // ========================================

    // db_id: commissionSettlement.id,
    // application_id: commissionSettlement.application_id || null,
    // b2b_partner_id: commissionSettlement.b2b_partner_id || null,
    lead_reference_id: commissionSettlement.lead_reference_id || null,
    // lender_id: commissionSettlement.lender_id || null,
    // student_id: commissionSettlement.student_id || null,
    settlement_id: commissionSettlement.settlement_id || null,
    product_id: commissionSettlement.product_id || null,

    settlement_reference_number:
      commissionSettlement.settlement_reference_number || null,
    // partner_name: commissionSettlement.partner_name || null,
    // student_name: commissionSettlement.student_name || null,
    settlement_date: commissionSettlement.settlement_date
      ? new Date(commissionSettlement.settlement_date)
          .toISOString()
          .split("T")[0]
      : null,
    settlement_month: commissionSettlement.settlement_month || null,
    settlement_period: commissionSettlement.settlement_period || null,
    settlement_year: commissionSettlement.settlement_year || null,
    verified_by: commissionSettlement.verified_by || null,

    // ========================================
    // COMMISSION CALCULATION DETAILS
    // ========================================

    commission_model: calculation.commission_model || null,
    commission_rate_applied: calculation.commission_rate_applied
      ? parseFloat(calculation.commission_rate_applied)
      : null,
    commission_tier_applied: calculation.commission_tier_applied || null,
    gross_commission_amount: calculation.gross_commission_amount
      ? parseFloat(calculation.gross_commission_amount)
      : null,
    bonus_amount: calculation.bonus_amount
      ? parseFloat(calculation.bonus_amount)
      : null,
    bonus_rate_applied: calculation.bonus_rate_applied
      ? parseFloat(calculation.bonus_rate_applied)
      : null,
    incentive_amount: calculation.incentive_amount
      ? parseFloat(calculation.incentive_amount)
      : null,
    penalty_amount: calculation.penalty_amount
      ? parseFloat(calculation.penalty_amount)
      : null,
    adjustment_amount: calculation.adjustment_amount
      ? parseFloat(calculation.adjustment_amount)
      : null,
    adjustment_reason: calculation.adjustment_reason || null,
    total_gross_amount: calculation.total_gross_amount
      ? parseFloat(calculation.total_gross_amount)
      : null,

    // ========================================
    // TAX AND DEDUCTIONS
    // ========================================

    gst_applicable: taxDeductions.gst_applicable || null,
    gst_rate_applied: taxDeductions.gst_rate_applied
      ? parseFloat(taxDeductions.gst_rate_applied)
      : null,
    gst_amount: taxDeductions.gst_amount
      ? parseFloat(taxDeductions.gst_amount)
      : null,
    tds_applicable: taxDeductions.tds_applicable || null,
    tds_rate_applied: taxDeductions.tds_rate_applied
      ? parseFloat(taxDeductions.tds_rate_applied)
      : null,
    tds_amount: taxDeductions.tds_amount
      ? parseFloat(taxDeductions.tds_amount)
      : null,
    tds_certificate_number: taxDeductions.tds_certificate_number || null,
    service_tax_amount: taxDeductions.service_tax_amount
      ? parseFloat(taxDeductions.service_tax_amount)
      : null,
    other_deductions: taxDeductions.other_deductions
      ? parseFloat(taxDeductions.other_deductions)
      : null,
    other_deductions_description:
      taxDeductions.other_deductions_description || null,
    total_deductions: taxDeductions.total_deductions
      ? parseFloat(taxDeductions.total_deductions)
      : null,
    net_payable_amount: taxDeductions.net_payable_amount
      ? parseFloat(taxDeductions.net_payable_amount)
      : null,
    withholding_tax_rate: taxDeductions.withholding_tax_rate
      ? parseFloat(taxDeductions.withholding_tax_rate)
      : null,
    withholding_tax_amount: taxDeductions.withholding_tax_amount
      ? parseFloat(taxDeductions.withholding_tax_amount)
      : null,

    // ========================================
    // LOAN DETAILS
    // ========================================

    // lender_name: loanDetails.lender_name || null,
    // loan_product_name: loanDetails.loan_product_name || null,
    loan_amount_disbursed: loanDetails.loan_amount_disbursed
      ? parseFloat(loanDetails.loan_amount_disbursed)
      : null,
    loan_disbursement_date: loanDetails.loan_disbursement_date
      ? new Date(loanDetails.loan_disbursement_date).toISOString().split("T")[0]
      : null,
    course_name: loanDetails.course_name || null,
    university_name: loanDetails.university_name || null,
    student_destination_country:
      loanDetails.student_destination_country || null,

    // ========================================
    // PAYMENT PROCESSING
    // ========================================

    payment_method: paymentDetails.payment_method || null,
    payment_status: paymentDetails.payment_status || null,
    payment_initiation_date: paymentDetails.payment_initiation_date
      ? new Date(paymentDetails.payment_initiation_date)
          .toISOString()
          .split("T")[0]
      : null,
    payment_completion_date: paymentDetails.payment_completion_date
      ? new Date(paymentDetails.payment_completion_date)
          .toISOString()
          .split("T")[0]
      : null,
    payment_reference_number: paymentDetails.payment_reference_number || null,
    payment_gateway_reference: paymentDetails.payment_gateway_reference || null,
    bank_transaction_id: paymentDetails.bank_transaction_id || null,
    beneficiary_account_number:
      paymentDetails.beneficiary_account_number || null,
    beneficiary_bank_name: paymentDetails.beneficiary_bank_name || null,
    beneficiary_ifsc_code: paymentDetails.beneficiary_ifsc_code || null,
    payment_failure_reason: paymentDetails.payment_failure_reason || null,
    retry_attempt_count: paymentDetails.retry_attempt_count || null,
    last_retry_date: paymentDetails.last_retry_date
      ? new Date(paymentDetails.last_retry_date).toISOString().split("T")[0]
      : null,

    // ========================================
    // SETTLEMENT STATUS
    // ========================================

    settlement_status: statusHistory.settlement_status || null,
    calculation_date: statusHistory.calculation_date
      ? new Date(statusHistory.calculation_date).toISOString().split("T")[0]
      : null,
    calculated_by: statusHistory.calculated_by || null,
    verification_status: statusHistory.verification_status || null,
    verification_date: statusHistory.verification_date
      ? new Date(statusHistory.verification_date).toISOString().split("T")[0]
      : null,

    // ========================================
    // DOCUMENTATION
    // ========================================

    invoice_required: documentation.invoice_required || null,
    invoice_number: documentation.invoice_number || null,
    invoice_date: documentation.invoice_date
      ? new Date(documentation.invoice_date).toISOString().split("T")[0]
      : null,
    invoice_amount: documentation.invoice_amount
      ? parseFloat(documentation.invoice_amount)
      : null,
    invoice_status: documentation.invoice_status || null,
    invoice_url: documentation.invoice_url || null,
    tax_certificate_required: documentation.tax_certificate_required || null,
    tax_certificate_url: documentation.tax_certificate_url || null,
    agreement_reference: documentation.agreement_reference || null,
    payment_terms_applied: documentation.payment_terms_applied || null,
    supporting_documents: documentation.supporting_documents || null,

    // ========================================
    // HOLD AND DISPUTES
    // ========================================

    on_hold: holdDispute.on_hold || null,
    hold_reason: holdDispute.hold_reason || null,
    hold_date: holdDispute.hold_date
      ? new Date(holdDispute.hold_date).toISOString().split("T")[0]
      : null,
    hold_initiated_by: holdDispute.hold_initiated_by || null,
    hold_release_date: holdDispute.hold_release_date
      ? new Date(holdDispute.hold_release_date).toISOString().split("T")[0]
      : null,
    hold_release_approved_by: holdDispute.hold_release_approved_by || null,
    dispute_raised: holdDispute.dispute_raised || null,
    dispute_date: holdDispute.dispute_date
      ? new Date(holdDispute.dispute_date).toISOString().split("T")[0]
      : null,
    dispute_raised_by: holdDispute.dispute_raised_by || null,
    dispute_description: holdDispute.dispute_description || null,
    dispute_resolution: holdDispute.dispute_resolution || null,
    dispute_resolution_date: holdDispute.dispute_resolution_date
      ? new Date(holdDispute.dispute_resolution_date)
          .toISOString()
          .split("T")[0]
      : null,
    dispute_resolved_by: holdDispute.dispute_resolved_by || null,

    // ========================================
    // COMMUNICATION
    // ========================================

    notification_date: communication.notification_date
      ? new Date(communication.notification_date).toISOString().split("T")[0]
      : null,
    notification_method: communication.notification_method || null,
    partner_notification_sent: communication.partner_notification_sent || null,
    acknowledgment_received: communication.acknowledgment_received || null,
    acknowledgment_date: communication.acknowledgment_date
      ? new Date(communication.acknowledgment_date).toISOString().split("T")[0]
      : null,
    last_communication_date: communication.last_communication_date
      ? new Date(communication.last_communication_date)
          .toISOString()
          .split("T")[0]
      : null,
    communication_log: communication.communication_log || null,
    email_sent_count: communication.email_sent_count || null,
    sms_sent_count: communication.sms_sent_count || null,

    // ========================================
    // RECONCILIATION
    // ========================================

    reconciliation_status: reconciliation.reconciliation_status || null,
    reconciliation_date: reconciliation.reconciliation_date
      ? new Date(reconciliation.reconciliation_date).toISOString().split("T")[0]
      : null,
    reconciled_by: reconciliation.reconciled_by || null,
    bank_statement_reference: reconciliation.bank_statement_reference || null,
    discrepancy_amount: reconciliation.discrepancy_amount
      ? parseFloat(reconciliation.discrepancy_amount)
      : null,
    discrepancy_reason: reconciliation.discrepancy_reason || null,
    reconciliation_notes: reconciliation.reconciliation_notes || null,

    // ========================================
    // PERFORMANCE ANALYTICS
    // ========================================

    processing_time_days: performanceMetrics.processing_time_days || null,
    payment_delay_days: performanceMetrics.payment_delay_days || null,
    sla_breach: performanceMetrics.sla_breach || null,
    sla_breach_reason: performanceMetrics.sla_breach_reason || null,
    partner_satisfaction_rating: performanceMetrics.partner_satisfaction_rating
      ? parseFloat(performanceMetrics.partner_satisfaction_rating)
      : null,

    // ========================================
    // TRANSACTION DETAILS
    // ========================================

    transaction_type: transaction.transaction_type || null,
    transaction_sub_type: transaction.transaction_sub_type || null,
    disbursement_trigger: transaction.disbursement_trigger || null,
    batch_payment_id: transaction.batch_payment_id || null,
    original_transaction_id: transaction.original_transaction_id || null,
    related_settlement_id: transaction.related_settlement_id || null,

    // ========================================
    // SYSTEM TRACKING
    // ========================================

    settlement_record_status: systemTracking.settlement_record_status || null,
    data_source: systemTracking.data_source || null,
    integration_status: systemTracking.integration_status || null,
    system_generated: systemTracking.system_generated || null,
    created_by_user: systemTracking.created_by_user || null,
    created_date: systemTracking.created_date
      ? new Date(systemTracking.created_date).toISOString().split("T")[0]
      : null,
    last_modified_by: systemTracking.last_modified_by || null,
    last_modified_date: systemTracking.last_modified_date
      ? new Date(systemTracking.last_modified_date).toISOString().split("T")[0]
      : null,
    version_number: systemTracking.version_number || null,
    audit_trail: systemTracking.audit_trail || null,
    change_log: systemTracking.change_log || null,
    notes: systemTracking.notes || null,
    internal_notes: systemTracking.internal_notes || null,

    // ========================================
    // HUBSPOT SYSTEM FIELDS (if updating)
    // ========================================

    // Don't send these on CREATE, only on UPDATE
    ...(commissionSettlement.hs_object_id &&
      {
        // hs_object_id: commissionSettlement.hs_object_id,
      }),
  };
}

/**
 * Handle sync error
 */
async function handleCommissionSettlementsSyncError(
  entryId: string,
  error: any
): Promise<void> {
  const errorMessage = error.message || "Unknown error";
  const errorCode = error.response?.status?.toString() || "UNKNOWN";

  await prisma.syncOutbox.update({
    where: { id: entryId },
    data: {
      status: "FAILED",
      last_error: errorMessage,
      error_code: errorCode,
      updated_at: new Date(),
    },
  });

  logger.error(
    `Failed to sync commission settlement entry ${entryId}:`,
    errorMessage
  );
}
