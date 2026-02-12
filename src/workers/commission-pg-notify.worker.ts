import PQueue from "p-queue";
import prisma from "../config/prisma";
import { getInstance, registerChannel } from "../config/pg-notify-client";
import logger from "../utils/logger";
import {
  createCommissionSettlementsOnHubspot,
  updateCommissionSettlementsApplication,
  deleteCommissionSettlement,
} from "../services/hubspot-commission-settlements.service";
import { notifyPartnerForSettlement } from "../services/EmailNotifications/commission.notification.service";

const MAX_RETRIES = 5;
const DEBOUNCE_DELAY = 5000;
const CONCURRENCY = 10;
const RATE_LIMIT = 100;
const FALLBACK_CHECK_INTERVAL = 30000;

const CHANNEL_NAME = "commission_sync_channel";

const commissionSyncQueue = new PQueue({
  concurrency: CONCURRENCY,
  interval: 1000,
  intervalCap: RATE_LIMIT,
  timeout: 60000,
});

const ongoingSync = new Set<string>();
const pendingUpdates = new Map<string, NodeJS.Timeout>();

export async function startCommissionPGNotifyWorker() {
  try {
    logger.info("[Commission PG NOTIFY] Starting worker...");

    // Get the shared PostgreSQL client
    const pgClient = await getInstance();
    logger.info("[Commission PG NOTIFY] Using shared PostgreSQL connection");

    // Register channel for auto-reconnect
    registerChannel(CHANNEL_NAME);

    // Listen to commission_sync_channel
    await pgClient.query(`LISTEN ${CHANNEL_NAME}`);
    logger.info(`[Commission PG NOTIFY] Listening on ${CHANNEL_NAME}`);

    // Setup notification handler
    pgClient.on("notification", handleNotification);

    // Start fallback processor
    startFallbackProcessor();

    logger.info("[Commission PG NOTIFY] Worker started successfully");
    logger.info(
      `[Commission PG NOTIFY] Config: concurrency=${CONCURRENCY}, rate=${RATE_LIMIT}/s`
    );
  } catch (error) {
    logger.error("[Commission PG NOTIFY] Failed to start worker:", error);
    process.exit(1);
  }
}

async function handleNotification(msg: any) {
  // Filter notifications - only process our channel
  if (msg.channel !== CHANNEL_NAME) {
    return;
  }

  try {
    const data = JSON.parse(msg.payload);
    logger.debug("[Commission PG NOTIFY] Received notification:", {
      table: data.table_name,
      operation: data.operation,
      entity_id: data.entity_id,
      source: data.source,
    });

    if (data.source === "hubspot" && data.operation === "UPDATE") {
      logger.debug("[Commission PG NOTIFY] Skipping HubSpot-source UPDATE");
      return;
    }

    const settlementId = data.settlement_id || data.entity_id;
    const syncKey = `commission:${settlementId}:${data.operation}`;

    if (ongoingSync.has(syncKey)) {
      logger.debug(
        `[Commission PG NOTIFY] Already processing ${syncKey}, skipping`
      );
      return;
    }

    if (data.operation === "UPDATE") {
      if (pendingUpdates.has(syncKey)) {
        clearTimeout(pendingUpdates.get(syncKey)!);
      }

      const timeout = setTimeout(() => {
        pendingUpdates.delete(syncKey);
        queueCommissionSync(
          settlementId,
          data.operation,
          data.hs_object_id,
          syncKey
        );
      }, DEBOUNCE_DELAY);

      pendingUpdates.set(syncKey, timeout);
      logger.debug(
        `[Commission PG NOTIFY] Debouncing ${syncKey} for ${DEBOUNCE_DELAY}ms`
      );
    } else {
      // ═══════════════════════════════════════════════════════════════
      // PHASE 2: Notify Partner when a new commission settlement is created
      // Non-blocking: fires and forgets, won't affect HubSpot sync
      // ═══════════════════════════════════════════════════════════════
      if (data.operation === "INSERT") {
        notifyPartnerForSettlement(settlementId, {
          name: "System",
          type: "system",
        }).catch((err) =>
          logger.warn(
            `[Commission PG NOTIFY] Partner notification failed for settlement #${settlementId}: ${err.message}`,
          ),
        );

        // Set default invoice_status = "Pending" if not already set
        prisma.hSCommissionSettlementsDocumentation
          .updateMany({
            where: {
              settlement_id: settlementId,
              OR: [{ invoice_status: null }, { invoice_status: "" }],
            },
            data: { invoice_status: "Pending" },
          })
          .catch((err: any) =>
            logger.warn(
              `[Commission PG NOTIFY] Failed to set default invoice_status for settlement #${settlementId}: ${err.message}`,
            ),
          );
      }

      await queueCommissionSync(
        settlementId,
        data.operation,
        data.hs_object_id,
        syncKey
      );
    }
  } catch (error) {
    logger.error(
      "[Commission PG NOTIFY] Failed to handle notification:",
      error
    );
  }
}

async function queueCommissionSync(
  settlementId: number,
  operation: string,
  hsObjectId: string | null,
  syncKey: string
) {
  commissionSyncQueue.add(async () => {
    ongoingSync.add(syncKey);

    let outboxEntry = await findOrCreateOutboxEntry(
      settlementId,
      operation,
      hsObjectId
    );

    try {
      outboxEntry = await markAsProcessing(outboxEntry.id);

      const result = await processCommissionSync(
        settlementId,
        operation,
        hsObjectId
      );

      await markAsCompleted(outboxEntry.id, result?.hubspotId || hsObjectId);

      logger.info(`[Commission PG NOTIFY] Successfully synced ${syncKey}`);
    } catch (error: any) {
      logger.error(`[Commission PG NOTIFY] Sync failed for ${syncKey}:`, error);

      await markAsFailed(
        outboxEntry.id,
        error.message,
        outboxEntry.attempts + 1
      );
    } finally {
      ongoingSync.delete(syncKey);
    }
  });

  logger.debug(
    `[Commission PG NOTIFY] Queued ${syncKey} (Queue: ${commissionSyncQueue.size}, Active: ${commissionSyncQueue.pending})`
  );
}

async function processCommissionSync(
  settlementId: number,
  operation: string,
  hsObjectId: string | null
): Promise<{ hubspotId?: string } | void> {
  logger.info(
    `[Commission PG NOTIFY] Processing ${operation} for settlement #${settlementId}`
  );

  switch (operation) {
    case "INSERT":
      const createResult = await handleCommissionCreate(settlementId);
      return { hubspotId: createResult };

    case "UPDATE":
      const updateResult = await handleCommissionUpdate(settlementId);
      return { hubspotId: updateResult };

    case "DELETE":
      if (hsObjectId) {
        await handleCommissionDelete(hsObjectId);
      }
      return;

    default:
      logger.warn(`[Commission PG NOTIFY] Unknown operation: ${operation}`);
      return;
  }
}

async function handleCommissionCreate(settlementId: number): Promise<string> {
  const settlement = await prisma.hSCommissionSettlements.findUnique({
    where: { id: settlementId },
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

  if (!settlement) {
    throw new Error(`Settlement ${settlementId} not found`);
  }

  if (settlement.hs_object_id) {
    logger.info(
      `[Commission PG NOTIFY] Settlement #${settlementId} already has HubSpot ID: ${settlement.hs_object_id}, updating with db_id`
    );

    const hubspotPayload =
      transformCommissionSettlementsToHubSpotFormat(settlement);

    try {
      await updateCommissionSettlementsApplication(
        settlement.hs_object_id,
        hubspotPayload
      );
      logger.info(
        `[Commission PG NOTIFY] Updated HubSpot settlement ${settlement.hs_object_id} with settlement_id: ${settlementId}`
      );
    } catch (error: any) {
      logger.error(
        `[Commission PG NOTIFY] Failed to update HubSpot with settlement_id:`,
        error
      );
    }

    return settlement.hs_object_id;
  }

  const hubspotPayload =
    transformCommissionSettlementsToHubSpotFormat(settlement);

  const result = await createCommissionSettlementsOnHubspot(hubspotPayload);

  if (!result || !result.id) {
    throw new Error("HubSpot create returned empty result");
  }

  await prisma.hSCommissionSettlements.update({
    where: { id: settlementId },
    data: {
      hs_object_id: result.id,
      source: "hubspot",
    },
  });

  logger.info(
    `[Commission PG NOTIFY] Created settlement #${settlementId} in HubSpot: ${result.id}`
  );

  return result.id;
}

async function handleCommissionUpdate(settlementId: number): Promise<string> {
  const settlement = await prisma.hSCommissionSettlements.findUnique({
    where: { id: settlementId },
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

  if (!settlement) {
    throw new Error(`Settlement ${settlementId} not found`);
  }

  const hubspotId = settlement.hs_object_id;

  if (!hubspotId) {
    logger.warn(
      `[Commission PG NOTIFY] No HubSpot ID for settlement ${settlementId}, creating new entry`
    );
    const newId = await handleCommissionCreate(settlementId);
    return newId;
  }

  const hubspotPayload =
    transformCommissionSettlementsToHubSpotFormat(settlement);

  try {
    await updateCommissionSettlementsApplication(hubspotId, hubspotPayload);
    logger.info(
      `[Commission PG NOTIFY] Updated settlement #${settlementId} in HubSpot: ${hubspotId}`
    );
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.warn(
        `[Commission PG NOTIFY] HubSpot settlement ${hubspotId} not found (404), creating new`
      );
      const newId = await handleCommissionCreate(settlementId);
      return newId;
    } else {
      throw error;
    }
  }

  return hubspotId;
}

async function handleCommissionDelete(hsObjectId: string): Promise<void> {
  await deleteCommissionSettlement(hsObjectId);
  logger.info(
    `[Commission PG NOTIFY] Deleted settlement from HubSpot: ${hsObjectId}`
  );
}

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
    lead_reference_id: commissionSettlement.lead_reference_id || null,
    settlement_id: commissionSettlement.settlement_id || null,
    product_id: commissionSettlement.product_id || null,
    settlement_reference_number:
      commissionSettlement.settlement_reference_number || null,
    settlement_date: commissionSettlement.settlement_date
      ? new Date(commissionSettlement.settlement_date)
          .toISOString()
          .split("T")[0]
      : null,
    settlement_month: commissionSettlement.settlement_month || null,
    settlement_period: commissionSettlement.settlement_period || null,
    settlement_year: commissionSettlement.settlement_year || null,
    verified_by: commissionSettlement.verified_by || null,

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
    beneficiary_name: paymentDetails.beneficiary_name || null,
    beneficiary_account_number:
      paymentDetails.beneficiary_account_number || null,
    beneficiary_bank_name: paymentDetails.beneficiary_bank_name || null,
    beneficiary_ifsc_code: paymentDetails.beneficiary_ifsc_code || null,
    payment_failure_reason: paymentDetails.payment_failure_reason || null,
    retry_attempt_count: paymentDetails.retry_attempt_count || null,
    last_retry_date: paymentDetails.last_retry_date
      ? new Date(paymentDetails.last_retry_date).toISOString().split("T")[0]
      : null,

    settlement_status: statusHistory.settlement_status || null,
    calculation_date: statusHistory.calculation_date
      ? new Date(statusHistory.calculation_date).toISOString().split("T")[0]
      : null,
    calculated_by: statusHistory.calculated_by || null,
    verification_status: statusHistory.verification_status || null,
    verification_date: statusHistory.verification_date
      ? new Date(statusHistory.verification_date).toISOString().split("T")[0]
      : null,

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

    processing_time_days: performanceMetrics.processing_time_days || null,
    payment_delay_days: performanceMetrics.payment_delay_days || null,
    sla_breach: performanceMetrics.sla_breach || null,
    sla_breach_reason: performanceMetrics.sla_breach_reason || null,
    partner_satisfaction_rating: performanceMetrics.partner_satisfaction_rating
      ? parseFloat(performanceMetrics.partner_satisfaction_rating)
      : null,

    transaction_type: transaction.transaction_type || null,
    transaction_sub_type: transaction.transaction_sub_type || null,
    disbursement_trigger: transaction.disbursement_trigger || null,
    batch_payment_id: transaction.batch_payment_id || null,
    original_transaction_id: transaction.original_transaction_id || null,
    related_settlement_id: transaction.related_settlement_id || null,

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

    ...(commissionSettlement.hs_object_id && {}),
  };
}

async function findOrCreateOutboxEntry(
  settlementId: number,
  operation: string,
  hsObjectId: string | null
): Promise<any> {
  const existingEntry = await prisma.syncOutbox.findFirst({
    where: {
      entity_type: "HSCommissionSettlements",
      entity_id: settlementId,
      operation: operation === "INSERT" ? "INSERT" : operation,
      status: "PENDING",
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (existingEntry) {
    logger.debug(
      `[Commission PG NOTIFY] Found existing outbox entry for settlement #${settlementId}`
    );
    return existingEntry;
  }

  logger.warn(
    `[Commission PG NOTIFY] No outbox entry found for settlement #${settlementId}, creating new`
  );

  const newEntry = await prisma.syncOutbox.create({
    data: {
      entity_type: "HSCommissionSettlements",
      entity_id: settlementId,
      operation: operation,
      payload: { hs_object_id: hsObjectId },
      status: "PENDING",
      priority: 5,
      attempts: 0,
    },
  });

  return newEntry;
}

async function markAsProcessing(outboxId: string): Promise<any> {
  const updated = await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: "PROCESSING",
      processing_at: new Date(),
      attempts: { increment: 1 },
    },
  });

  logger.debug(
    `[Commission PG NOTIFY] Marked outbox #${outboxId} as PROCESSING`
  );
  return updated;
}

async function markAsCompleted(
  outboxId: string,
  hubspotId: string | null
): Promise<void> {
  await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: "COMPLETED",
      hubspot_id: hubspotId,
      processed_at: new Date(),
      last_error: null,
    },
  });

  logger.debug(
    `[Commission PG NOTIFY] Marked outbox #${outboxId} as COMPLETED (HubSpot ID: ${hubspotId})`
  );
}

async function markAsFailed(
  outboxId: string,
  errorMessage: string,
  currentAttempts: number
): Promise<void> {
  const isFinalAttempt = currentAttempts >= MAX_RETRIES;

  await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: isFinalAttempt ? "FAILED" : "PENDING",
      last_error: errorMessage,
      ...(isFinalAttempt && { processed_at: new Date() }),
    },
  });

  if (isFinalAttempt) {
    logger.error(
      `[Commission PG NOTIFY] Marked outbox #${outboxId} as FAILED after ${MAX_RETRIES} attempts`
    );
  } else {
    logger.debug(
      `[Commission PG NOTIFY] Marked outbox #${outboxId} as PENDING for retry (attempt ${currentAttempts}/${MAX_RETRIES})`
    );
  }
}

function startFallbackProcessor() {
  setInterval(async () => {
    try {
      const pendingItems = await prisma.syncOutbox.findMany({
        where: {
          entity_type: "HSCommissionSettlements",
          status: "PENDING",
          attempts: { lt: MAX_RETRIES },
        },
        orderBy: [{ priority: "asc" }, { created_at: "asc" }],
        take: 50,
      });

      if (pendingItems.length === 0) return;

      logger.info(
        `[Commission PG NOTIFY] Processing ${pendingItems.length} items from fallback queue`
      );

      for (const item of pendingItems) {
        await processRetry(item);
      }
    } catch (error) {
      logger.error("[Commission PG NOTIFY] Fallback processor error:", error);
    }
  }, FALLBACK_CHECK_INTERVAL);

  logger.info("[Commission PG NOTIFY] Fallback processor started");
}

async function processRetry(item: any): Promise<void> {
  await prisma.syncOutbox.update({
    where: { id: item.id },
    data: {
      status: "PROCESSING",
      processing_at: new Date(),
      attempts: { increment: 1 },
    },
  });

  try {
    const result = await processCommissionSync(
      item.entity_id,
      item.operation,
      item.payload?.hs_object_id
    );

    await prisma.syncOutbox.update({
      where: { id: item.id },
      data: {
        status: "COMPLETED",
        hubspot_id: result?.hubspotId,
        processed_at: new Date(),
        last_error: null,
      },
    });

    logger.info(
      `[Commission PG NOTIFY] Retry succeeded for settlement #${item.entity_id}`
    );
  } catch (error: any) {
    const newAttempts = item.attempts + 1;
    const isFinalAttempt = newAttempts >= MAX_RETRIES;

    await prisma.syncOutbox.update({
      where: { id: item.id },
      data: {
        status: isFinalAttempt ? "FAILED" : "PENDING",
        last_error: error.message,
        ...(isFinalAttempt && { processed_at: new Date() }),
      },
    });

    if (isFinalAttempt) {
      logger.error(
        `[Commission PG NOTIFY] Retry exhausted for settlement #${item.entity_id} after ${MAX_RETRIES} attempts`
      );
    }
  }
}

// REMOVED: async function reconnectcommissionPgClient() { ... }
// Connection management is now handled by the shared pg-notify-client

// Updated graceful shutdown - don't close the shared connection
process.on("SIGTERM", async () => {
  logger.info(
    "[Commission PG NOTIFY] SIGTERM received, closing worker gracefully..."
  );
  await commissionSyncQueue.onIdle();
  // Connection will be closed centrally by pg-notify-client
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info(
    "[Commission PG NOTIFY] SIGINT received, closing worker gracefully..."
  );
  await commissionSyncQueue.onIdle();
  // Connection will be closed centrally by pg-notify-client
  process.exit(0);
});