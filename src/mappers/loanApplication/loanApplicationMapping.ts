import {
  applicationSourceMap,
  visaStatusMap,
  i20CasStatusMap,
  applicationStatusEnumMap,
  recordStatusMap,
  loanProductTypeMap,
  interestRateTypeMap,
  delayReasonMap,
  rejectionReasonMap,
  appealOutcomeMap,
  communicationChannelMap,
  followUpFrequencyMap,
  applicationSourceSystemMap,
  integrationStatusMap,
  commissionBaseMap,
  commissionStatusMap,
  courseLevelMap,
  admissionStatusMap,
  priorityLevelMap,
} from "../../types/loanApplication.types";

export const mapAllLoanApplicationFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // ===== MAIN LOAN APPLICATION FIELDS =====
  if (input.application_date !== undefined)
    mapped.application_date =
      input.application_date !== null && input.application_date !== ""
        ? input.application_date
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
  if (input.application_source !== undefined)
    mapped.application_source =
      input.application_source !== null && input.application_source !== ""
        ? applicationSourceMap[input.application_source] || null
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
  if (input.last_modified_by_id !== undefined)
    mapped.last_modified_by_id =
      input.last_modified_by_id !== null && input.last_modified_by_id !== ""
        ? input.last_modified_by_id
        : null;
  if (input.hs_created_by_user_id !== undefined)
    mapped.hs_created_by_user_id =
      input.hs_created_by_user_id !== null && input.hs_created_by_user_id !== ""
        ? input.hs_created_by_user_id
        : null;
  if (input.hs_createdate !== undefined)
    mapped.hs_createdate =
      input.hs_createdate !== null && input.hs_createdate !== ""
        ? input.hs_createdate
        : null;
  if (input.hs_lastmodifieddate !== undefined)
    mapped.hs_lastmodifieddate =
      input.hs_lastmodifieddate !== null && input.hs_lastmodifieddate !== ""
        ? input.hs_lastmodifieddate
        : null;
  if (input.hs_object_id !== undefined)
    mapped.hs_object_id =
      input.hs_object_id !== null && input.hs_object_id !== ""
        ? input.hs_object_id
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

  // ===== ACADEMIC DETAILS FIELDS =====
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
  if (input.course_level !== undefined)
    mapped.course_level =
      input.course_level !== null && input.course_level !== ""
        ? courseLevelMap[input.course_level] || null
        : null;
  if (input.course_start_date !== undefined)
    mapped.course_start_date =
      input.course_start_date !== null && input.course_start_date !== ""
        ? input.course_start_date
        : null;
  if (input.course_end_date !== undefined)
    mapped.course_end_date =
      input.course_end_date !== null && input.course_end_date !== ""
        ? input.course_end_date
        : null;
  if (input.course_duration !== undefined)
    mapped.course_duration =
      input.course_duration !== null && input.course_duration !== ""
        ? input.course_duration
        : null;
  if (input.admission_status !== undefined)
    mapped.admission_status =
      input.admission_status !== null && input.admission_status !== ""
        ? admissionStatusMap[input.admission_status] || null
        : null;
  if (input.visa_status !== undefined)
    mapped.visa_status =
      input.visa_status !== null && input.visa_status !== ""
        ? visaStatusMap[input.visa_status] || null
        : null;
  if (input.i20_cas_received !== undefined)
    mapped.i20_cas_received =
      input.i20_cas_received !== null && input.i20_cas_received !== ""
        ? i20CasStatusMap[input.i20_cas_received] || null
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

  // ===== APPLICATION STATUS FIELDS =====
  if (input.status !== undefined)
    mapped.status =
      input.status !== null && input.status !== ""
        ? applicationStatusEnumMap[input.status] || null
        : null;
  if (input.priority_level !== undefined)
    mapped.priority_level =
      input.priority_level !== null && input.priority_level !== ""
        ? priorityLevelMap[input.priority_level] || null
        : null;
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
  if (input.record_status !== undefined)
    mapped.record_status =
      input.record_status !== null && input.record_status !== ""
        ? recordStatusMap[input.record_status] || null
        : null;

  // ===== LENDER INFORMATION FIELDS =====
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
  if (input.loan_product_type !== undefined)
    mapped.loan_product_type =
      input.loan_product_type !== null && input.loan_product_type !== ""
        ? loanProductTypeMap[input.loan_product_type] || null
        : null;
  if (input.interest_rate_offered !== undefined)
    mapped.interest_rate_offered =
      input.interest_rate_offered !== null && input.interest_rate_offered !== ""
        ? input.interest_rate_offered
        : null;
  if (input.interest_rate_type !== undefined)
    mapped.interest_rate_type =
      input.interest_rate_type !== null && input.interest_rate_type !== ""
        ? interestRateTypeMap[input.interest_rate_type] || null
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
  if (input.co_signer_required !== undefined)
    mapped.co_signer_required =
      input.co_signer_required !== null && input.co_signer_required !== ""
        ? input.co_signer_required
        : null;
  if (input.collateral_required !== undefined)
    mapped.collateral_required =
      input.collateral_required !== null && input.collateral_required !== ""
        ? input.collateral_required
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

  // ===== PROCESSING TIMELINE FIELDS =====
  if (input.lender_submission_date !== undefined)
    mapped.lender_submission_date =
      input.lender_submission_date !== null &&
      input.lender_submission_date !== ""
        ? input.lender_submission_date
        : null;
  if (input.lender_acknowledgment_date !== undefined)
    mapped.lender_acknowledgment_date =
      input.lender_acknowledgment_date !== null &&
      input.lender_acknowledgment_date !== ""
        ? input.lender_acknowledgment_date
        : null;
  if (input.approval_date !== undefined)
    mapped.approval_date =
      input.approval_date !== null && input.approval_date !== ""
        ? input.approval_date
        : null;
  if (input.sanction_letter_date !== undefined)
    mapped.sanction_letter_date =
      input.sanction_letter_date !== null && input.sanction_letter_date !== ""
        ? input.sanction_letter_date
        : null;
  if (input.disbursement_request_date !== undefined)
    mapped.disbursement_request_date =
      input.disbursement_request_date !== null &&
      input.disbursement_request_date !== ""
        ? input.disbursement_request_date
        : null;
  if (input.disbursement_date !== undefined)
    mapped.disbursement_date =
      input.disbursement_date !== null && input.disbursement_date !== ""
        ? input.disbursement_date
        : null;
  if (input.total_processing_days !== undefined)
    mapped.total_processing_days =
      input.total_processing_days !== null && input.total_processing_days !== ""
        ? input.total_processing_days
        : null;
  if (input.sla_breach !== undefined)
    mapped.sla_breach =
      input.sla_breach !== null && input.sla_breach !== ""
        ? input.sla_breach
        : null;
  if (input.delay_reason !== undefined)
    mapped.delay_reason =
      input.delay_reason !== null && input.delay_reason !== ""
        ? delayReasonMap[input.delay_reason] || null
        : null;

  // ===== REJECTION DETAILS FIELDS =====
  if (input.rejection_date !== undefined)
    mapped.rejection_date =
      input.rejection_date !== null && input.rejection_date !== ""
        ? input.rejection_date
        : null;
  if (input.rejection_reason !== undefined)
    mapped.rejection_reason =
      input.rejection_reason !== null && input.rejection_reason !== ""
        ? rejectionReasonMap[input.rejection_reason] || null
        : null;
  if (input.rejection_details !== undefined)
    mapped.rejection_details =
      input.rejection_details !== null && input.rejection_details !== ""
        ? input.rejection_details
        : null;
  if (input.appeal_submitted !== undefined)
    mapped.appeal_submitted =
      input.appeal_submitted !== null && input.appeal_submitted !== ""
        ? input.appeal_submitted
        : null;
  if (input.appeal_outcome !== undefined)
    mapped.appeal_outcome =
      input.appeal_outcome !== null && input.appeal_outcome !== ""
        ? appealOutcomeMap[input.appeal_outcome] || null
        : null;
  if (input.resolution_provided !== undefined)
    mapped.resolution_provided =
      input.resolution_provided !== null && input.resolution_provided !== ""
        ? input.resolution_provided
        : null;

  // ===== COMMUNICATION PREFERENCES FIELDS =====
  if (input.communication_preference !== undefined)
    mapped.communication_preference =
      input.communication_preference !== null &&
      input.communication_preference !== ""
        ? communicationChannelMap[input.communication_preference] || null
        : null;
  if (input.follow_up_frequency !== undefined)
    mapped.follow_up_frequency =
      input.follow_up_frequency !== null && input.follow_up_frequency !== ""
        ? followUpFrequencyMap[input.follow_up_frequency] || null
        : null;
  if (input.last_contact_date !== undefined)
    mapped.last_contact_date =
      input.last_contact_date !== null && input.last_contact_date !== ""
        ? input.last_contact_date
        : null;
  if (input.next_follow_up_date !== undefined)
    mapped.next_follow_up_date =
      input.next_follow_up_date !== null && input.next_follow_up_date !== ""
        ? input.next_follow_up_date
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
  if (input.complaint_raised !== undefined)
    mapped.complaint_raised =
      input.complaint_raised !== null && input.complaint_raised !== ""
        ? input.complaint_raised
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
        ? input.complaint_resolution_date
        : null;

  // ===== SYSTEM TRACKING FIELDS =====
  if (input.application_source_system !== undefined)
    mapped.application_source_system =
      input.application_source_system !== null &&
      input.application_source_system !== ""
        ? applicationSourceSystemMap[input.application_source_system] || null
        : null;
  if (input.integration_status !== undefined)
    mapped.integration_status =
      input.integration_status !== null && input.integration_status !== ""
        ? integrationStatusMap[input.integration_status] || null
        : null;
  if (input.audit_trail !== undefined)
    mapped.audit_trail =
      input.audit_trail !== null && input.audit_trail !== ""
        ? input.audit_trail
        : null;
  if (input.hs_object_id !== undefined)
    mapped.hs_object_id =
      input.hs_object_id !== null && input.hs_object_id !== ""
        ? input.hs_object_id
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
  if (input.application_record_status !== undefined)
    mapped.application_record_status =
      input.application_record_status !== null &&
      input.application_record_status !== ""
        ? recordStatusMap[input.application_record_status] || null
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

  // ===== COMMISSION RECORDS FIELDS =====
  if (input.commission_amount !== undefined)
    mapped.commission_amount =
      input.commission_amount !== null && input.commission_amount !== ""
        ? input.commission_amount
        : null;
  if (input.commission_rate !== undefined)
    mapped.commission_rate =
      input.commission_rate !== null && input.commission_rate !== ""
        ? input.commission_rate
        : null;
  if (input.commission_calculation_base !== undefined)
    mapped.commission_calculation_base =
      input.commission_calculation_base !== null &&
      input.commission_calculation_base !== ""
        ? commissionBaseMap[input.commission_calculation_base] || null
        : null;
  if (input.commission_status !== undefined)
    mapped.commission_status =
      input.commission_status !== null && input.commission_status !== ""
        ? commissionStatusMap[input.commission_status] || null
        : null;
  if (input.commission_approval_date !== undefined)
    mapped.commission_approval_date =
      input.commission_approval_date !== null &&
      input.commission_approval_date !== ""
        ? input.commission_approval_date
        : null;
  if (input.commission_payment_date !== undefined)
    mapped.commission_payment_date =
      input.commission_payment_date !== null &&
      input.commission_payment_date !== ""
        ? input.commission_payment_date
        : null;
  if (input.partner_commission_applicable !== undefined)
    mapped.partner_commission_applicable =
      input.partner_commission_applicable !== null &&
      input.partner_commission_applicable !== ""
        ? input.partner_commission_applicable
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

  return mapped;
};
