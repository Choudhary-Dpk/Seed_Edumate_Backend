import {
  lenderCategoryMap,
  lenderTypeMap,
  lenderDataSourceMap,
  lenderRecordStatusMap,
  performanceRatingMap,
  coSignerRequirementMap,
  lenderCollateralTypeMap,
  supportedCourseTypesMap,
  supportedDestinationsMap,
  apiConnectivityStatusMap,
  integrationLevelMap,
  holidayProcessingMap,
  repaymentOptionsMap,
  partnershipStatusMap,
  payoutTermsMap,
} from "../../types/lenders.types";

export const mapAllHSLendersFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // ===== MAIN HSLENDERS FIELDS =====
  if (input.external_id !== undefined)
    mapped.external_id =
      input.external_id !== null && input.external_id !== ""
        ? input.external_id
        : null;
  if (input.lender_display_name !== undefined)
    mapped.lender_display_name =
      input.lender_display_name !== null && input.lender_display_name !== ""
        ? input.lender_display_name
        : null;
  if (input.lender_name !== undefined)
    mapped.lender_name =
      input.lender_name !== null && input.lender_name !== ""
        ? input.lender_name
        : null;
  if (input.legal_name !== undefined)
    mapped.legal_name =
      input.legal_name !== null && input.legal_name !== ""
        ? input.legal_name
        : null;
  if (input.short_code !== undefined)
    mapped.short_code =
      input.short_code !== null && input.short_code !== ""
        ? input.short_code
        : null;
  if (input.lender_logo_url !== undefined)
    mapped.lender_logo_url =
      input.lender_logo_url !== null && input.lender_logo_url !== ""
        ? input.lender_logo_url
        : null;
  if (input.website_url !== undefined)
    mapped.website_url =
      input.website_url !== null && input.website_url !== ""
        ? input.website_url
        : null;
  if (input.lender_category !== undefined)
    mapped.lender_category =
      input.lender_category !== null && input.lender_category !== ""
        ? lenderCategoryMap[input.lender_category] || null
        : null;
  if (input.lender_type !== undefined)
    mapped.lender_type =
      input.lender_type !== null && input.lender_type !== ""
        ? lenderTypeMap[input.lender_type] || null
        : null;
  if (input.is_active !== undefined)
    mapped.is_active =
      input.is_active !== null && input.is_active !== ""
        ? input.is_active
        : null;
  if (input.created_at !== undefined)
    mapped.created_at =
      input.created_at !== null && input.created_at !== ""
        ? input.created_at
        : null;
  if (input.updated_at !== undefined)
    mapped.updated_at =
      input.updated_at !== null && input.updated_at !== ""
        ? input.updated_at
        : null;
  if (input.created_by !== undefined)
    mapped.created_by =
      input.created_by !== null && input.created_by !== ""
        ? input.created_by
        : null;
  if (input.updated_by !== undefined)
    mapped.updated_by =
      input.updated_by !== null && input.updated_by !== ""
        ? input.updated_by
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

  // ===== HSLENDERS CONTACT INFO FIELDS =====
  if (input.primary_contact_email !== undefined)
    mapped.primary_contact_email =
      input.primary_contact_email !== null && input.primary_contact_email !== ""
        ? input.primary_contact_email
        : null;
  if (input.primary_contact_phone !== undefined)
    mapped.primary_contact_phone =
      input.primary_contact_phone !== null && input.primary_contact_phone !== ""
        ? input.primary_contact_phone
        : null;
  if (input.primary_contact_designation !== undefined)
    mapped.primary_contact_designation =
      input.primary_contact_designation !== null &&
      input.primary_contact_designation !== ""
        ? input.primary_contact_designation
        : null;
  if (input.primary_contact_person !== undefined)
    mapped.primary_contact_person =
      input.primary_contact_person !== null &&
      input.primary_contact_person !== ""
        ? input.primary_contact_person
        : null;
  if (input.relationship_manager_email !== undefined)
    mapped.relationship_manager_email =
      input.relationship_manager_email !== null &&
      input.relationship_manager_email !== ""
        ? input.relationship_manager_email
        : null;
  if (input.relationship_manager_name !== undefined)
    mapped.relationship_manager_name =
      input.relationship_manager_name !== null &&
      input.relationship_manager_name !== ""
        ? input.relationship_manager_name
        : null;
  if (input.relationship_manager_phone !== undefined)
    mapped.relationship_manager_phone =
      input.relationship_manager_phone !== null &&
      input.relationship_manager_phone !== ""
        ? input.relationship_manager_phone
        : null;
  if (input.escalation_hierarchy_1_designation !== undefined)
    mapped.escalation_hierarchy_1_designation =
      input.escalation_hierarchy_1_designation !== null &&
      input.escalation_hierarchy_1_designation !== ""
        ? input.escalation_hierarchy_1_designation
        : null;
  if (input.escalation_hierarchy_1_email !== undefined)
    mapped.escalation_hierarchy_1_email =
      input.escalation_hierarchy_1_email !== null &&
      input.escalation_hierarchy_1_email !== ""
        ? input.escalation_hierarchy_1_email
        : null;
  if (input.escalation_hierarchy_1_name !== undefined)
    mapped.escalation_hierarchy_1_name =
      input.escalation_hierarchy_1_name !== null &&
      input.escalation_hierarchy_1_name !== ""
        ? input.escalation_hierarchy_1_name
        : null;
  if (input.escalation_hierarchy_1_phone !== undefined)
    mapped.escalation_hierarchy_1_phone =
      input.escalation_hierarchy_1_phone !== null &&
      input.escalation_hierarchy_1_phone !== ""
        ? input.escalation_hierarchy_1_phone
        : null;
  if (input.customer_service_email !== undefined)
    mapped.customer_service_email =
      input.customer_service_email !== null &&
      input.customer_service_email !== ""
        ? input.customer_service_email
        : null;
  if (input.customer_service_number !== undefined)
    mapped.customer_service_number =
      input.customer_service_number !== null &&
      input.customer_service_number !== ""
        ? input.customer_service_number
        : null;

  // ===== HSLENDERS BUSINESS METRICS FIELDS =====
  if (input.average_approval_rate !== undefined)
    mapped.average_approval_rate =
      input.average_approval_rate !== null && input.average_approval_rate !== ""
        ? input.average_approval_rate
        : null;
  if (input.monthly_application_volume !== undefined)
    mapped.monthly_application_volume =
      input.monthly_application_volume !== null &&
      input.monthly_application_volume !== ""
        ? input.monthly_application_volume
        : null;
  if (input.quarterly_application_volume !== undefined)
    mapped.quarterly_application_volume =
      input.quarterly_application_volume !== null &&
      input.quarterly_application_volume !== ""
        ? input.quarterly_application_volume
        : null;
  if (input.yearly_application_volume !== undefined)
    mapped.yearly_application_volume =
      input.yearly_application_volume !== null &&
      input.yearly_application_volume !== ""
        ? input.yearly_application_volume
        : null;
  if (input.average_processing_days !== undefined)
    mapped.average_processing_days =
      input.average_processing_days !== null &&
      input.average_processing_days !== ""
        ? input.average_processing_days
        : null;
  if (input.average_disbursement_days !== undefined)
    mapped.average_disbursement_days =
      input.average_disbursement_days !== null &&
      input.average_disbursement_days !== ""
        ? input.average_disbursement_days
        : null;

  // ===== HSLENDERS LOAN OFFERINGS FIELDS =====
  if (input.co_signer_requirements !== undefined)
    mapped.co_signer_requirements =
      input.co_signer_requirements !== null &&
      input.co_signer_requirements !== ""
        ? coSignerRequirementMap[input.co_signer_requirements] || null
        : null;
  if (input.collateral_requirements !== undefined)
    mapped.collateral_requirements =
      input.collateral_requirements !== null &&
      input.collateral_requirements !== ""
        ? lenderCollateralTypeMap[input.collateral_requirements] || null
        : null;
  if (input.interest_rate_range_max_secured !== undefined)
    mapped.interest_rate_range_max_secured =
      input.interest_rate_range_max_secured !== null &&
      input.interest_rate_range_max_secured !== ""
        ? input.interest_rate_range_max_secured
        : null;
  if (input.interest_rate_range_max_unsecured !== undefined)
    mapped.interest_rate_range_max_unsecured =
      input.interest_rate_range_max_unsecured !== null &&
      input.interest_rate_range_max_unsecured !== ""
        ? input.interest_rate_range_max_unsecured
        : null;
  if (input.interest_rate_range_min_secured !== undefined)
    mapped.interest_rate_range_min_secured =
      input.interest_rate_range_min_secured !== null &&
      input.interest_rate_range_min_secured !== ""
        ? input.interest_rate_range_min_secured
        : null;
  if (input.interest_rate_range_min_unsecured !== undefined)
    mapped.interest_rate_range_min_unsecured =
      input.interest_rate_range_min_unsecured !== null &&
      input.interest_rate_range_min_unsecured !== ""
        ? input.interest_rate_range_min_unsecured
        : null;
  if (input.margin_money_requirement !== undefined)
    mapped.margin_money_requirement =
      input.margin_money_requirement !== null &&
      input.margin_money_requirement !== ""
        ? input.margin_money_requirement
        : null;
  if (input.maximum_loan_amount_secured !== undefined)
    mapped.maximum_loan_amount_secured =
      input.maximum_loan_amount_secured !== null &&
      input.maximum_loan_amount_secured !== ""
        ? input.maximum_loan_amount_secured
        : null;
  if (input.maximum_loan_amount_unsecured !== undefined)
    mapped.maximum_loan_amount_unsecured =
      input.maximum_loan_amount_unsecured !== null &&
      input.maximum_loan_amount_unsecured !== ""
        ? input.maximum_loan_amount_unsecured
        : null;
  if (input.minimum_loan_amount_secured !== undefined)
    mapped.minimum_loan_amount_secured =
      input.minimum_loan_amount_secured !== null &&
      input.minimum_loan_amount_secured !== ""
        ? input.minimum_loan_amount_secured
        : null;
  if (input.minimum_loan_amount_unsecured !== undefined)
    mapped.minimum_loan_amount_unsecured =
      input.minimum_loan_amount_unsecured !== null &&
      input.minimum_loan_amount_unsecured !== ""
        ? input.minimum_loan_amount_unsecured
        : null;
  if (input.not_supported_universities !== undefined)
    mapped.not_supported_universities =
      input.not_supported_universities !== null &&
      input.not_supported_universities !== ""
        ? input.not_supported_universities
        : null;
  if (input.processing_fee_range !== undefined)
    mapped.processing_fee_range =
      input.processing_fee_range !== null && input.processing_fee_range !== ""
        ? input.processing_fee_range
        : null;
  if (input.special_programs !== undefined)
    mapped.special_programs =
      input.special_programs !== null && input.special_programs !== ""
        ? input.special_programs
        : null;
  if (input.supported_course_types !== undefined)
    mapped.supported_course_types =
      input.supported_course_types !== null &&
      input.supported_course_types !== ""
        ? supportedCourseTypesMap[input.supported_course_types] || null
        : null;
  if (input.supported_destinations !== undefined)
    mapped.supported_destinations =
      input.supported_destinations !== null &&
      input.supported_destinations !== ""
        ? supportedDestinationsMap[input.supported_destinations] || null
        : null;

  // ===== HSLENDERS OPERATIONAL DETAILS FIELDS =====
  if (input.api_connectivity_status !== undefined)
    mapped.api_connectivity_status =
      input.api_connectivity_status !== null &&
      input.api_connectivity_status !== ""
        ? apiConnectivityStatusMap[input.api_connectivity_status] || null
        : null;
  if (input.digital_integration_level !== undefined)
    mapped.digital_integration_level =
      input.digital_integration_level !== null &&
      input.digital_integration_level !== ""
        ? integrationLevelMap[input.digital_integration_level] || null
        : null;
  if (input.documentation_requirements !== undefined)
    mapped.documentation_requirements =
      input.documentation_requirements !== null &&
      input.documentation_requirements !== ""
        ? input.documentation_requirements
        : null;
  if (input.holiday_processing !== undefined)
    mapped.holiday_processing =
      input.holiday_processing !== null && input.holiday_processing !== ""
        ? holidayProcessingMap[input.holiday_processing] || null
        : null;
  if (input.late_payment_charges !== undefined)
    mapped.late_payment_charges =
      input.late_payment_charges !== null && input.late_payment_charges !== ""
        ? input.late_payment_charges
        : null;
  if (input.prepayment_charges !== undefined)
    mapped.prepayment_charges =
      input.prepayment_charges !== null && input.prepayment_charges !== ""
        ? input.prepayment_charges
        : null;
  if (input.repayment_options !== undefined)
    mapped.repayment_options =
      input.repayment_options !== null && input.repayment_options !== ""
        ? repaymentOptionsMap[input.repayment_options] || null
        : null;
  if (input.turnaround_time_commitment !== undefined)
    mapped.turnaround_time_commitment =
      input.turnaround_time_commitment !== null &&
      input.turnaround_time_commitment !== ""
        ? input.turnaround_time_commitment
        : null;
  if (input.working_hours !== undefined)
    mapped.working_hours =
      input.working_hours !== null && input.working_hours !== ""
        ? input.working_hours
        : null;

  // ===== HSLENDERS PARTNERSHIPS DETAILS FIELDS =====
  if (input.partnership_type !== undefined)
    mapped.partnership_type =
      input.partnership_type !== null && input.partnership_type !== ""
        ? input.partnership_type
        : null;
  if (input.agreement_start_date !== undefined)
    mapped.agreement_start_date =
      input.agreement_start_date !== null && input.agreement_start_date !== ""
        ? input.agreement_start_date
        : null;
  if (input.agreement_end_date !== undefined)
    mapped.agreement_end_date =
      input.agreement_end_date !== null && input.agreement_end_date !== ""
        ? input.agreement_end_date
        : null;
  if (input.auto_renewal !== undefined)
    mapped.auto_renewal =
      input.auto_renewal !== null && input.auto_renewal !== ""
        ? input.auto_renewal
        : null;
  if (input.renewal_notice_days !== undefined)
    mapped.renewal_notice_days =
      input.renewal_notice_days !== null && input.renewal_notice_days !== ""
        ? input.renewal_notice_days
        : null;
  if (input.commission_structure !== undefined)
    mapped.commission_structure =
      input.commission_structure !== null && input.commission_structure !== ""
        ? input.commission_structure
        : null;
  if (input.commission_percentage !== undefined)
    mapped.commission_percentage =
      input.commission_percentage !== null && input.commission_percentage !== ""
        ? input.commission_percentage
        : null;
  if (input.partnership_end_date !== undefined)
    mapped.partnership_end_date =
      input.partnership_end_date !== null && input.partnership_end_date !== ""
        ? input.partnership_end_date
        : null;
  if (input.partnership_start_date !== undefined)
    mapped.partnership_start_date =
      input.partnership_start_date !== null &&
      input.partnership_start_date !== ""
        ? input.partnership_start_date
        : null;
  if (input.partnership_status !== undefined)
    mapped.partnership_status =
      input.partnership_status !== null && input.partnership_status !== ""
        ? partnershipStatusMap[input.partnership_status] || null
        : null;
  if (input.payout_terms !== undefined)
    mapped.payout_terms =
      input.payout_terms !== null && input.payout_terms !== ""
        ? payoutTermsMap[input.payout_terms] || null
        : null;
  if (input.revenue_share_model !== undefined)
    mapped.revenue_share_model =
      input.revenue_share_model !== null && input.revenue_share_model !== ""
        ? input.revenue_share_model
        : null;

  // ===== HSLENDERS SYSTEM TRACKING FIELDS =====
  if (input.data_source !== undefined)
    mapped.data_source =
      input.data_source !== null && input.data_source !== ""
        ? lenderDataSourceMap[input.data_source] || null
        : null;
  if (input.lender_record_status !== undefined)
    mapped.lender_record_status =
      input.lender_record_status !== null && input.lender_record_status !== ""
        ? lenderRecordStatusMap[input.lender_record_status] || null
        : null;
  if (input.notes !== undefined)
    mapped.notes =
      input.notes !== null && input.notes !== "" ? input.notes : null;
  if (input.performance_rating !== undefined)
    mapped.performance_rating =
      input.performance_rating !== null && input.performance_rating !== ""
        ? performanceRatingMap[input.performance_rating] || null
        : null;
  if (input.last_modified_by !== undefined)
    mapped.last_modified_by =
      input.last_modified_by !== null && input.last_modified_by !== ""
        ? input.last_modified_by
        : null;
  if (input.last_modified_date !== undefined)
    mapped.last_modified_date =
      input.last_modified_date !== null && input.last_modified_date !== ""
        ? input.last_modified_date
        : null;

  return mapped;
};
