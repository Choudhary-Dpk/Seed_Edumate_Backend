import { enumMappingService } from "../enumMapping";

const parseDate = (
  inputDate?: string | Date | null,
  asDateOnly = false
): string | null => {
  if (!inputDate) return null;
  const dateObj = new Date(inputDate);
  if (isNaN(dateObj.getTime())) return null;
  return asDateOnly
    ? dateObj.toISOString().split("T")[0] // YYYY-MM-DD
    : dateObj.toISOString(); // full ISO-8601
};

// ==================== LOAN APPLICATION MAPPER WITH BATCH ENUM TRANSLATION ====================

export const mapAllLoanApplicationFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // ===== MAIN LOAN APPLICATION FIELDS (Non-Enum) =====

  if (input.source !== undefined)
    mapped.source =
      input.source !== null && input.source !== "" ? input.source : null;

  if (input.hs_contact_id !== undefined)
    mapped.hs_contact_id =
      input.hs_contact_id !== null && input.hs_contact_id !== ""
        ? input.hs_contact_id
        : null;

  if (input.hs_b2b_partner_id !== undefined)
    mapped.hs_b2b_partner_id =
      input.hs_b2b_partner_id !== null && input.hs_b2b_partner_id !== ""
        ? input.hs_b2b_partner_id
        : null;

  if (input.hs_lender_id !== undefined)
    mapped.hs_lender_id =
      input.hs_lender_id !== null && input.hs_lender_id !== ""
        ? input.hs_lender_id
        : null;

  if (input.hs_product_id !== undefined)
    mapped.hs_product_id =
      input.hs_product_id !== null && input.hs_product_id !== ""
        ? input.hs_product_id
        : null;

  if (input.assigned_counselor !== undefined)
    mapped.assigned_counselor =
      input.assigned_counselor !== null && input.assigned_counselor !== ""
        ? input.assigned_counselor
        : null;

  if (input.lender_id !== undefined)
    mapped.lender_id =
      input.lender_id !== null && input.lender_id !== ""
        ? input.lender_id
        : null;

  // MISSING: product_id
  if (input.product_id !== undefined)
    mapped.product_id =
      input.product_id !== null && input.product_id !== ""
        ? input.product_id
        : null;

  if (input.application_date !== undefined)
    mapped.application_date =
      input.application_date !== null && input.application_date !== ""
        ? parseDate(input.application_date, false)
        : null;

  if (input.lead_reference_code !== undefined)
    mapped.lead_reference_code =
      input.lead_reference_code !== null && input.lead_reference_code !== ""
        ? input.lead_reference_code
        : null;

  if (input.student_id !== undefined)
    mapped.student_id =
      input.student_id !== null && input.student_id !== ""
        ? input.student_id
        : null;

  if (input.student_name !== undefined)
    mapped.student_name =
      input.student_name !== null && input.student_name !== ""
        ? input.student_name
        : null;

  if (input.student_email !== undefined)
    mapped.student_email =
      input.student_email !== null && input.student_email !== ""
        ? input.student_email
        : null;

  if (input.student_phone !== undefined)
    mapped.student_phone =
      input.student_phone !== null && input.student_phone !== ""
        ? input.student_phone
        : null;

  if (input.assigned_counselor_id !== undefined)
    mapped.assigned_counselor_id =
      input.assigned_counselor_id !== null && input.assigned_counselor_id !== ""
        ? input.assigned_counselor_id
        : null;

  if (input.b2b_partner_id !== undefined)
    mapped.b2b_partner_id =
      input.b2b_partner_id !== null && input.b2b_partner_id !== ""
        ? input.b2b_partner_id
        : null;

  if (input.user_id !== undefined)
    mapped.user_id =
      input.user_id !== null && input.user_id !== "" ? input.user_id : null;

  if (input.contact_id !== undefined)
    mapped.contact_id =
      input.contact_id !== null && input.contact_id !== ""
        ? input.contact_id
        : null;

  if (input.created_by_id !== undefined)
    mapped.created_by_id =
      input.created_by_id !== null && input.created_by_id !== ""
        ? input.created_by_id
        : null;

  if (input.b2b_partner_id !== undefined)
    mapped.b2b_partner_id =
      input.b2b_partner_id !== null && input.b2b_partner_id !== ""
        ? input.b2b_partner_id
        : null;

  if (input.deleted_by_id !== undefined)
    mapped.deleted_by_id =
      input.deleted_by_id !== null && input.deleted_by_id !== ""
        ? input.deleted_by_id
        : null;

  if (input.last_modified_by_id !== undefined)
    mapped.last_modified_by_id =
      input.last_modified_by_id !== null && input.last_modified_by_id !== ""
        ? input.last_modified_by_id
        : null;

  // HubSpot System Fields
  if (input.hs_created_by_user_id !== undefined)
    mapped.hs_created_by_user_id =
      input.hs_created_by_user_id !== null && input.hs_created_by_user_id !== ""
        ? input.hs_created_by_user_id
        : null;

  if (input.hs_createdate !== undefined)
    mapped.hs_createdate =
      input.hs_createdate !== null && input.hs_createdate !== ""
        ? parseDate(input.hs_createdate)
        : null;

  if (input.hs_lastmodifieddate !== undefined)
    mapped.hs_lastmodifieddate =
      input.hs_lastmodifieddate !== null && input.hs_lastmodifieddate !== ""
        ? parseDate(input.hs_lastmodifieddate)
        : null;

  if (input.hs_object_id !== undefined)
    mapped.hs_object_id =
      input.hs_object_id !== null && input.hs_object_id !== ""
        ? input.hs_object_id
        : null;

  if (input.hs_object_source_detail_1 !== undefined)
    mapped.hs_object_source_detail_1 =
      input.hs_object_source_detail_1 !== null &&
      input.hs_object_source_detail_1 !== ""
        ? input.hs_object_source_detail_1
        : null;

  if (input.hs_object_source_detail_2 !== undefined)
    mapped.hs_object_source_detail_2 =
      input.hs_object_source_detail_2 !== null &&
      input.hs_object_source_detail_2 !== ""
        ? input.hs_object_source_detail_2
        : null;

  if (input.hs_object_source_detail_3 !== undefined)
    mapped.hs_object_source_detail_3 =
      input.hs_object_source_detail_3 !== null &&
      input.hs_object_source_detail_3 !== ""
        ? input.hs_object_source_detail_3
        : null;

  if (input.hs_shared_team_ids !== undefined)
    mapped.hs_shared_team_ids =
      input.hs_shared_team_ids !== null && input.hs_shared_team_ids !== ""
        ? input.hs_shared_team_ids
        : null;

  if (input.hs_shared_user_ids !== undefined)
    mapped.hs_shared_user_ids =
      input.hs_shared_user_ids !== null && input.hs_shared_user_ids !== ""
        ? input.hs_shared_user_ids
        : null;

  if (input.hubspot_owner_assigneddate !== undefined)
    mapped.hubspot_owner_assigneddate =
      input.hubspot_owner_assigneddate !== null &&
      input.hubspot_owner_assigneddate !== ""
        ? parseDate(input.hubspot_owner_assigneddate)
        : null;

  if (input.hubspot_team_id !== undefined)
    mapped.hubspot_team_id =
      input.hubspot_team_id !== null && input.hubspot_team_id !== ""
        ? input.hubspot_team_id
        : null;

  if (input.hs_updated_by_user_id !== undefined)
    mapped.hs_updated_by_user_id =
      input.hs_updated_by_user_id !== null && input.hs_updated_by_user_id !== ""
        ? input.hs_updated_by_user_id
        : null;

  if (input.hubspot_owner_id !== undefined)
    mapped.hubspot_owner_id =
      input.hubspot_owner_id !== null && input.hubspot_owner_id !== ""
        ? input.hubspot_owner_id
        : null;

  if (input.hs_merged_object_ids !== undefined)
    mapped.hs_merged_object_ids =
      input.hs_merged_object_ids !== null && input.hs_merged_object_ids !== ""
        ? input.hs_merged_object_ids
        : null;

  if (input.hs_object_source_label !== undefined)
    mapped.hs_object_source_label =
      input.hs_object_source_label !== null &&
      input.hs_object_source_label !== ""
        ? input.hs_object_source_label
        : null;

  if (input.is_active !== undefined)
    mapped.is_active =
      input.is_active !== null && input.is_active !== ""
        ? input.is_active
        : null;

  if (input.is_deleted !== undefined)
    mapped.is_deleted =
      input.is_deleted !== null && input.is_deleted !== ""
        ? input.is_deleted
        : null;

  if (input.commission_type !== undefined)
    mapped.commission_type =
      input.commission_type !== null && input.commission_type !== ""
        ? input.commission_type
        : null;

  if (input.updated_by !== undefined)
    mapped.updated_by =
      input.updated_by !== null && input.updated_by !== ""
        ? input.updated_by
        : null;

  if (input.deleted_by !== undefined)
    mapped.deleted_by =
      input.deleted_by !== null && input.deleted_by !== ""
        ? input.deleted_by
        : null;

  if (input.deleted_on !== undefined)
    mapped.deleted_on =
      input.deleted_on !== null && input.deleted_on !== ""
        ? parseDate(input.deleted_on)
        : null;

  // ===== ACADEMIC DETAILS FIELDS (Non-Enum) =====

  if (input.target_course !== undefined)
    mapped.target_course =
      input.target_course !== null && input.target_course !== ""
        ? input.target_course
        : null;

  if (input.target_university !== undefined)
    mapped.target_university =
      input.target_university !== null && input.target_university !== ""
        ? input.target_university
        : null;

  if (input.target_university_country !== undefined)
    mapped.target_university_country =
      input.target_university_country !== null &&
      input.target_university_country !== ""
        ? input.target_university_country
        : null;

  if (input.course_start_date !== undefined)
    mapped.course_start_date =
      input.course_start_date !== null && input.course_start_date !== ""
        ? parseDate(input.course_start_date, false)
        : null;

  if (input.course_end_date !== undefined)
    mapped.course_end_date =
      input.course_end_date !== null && input.course_end_date !== ""
        ? parseDate(input.course_end_date, false)
        : null;

  if (input.course_duration !== undefined)
    mapped.course_duration =
      input.course_duration !== null && input.course_duration !== ""
        ? input.course_duration
        : null;

  // ===== FINANCIAL REQUIREMENTS FIELDS =====

  if (input.loan_amount_requested !== undefined)
    mapped.loan_amount_requested =
      input.loan_amount_requested !== null && input.loan_amount_requested !== ""
        ? input.loan_amount_requested
        : null;

  if (input.loan_amount_approved !== undefined)
    mapped.loan_amount_approved =
      input.loan_amount_approved !== null && input.loan_amount_approved !== ""
        ? input.loan_amount_approved
        : null;

  if (input.loan_amount_disbursed !== undefined)
    mapped.loan_amount_disbursed =
      input.loan_amount_disbursed !== null && input.loan_amount_disbursed !== ""
        ? input.loan_amount_disbursed
        : null;
  
    if (input.last_loan_amount_disbursed !== undefined)
    mapped.last_loan_amount_disbursed =
      input.last_loan_amount_disbursed !== null && input.last_loan_amount_disbursed !== ""
        ? input.last_loan_amount_disbursed
        : null;

  if (input.tuition_fee !== undefined)
    mapped.tuition_fee =
      input.tuition_fee !== null && input.tuition_fee !== ""
        ? input.tuition_fee
        : null;

  if (input.living_expenses !== undefined)
    mapped.living_expenses =
      input.living_expenses !== null && input.living_expenses !== ""
        ? input.living_expenses
        : null;

  if (input.travel_expenses !== undefined)
    mapped.travel_expenses =
      input.travel_expenses !== null && input.travel_expenses !== ""
        ? input.travel_expenses
        : null;

  if (input.insurance_cost !== undefined)
    mapped.insurance_cost =
      input.insurance_cost !== null && input.insurance_cost !== ""
        ? input.insurance_cost
        : null;

  if (input.other_expenses !== undefined)
    mapped.other_expenses =
      input.other_expenses !== null && input.other_expenses !== ""
        ? input.other_expenses
        : null;

  if (input.total_funding_required !== undefined)
    mapped.total_funding_required =
      input.total_funding_required !== null &&
      input.total_funding_required !== ""
        ? input.total_funding_required
        : null;

  if (input.scholarship_amount !== undefined)
    mapped.scholarship_amount =
      input.scholarship_amount !== null && input.scholarship_amount !== ""
        ? input.scholarship_amount
        : null;

  if (input.self_funding_amount !== undefined)
    mapped.self_funding_amount =
      input.self_funding_amount !== null && input.self_funding_amount !== ""
        ? input.self_funding_amount
        : null;

  // ===== APPLICATION STATUS FIELDS (Non-Enum) =====

  if (input.application_notes !== undefined)
    mapped.application_notes =
      input.application_notes !== null && input.application_notes !== ""
        ? input.application_notes
        : null;

  if (input.internal_notes !== undefined)
    mapped.internal_notes =
      input.internal_notes !== null && input.internal_notes !== ""
        ? input.internal_notes
        : null;

  // ===== LENDER INFORMATION FIELDS (Non-Enum) =====

  if (input.primary_lender_id !== undefined)
    mapped.primary_lender_id =
      input.primary_lender_id !== null && input.primary_lender_id !== ""
        ? input.primary_lender_id
        : null;

  if (input.primary_lender_name !== undefined)
    mapped.primary_lender_name =
      input.primary_lender_name !== null && input.primary_lender_name !== ""
        ? input.primary_lender_name
        : null;

  if (input.loan_product_id !== undefined)
    mapped.loan_product_id =
      input.loan_product_id !== null && input.loan_product_id !== ""
        ? input.loan_product_id
        : null;

  if (input.loan_product_name !== undefined)
    mapped.loan_product_name =
      input.loan_product_name !== null && input.loan_product_name !== ""
        ? input.loan_product_name
        : null;

  if (input.interest_rate_offered !== undefined)
    mapped.interest_rate_offered =
      input.interest_rate_offered !== null && input.interest_rate_offered !== ""
        ? input.interest_rate_offered
        : null;

  if (input.loan_tenure_years !== undefined)
    mapped.loan_tenure_years =
      input.loan_tenure_years !== null && input.loan_tenure_years !== ""
        ? input.loan_tenure_years
        : null;

  if (input.moratorium_period_months !== undefined)
    mapped.moratorium_period_months =
      input.moratorium_period_months !== null &&
      input.moratorium_period_months !== ""
        ? input.moratorium_period_months
        : null;

  if (input.emi_amount !== undefined)
    mapped.emi_amount =
      input.emi_amount !== null && input.emi_amount !== ""
        ? input.emi_amount
        : null;

  if (input.processing_fee !== undefined)
    mapped.processing_fee =
      input.processing_fee !== null && input.processing_fee !== ""
        ? input.processing_fee
        : null;

  if (input.collateral_type !== undefined)
    mapped.collateral_type =
      input.collateral_type !== null && input.collateral_type !== ""
        ? input.collateral_type
        : null;

  if (input.collateral_value !== undefined)
    mapped.collateral_value =
      input.collateral_value !== null && input.collateral_value !== ""
        ? input.collateral_value
        : null;

  if (input.guarantor_details !== undefined)
    mapped.guarantor_details =
      input.guarantor_details !== null && input.guarantor_details !== ""
        ? input.guarantor_details
        : null;

  // ===== DOCUMENT MANAGEMENT FIELDS =====

  if (input.documents_required_list !== undefined)
    mapped.documents_required_list =
      input.documents_required_list !== null &&
      input.documents_required_list !== ""
        ? input.documents_required_list
        : null;

  if (input.documents_submitted_list !== undefined)
    mapped.documents_submitted_list =
      input.documents_submitted_list !== null &&
      input.documents_submitted_list !== ""
        ? input.documents_submitted_list
        : null;

  if (input.documents_pending_list !== undefined)
    mapped.documents_pending_list =
      input.documents_pending_list !== null &&
      input.documents_pending_list !== ""
        ? input.documents_pending_list
        : null;

  // ===== PROCESSING TIMELINE FIELDS (Non-Enum) =====

  if (input.lender_submission_date !== undefined)
    mapped.lender_submission_date =
      input.lender_submission_date !== null &&
      input.lender_submission_date !== ""
        ? parseDate(input.lender_submission_date, false)
        : null;

  if (input.lender_acknowledgment_date !== undefined)
    mapped.lender_acknowledgment_date =
      input.lender_acknowledgment_date !== null &&
      input.lender_acknowledgment_date !== ""
        ? parseDate(input.lender_acknowledgment_date, false)
        : null;

  if (input.approval_date !== undefined)
    mapped.approval_date =
      input.approval_date !== null && input.approval_date !== ""
        ? parseDate(input.approval_date, false)
        : null;

  if (input.sanction_letter_date !== undefined)
    mapped.sanction_letter_date =
      input.sanction_letter_date !== null && input.sanction_letter_date !== ""
        ? parseDate(input.sanction_letter_date, false)
        : null;

  if (input.disbursement_request_date !== undefined)
    mapped.disbursement_request_date =
      input.disbursement_request_date !== null &&
      input.disbursement_request_date !== ""
        ? parseDate(input.disbursement_request_date, false)
        : null;

  if (input.disbursement_date !== undefined)
    mapped.disbursement_date =
      input.disbursement_date !== null && input.disbursement_date !== ""
        ? parseDate(input.disbursement_date, false)
        : null;

  if (input.total_processing_days !== undefined)
    mapped.total_processing_days =
      input.total_processing_days !== null && input.total_processing_days !== ""
        ? input.total_processing_days
        : null;

  // ===== REJECTION DETAILS FIELDS (Non-Enum) =====

  if (input.rejection_date !== undefined)
    mapped.rejection_date =
      input.rejection_date !== null && input.rejection_date !== ""
        ? parseDate(input.rejection_date, false)
        : null;

  if (input.rejection_details !== undefined)
    mapped.rejection_details =
      input.rejection_details !== null && input.rejection_details !== ""
        ? input.rejection_details
        : null;

  if (input.resolution_provided !== undefined)
    mapped.resolution_provided =
      input.resolution_provided !== null && input.resolution_provided !== ""
        ? input.resolution_provided
        : null;

  // ===== COMMUNICATION PREFERENCES FIELDS (Non-Enum) =====

  if (input.last_contact_date !== undefined)
    mapped.last_contact_date =
      input.last_contact_date !== null && input.last_contact_date !== ""
        ? parseDate(input.last_contact_date, false)
        : null;

  if (input.next_follow_up_date !== undefined)
    mapped.next_follow_up_date =
      input.next_follow_up_date !== null && input.next_follow_up_date !== ""
        ? parseDate(input.next_follow_up_date, false)
        : null;

  if (input.customer_satisfaction_rating !== undefined)
    mapped.customer_satisfaction_rating =
      input.customer_satisfaction_rating !== null &&
      input.customer_satisfaction_rating !== ""
        ? input.customer_satisfaction_rating
        : null;

  if (input.customer_feedback !== undefined)
    mapped.customer_feedback =
      input.customer_feedback !== null && input.customer_feedback !== ""
        ? input.customer_feedback
        : null;

  if (input.complaint_details !== undefined)
    mapped.complaint_details =
      input.complaint_details !== null && input.complaint_details !== ""
        ? input.complaint_details
        : null;

  if (input.complaint_resolution_date !== undefined)
    mapped.complaint_resolution_date =
      input.complaint_resolution_date !== null &&
      input.complaint_resolution_date !== ""
        ? parseDate(input.complaint_resolution_date, false)
        : null;

  // ===== SYSTEM TRACKING FIELDS (Non-Enum) =====

  if (input.audit_trail !== undefined)
    mapped.audit_trail =
      input.audit_trail !== null && input.audit_trail !== ""
        ? input.audit_trail
        : null;

  if (input.external_reference_id !== undefined)
    mapped.external_reference_id =
      input.external_reference_id !== null && input.external_reference_id !== ""
        ? input.external_reference_id
        : null;

  if (input.created_by !== undefined)
    mapped.created_by =
      input.created_by !== null && input.created_by !== ""
        ? input.created_by
        : null;

  if (input.last_modified_by !== undefined)
    mapped.last_modified_by =
      input.last_modified_by !== null && input.last_modified_by !== ""
        ? input.last_modified_by
        : null;

  // ===== COMMISSION RECORDS FIELDS (Non-Enum) =====

  if (input.commission_amount !== undefined)
    mapped.commission_amount =
      input.commission_amount !== null && input.commission_amount !== ""
        ? input.commission_amount
        : null;

  if (input.commission_model !== undefined)
    mapped.commission_model =
      input.commission_model !== null && input.commission_model !== ""
        ? input.commission_model
        : null;

  if (input.commission_rate !== undefined)
    mapped.commission_rate =
      input.commission_rate !== null && input.commission_rate !== ""
        ? input.commission_rate
        : null;

  if (input.tds_applicable !== undefined)
    mapped.tds_applicable =
      input.tds_applicable !== null && input.tds_applicable !== ""
        ? input.tds_applicable
        : null;

  if (input.gst_applicable !== undefined)
    mapped.gst_applicable =
      input.gst_applicable !== null && input.gst_applicable !== ""
        ? input.gst_applicable
        : null;

  if (input.gst_rate !== undefined)
    mapped.gst_rate =
      input.gst_rate !== null && input.gst_rate !== "" ? input.gst_rate : null;

  if (input.tds_rate !== undefined)
    mapped.tds_rate =
      input.tds_rate !== null && input.tds_rate !== "" ? input.tds_rate : null;

  if (input.commission_rate !== undefined)
    mapped.commission_rate =
      input.commission_rate !== null && input.commission_rate !== ""
        ? input.commission_rate
        : null;

  if (input.commission_approval_date !== undefined)
    mapped.commission_approval_date =
      input.commission_approval_date !== null &&
      input.commission_approval_date !== ""
        ? parseDate(input.commission_approval_date, false)
        : null;

  if (input.commission_payment_date !== undefined)
    mapped.commission_payment_date =
      input.commission_payment_date !== null &&
      input.commission_payment_date !== ""
        ? parseDate(input.commission_payment_date, false)
        : null;

  if (input.settlement_id !== undefined)
    mapped.settlement_id =
      input.settlement_id !== null && input.settlement_id !== ""
        ? input.settlement_id
        : null;

  // ===== ADDITIONAL SERVICES FIELDS =====

  if (input.additional_services_notes !== undefined)
    mapped.additional_services_notes =
      input.additional_services_notes !== null &&
      input.additional_services_notes !== ""
        ? input.additional_services_notes
        : null;

  // ===== ENUM TRANSLATIONS COLLECTION =====
  const enumTranslations = [];

  // 1. Application Source (Loan Applications Information)
  if (
    input.application_source !== undefined &&
    input.application_source !== null &&
    input.application_source !== ""
  ) {
    enumTranslations.push({
      field: "application_source",
      enumName: "loanAppApplicationSource",
      sourceValue: input.application_source,
    });
  }

  // 2. Course Level (Academic Details)
  if (
    input.course_level !== undefined &&
    input.course_level !== null &&
    input.course_level !== ""
  ) {
    enumTranslations.push({
      field: "course_level",
      enumName: "courseLevel",
      sourceValue: input.course_level,
    });
  }

  // 3. Admission Status (Academic Details)
  if (
    input.admission_status !== undefined &&
    input.admission_status !== null &&
    input.admission_status !== ""
  ) {
    enumTranslations.push({
      field: "admission_status",
      enumName: "loanAppAdmissionStatus",
      sourceValue: input.admission_status,
    });
  }

  // 4. Visa Status (Academic Details)
  if (
    input.visa_status !== undefined &&
    input.visa_status !== null &&
    input.visa_status !== ""
  ) {
    enumTranslations.push({
      field: "visa_status",
      enumName: "visaStatus",
      sourceValue: input.visa_status,
    });
  }

  // 5. I20 CAS Received (Academic Details)
  if (
    input.i20_cas_received !== undefined &&
    input.i20_cas_received !== null &&
    input.i20_cas_received !== ""
  ) {
    enumTranslations.push({
      field: "i20_cas_received",
      enumName: "i20CasReceived",
      sourceValue: input.i20_cas_received,
    });
  }

  // 6. Application Status (status field - Application Status)
  if (
    input.application_status !== undefined &&
    input.application_status !== null &&
    input.application_status !== ""
  ) {
    enumTranslations.push({
      field: "application_status",
      enumName: "applicationStatus",
      sourceValue: input.application_status,
    });
  }

  // 7. Priority Level (Application Status)
  if (
    input.priority_level !== undefined &&
    input.priority_level !== null &&
    input.priority_level !== ""
  ) {
    enumTranslations.push({
      field: "priority_level",
      enumName: "loanAppPriorityLevel",
      sourceValue: input.priority_level,
    });
  }

  // 8. Record Status (Application Status) - mapped from application_record_status
  if (
    input.application_record_status !== undefined &&
    input.application_record_status !== null &&
    input.application_record_status !== ""
  ) {
    enumTranslations.push({
      field: "application_record_status",
      enumName: "applicationRecordStatus",
      sourceValue: input.application_record_status,
    });
  }

  // 9. Loan Product Type (Lender Information)
  if (
    input.loan_product_type !== undefined &&
    input.loan_product_type !== null &&
    input.loan_product_type !== ""
  ) {
    enumTranslations.push({
      field: "loan_product_type",
      enumName: "loanProductType",
      sourceValue: input.loan_product_type,
    });
  }

  // 10. Interest Rate Type (Lender Information)
  if (
    input.interest_rate_type !== undefined &&
    input.interest_rate_type !== null &&
    input.interest_rate_type !== ""
  ) {
    enumTranslations.push({
      field: "interest_rate_type",
      enumName: "interestRateType",
      sourceValue: input.interest_rate_type,
    });
  }

  // 11. Co-signer Required (Lender Information)
  if (
    input.co_signer_required !== undefined &&
    input.co_signer_required !== null &&
    input.co_signer_required !== ""
  ) {
    enumTranslations.push({
      field: "co_signer_required",
      enumName: "coSignerRequired",
      sourceValue: input.co_signer_required,
    });
  }

  // 12. Collateral Required (Lender Information)
  if (
    input.collateral_required !== undefined &&
    input.collateral_required !== null &&
    input.collateral_required !== ""
  ) {
    enumTranslations.push({
      field: "collateral_required",
      enumName: "collateralRequired",
      sourceValue: input.collateral_required,
    });
  }

  // 13. SLA Breach (Processing Timeline)
  if (
    input.sla_breach !== undefined &&
    input.sla_breach !== null &&
    input.sla_breach !== ""
  ) {
    enumTranslations.push({
      field: "sla_breach",
      enumName: "slaBreach",
      sourceValue: input.sla_breach,
    });
  }

  // 14. Delay Reason (Processing Timeline)
  if (
    input.delay_reason !== undefined &&
    input.delay_reason !== null &&
    input.delay_reason !== ""
  ) {
    enumTranslations.push({
      field: "delay_reason",
      enumName: "delayReason",
      sourceValue: input.delay_reason,
    });
  }

  // 15. Rejection Reason (Rejection & Issues)
  if (
    input.rejection_reason !== undefined &&
    input.rejection_reason !== null &&
    input.rejection_reason !== ""
  ) {
    enumTranslations.push({
      field: "rejection_reason",
      enumName: "rejectionReason",
      sourceValue: input.rejection_reason,
    });
  }

  // 16. Appeal Submitted (Rejection & Issues)
  if (
    input.appeal_submitted !== undefined &&
    input.appeal_submitted !== null &&
    input.appeal_submitted !== ""
  ) {
    enumTranslations.push({
      field: "appeal_submitted",
      enumName: "appealSubmitted",
      sourceValue: input.appeal_submitted,
    });
  }

  // 17. Appeal Outcome (Rejection & Issues)
  if (
    input.appeal_outcome !== undefined &&
    input.appeal_outcome !== null &&
    input.appeal_outcome !== ""
  ) {
    enumTranslations.push({
      field: "appeal_outcome",
      enumName: "appealOutcome",
      sourceValue: input.appeal_outcome,
    });
  }

  // 18. Communication Preference (Communication)
  if (
    input.communication_preference !== undefined &&
    input.communication_preference !== null &&
    input.communication_preference !== ""
  ) {
    enumTranslations.push({
      field: "communication_preference",
      enumName: "communicationPreference",
      sourceValue: input.communication_preference,
    });
  }

  // 19. Follow Up Frequency (Communication)
  if (
    input.follow_up_frequency !== undefined &&
    input.follow_up_frequency !== null &&
    input.follow_up_frequency !== ""
  ) {
    enumTranslations.push({
      field: "follow_up_frequency",
      enumName: "followUpFrequency",
      sourceValue: input.follow_up_frequency,
    });
  }

  // 20. Complaint Raised (Communication)
  if (
    input.complaint_raised !== undefined &&
    input.complaint_raised !== null &&
    input.complaint_raised !== ""
  ) {
    enumTranslations.push({
      field: "complaint_raised",
      enumName: "complaintRaised",
      sourceValue: input.complaint_raised,
    });
  }

  // 21. Application Source System (System Tracking)
  if (
    input.application_source_system !== undefined &&
    input.application_source_system !== null &&
    input.application_source_system !== ""
  ) {
    enumTranslations.push({
      field: "application_source_system",
      enumName: "applicationSourceSystem",
      sourceValue: input.application_source_system,
    });
  }

  // 22. Integration Status (System Tracking)
  if (
    input.integration_status !== undefined &&
    input.integration_status !== null &&
    input.integration_status !== ""
  ) {
    enumTranslations.push({
      field: "integration_status",
      enumName: "loanAppIntegrationStatus",
      sourceValue: input.integration_status,
    });
  }

  // 23. Application Record Status (System Tracking)
  if (
    input.application_record_status !== undefined &&
    input.application_record_status !== null &&
    input.application_record_status !== ""
  ) {
    enumTranslations.push({
      field: "application_record_status",
      enumName: "applicationRecordStatus",
      sourceValue: input.application_record_status,
    });
  }

  // 24. Commission Calculation Base (Commission)
  if (
    input.commission_calculation_base !== undefined &&
    input.commission_calculation_base !== null &&
    input.commission_calculation_base !== ""
  ) {
    enumTranslations.push({
      field: "commission_calculation_base",
      enumName: "commissionCalculationBase",
      sourceValue: input.commission_calculation_base,
    });
  }

  // 25. Commission Status (Commission)
  if (
    input.commission_status !== undefined &&
    input.commission_status !== null &&
    input.commission_status !== ""
  ) {
    enumTranslations.push({
      field: "commission_status",
      enumName: "commissionStatus",
      sourceValue: input.commission_status,
    });
  }

  // 26. Partner Commission Applicable (Commission)
  if (
    input.partner_commission_applicable !== undefined &&
    input.partner_commission_applicable !== null &&
    input.partner_commission_applicable !== ""
  ) {
    enumTranslations.push({
      field: "partner_commission_applicable",
      enumName: "loanAppPartnerCommissionApplicable",
      sourceValue: input.partner_commission_applicable,
    });
  }

  // ===== TRANSLATE ALL ENUMS IN ONE BATCH DATABASE QUERY =====
  if (enumTranslations.length > 0) {
    const translated = await enumMappingService.translateBatch(
      enumTranslations.map((t) => ({
        enumName: t.enumName,
        sourceValue: t.sourceValue,
      }))
    );

    // Map translated values back to fields
    for (const translation of enumTranslations) {
      const key = `${translation.enumName}:${translation.sourceValue}`;
      mapped[translation.field] = translated[key];
    }
  }

  return mapped;
};
