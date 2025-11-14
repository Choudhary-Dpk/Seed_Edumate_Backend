export const categorizeLoanApplicationByTable = (
  mappedFields: Record<string, any>
) => {
  const categorized: Record<string, Record<string, any>> = {};
  // ==================== MAIN TABLE: hs_loan_applications ====================
  const mainLoanApplicationFields = [
    // Basic Information
    "application_date",
    "application_source",
    "assigned_counselor",
    "b2b_partner_id",
    "lead_reference_code",
    "student_id",
    "student_name",
    "student_email",
    "student_phone",
    "user_id",
    "contact_id",
    "lender_id",
    "product_id",

    // HubSpot System Fields
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_merged_object_ids",
    "hs_object_id",
    "hs_object_source_detail_1",
    "hs_object_source_detail_2",
    "hs_object_source_detail_3",
    "hs_object_source_label",
    "hs_shared_team_ids",
    "hs_shared_user_ids",
    "hs_updated_by_user_id",
    "hubspot_owner_assigneddate",
    "hubspot_owner_id",
    "hubspot_team_id",

    // Audit Fields
    "is_active",
    "is_deleted",
    "created_by",
    "updated_by",
    "deleted_by",
    "deleted_by_id",
    "deleted_on",
  ];

  // ==================== ACADEMIC DETAILS ====================
  const academicDetailsFields = [
    "admission_status",
    "course_duration",
    "course_end_date",
    "course_level",
    "course_start_date",
    "i20_cas_received",
    "target_course",
    "target_university",
    "target_university_country",
    "visa_status",
  ];

  // ==================== FINANCIAL REQUIREMENTS ====================
  const financialRequirementsFields = [
    "insurance_cost",
    "living_expenses",
    "loan_amount_approved",
    "loan_amount_disbursed",
    "loan_amount_requested",
    "other_expenses",
    "scholarship_amount",
    "self_funding_amount",
    "total_funding_required",
    "travel_expenses",
    "tuition_fee",
  ];

  // ==================== APPLICATION STATUS ====================
  const applicationStatusFields = [
    "application_status",
    "application_notes",
    "internal_notes",
    "priority_level",
  ];

  // ==================== LENDER INFORMATION ====================
  const lenderInformationFields = [
    "co_signer_required",
    "collateral_required",
    "collateral_type",
    "collateral_value",
    "emi_amount",
    "guarantor_details",
    "interest_rate_offered",
    "interest_rate_type",
    "loan_product_id",
    "loan_product_name",
    "loan_product_type",
    "loan_tenure_years",
    "moratorium_period_months",
    "primary_lender_id",
    "primary_lender_name",
    "processing_fee",
  ];

  // ==================== DOCUMENT MANAGEMENT ====================
  const documentManagementFields = [
    "documents_pending_list",
    "documents_required_list",
    "documents_submitted_list",
  ];

  // ==================== PROCESSING TIMELINE ====================
  const processingTimelineFields = [
    "approval_date",
    "delay_reason",
    "disbursement_date",
    "disbursement_request_date",
    "lender_acknowledgment_date",
    "lender_submission_date",
    "sanction_letter_date",
    "sla_breach",
    "total_processing_days",
  ];

  // ==================== REJECTION DETAILS ====================
  const rejectionDetailsFields = [
    "appeal_outcome",
    "appeal_submitted",
    "rejection_date",
    "rejection_details",
    "rejection_reason",
    "resolution_provided",
  ];

  // ==================== COMMUNICATION PREFERENCES ====================
  const communicationPreferencesFields = [
    "communication_preference",
    "complaint_details",
    "complaint_raised",
    "complaint_resolution_date",
    "customer_feedback",
    "customer_satisfaction_rating",
    "follow_up_frequency",
    "last_contact_date",
    "next_follow_up_date",
  ];

  // ==================== SYSTEM TRACKING ====================
  const systemTrackingFields = [
    "application_record_status",
    "application_source_system",
    "audit_trail",
    "created_by_user",
    "created_date",
    "external_reference_id",
    "integration_status",
    "last_modified_by",
    "last_modified_date",
  ];

  // ==================== COMMISSION RECORDS ====================
  const commissionRecordsFields = [
    "commission_amount",
    "commission_approval_date",
    "commission_calculation_base",
    "commission_payment_date",
    "commission_rate",
    "commission_model",
    "commission_type",
    "tds_applicable",
    "tds_rate",
    "gst_applicable",
    "gst_rate",
    "commission_status",
    "partner_commission_applicable",
    "settlement_id",
  ];

  // ==================== ADDITIONAL SERVICES ====================
  const additionalServicesFields = ["additional_services_notes"];

  // Categorize main loan application
  const mainLoanApplication: Record<string, any> = {};
  for (const field of mainLoanApplicationFields) {
    if (field in mappedFields) {
      mainLoanApplication[field] = mappedFields[field];
    }
  }
  if (Object.keys(mainLoanApplication).length > 0) {
    categorized.mainLoanApplication = mainLoanApplication;
  }

  // Categorize academic details
  const academicDetails: Record<string, any> = {};
  for (const field of academicDetailsFields) {
    if (field in mappedFields) {
      academicDetails[field] = mappedFields[field];
    }
  }
  if (Object.keys(academicDetails).length > 0) {
    categorized.academicDetails = academicDetails;
  }

  // Categorize financial requirements
  const financialRequirements: Record<string, any> = {};
  for (const field of financialRequirementsFields) {
    if (field in mappedFields) {
      financialRequirements[field] = mappedFields[field];
    }
  }
  if (Object.keys(financialRequirements).length > 0) {
    categorized.financialRequirements = financialRequirements;
  }

  // Categorize application status
  const applicationStatus: Record<string, any> = {};
  for (const field of applicationStatusFields) {
    if (field in mappedFields) {
      applicationStatus[field] = mappedFields[field];
    }
  }
  if (Object.keys(applicationStatus).length > 0) {
    categorized.applicationStatus = applicationStatus;
  }

  // Categorize lender information
  const lenderInformation: Record<string, any> = {};
  for (const field of lenderInformationFields) {
    if (field in mappedFields) {
      lenderInformation[field] = mappedFields[field];
    }
  }
  if (Object.keys(lenderInformation).length > 0) {
    categorized.lenderInformation = lenderInformation;
  }

  // Categorize document management
  const documentManagement: Record<string, any> = {};
  for (const field of documentManagementFields) {
    if (field in mappedFields) {
      documentManagement[field] = mappedFields[field];
    }
  }
  if (Object.keys(documentManagement).length > 0) {
    categorized.documentManagement = documentManagement;
  }

  // Categorize processing timeline
  const processingTimeline: Record<string, any> = {};
  for (const field of processingTimelineFields) {
    if (field in mappedFields) {
      processingTimeline[field] = mappedFields[field];
    }
  }
  if (Object.keys(processingTimeline).length > 0) {
    categorized.processingTimeline = processingTimeline;
  }

  // Categorize rejection details
  const rejectionDetails: Record<string, any> = {};
  for (const field of rejectionDetailsFields) {
    if (field in mappedFields) {
      rejectionDetails[field] = mappedFields[field];
    }
  }
  if (Object.keys(rejectionDetails).length > 0) {
    categorized.rejectionDetails = rejectionDetails;
  }

  // Categorize communication preferences
  const communicationPreferences: Record<string, any> = {};
  for (const field of communicationPreferencesFields) {
    if (field in mappedFields) {
      communicationPreferences[field] = mappedFields[field];
    }
  }
  if (Object.keys(communicationPreferences).length > 0) {
    categorized.communicationPreferences = communicationPreferences;
  }

  // Categorize system tracking
  const systemTracking: Record<string, any> = {};
  for (const field of systemTrackingFields) {
    if (field in mappedFields) {
      systemTracking[field] = mappedFields[field];
    }
  }
  if (Object.keys(systemTracking).length > 0) {
    categorized.systemTracking = systemTracking;
  }

  // Categorize commission records
  const commissionRecords: Record<string, any> = {};
  for (const field of commissionRecordsFields) {
    if (field in mappedFields) {
      commissionRecords[field] = mappedFields[field];
    }
  }
  if (Object.keys(commissionRecords).length > 0) {
    categorized.commissionRecords = commissionRecords;
  }

  // Categorize additional services
  const additionalServices: Record<string, any> = {};
  for (const field of additionalServicesFields) {
    if (field in mappedFields) {
      additionalServices[field] = mappedFields[field];
    }
  }
  if (Object.keys(additionalServices).length > 0) {
    categorized.additionalServices = additionalServices;
  }

  return categorized;
};
