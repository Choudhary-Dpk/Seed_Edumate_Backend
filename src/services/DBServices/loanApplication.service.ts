export const categorizeLoanApplicationByTable = (
  mappedFields: Record<string, any>
) => {
  const categorized: Record<string, Record<string, any>> = {};

  // Main Loan Application Fields
  const mainLoanApplicationFields = [
    "application_date",
    "lead_reference_code",
    "student_id",
    "student_name",
    "student_email",
    "student_phone",
    "application_source",
    "assigned_counselor_id",
    "b2b_partner_id",
    "user_id",
    "contact_id",
    "created_by_id",
    "last_modified_by_id",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
  ];

  // Academic Details Fields
  const academicDetailsFields = [
    "target_course",
    "target_university",
    "target_university_country",
    "course_level",
    "course_start_date",
    "course_end_date",
    "course_duration",
    "admission_status",
    "visa_status",
    "i20_cas_received",
  ];

  // Financial Requirements Fields
  const financialRequirementsFields = [
    "loan_amount_requested",
    "loan_amount_approved",
    "loan_amount_disbursed",
    "tuition_fee",
    "living_expenses",
    "travel_expenses",
    "insurance_cost",
    "other_expenses",
    "total_funding_required",
    "scholarship_amount",
    "self_funding_amount",
  ];

  // Application Status Fields
  const applicationStatusFields = [
    "status",
    "priority_level",
    "application_notes",
    "internal_notes",
    "record_status",
  ];

  // Lender Information Fields
  const lenderInformationFields = [
    "primary_lender_id",
    "primary_lender_name",
    "loan_product_id",
    "loan_product_name",
    "loan_product_type",
    "interest_rate_offered",
    "interest_rate_type",
    "loan_tenure_years",
    "moratorium_period_months",
    "emi_amount",
    "processing_fee",
    "co_signer_required",
    "collateral_required",
    "collateral_type",
    "collateral_value",
    "guarantor_details",
  ];

  // Document Management Fields
  const documentManagementFields = [
    "documents_required_list",
    "documents_submitted_list",
    "documents_pending_list",
  ];

  // Processing Timeline Fields
  const processingTimelineFields = [
    "lender_submission_date",
    "lender_acknowledgment_date",
    "approval_date",
    "sanction_letter_date",
    "disbursement_request_date",
    "disbursement_date",
    "total_processing_days",
    "sla_breach",
    "delay_reason",
  ];

  // Rejection Details Fields
  const rejectionDetailsFields = [
    "rejection_date",
    "rejection_reason",
    "rejection_details",
    "appeal_submitted",
    "appeal_outcome",
    "resolution_provided",
  ];

  // Communication Preferences Fields
  const communicationPreferencesFields = [
    "communication_preference",
    "follow_up_frequency",
    "last_contact_date",
    "next_follow_up_date",
    "customer_satisfaction_rating",
    "customer_feedback",
    "complaint_raised",
    "complaint_details",
    "complaint_resolution_date",
  ];

  // System Tracking Fields
  const systemTrackingFields = [
    "application_source_system",
    "integration_status",
    "audit_trail",
    "hs_object_id",
    "hs_merged_object_ids",
    "hs_object_source_label",
    "application_record_status",
    "external_reference_id",
    "created_by",
    "last_modified_by",
  ];

  // Commission Records Fields
  const commissionRecordsFields = [
    "commission_amount",
    "commission_rate",
    "commission_calculation_base",
    "commission_status",
    "commission_approval_date",
    "commission_payment_date",
    "partner_commission_applicable",
    "settlement_id",
  ];

  // Additional Services Fields
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
