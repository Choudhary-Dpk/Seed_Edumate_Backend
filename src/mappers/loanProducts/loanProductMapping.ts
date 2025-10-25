import { collateralTypeMap } from "../../types/contact.types";
import {
  reviewFrequencyMap,
  interestRateTypeMap,
  productCategoryMap,
  productTypeMap,
  loanProductMarketPositioningMap,
  pricingStrategyMap,
  nationalityRestrictionsMap,
  residencyRequirementsMap,
  targetSegmentMap,
  collateralRequirementMap,
  guarantorRequiredMap,
  insuranceRequiredMap,
  thirdPartyGuaranteeRequiredMap,
  moratoriumTypeMap,
  repaymentFrequencyMap,
  partPaymentAllowedMap,
  applicationModeMap,
  disbursementProcessMap,
  loanProductCourseTypesMap,
  digitalFeaturesMap,
  customerSupportFeaturesMap,
  flexibleRepaymentOptionsMap,
  apiAvailabilityMap,
  integrationComplexityMap,
  dataFormatMap,
  sandboxEnvironmentMap,
  webHookSupportMap,
  processingFeeTypeMap,
  productStatusMap,
  productRecordStatusMap,
} from "../../types/loanProduct.types";

export const mapAllLoanProductFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // ===== MAIN LOAN PRODUCT FIELDS =====
  if (input.deleted_by_id !== undefined)
    mapped.deleted_by_id =
      input.deleted_by_id !== null && input.deleted_by_id !== ""
        ? input.deleted_by_id
        : null;
  if (input.is_deleted !== undefined)
    mapped.is_deleted =
      input.is_deleted !== null && input.is_deleted !== ""
        ? input.is_deleted
        : null;
  if (input.lender_id !== undefined)
    mapped.lender_id =
      input.lender_id !== null && input.lender_id !== ""
        ? input.lender_id
        : null;
  if (input.lender_name !== undefined)
    mapped.lender_name =
      input.lender_name !== null && input.lender_name !== ""
        ? input.lender_name
        : null;
  if (input.partner_name !== undefined)
    mapped.partner_name =
      input.partner_name !== null && input.partner_name !== ""
        ? input.partner_name
        : null;
  if (input.product_description !== undefined)
    mapped.product_description =
      input.product_description !== null && input.product_description !== ""
        ? input.product_description
        : null;
  if (input.product_display_name !== undefined)
    mapped.product_display_name =
      input.product_display_name !== null && input.product_display_name !== ""
        ? input.product_display_name
        : null;
  if (input.product_category !== undefined)
    mapped.product_category =
      input.product_category !== null && input.product_category !== ""
        ? productCategoryMap[input.product_category] || null
        : null;
  if (input.product_status !== undefined)
    mapped.product_status =
      input.product_status !== null && input.product_status !== ""
        ? productStatusMap[input.product_status] || null
        : null;
  if (input.product_type !== undefined)
    mapped.product_type =
      input.product_type !== null && input.product_type !== ""
        ? productTypeMap[input.product_type] || null
        : null;
  if (input.last_updated_date !== undefined)
    mapped.last_updated_date =
      input.last_updated_date !== null && input.last_updated_date !== ""
        ? input.last_updated_date
        : null;
  if (input.is_active !== undefined)
    mapped.is_active =
      input.is_active !== null && input.is_active !== ""
        ? input.is_active
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

  // ===== SYSTEM TRACKING FIELDS =====
  if (input.change_log !== undefined)
    mapped.change_log =
      input.change_log !== null && input.change_log !== ""
        ? input.change_log
        : null;
  if (input.system_tracking_created_by !== undefined)
    mapped.system_tracking_created_by =
      input.system_tracking_created_by !== null &&
      input.system_tracking_created_by !== ""
        ? input.system_tracking_created_by
        : null;
  if (input.created_date !== undefined)
    mapped.created_date =
      input.created_date !== null && input.created_date !== ""
        ? input.created_date
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
  if (input.next_review_date !== undefined)
    mapped.next_review_date =
      input.next_review_date !== null && input.next_review_date !== ""
        ? input.next_review_date
        : null;
  if (input.notes !== undefined)
    mapped.notes =
      input.notes !== null && input.notes !== "" ? input.notes : null;
  if (input.product_record_status !== undefined)
    mapped.product_record_status =
      input.product_record_status !== null && input.product_record_status !== ""
        ? productRecordStatusMap[input.product_record_status] || null
        : null;
  if (input.review_frequency !== undefined)
    mapped.review_frequency =
      input.review_frequency !== null && input.review_frequency !== ""
        ? reviewFrequencyMap[input.review_frequency] || null
        : null;
  if (input.version_number !== undefined)
    mapped.version_number =
      input.version_number !== null && input.version_number !== ""
        ? input.version_number
        : null;

  // ===== COMPETITIVE ANALYTICS FIELDS =====
  if (input.market_positioning !== undefined)
    mapped.market_positioning =
      input.market_positioning !== null && input.market_positioning !== ""
        ? loanProductMarketPositioningMap[input.market_positioning] || null
        : null;
  if (input.pricing_strategy !== undefined)
    mapped.pricing_strategy =
      input.pricing_strategy !== null && input.pricing_strategy !== ""
        ? pricingStrategyMap[input.pricing_strategy] || null
        : null;

  // ===== ELIGIBILITY CRITERIA FIELDS =====
  if (input.criteria_type !== undefined)
    mapped.criteria_type =
      input.criteria_type !== null && input.criteria_type !== ""
        ? input.criteria_type
        : null;
  if (input.criteria_name !== undefined)
    mapped.criteria_name =
      input.criteria_name !== null && input.criteria_name !== ""
        ? input.criteria_name
        : null;
  if (input.criteria_description !== undefined)
    mapped.criteria_description =
      input.criteria_description !== null && input.criteria_description !== ""
        ? input.criteria_description
        : null;
  if (input.is_mandatory !== undefined)
    mapped.is_mandatory =
      input.is_mandatory !== null && input.is_mandatory !== ""
        ? input.is_mandatory
        : null;
  if (input.validation_rule !== undefined)
    mapped.validation_rule =
      input.validation_rule !== null && input.validation_rule !== ""
        ? input.validation_rule
        : null;
  if (input.min_age !== undefined)
    mapped.min_age =
      input.min_age !== null && input.min_age !== "" ? input.min_age : null;
  if (input.max_age !== undefined)
    mapped.max_age =
      input.max_age !== null && input.max_age !== "" ? input.max_age : null;
  if (input.max_age_at_maturity !== undefined)
    mapped.max_age_at_maturity =
      input.max_age_at_maturity !== null && input.max_age_at_maturity !== ""
        ? input.max_age_at_maturity
        : null;
  if (input.min_academic_percentage !== undefined)
    mapped.min_academic_percentage =
      input.min_academic_percentage !== null &&
      input.min_academic_percentage !== ""
        ? input.min_academic_percentage
        : null;
  if (input.entrance_exam_required !== undefined)
    mapped.entrance_exam_required =
      input.entrance_exam_required !== null &&
      input.entrance_exam_required !== ""
        ? input.entrance_exam_required
        : null;
  if (input.entrance_exam_list !== undefined)
    mapped.entrance_exam_list =
      input.entrance_exam_list !== null && input.entrance_exam_list !== ""
        ? input.entrance_exam_list
        : null;
  if (input.minimum_percentage_required !== undefined)
    mapped.minimum_percentage_required =
      input.minimum_percentage_required !== null &&
      input.minimum_percentage_required !== ""
        ? input.minimum_percentage_required
        : null;
  if (input.nationality_restrictions !== undefined)
    mapped.nationality_restrictions =
      input.nationality_restrictions !== null &&
      input.nationality_restrictions !== ""
        ? nationalityRestrictionsMap[input.nationality_restrictions] || null
        : null;
  if (input.residency_requirements !== undefined)
    mapped.residency_requirements =
      input.residency_requirements !== null &&
      input.residency_requirements !== ""
        ? residencyRequirementsMap[input.residency_requirements] || null
        : null;
  if (input.target_segment !== undefined)
    mapped.target_segment =
      input.target_segment !== null && input.target_segment !== ""
        ? targetSegmentMap[input.target_segment] || null
        : null;
  if (input.maximum_family_income !== undefined)
    mapped.maximum_family_income =
      input.maximum_family_income !== null && input.maximum_family_income !== ""
        ? input.maximum_family_income
        : null;
  if (input.minimum_family_income !== undefined)
    mapped.minimum_family_income =
      input.minimum_family_income !== null && input.minimum_family_income !== ""
        ? input.minimum_family_income
        : null;
  if (input.min_annual_income !== undefined)
    mapped.min_annual_income =
      input.min_annual_income !== null && input.min_annual_income !== ""
        ? input.min_annual_income
        : null;
  if (input.min_co_applicant_income !== undefined)
    mapped.min_co_applicant_income =
      input.min_co_applicant_income !== null &&
      input.min_co_applicant_income !== ""
        ? input.min_co_applicant_income
        : null;
  if (input.employment_criteria !== undefined)
    mapped.employment_criteria =
      input.employment_criteria !== null && input.employment_criteria !== ""
        ? input.employment_criteria
        : null;
  if (input.co_applicant_income_criteria !== undefined)
    mapped.co_applicant_income_criteria =
      input.co_applicant_income_criteria !== null &&
      input.co_applicant_income_criteria !== ""
        ? input.co_applicant_income_criteria
        : null;
  if (input.co_applicant_required !== undefined)
    mapped.co_applicant_required =
      input.co_applicant_required !== null && input.co_applicant_required !== ""
        ? input.co_applicant_required
        : null;
  if (input.co_applicant_relationship !== undefined)
    mapped.co_applicant_relationship =
      input.co_applicant_relationship !== null &&
      input.co_applicant_relationship !== ""
        ? input.co_applicant_relationship
        : null;
  if (input.guarantor_required !== undefined)
    mapped.guarantor_required =
      input.guarantor_required !== null && input.guarantor_required !== ""
        ? input.guarantor_required
        : null;
  if (input.min_credit_score !== undefined)
    mapped.min_credit_score =
      input.min_credit_score !== null && input.min_credit_score !== ""
        ? input.min_credit_score
        : null;
  if (input.credit_history_required !== undefined)
    mapped.credit_history_required =
      input.credit_history_required !== null &&
      input.credit_history_required !== ""
        ? input.credit_history_required
        : null;
  if (input.indian_citizen_only !== undefined)
    mapped.indian_citizen_only =
      input.indian_citizen_only !== null && input.indian_citizen_only !== ""
        ? input.indian_citizen_only
        : null;
  if (input.nri_eligible !== undefined)
    mapped.nri_eligible =
      input.nri_eligible !== null && input.nri_eligible !== ""
        ? input.nri_eligible
        : null;
  if (input.pio_oci_eligible !== undefined)
    mapped.pio_oci_eligible =
      input.pio_oci_eligible !== null && input.pio_oci_eligible !== ""
        ? input.pio_oci_eligible
        : null;
  if (input.work_experience_required !== undefined)
    mapped.work_experience_required =
      input.work_experience_required !== null &&
      input.work_experience_required !== ""
        ? input.work_experience_required
        : null;
  if (input.min_work_experience_months !== undefined)
    mapped.min_work_experience_months =
      input.min_work_experience_months !== null &&
      input.min_work_experience_months !== ""
        ? input.min_work_experience_months
        : null;
  if (input.admission_confirmation_required !== undefined)
    mapped.admission_confirmation_required =
      input.admission_confirmation_required !== null &&
      input.admission_confirmation_required !== ""
        ? input.admission_confirmation_required
        : null;

  // ===== COLLATERAL AND SECURITY FIELDS =====
  if (input.collateral_margin !== undefined)
    mapped.collateral_margin =
      input.collateral_margin !== null && input.collateral_margin !== ""
        ? input.collateral_margin
        : null;
  if (input.collateral_required !== undefined)
    mapped.collateral_required =
      input.collateral_required !== null && input.collateral_required !== ""
        ? collateralRequirementMap[input.collateral_required] || null
        : null;
  if (input.collateral_threshold_amount !== undefined)
    mapped.collateral_threshold_amount =
      input.collateral_threshold_amount !== null &&
      input.collateral_threshold_amount !== ""
        ? input.collateral_threshold_amount
        : null;
  if (input.collateral_types_accepted !== undefined)
    mapped.collateral_types_accepted =
      input.collateral_types_accepted !== null &&
      input.collateral_types_accepted !== ""
        ? collateralTypeMap[input.collateral_types_accepted] || null
        : null;
  if (input.guarantor_required_security !== undefined)
    mapped.guarantor_required_security =
      input.guarantor_required_security !== null &&
      input.guarantor_required_security !== ""
        ? guarantorRequiredMap[input.guarantor_required_security] || null
        : null;
  if (input.insurance_coverage_percentage !== undefined)
    mapped.insurance_coverage_percentage =
      input.insurance_coverage_percentage !== null &&
      input.insurance_coverage_percentage !== ""
        ? input.insurance_coverage_percentage
        : null;
  if (input.insurance_required !== undefined)
    mapped.insurance_required =
      input.insurance_required !== null && input.insurance_required !== ""
        ? insuranceRequiredMap[input.insurance_required] || null
        : null;
  if (input.third_party_guarantee_required !== undefined)
    mapped.third_party_guarantee_required =
      input.third_party_guarantee_required !== null &&
      input.third_party_guarantee_required !== ""
        ? thirdPartyGuaranteeRequiredMap[
            input.third_party_guarantee_required
          ] || null
        : null;

  // ===== REPAYMENT TERMS FIELDS =====
  if (input.moratorium_type !== undefined)
    mapped.moratorium_type =
      input.moratorium_type !== null && input.moratorium_type !== ""
        ? moratoriumTypeMap[input.moratorium_type] || null
        : null;
  if (input.moratorium_period !== undefined)
    mapped.moratorium_period =
      input.moratorium_period !== null && input.moratorium_period !== ""
        ? input.moratorium_period
        : null;
  if (input.repayment_frequency !== undefined)
    mapped.repayment_frequency =
      input.repayment_frequency !== null && input.repayment_frequency !== ""
        ? repaymentFrequencyMap[input.repayment_frequency] || null
        : null;
  if (input.repayment_period_maximum !== undefined)
    mapped.repayment_period_maximum =
      input.repayment_period_maximum !== null &&
      input.repayment_period_maximum !== ""
        ? input.repayment_period_maximum
        : null;
  if (input.repayment_period_minimum !== undefined)
    mapped.repayment_period_minimum =
      input.repayment_period_minimum !== null &&
      input.repayment_period_minimum !== ""
        ? input.repayment_period_minimum
        : null;
  if (input.prepayment_allowed !== undefined)
    mapped.prepayment_allowed =
      input.prepayment_allowed !== null && input.prepayment_allowed !== ""
        ? input.prepayment_allowed
        : null;
  if (input.prepayment_charges !== undefined)
    mapped.prepayment_charges =
      input.prepayment_charges !== null && input.prepayment_charges !== ""
        ? input.prepayment_charges
        : null;
  if (input.prepayment_lock_in_period !== undefined)
    mapped.prepayment_lock_in_period =
      input.prepayment_lock_in_period !== null &&
      input.prepayment_lock_in_period !== ""
        ? input.prepayment_lock_in_period
        : null;
  if (input.foreclosure_allowed !== undefined)
    mapped.foreclosure_allowed =
      input.foreclosure_allowed !== null && input.foreclosure_allowed !== ""
        ? input.foreclosure_allowed
        : null;
  if (input.foreclosure_charges !== undefined)
    mapped.foreclosure_charges =
      input.foreclosure_charges !== null && input.foreclosure_charges !== ""
        ? input.foreclosure_charges
        : null;
  if (input.late_payment_charges !== undefined)
    mapped.late_payment_charges =
      input.late_payment_charges !== null && input.late_payment_charges !== ""
        ? input.late_payment_charges
        : null;
  if (input.bounce_charges !== undefined)
    mapped.bounce_charges =
      input.bounce_charges !== null && input.bounce_charges !== ""
        ? input.bounce_charges
        : null;
  if (input.part_payment_allowed !== undefined)
    mapped.part_payment_allowed =
      input.part_payment_allowed !== null && input.part_payment_allowed !== ""
        ? partPaymentAllowedMap[input.part_payment_allowed] || null
        : null;
  if (input.part_payment_minimum !== undefined)
    mapped.part_payment_minimum =
      input.part_payment_minimum !== null && input.part_payment_minimum !== ""
        ? input.part_payment_minimum
        : null;

  // ===== APPLICATION AND PROCESSING FIELDS =====
  if (input.application_mode !== undefined)
    mapped.application_mode =
      input.application_mode !== null && input.application_mode !== ""
        ? applicationModeMap[input.application_mode] || null
        : null;
  if (input.disbursement_process !== undefined)
    mapped.disbursement_process =
      input.disbursement_process !== null && input.disbursement_process !== ""
        ? disbursementProcessMap[input.disbursement_process] || null
        : null;
  if (input.disbursement_timeline !== undefined)
    mapped.disbursement_timeline =
      input.disbursement_timeline !== null && input.disbursement_timeline !== ""
        ? input.disbursement_timeline
        : null;
  if (input.partial_disbursement_allowed !== undefined)
    mapped.partial_disbursement_allowed =
      input.partial_disbursement_allowed !== null &&
      input.partial_disbursement_allowed !== ""
        ? input.partial_disbursement_allowed
        : null;
  if (input.disbursement_stages !== undefined)
    mapped.disbursement_stages =
      input.disbursement_stages !== null && input.disbursement_stages !== ""
        ? input.disbursement_stages
        : null;
  if (input.documentation_list !== undefined)
    mapped.documentation_list =
      input.documentation_list !== null && input.documentation_list !== ""
        ? input.documentation_list
        : null;
  if (input.mandatory_documents !== undefined)
    mapped.mandatory_documents =
      input.mandatory_documents !== null && input.mandatory_documents !== ""
        ? input.mandatory_documents
        : null;
  if (input.optional_documents !== undefined)
    mapped.optional_documents =
      input.optional_documents !== null && input.optional_documents !== ""
        ? input.optional_documents
        : null;

  // ===== GEOGRAPHIC COVERAGE FIELDS =====
  if (input.course_restrictions !== undefined)
    mapped.course_restrictions =
      input.course_restrictions !== null && input.course_restrictions !== ""
        ? input.course_restrictions
        : null;
  if (input.not_supported_universities !== undefined)
    mapped.not_supported_universities =
      input.not_supported_universities !== null &&
      input.not_supported_universities !== ""
        ? input.not_supported_universities
        : null;
  if (input.restricted_countries !== undefined)
    mapped.restricted_countries =
      input.restricted_countries !== null && input.restricted_countries !== ""
        ? input.restricted_countries
        : null;
  if (input.course_duration_minimum !== undefined)
    mapped.course_duration_minimum =
      input.course_duration_minimum !== null &&
      input.course_duration_minimum !== ""
        ? input.course_duration_minimum
        : null;
  if (input.course_duration_maximum !== undefined)
    mapped.course_duration_maximum =
      input.course_duration_maximum !== null &&
      input.course_duration_maximum !== ""
        ? input.course_duration_maximum
        : null;
  if (input.supported_course_types !== undefined)
    mapped.supported_course_types =
      input.supported_course_types !== null &&
      input.supported_course_types !== ""
        ? loanProductCourseTypesMap[input.supported_course_types] || null
        : null;

  // ===== SPECIAL FEATURES FIELDS =====
  if (input.digital_features !== undefined)
    mapped.digital_features =
      input.digital_features !== null && input.digital_features !== ""
        ? digitalFeaturesMap[input.digital_features] || null
        : null;
  if (input.customer_support_features !== undefined)
    mapped.customer_support_features =
      input.customer_support_features !== null &&
      input.customer_support_features !== ""
        ? customerSupportFeaturesMap[input.customer_support_features] || null
        : null;
  if (input.flexible_repayment_options !== undefined)
    mapped.flexible_repayment_options =
      input.flexible_repayment_options !== null &&
      input.flexible_repayment_options !== ""
        ? flexibleRepaymentOptionsMap[input.flexible_repayment_options] || null
        : null;
  if (input.tax_benefits_available !== undefined)
    mapped.tax_benefits_available =
      input.tax_benefits_available !== null &&
      input.tax_benefits_available !== ""
        ? input.tax_benefits_available
        : null;
  if (input.forex_tax_benefits !== undefined)
    mapped.forex_tax_benefits =
      input.forex_tax_benefits !== null && input.forex_tax_benefits !== ""
        ? input.forex_tax_benefits
        : null;
  if (input.grace_period_benefits !== undefined)
    mapped.grace_period_benefits =
      input.grace_period_benefits !== null && input.grace_period_benefits !== ""
        ? input.grace_period_benefits
        : null;
  if (input.insurance_coverage_included !== undefined)
    mapped.insurance_coverage_included =
      input.insurance_coverage_included !== null &&
      input.insurance_coverage_included !== ""
        ? input.insurance_coverage_included
        : null;
  if (input.loyalty_benefits !== undefined)
    mapped.loyalty_benefits =
      input.loyalty_benefits !== null && input.loyalty_benefits !== ""
        ? input.loyalty_benefits
        : null;

  // ===== PERFORMANCE METRICS FIELDS =====
  if (input.application_volume_monthly !== undefined)
    mapped.application_volume_monthly =
      input.application_volume_monthly !== null &&
      input.application_volume_monthly !== ""
        ? input.application_volume_monthly
        : null;
  if (input.application_volume_quarterly !== undefined)
    mapped.application_volume_quarterly =
      input.application_volume_quarterly !== null &&
      input.application_volume_quarterly !== ""
        ? input.application_volume_quarterly
        : null;
  if (input.application_volume_yearly !== undefined)
    mapped.application_volume_yearly =
      input.application_volume_yearly !== null &&
      input.application_volume_yearly !== ""
        ? input.application_volume_yearly
        : null;
  if (input.approval_rate !== undefined)
    mapped.approval_rate =
      input.approval_rate !== null && input.approval_rate !== ""
        ? input.approval_rate
        : null;
  if (input.average_loan_amount !== undefined)
    mapped.average_loan_amount =
      input.average_loan_amount !== null && input.average_loan_amount !== ""
        ? input.average_loan_amount
        : null;
  if (input.average_processing_days !== undefined)
    mapped.average_processing_days =
      input.average_processing_days !== null &&
      input.average_processing_days !== ""
        ? input.average_processing_days
        : null;
  if (input.customer_satisfaction_rating !== undefined)
    mapped.customer_satisfaction_rating =
      input.customer_satisfaction_rating !== null &&
      input.customer_satisfaction_rating !== ""
        ? input.customer_satisfaction_rating
        : null;
  if (input.product_popularity_score !== undefined)
    mapped.product_popularity_score =
      input.product_popularity_score !== null &&
      input.product_popularity_score !== ""
        ? input.product_popularity_score
        : null;

  // ===== SYSTEM INTEGRATION FIELDS =====
  if (input.api_availability !== undefined)
    mapped.api_availability =
      input.api_availability !== null && input.api_availability !== ""
        ? apiAvailabilityMap[input.api_availability] || null
        : null;
  if (input.technical_documentation_url !== undefined)
    mapped.technical_documentation_url =
      input.technical_documentation_url !== null &&
      input.technical_documentation_url !== ""
        ? input.technical_documentation_url
        : null;
  if (input.integration_complexity !== undefined)
    mapped.integration_complexity =
      input.integration_complexity !== null &&
      input.integration_complexity !== ""
        ? integrationComplexityMap[input.integration_complexity] || null
        : null;
  if (input.data_format !== undefined)
    mapped.data_format =
      input.data_format !== null && input.data_format !== ""
        ? dataFormatMap[input.data_format] || null
        : null;
  if (input.sandbox_environment !== undefined)
    mapped.sandbox_environment =
      input.sandbox_environment !== null && input.sandbox_environment !== ""
        ? sandboxEnvironmentMap[input.sandbox_environment] || null
        : null;
  if (input.webhook_support !== undefined)
    mapped.webhook_support =
      input.webhook_support !== null && input.webhook_support !== ""
        ? webHookSupportMap[input.webhook_support] || null
        : null;

  // ===== FINANCIAL TERMS FIELDS =====
  if (input.interest_rate_type !== undefined)
    mapped.interest_rate_type =
      input.interest_rate_type !== null && input.interest_rate_type !== ""
        ? interestRateTypeMap[input.interest_rate_type] || null
        : null;
  if (input.interest_rate_range_min !== undefined)
    mapped.interest_rate_range_min =
      input.interest_rate_range_min !== null &&
      input.interest_rate_range_min !== ""
        ? input.interest_rate_range_min
        : null;
  if (input.interest_rate_range_max !== undefined)
    mapped.interest_rate_range_max =
      input.interest_rate_range_max !== null &&
      input.interest_rate_range_max !== ""
        ? input.interest_rate_range_max
        : null;
  if (input.legal_charges !== undefined)
    mapped.legal_charges =
      input.legal_charges !== null && input.legal_charges !== ""
        ? input.legal_charges
        : null;
  if (input.loan_to_value_ratio !== undefined)
    mapped.loan_to_value_ratio =
      input.loan_to_value_ratio !== null && input.loan_to_value_ratio !== ""
        ? input.loan_to_value_ratio
        : null;
  if (input.rack_rate !== undefined)
    mapped.rack_rate =
      input.rack_rate !== null && input.rack_rate !== ""
        ? input.rack_rate
        : null;
  if (input.valuation_charges !== undefined)
    mapped.valuation_charges =
      input.valuation_charges !== null && input.valuation_charges !== ""
        ? input.valuation_charges
        : null;
  if (input.processing_fee_type !== undefined)
    mapped.processing_fee_type =
      input.processing_fee_type !== null && input.processing_fee_type !== ""
        ? processingFeeTypeMap[input.processing_fee_type] || null
        : null;
  if (input.processing_fee_percentage !== undefined)
    mapped.processing_fee_percentage =
      input.processing_fee_percentage !== null &&
      input.processing_fee_percentage !== ""
        ? input.processing_fee_percentage
        : null;
  if (input.processing_fee_amount !== undefined)
    mapped.processing_fee_amount =
      input.processing_fee_amount !== null && input.processing_fee_amount !== ""
        ? input.processing_fee_amount
        : null;
  if (input.processing_fee_minimum !== undefined)
    mapped.processing_fee_minimum =
      input.processing_fee_minimum !== null &&
      input.processing_fee_minimum !== ""
        ? input.processing_fee_minimum
        : null;
  if (input.processing_fee_maximum !== undefined)
    mapped.processing_fee_maximum =
      input.processing_fee_maximum !== null &&
      input.processing_fee_maximum !== ""
        ? input.processing_fee_maximum
        : null;
  if (input.administrative_charges !== undefined)
    mapped.administrative_charges =
      input.administrative_charges !== null &&
      input.administrative_charges !== ""
        ? input.administrative_charges
        : null;
  if (input.margin_money_percentage !== undefined)
    mapped.margin_money_percentage =
      input.margin_money_percentage !== null &&
      input.margin_money_percentage !== ""
        ? input.margin_money_percentage
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

  return mapped;
};
