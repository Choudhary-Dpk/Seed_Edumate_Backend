// src/workers/hubspot-loan-sync.worker.ts

import prisma from "../config/prisma";
import logger from "../utils/logger";
import {
  createLoanApplication,
  updateLoanApplication,
  deleteLoanApplication,
  HubSpotLoanApplication,
} from "../services/hubspot-loan.service";
import { mapLoanEnumValue } from "../constants/loanEnumMappingDbToHs";

const POLL_INTERVAL = 60000; // 60 seconds
const MAX_RETRIES = 5;

/**
 * Start all background workers
 */
// export async function startWorkers() {
//   try {
//     logger.info("🔧 Initializing background workers...");
    
//     // Start Contact sync worker
//     startLoanHubSpotSyncWorker().catch((error) => {
//       logger.error("Contact Sync Worker crashed:", error);
//       process.exit(1);
//     });

//     logger.info("✅ All workers started successfully");
//   } catch (error) {
//     logger.error("Failed to start workers:", error);
//     process.exit(1);
//   }
// }

// // Graceful shutdown
// process.on("SIGTERM", () => {
//   logger.info("SIGTERM received, shutting down workers gracefully...");
//   process.exit(0);
// });

// process.on("SIGINT", () => {
//   logger.info("SIGINT received, shutting down workers gracefully...");
//   process.exit(0);
// });

/**
 * Start Loan Application HubSpot Sync Worker
 */
export async function startLoanHubSpotSyncWorker() {
  logger.info("🚀 Loan Application HubSpot Sync Worker started");
  
  // Continuous polling
  while (true) {
    try {
      await processLoanOutboxEntries();
      
      // Wait before next poll
      await sleep(POLL_INTERVAL);
    } catch (error) {
      logger.error("Loan worker error:", error);
      await sleep(POLL_INTERVAL * 2); // Wait longer on error
    }
  }
}

/**
 * Process pending loan outbox entries
 */
async function processLoanOutboxEntries() {
  // Fetch pending entries for Loan Applications only
  const pendingEntries = await prisma.syncOutbox.findMany({
    where: {
      entity_type: "HSLoanApplications",
      status: "PENDING",
      attempts: {
        lt: MAX_RETRIES,
      },
    },
    orderBy: [
      { priority: "asc" }, // Higher priority first
      { created_at: "asc" }, // Older first
    ],
    take: 50, // Process 50 at a time (no batch operations)
  });

  if (pendingEntries.length === 0) {
    return; // Nothing to process
  }

  logger.info(`Processing ${pendingEntries.length} pending loan application outbox entries`);

  // Process each entry individually
  for (const entry of pendingEntries) {
    await processSingleLoanEntry(entry);
  }
}

/**
 * Process single loan outbox entry
 */
async function processSingleLoanEntry(entry: any) {
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
    if (entity_type !== "HSLoanApplications") {
      await markAsCompleted(entry.id);
      return;
    }

    let hubspotId: string | undefined;

    switch (operation) {
      case "CREATE":
        hubspotId = await handleLoanCreate(payload, entry.entity_id);
        break;
      case "UPDATE":
        hubspotId = await handleLoanUpdate(payload, entry.entity_id);
        break;
      case "DELETE":
        await handleLoanDelete(payload?.hs_object_id);
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
      await prisma.hSLoanApplications.update({
        where: { id: entry.entity_id },
        data: { hs_object_id: hubspotId },
      });
    }

    logger.debug(`✅ Loan Synced: ${operation} ${entity_type}#${entry.entity_id}`);
  } catch (error: any) {
    await handleLoanSyncError(entry.id, error);
  }
}

/**
 * Handle CREATE operation for loan application
 */
async function handleLoanCreate(payload: any, loanId: number): Promise<string | undefined> {
  // Fetch complete loan application data
  const loanApplication = await prisma.hSLoanApplications.findUnique({
    where: { id: loanId },
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
    throw new Error(`Loan application ${loanId} not found`);
  }

  // Transform to HubSpot format
  const hubspotPayload = transformLoanToHubSpotFormat(loanApplication);

  // Create in HubSpot
  const result = await createLoanApplication(hubspotPayload);

  return result.id;
}

/**
 * Handle UPDATE operation for loan application
 */
async function handleLoanUpdate(payload: any, loanId: number): Promise<string | undefined> {
  // Fetch complete loan application data
  const loanApplication = await prisma.hSLoanApplications.findUnique({
    where: { id: loanId },
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
    throw new Error(`Loan application ${loanId} not found`);
  }

  // Get HubSpot ID
  const hubspotId = loanApplication.hs_object_id;

  if (!hubspotId) {
    // If no HubSpot ID exists, create new entry
    logger.warn(`No HubSpot ID for loan ${loanId}, creating new entry`);
    return await handleLoanCreate(payload, loanId);
  }

  // Transform to HubSpot format
  const hubspotPayload = transformLoanToHubSpotFormat(loanApplication);

  // Update in HubSpot
  const result = await updateLoanApplication(hubspotId, hubspotPayload);

  return result.id;
}

/**
 * Handle DELETE operation for loan application
 */
async function handleLoanDelete(hs_object_id: string): Promise<void> {
  // Try to find the loan application (might be soft-deleted)
  // const loanApplication = await prisma.hSLoanApplications.findUnique({
  //   where: { id: loanId },
  // });

  // const hubspotId = loanApplication?.hs_object_id;

  if (!hs_object_id) {
    logger.warn(`No HubSpot ID found for loan ${hs_object_id}, skipping delete`);
    return;
  }

  // Delete from HubSpot
  await deleteLoanApplication(hs_object_id);
}

/**
 * Transform loan application data to HubSpot format
 */
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
    // ========================================
    // MAIN LOAN APPLICATION FIELDS
    // ========================================
    
    application_date: loanApp.application_date 
      ? new Date(loanApp.application_date).toISOString().split('T')[0] 
      : null,
    lead_reference_code: loanApp.lead_reference_code || null,
    student_id: loanApp.student_id || null,
    student_name: loanApp.student_name || null,
    student_email: loanApp.student_email || null,
    student_phone: loanApp.student_phone || null,
    application_source: mapLoanEnumValue('application_source', loanApp.application_source),
    assigned_counselor_id: loanApp.assigned_counselor_id || null,
    b2b_partner_id: loanApp.b2b_partner_id || null,
    
    // ========================================
    // ACADEMIC DETAILS
    // ========================================
    
    target_course: academicDetails.target_course || null,
    target_university: academicDetails.target_university || null,
    target_university_country: academicDetails.target_university_country || null,
    course_level: mapLoanEnumValue('course_level', academicDetails.course_level),
    course_start_date: academicDetails.course_start_date 
      ? new Date(academicDetails.course_start_date).toISOString().split('T')[0] 
      : null,
    course_end_date: academicDetails.course_end_date 
      ? new Date(academicDetails.course_end_date).toISOString().split('T')[0] 
      : null,
    course_duration: academicDetails.course_duration || null,
    admission_status: mapLoanEnumValue('admission_status', academicDetails.admission_status),
    visa_status: mapLoanEnumValue('visa_status', academicDetails.visa_status),
    i20_cas_received: mapLoanEnumValue('i20_cas_received', academicDetails.i20_cas_received),
    
    // ========================================
    // FINANCIAL REQUIREMENTS
    // ========================================
    
    loan_amount_requested: financialReq.loan_amount_requested 
      ? parseFloat(financialReq.loan_amount_requested) 
      : null,
    loan_amount_approved: financialReq.loan_amount_approved 
      ? parseFloat(financialReq.loan_amount_approved) 
      : null,
    loan_amount_disbursed: financialReq.loan_amount_disbursed 
      ? parseFloat(financialReq.loan_amount_disbursed) 
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
    
    // ========================================
    // APPLICATION STATUS
    // ========================================
    
    status: mapLoanEnumValue('status', status.status),
    priority_level: mapLoanEnumValue('priority_level', status.priority_level),
    application_notes: status.application_notes || null,
    internal_notes: status.internal_notes || null,
    record_status: mapLoanEnumValue('record_status', status.record_status),
    
    // ========================================
    // LENDER INFORMATION
    // ========================================
    
    primary_lender_id: lenderInfo.primary_lender_id || null,
    primary_lender_name: lenderInfo.primary_lender_name || null,
    loan_product_id: lenderInfo.loan_product_id || null,
    loan_product_name: lenderInfo.loan_product_name || null,
    loan_product_type: mapLoanEnumValue('loan_product_type', lenderInfo.loan_product_type),
    interest_rate_offered: lenderInfo.interest_rate_offered 
      ? parseFloat(lenderInfo.interest_rate_offered) 
      : null,
    interest_rate_type: mapLoanEnumValue('interest_rate_type', lenderInfo.interest_rate_type),
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
    
    // ========================================
    // DOCUMENT MANAGEMENT
    // ========================================
    
    documents_required_list: docManagement.documents_required_list || null,
    documents_submitted_list: docManagement.documents_submitted_list || null,
    documents_pending_list: docManagement.documents_pending_list || null,
    
    // ========================================
    // PROCESSING TIMELINE
    // ========================================
    
    lender_submission_date: timeline.lender_submission_date 
      ? new Date(timeline.lender_submission_date).toISOString().split('T')[0] 
      : null,
    lender_acknowledgment_date: timeline.lender_acknowledgment_date 
      ? new Date(timeline.lender_acknowledgment_date).toISOString().split('T')[0] 
      : null,
    approval_date: timeline.approval_date 
      ? new Date(timeline.approval_date).toISOString().split('T')[0] 
      : null,
    sanction_letter_date: timeline.sanction_letter_date 
      ? new Date(timeline.sanction_letter_date).toISOString().split('T')[0] 
      : null,
    disbursement_request_date: timeline.disbursement_request_date 
      ? new Date(timeline.disbursement_request_date).toISOString().split('T')[0] 
      : null,
    disbursement_date: timeline.disbursement_date 
      ? new Date(timeline.disbursement_date).toISOString().split('T')[0] 
      : null,
    total_processing_days: timeline.total_processing_days || null,
    sla_breach: timeline.sla_breach || null,
    delay_reason: mapLoanEnumValue('delay_reason', timeline.delay_reason),
    
    // ========================================
    // REJECTION DETAILS
    // ========================================
    
    rejection_date: rejection.rejection_date 
      ? new Date(rejection.rejection_date).toISOString().split('T')[0] 
      : null,
    rejection_reason: mapLoanEnumValue('rejection_reason', rejection.rejection_reason),
    rejection_details: rejection.rejection_details || null,
    appeal_submitted: rejection.appeal_submitted || null,
    appeal_outcome: mapLoanEnumValue('appeal_outcome', rejection.appeal_outcome),
    resolution_provided: rejection.resolution_provided || null,
    
    // ========================================
    // COMMUNICATION PREFERENCES
    // ========================================
    
    communication_preference: mapLoanEnumValue('communication_preference', commPrefs.communication_preference),
    follow_up_frequency: mapLoanEnumValue('follow_up_frequency', commPrefs.follow_up_frequency),
    last_contact_date: commPrefs.last_contact_date 
      ? new Date(commPrefs.last_contact_date).toISOString().split('T')[0] 
      : null,
    next_follow_up_date: commPrefs.next_follow_up_date 
      ? new Date(commPrefs.next_follow_up_date).toISOString().split('T')[0] 
      : null,
    customer_satisfaction_rating: commPrefs.customer_satisfaction_rating || null,
    customer_feedback: commPrefs.customer_feedback || null,
    complaint_raised: commPrefs.complaint_raised || null,
    complaint_details: commPrefs.complaint_details || null,
    complaint_resolution_date: commPrefs.complaint_resolution_date 
      ? new Date(commPrefs.complaint_resolution_date).toISOString().split('T')[0] 
      : null,
    
    // ========================================
    // SYSTEM TRACKING
    // ========================================
    
    application_source_system: mapLoanEnumValue('application_source_system', systemTracking.application_source_system),
    integration_status: mapLoanEnumValue('integration_status', systemTracking.integration_status),
    external_reference_id: systemTracking.external_reference_id || null,
    application_record_status: mapLoanEnumValue('application_record_status', systemTracking.application_record_status),
    
    // ========================================
    // COMMISSION RECORDS
    // ========================================
    
    commission_amount: commission.commission_amount 
      ? parseFloat(commission.commission_amount) 
      : null,
    commission_rate: commission.commission_rate 
      ? parseFloat(commission.commission_rate) 
      : null,
    commission_calculation_base: mapLoanEnumValue('commission_calculation_base', commission.commission_calculation_base),
    commission_status: mapLoanEnumValue('commission_status', commission.commission_status),
    commission_approval_date: commission.commission_approval_date 
      ? new Date(commission.commission_approval_date).toISOString().split('T')[0] 
      : null,
    commission_payment_date: commission.commission_payment_date 
      ? new Date(commission.commission_payment_date).toISOString().split('T')[0] 
      : null,
    partner_commission_applicable: commission.partner_commission_applicable || null,
    settlement_id: commission.settlement_id || null,
    
    // ========================================
    // ADDITIONAL SERVICES
    // ========================================
    
    additional_services_notes: additionalServices.additional_services_notes || null,
    
    // ========================================
    // HUBSPOT SYSTEM FIELDS (if updating)
    // ========================================
    
    // Don't send these on CREATE, only on UPDATE
    ...(loanApp.hs_object_id && {
      // hs_object_id: loanApp.hs_object_id,
    }),
  };
}

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
 * Handle sync error
 */
async function handleLoanSyncError(entryId: string, error: any): Promise<void> {
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

  logger.error(`Failed to sync loan entry ${entryId}:`, errorMessage);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}