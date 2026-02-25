import PQueue from "p-queue";
import prisma from "../config/prisma";
import { getInstance, registerChannel } from "../config/pg-notify-client";
import logger from "../utils/logger";
import {
  createLoanApplication,
  updateLoanApplication,
  deleteLoanApplication,
} from "../services/hubspot-loan.service";

const MAX_RETRIES = 5;
const DEBOUNCE_DELAY = 5000;
const CONCURRENCY = 10;
const RATE_LIMIT = 100;
const FALLBACK_CHECK_INTERVAL = 30000;

const CHANNEL_NAME = "loan_sync_channel";

const loanSyncQueue = new PQueue({
  concurrency: CONCURRENCY,
  interval: 1000,
  intervalCap: RATE_LIMIT,
  timeout: 60000,
});

const loanOngoingSync = new Set<string>();
const loanPendingUpdates = new Map<string, NodeJS.Timeout>();

export async function startLoanPGNotifyWorker() {
  try {
    logger.info("[Loan PG NOTIFY] Starting worker...");

    // Get the shared PostgreSQL client
    const pgClient = await getInstance();
    logger.info("[Loan PG NOTIFY] Using shared PostgreSQL connection");

    // Register channel for auto-reconnect
    registerChannel(CHANNEL_NAME);

    // Listen to loan_sync_channel
    await pgClient.query(`LISTEN ${CHANNEL_NAME}`);
    logger.info(`[Loan PG NOTIFY] Listening on ${CHANNEL_NAME}`);

    // Setup notification handler
    pgClient.on("notification", handleNotification);

    // Start fallback processor
    startFallbackProcessor();

    logger.info("[Loan PG NOTIFY] Worker started successfully");
    logger.info(
      `[Loan PG NOTIFY] Config: concurrency=${CONCURRENCY}, rate=${RATE_LIMIT}/s`,
    );
  } catch (error) {
    logger.error("[Loan PG NOTIFY] Failed to start worker:", error);
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
    logger.debug("[Loan PG NOTIFY] Received notification:", {
      table: data.table_name,
      operation: data.operation,
      entity_id: data.entity_id,
      source: data.source,
    });

    // Only skip HubSpot-source for UPDATEs, not INSERTs
    if (data.source === "hubspot" && data.operation === "UPDATE") {
      logger.debug("[Loan PG NOTIFY] Skipping HubSpot-source UPDATE");
      return;
    }

    const applicationId = data.application_id || data.entity_id;
    const syncKey = `loan:${applicationId}:${data.operation}`;

    if (loanOngoingSync.has(syncKey)) {
      logger.debug(`[Loan PG NOTIFY] Already processing ${syncKey}, skipping`);
      return;
    }

    if (data.operation === "UPDATE") {
      if (loanPendingUpdates.has(syncKey)) {
        clearTimeout(loanPendingUpdates.get(syncKey)!);
      }

      const timeout = setTimeout(() => {
        loanPendingUpdates.delete(syncKey);
        queueLoanSync(
          applicationId,
          data.operation,
          data.hs_object_id,
          syncKey,
        );
      }, DEBOUNCE_DELAY);

      loanPendingUpdates.set(syncKey, timeout);
      logger.debug(
        `[Loan PG NOTIFY] Debouncing ${syncKey} for ${DEBOUNCE_DELAY}ms`,
      );
    } else {
      await queueLoanSync(
        applicationId,
        data.operation,
        data.hs_object_id,
        syncKey,
      );
    }
  } catch (error) {
    logger.error("[Loan PG NOTIFY] Failed to handle notification:", error);
  }
}

async function queueLoanSync(
  applicationId: number,
  operation: string,
  hsObjectId: string | null,
  syncKey: string,
) {
  loanSyncQueue.add(async () => {
    loanOngoingSync.add(syncKey);

    // Find or create SyncOutbox entry
    let outboxEntry = await findOrCreateOutboxEntry(
      applicationId,
      operation,
      hsObjectId,
    );

    try {
      // Mark as PROCESSING
      outboxEntry = await markAsProcessing(outboxEntry.id);

      // Process the sync
      const result = await processLoanSync(
        applicationId,
        operation,
        hsObjectId,
      );

      // Mark as COMPLETED on success
      await markAsCompleted(outboxEntry.id, result?.hubspotId || hsObjectId);

      logger.info(`[Loan PG NOTIFY] Successfully synced ${syncKey}`);
    } catch (error: any) {
      logger.error(`[Loan PG NOTIFY] Sync failed for ${syncKey}:`, error);

      // Mark as PENDING (for retry) or FAILED (if max attempts)
      await markAsFailed(
        outboxEntry.id,
        error.message,
        outboxEntry.attempts + 1,
      );
    } finally {
      loanOngoingSync.delete(syncKey);
    }
  });

  logger.debug(
    `[Loan PG NOTIFY] Queued ${syncKey} (Queue: ${loanSyncQueue.size}, Active: ${loanSyncQueue.pending})`,
  );
}

async function processLoanSync(
  applicationId: number,
  operation: string,
  hsObjectId: string | null,
): Promise<{ hubspotId?: string } | void> {
  logger.info(
    `[Loan PG NOTIFY] Processing ${operation} for application #${applicationId}`,
  );

  switch (operation) {
    case "CREATE":
    case "INSERT":
      const createResult = await handleLoanCreate(applicationId);
      return { hubspotId: createResult };

    case "UPDATE":
      const updateResult = await handleLoanUpdate(applicationId);
      return { hubspotId: updateResult };

    case "DELETE":
      if (hsObjectId) {
        await handleLoanDelete(hsObjectId);
      }
      return;

    default:
      logger.warn(`[Loan PG NOTIFY] Unknown operation: ${operation}`);
      return;
  }
}

async function handleLoanCreate(applicationId: number): Promise<string> {
  const loanApplication = await prisma.hSLoanApplications.findUnique({
    where: { id: applicationId },
    include: {
      academic_details: true,
      financial_requirements: true,
      loan_application_status: true,
      lender_information: true,
      document_management: true,
      processing_timeline: true,
      rejection_details: true,
      communication_prefs: true,
      system_tracking: true,
      commission_records: true,
      additional_services: true,
    },
  });

  if (!loanApplication) {
    throw new Error(`Loan application ${applicationId} not found`);
  }

  // If loan has hs_object_id (came from HubSpot), UPDATE instead
  if (loanApplication.hs_object_id) {
    logger.info(
      `[Loan PG NOTIFY] Application #${applicationId} already has HubSpot ID: ${loanApplication.hs_object_id}, updating with db_id`,
    );

    const hubspotPayload = transformLoanToHubSpotFormat(loanApplication);

    try {
      await updateLoanApplication(loanApplication.hs_object_id, hubspotPayload);
      logger.info(
        `[Loan PG NOTIFY] Updated HubSpot loan ${loanApplication.hs_object_id} with db_id: ${applicationId}`,
      );
    } catch (error: any) {
      logger.error(
        `[Loan PG NOTIFY] Failed to update HubSpot with db_id:`,
        error,
      );
    }

    return loanApplication.hs_object_id;
  }

  // Fetch associations
  let edumateContactHsObjectId: string | null = null;
  let b2bPartnerHsObjectId: string | null = null;
  let lenderHsObjectId: string | null = null;
  let loanProductHsObjectId: string | null = null;

  if (loanApplication.contact_id) {
    const contact = await prisma.hSEdumateContacts.findUnique({
      where: { id: loanApplication.contact_id },
      select: { hs_object_id: true },
    });
    if (contact?.hs_object_id) {
      edumateContactHsObjectId = contact.hs_object_id;
      logger.info("[Loan PG NOTIFY] Found Edumate Contact for association", {
        contactId: loanApplication.contact_id,
        hsObjectId: edumateContactHsObjectId,
      });
    }
  }

  if (loanApplication.b2b_partner_id) {
    const b2bPartner = await prisma.hSB2BPartners.findUnique({
      where: { id: loanApplication.b2b_partner_id },
      select: { hs_object_id: true },
    });
    if (b2bPartner?.hs_object_id) {
      b2bPartnerHsObjectId = b2bPartner.hs_object_id;
      logger.info("[Loan PG NOTIFY] Found B2B Partner for association", {
        b2bPartnerId: loanApplication.b2b_partner_id,
        hsObjectId: b2bPartnerHsObjectId,
      });
    }
  }

  if (loanApplication.lender_id) {
    const lender = await prisma.hSLenders.findUnique({
      where: { id: loanApplication.lender_id },
      select: { hs_object_id: true },
    });
    if (lender?.hs_object_id) {
      lenderHsObjectId = lender.hs_object_id;
      logger.info("[Loan PG NOTIFY] Found Lender for association", {
        lenderId: loanApplication.lender_id,
        hsObjectId: lenderHsObjectId,
      });
    }
  }

  if (loanApplication.product_id) {
    const loanProduct = await prisma.hSLoanProducts.findUnique({
      where: { id: loanApplication.product_id },
      select: { hs_object_id: true },
    });
    if (loanProduct?.hs_object_id) {
      loanProductHsObjectId = loanProduct.hs_object_id;
      logger.info("[Loan PG NOTIFY] Found Loan Product for association", {
        productId: loanApplication.product_id,
        hsObjectId: loanProductHsObjectId,
      });
    }
  }

  // Transform to HubSpot format
  const hubspotPayload = transformLoanToHubSpotFormat(loanApplication);

  // Call HubSpot API
  const result = await createLoanApplication(
    hubspotPayload,
    edumateContactHsObjectId,
    b2bPartnerHsObjectId,
    lenderHsObjectId,
    loanProductHsObjectId,
  );

  if (!result || !result.id) {
    throw new Error("HubSpot create returned empty result");
  }

  await prisma.hSLoanApplications.update({
    where: { id: applicationId },
    data: {
      hs_object_id: result.id,
      source: "hubspot",
    },
  });

  logger.info(
    `[Loan PG NOTIFY] Created loan application #${applicationId} in HubSpot: ${result.id}`,
  );

  return result.id;
}

async function handleLoanUpdate(applicationId: number): Promise<string> {
  const loanApplication = await prisma.hSLoanApplications.findUnique({
    where: { id: applicationId },
    include: {
      academic_details: true,
      financial_requirements: true,
      loan_application_status: true,
      lender_information: true,
      document_management: true,
      processing_timeline: true,
      rejection_details: true,
      communication_prefs: true,
      system_tracking: true,
      commission_records: true,
      additional_services: true,
    },
  });

  if (!loanApplication) {
    throw new Error(`Loan application ${applicationId} not found`);
  }

  const hubspotId = loanApplication.hs_object_id;

  if (!hubspotId) {
    logger.warn(
      `[Loan PG NOTIFY] No HubSpot ID for loan ${applicationId}, creating new entry`,
    );
    const newId = await handleLoanCreate(applicationId);
    return newId;
  }

  const hubspotPayload = transformLoanToHubSpotFormat(loanApplication);

  try {
    await updateLoanApplication(hubspotId, hubspotPayload);
    logger.info(
      `[Loan PG NOTIFY] Updated loan application #${applicationId} in HubSpot: ${hubspotId}`,
    );
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.warn(
        `[Loan PG NOTIFY] HubSpot loan ${hubspotId} not found (404), creating new`,
      );
      const newId = await handleLoanCreate(applicationId);
      return newId;
    } else {
      throw error;
    }
  }

  return hubspotId;
}

async function handleLoanDelete(hsObjectId: string): Promise<void> {
  await deleteLoanApplication(hsObjectId);
  logger.info(
    `[Loan PG NOTIFY] Deleted loan application from HubSpot: ${hsObjectId}`,
  );
}

async function findOrCreateOutboxEntry(
  applicationId: number,
  operation: string,
  hsObjectId: string | null,
): Promise<any> {
  const existingEntry = await prisma.syncOutbox.findFirst({
    where: {
      entity_type: "HSLoanApplications",
      entity_id: applicationId,
      operation: operation === "INSERT" ? "CREATE" : operation,
      status: "PENDING",
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (existingEntry) {
    logger.debug(
      `[Loan PG NOTIFY] Found existing outbox entry for loan #${applicationId}`,
    );
    return existingEntry;
  }

  logger.warn(
    `[Loan PG NOTIFY] No outbox entry found for loan #${applicationId}, creating new`,
  );

  const newEntry = await prisma.syncOutbox.create({
    data: {
      entity_type: "HSLoanApplications",
      entity_id: applicationId,
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

  logger.debug(`[Loan PG NOTIFY] Marked outbox #${outboxId} as PROCESSING`);
  return updated;
}

async function markAsCompleted(
  outboxId: string,
  hubspotId: string | null,
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
    `[Loan PG NOTIFY] Marked outbox #${outboxId} as COMPLETED (HubSpot ID: ${hubspotId})`,
  );
}

async function markAsFailed(
  outboxId: string,
  errorMessage: string,
  currentAttempts: number,
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
      `[Loan PG NOTIFY] Marked outbox #${outboxId} as FAILED after ${MAX_RETRIES} attempts`,
    );
  } else {
    logger.debug(
      `[Loan PG NOTIFY] Marked outbox #${outboxId} as PENDING for retry (attempt ${currentAttempts}/${MAX_RETRIES})`,
    );
  }
}

function transformLoanToHubSpotFormat(loanApp: any): any {
  const academicDetails = loanApp.academic_details || {};
  const financialReq = loanApp.financial_requirements || {};
  const status = loanApp.loan_application_status || {};
  const lenderInfo = loanApp.lender_information || {};
  const docManagement = loanApp.document_management || {};
  const timeline = loanApp.processing_timeline || {};
  const rejection = loanApp.rejection_details || {};
  const commPrefs = loanApp.communication_prefs || {};
  const systemTracking = loanApp.system_tracking || {};
  const commission = loanApp.commission_records || {};
  const additionalServices = loanApp.additional_services || {};

  return {
    db_id: loanApp.id,
    // application_date: loanApp.application_date
    //   ? new Date(loanApp.application_date).toISOString().split("T")[0]
    //   : null,
    lead_reference_code: loanApp.lead_reference_code || null,
    student_id: loanApp.student_id || null,
    student_name: loanApp.student_name || null,
    student_email: loanApp.student_email || null,
    student_phone: loanApp.student_phone || null,
    application_source: loanApp.application_source || null,
    assigned_counselor_id: loanApp.assigned_counselor_id || null,

    target_course: academicDetails.target_course || null,
    target_university: academicDetails.target_university || null,
    target_university_country:
      academicDetails.target_university_country || null,
    course_level: academicDetails.course_level || null,
    course_start_date: academicDetails.course_start_date
      ? new Date(academicDetails.course_start_date).toISOString().split("T")[0]
      : null,
    course_end_date: academicDetails.course_end_date
      ? new Date(academicDetails.course_end_date).toISOString().split("T")[0]
      : null,
    course_duration: academicDetails.course_duration || null,
    admission_status: academicDetails.admission_status || null,
    visa_status: academicDetails.visa_status || null,
    i20_cas_received: academicDetails.i20_cas_received || null,

    loan_amount_requested: financialReq.loan_amount_requested
      ? parseFloat(financialReq.loan_amount_requested)
      : null,
    loan_amount_approved: financialReq.loan_amount_approved
      ? parseFloat(financialReq.loan_amount_approved)
      : null,
    loan_amount_disbursed: financialReq.loan_amount_disbursed
      ? parseFloat(financialReq.loan_amount_disbursed)
      : null,
    last_loan_amount_disbursed: financialReq.last_loan_amount_disbursed
      ? parseFloat(financialReq.last_loan_amount_disbursed)
      : null,
    tuition_fee: financialReq.tuition_fee
      ? parseFloat(financialReq.tuition_fee)
      : null,
    living_expenses: financialReq.living_expenses
      ? parseFloat(financialReq.living_expenses)
      : null,
    travel_expenses: financialReq.travel_expenses
      ? parseFloat(financialReq.travel_expenses)
      : null,
    insurance_cost: financialReq.insurance_cost
      ? parseFloat(financialReq.insurance_cost)
      : null,
    other_expenses: financialReq.other_expenses
      ? parseFloat(financialReq.other_expenses)
      : null,
    total_funding_required: financialReq.total_funding_required
      ? parseFloat(financialReq.total_funding_required)
      : null,
    scholarship_amount: financialReq.scholarship_amount
      ? parseFloat(financialReq.scholarship_amount)
      : null,
    self_funding_amount: financialReq.self_funding_amount
      ? parseFloat(financialReq.self_funding_amount)
      : null,

    status: status.status || null,
    priority_level: status.priority_level || null,
    application_notes: status.application_notes || null,
    internal_notes: status.internal_notes || null,
    record_status: status.record_status || null,

    primary_lender_id: lenderInfo.primary_lender_id || null,
    primary_lender_name: lenderInfo.primary_lender_name || null,
    loan_product_id: lenderInfo.loan_product_id || null,
    loan_product_name: lenderInfo.loan_product_name || null,
    loan_product_type: lenderInfo.loan_product_type || null,
    interest_rate_offered: lenderInfo.interest_rate_offered
      ? parseFloat(lenderInfo.interest_rate_offered)
      : null,
    interest_rate_type: lenderInfo.interest_rate_type || null,
    loan_tenure_years: lenderInfo.loan_tenure_years || null,
    moratorium_period_months: lenderInfo.moratorium_period_months || null,
    emi_amount: lenderInfo.emi_amount
      ? parseFloat(lenderInfo.emi_amount)
      : null,
    processing_fee: lenderInfo.processing_fee
      ? parseFloat(lenderInfo.processing_fee)
      : null,
    co_signer_required: lenderInfo.co_signer_required || null,
    collateral_required: lenderInfo.collateral_required || null,
    collateral_type: lenderInfo.collateral_type || null,
    collateral_value: lenderInfo.collateral_value
      ? parseFloat(lenderInfo.collateral_value)
      : null,
    guarantor_details: lenderInfo.guarantor_details || null,

    documents_required_list: docManagement.documents_required_list || null,
    documents_submitted_list: docManagement.documents_submitted_list || null,
    documents_pending_list: docManagement.documents_pending_list || null,

    lender_submission_date: timeline.lender_submission_date
      ? new Date(timeline.lender_submission_date).toISOString().split("T")[0]
      : null,
    lender_acknowledgment_date: timeline.lender_acknowledgment_date
      ? new Date(timeline.lender_acknowledgment_date)
          .toISOString()
          .split("T")[0]
      : null,
    // approval_date: timeline.approval_date
    //   ? new Date(timeline.approval_date).toISOString().split("T")[0]
    //   : null,
    sanction_letter_date: timeline.sanction_letter_date
      ? new Date(timeline.sanction_letter_date).toISOString().split("T")[0]
      : null,
    disbursement_request_date: timeline.disbursement_request_date
      ? new Date(timeline.disbursement_request_date).toISOString().split("T")[0]
      : null,
    disbursement_date: timeline.disbursement_date
      ? new Date(timeline.disbursement_date).toISOString().split("T")[0]
      : null,
    total_processing_days: timeline.total_processing_days || null,
    sla_breach: timeline.sla_breach || null,
    delay_reason: timeline.delay_reason || null,

    rejection_date: rejection.rejection_date
      ? new Date(rejection.rejection_date).toISOString().split("T")[0]
      : null,
    rejection_reason: rejection.rejection_reason || null,
    rejection_details: rejection.rejection_details || null,
    appeal_submitted: rejection.appeal_submitted || null,
    appeal_outcome: rejection.appeal_outcome || null,
    resolution_provided: rejection.resolution_provided || null,

    communication_preference: commPrefs.communication_preference || null,
    follow_up_frequency: commPrefs.follow_up_frequency || null,
    last_contact_date: commPrefs.last_contact_date
      ? new Date(commPrefs.last_contact_date).toISOString().split("T")[0]
      : null,
    next_follow_up_date: commPrefs.next_follow_up_date
      ? new Date(commPrefs.next_follow_up_date).toISOString().split("T")[0]
      : null,
    customer_satisfaction_rating:
      commPrefs.customer_satisfaction_rating || null,
    customer_feedback: commPrefs.customer_feedback || null,
    complaint_raised: commPrefs.complaint_raised || null,
    complaint_details: commPrefs.complaint_details || null,
    complaint_resolution_date: commPrefs.complaint_resolution_date
      ? new Date(commPrefs.complaint_resolution_date)
          .toISOString()
          .split("T")[0]
      : null,

    application_source_system: systemTracking.application_source_system || null,
    integration_status: systemTracking.integration_status || null,
    external_reference_id: systemTracking.external_reference_id || null,
    application_record_status: systemTracking.application_record_status || null,

    commission_amount: commission.commission_amount
      ? parseFloat(commission.commission_amount)
      : null,
    commission_rate: commission.commission_rate
      ? parseFloat(commission.commission_rate)
      : null,
    commission_calculation_base: commission.commission_calculation_base || null,
    commission_status: commission.commission_status || null,
    commission_approval_date: commission.commission_approval_date
      ? new Date(commission.commission_approval_date)
          .toISOString()
          .split("T")[0]
      : null,
    commission_payment_date: commission.commission_payment_date
      ? new Date(commission.commission_payment_date).toISOString().split("T")[0]
      : null,
    partner_commission_applicable:
      commission.partner_commission_applicable || null,
    settlement_id: commission.settlement_id || null,

    additional_services_notes:
      additionalServices.additional_services_notes || null,

    ...(loanApp.hs_object_id && {}),
  };
}

function startFallbackProcessor() {
  setInterval(async () => {
    try {
      const pendingItems = await prisma.syncOutbox.findMany({
        where: {
          entity_type: "HSLoanApplications",
          status: "PENDING",
          attempts: { lt: MAX_RETRIES },
        },
        orderBy: [{ priority: "asc" }, { created_at: "asc" }],
        take: 50,
      });

      if (pendingItems.length === 0) return;

      logger.info(
        `[Loan PG NOTIFY] Processing ${pendingItems.length} items from fallback queue`,
      );

      for (const item of pendingItems) {
        await processRetry(item);
      }
    } catch (error) {
      logger.error("[Loan PG NOTIFY] Fallback processor error:", error);
    }
  }, FALLBACK_CHECK_INTERVAL);

  logger.info("[Loan PG NOTIFY] Fallback processor started");
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
    const result = await processLoanSync(
      item.entity_id,
      item.operation,
      item.payload?.hs_object_id,
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
      `[Loan PG NOTIFY] Retry succeeded for loan application #${item.entity_id}`,
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
        `[Loan PG NOTIFY] Retry exhausted for loan application #${item.entity_id} after ${MAX_RETRIES} attempts`,
      );
    }
  }
}

// REMOVED: async function reconnectPGClient() { ... }
// Connection management is now handled by the shared pg-notify-client

// Updated graceful shutdown - don't close the shared connection
process.on("SIGTERM", async () => {
  logger.info(
    "[Loan PG NOTIFY] SIGTERM received, closing worker gracefully...",
  );
  await loanSyncQueue.onIdle();
  // Connection will be closed centrally by pg-notify-client
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("[Loan PG NOTIFY] SIGINT received, closing worker gracefully...");
  await loanSyncQueue.onIdle();
  // Connection will be closed centrally by pg-notify-client
  process.exit(0);
});
