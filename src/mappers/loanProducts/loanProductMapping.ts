import { enumMappingService } from "../enumMapping";

export const mapAllLoanProductFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // =====================================================================
  // STEP 1: COLLECT ALL ENUM FIELDS FOR BATCH TRANSLATION
  // =====================================================================
  const enumTranslations: Array<{
    field: string;
    enumName: string;
    sourceValue: string;
  }> = [];

  // === MAIN TABLE ENUMS (3) ===
  if (input.product_type && input.product_type !== "") {
    enumTranslations.push({
      field: "product_type",
      enumName: "productType",
      sourceValue: input.product_type,
    });
  }

  if (input.product_category && input.product_category !== "") {
    enumTranslations.push({
      field: "product_category",
      enumName: "productCategory",
      sourceValue: input.product_category,
    });
  }

  if (input.product_status && input.product_status !== "") {
    enumTranslations.push({
      field: "product_status",
      enumName: "productStatus",
      sourceValue: input.product_status,
    });
  }

  // === APPLICATION & PROCESSING ENUMS (2) ===
  if (input.application_mode && input.application_mode !== "") {
    enumTranslations.push({
      field: "application_mode",
      enumName: "applicationMode",
      sourceValue: input.application_mode,
    });
  }

  if (input.disbursement_process && input.disbursement_process !== "") {
    enumTranslations.push({
      field: "disbursement_process",
      enumName: "disbursementProcess",
      sourceValue: input.disbursement_process,
    });
  }

  // === COLLATERAL & SECURITY ENUMS (5) ===
  if (input.collateral_required && input.collateral_required !== "") {
    enumTranslations.push({
      field: "collateral_required",
      enumName: "loanProductCollateralRequired",
      sourceValue: input.collateral_required,
    });
  }

  if (
    input.collateral_types_accepted &&
    input.collateral_types_accepted !== ""
  ) {
    enumTranslations.push({
      field: "collateral_types_accepted",
      enumName: "collateralTypesAccepted",
      sourceValue: input.collateral_types_accepted,
    });
  }

  if (input.guarantor_required && input.guarantor_required !== "") {
    enumTranslations.push({
      field: "guarantor_required",
      enumName: "guarantorRequired",
      sourceValue: input.guarantor_required,
    });
  }

  if (input.insurance_required && input.insurance_required !== "") {
    enumTranslations.push({
      field: "insurance_required",
      enumName: "insuranceRequired",
      sourceValue: input.insurance_required,
    });
  }

  if (
    input.third_party_guarantee_accepted &&
    input.third_party_guarantee_accepted !== ""
  ) {
    enumTranslations.push({
      field: "third_party_guarantee_accepted",
      enumName: "thirdPartyGuaranteeAccepted",
      sourceValue: input.third_party_guarantee_accepted,
    });
  }

  // === COMPETITIVE ANALYSIS ENUMS (2) ===
  if (input.market_positioning && input.market_positioning !== "") {
    enumTranslations.push({
      field: "market_positioning",
      enumName: "marketPositioning",
      sourceValue: input.market_positioning,
    });
  }

  if (input.pricing_strategy && input.pricing_strategy !== "") {
    enumTranslations.push({
      field: "pricing_strategy",
      enumName: "pricingStrategy",
      sourceValue: input.pricing_strategy,
    });
  }

  // === ELIGIBILITY CRITERIA ENUMS (8) ===
  if (
    input.co_applicant_relationship &&
    input.co_applicant_relationship !== ""
  ) {
    enumTranslations.push({
      field: "co_applicant_relationship",
      enumName: "coApplicantRelationship",
      sourceValue: input.co_applicant_relationship,
    });
  }

  if (input.co_applicant_required && input.co_applicant_required !== "") {
    enumTranslations.push({
      field: "co_applicant_required",
      enumName: "loanProductCoApplicantRequired",
      sourceValue: input.co_applicant_required,
    });
  }

  if (input.entrance_exam_required && input.entrance_exam_required !== "") {
    enumTranslations.push({
      field: "entrance_exam_required",
      enumName: "entranceExamRequired",
      sourceValue: input.entrance_exam_required,
    });
  }

  if (input.nationality_restrictions && input.nationality_restrictions !== "") {
    enumTranslations.push({
      field: "nationality_restrictions",
      enumName: "nationalityRestrictions",
      sourceValue: input.nationality_restrictions,
    });
  }

  if (input.residency_requirements && input.residency_requirements !== "") {
    enumTranslations.push({
      field: "residency_requirements",
      enumName: "residencyRequirements",
      sourceValue: input.residency_requirements,
    });
  }

  if (
    (input.study_level &&
      input.study_level !== "") ||
    (input.target_segment &&
      input.target_segment !== "")
  ) {
    enumTranslations.push({
      field: "target_segment",
      enumName: "targetSegment",
      sourceValue: input.target_segment ?? input.study_level,
    });
  }

  // === FINANCIAL TERMS ENUMS (2) ===
  if (input.interest_rate_type && input.interest_rate_type !== "") {
    enumTranslations.push({
      field: "interest_rate_type",
      enumName: "loanProductInterestRateType",
      sourceValue: input.interest_rate_type,
    });
  }

  if (input.processing_fee_type && input.processing_fee_type !== "") {
    enumTranslations.push({
      field: "processing_fee_type",
      enumName: "processingFeeType",
      sourceValue: input.processing_fee_type,
    });
  }

  // === GEOGRAPHIC COVERAGE ENUMS (1) ===
  if (input.supported_course_types && input.supported_course_types !== "") {
    enumTranslations.push({
      field: "supported_course_types",
      enumName: "loanProductSupportedCourseTypes",
      sourceValue: input.supported_course_types,
    });
  }

  // === REPAYMENT TERMS ENUMS (4) ===
  if (input.moratorium_type && input.moratorium_type !== "") {
    enumTranslations.push({
      field: "moratorium_type",
      enumName: "moratoriumType",
      sourceValue: input.moratorium_type,
    });
  }

  if (input.part_payment_allowed && input.part_payment_allowed !== "") {
    enumTranslations.push({
      field: "part_payment_allowed",
      enumName: "partPaymentAllowed",
      sourceValue: input.part_payment_allowed,
    });
  }

  if (input.prepayment_allowed && input.prepayment_allowed !== "") {
    enumTranslations.push({
      field: "prepayment_allowed",
      enumName: "prepaymentAllowed",
      sourceValue: input.prepayment_allowed,
    });
  }

  if (input.repayment_frequency && input.repayment_frequency !== "") {
    enumTranslations.push({
      field: "repayment_frequency",
      enumName: "repaymentFrequency",
      sourceValue: input.repayment_frequency,
    });
  }

  // === SPECIAL FEATURES ENUMS (4) ===
  if (
    input.customer_support_features &&
    input.customer_support_features !== ""
  ) {
    enumTranslations.push({
      field: "customer_support_features",
      enumName: "customerSupportFeatures",
      sourceValue: input.customer_support_features,
    });
  }

  if (input.digital_features && input.digital_features !== "") {
    enumTranslations.push({
      field: "digital_features",
      enumName: "digitalFeatures",
      sourceValue: input.digital_features,
    });
  }

  if (
    input.flexible_repayment_options &&
    input.flexible_repayment_options !== ""
  ) {
    enumTranslations.push({
      field: "flexible_repayment_options",
      enumName: "flexibleRepaymentOptions",
      sourceValue: input.flexible_repayment_options,
    });
  }

  if (input.tax_benefits_available && input.tax_benefits_available !== "") {
    enumTranslations.push({
      field: "tax_benefits_available",
      enumName: "taxBenefitsAvailable",
      sourceValue: input.tax_benefits_available,
    });
  }

  // === SYSTEM INTEGRATION ENUMS (5) ===
  if (input.api_availability && input.api_availability !== "") {
    enumTranslations.push({
      field: "api_availability",
      enumName: "apiAvailability",
      sourceValue: input.api_availability,
    });
  }

  if (input.data_format && input.data_format !== "") {
    enumTranslations.push({
      field: "data_format",
      enumName: "dataFormat",
      sourceValue: input.data_format,
    });
  }

  if (input.integration_complexity && input.integration_complexity !== "") {
    enumTranslations.push({
      field: "integration_complexity",
      enumName: "integrationComplexity",
      sourceValue: input.integration_complexity,
    });
  }

  if (input.sandbox_environment && input.sandbox_environment !== "") {
    enumTranslations.push({
      field: "sandbox_environment",
      enumName: "sandboxEnvironment",
      sourceValue: input.sandbox_environment,
    });
  }

  if (input.webhook_support && input.webhook_support !== "") {
    enumTranslations.push({
      field: "webhook_support",
      enumName: "webhookSupport",
      sourceValue: input.webhook_support,
    });
  }

  // === SYSTEM TRACKING ENUMS (2) ===
  if (input.product_record_status && input.product_record_status !== "") {
    enumTranslations.push({
      field: "product_record_status",
      enumName: "productRecordStatus",
      sourceValue: input.product_record_status,
    });
  }

  if (input.review_frequency && input.review_frequency !== "") {
    enumTranslations.push({
      field: "review_frequency",
      enumName: "reviewFrequency",
      sourceValue: input.review_frequency,
    });
  }

  // =====================================================================
  // STEP 2: BATCH TRANSLATE ALL ENUMS IN ONE QUERY (90% FASTER!)
  // =====================================================================
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
      mapped[translation.field] = translated[key] || null;
    }
  }

  // =====================================================================
  // STEP 3: MAP ALL NON-ENUM FIELDS
  // =====================================================================

  // === MAIN LOAN PRODUCT FIELDS ===
  if (input.source !== undefined)
    mapped.source =
      input.source !== null && input.source !== "" ? input.source : null;

  if (input.hs_lender_id !== undefined)
    mapped.hs_lender_id =
      input.hs_lender_id !== null && input.hs_lender_id !== ""
        ? input.hs_lender_id
        : null;

  if (input.deleted_by_id !== undefined) {
    mapped.deleted_by_id =
      input.deleted_by_id !== null && input.deleted_by_id !== ""
        ? input.deleted_by_id
        : null;
  }

  if (input.is_deleted !== undefined) {
    mapped.is_deleted =
      input.is_deleted !== null && input.is_deleted !== ""
        ? input.is_deleted
        : null;
  }

  if (input.lender_id !== undefined) {
    mapped.lender_id =
      input.lender_id !== null && input.lender_id !== ""
        ? input.lender_id
        : null;
  }

  if (input.lender_name !== undefined) {
    mapped.lender_name =
      input.lender_name !== null && input.lender_name !== ""
        ? input.lender_name
        : null;
  }

  if (input.partner_name !== undefined) {
    mapped.partner_name =
      input.partner_name !== null && input.partner_name !== ""
        ? input.partner_name
        : null;
  }

  if (input.product_description !== undefined) {
    mapped.product_description =
      input.product_description !== null && input.product_description !== ""
        ? input.product_description
        : null;
  }

  if (input.product_display_name !== undefined) {
    mapped.product_display_name =
      input.product_display_name !== null && input.product_display_name !== ""
        ? input.product_display_name
        : null;
  }

  if (input.product_name !== undefined) {
    mapped.product_name =
      input.product_name !== null && input.product_name !== ""
        ? input.product_name
        : null;
  }

  if (input.last_updated_date !== undefined) {
    mapped.last_updated_date =
      input.last_updated_date !== null && input.last_updated_date !== ""
        ? input.last_updated_date
        : null;
  }

  if (input.is_active !== undefined) {
    mapped.is_active =
      input.is_active !== null && input.is_active !== ""
        ? input.is_active
        : null;
  }

  if (input.created_by !== undefined) {
    mapped.created_by =
      input.created_by !== null && input.created_by !== ""
        ? input.created_by
        : null;
  }

  if (input.updated_by !== undefined) {
    mapped.updated_by =
      input.updated_by !== null && input.updated_by !== ""
        ? input.updated_by
        : null;
  }

  // === HUBSPOT SYSTEM FIELDS ===
  if (input.hs_created_by_user_id !== undefined) {
    mapped.hs_created_by_user_id =
      input.hs_created_by_user_id !== null && input.hs_created_by_user_id !== ""
        ? input.hs_created_by_user_id
        : null;
  }

  if (input.hs_createdate !== undefined) {
    mapped.hs_createdate =
      input.hs_createdate !== null && input.hs_createdate !== ""
        ? input.hs_createdate
        : null;
  }

  if (input.hs_lastmodifieddate !== undefined) {
    mapped.hs_lastmodifieddate =
      input.hs_lastmodifieddate !== null && input.hs_lastmodifieddate !== ""
        ? input.hs_lastmodifieddate
        : null;
  }

  if (input.hs_object_id !== undefined) {
    mapped.hs_object_id =
      input.hs_object_id !== null && input.hs_object_id !== ""
        ? input.hs_object_id
        : null;
  }

  if (input.hs_updated_by_user_id !== undefined) {
    mapped.hs_updated_by_user_id =
      input.hs_updated_by_user_id !== null && input.hs_updated_by_user_id !== ""
        ? input.hs_updated_by_user_id
        : null;
  }

  if (input.hubspot_owner_id !== undefined) {
    mapped.hubspot_owner_id =
      input.hubspot_owner_id !== null && input.hubspot_owner_id !== ""
        ? input.hubspot_owner_id
        : null;
  }

  if (input.hs_merged_object_ids !== undefined) {
    mapped.hs_merged_object_ids =
      input.hs_merged_object_ids !== null && input.hs_merged_object_ids !== ""
        ? input.hs_merged_object_ids
        : null;
  }

  if (input.hs_object_source_detail_1 !== undefined) {
    mapped.hs_object_source_detail_1 =
      input.hs_object_source_detail_1 !== null &&
      input.hs_object_source_detail_1 !== ""
        ? input.hs_object_source_detail_1
        : null;
  }

  if (input.hs_object_source_detail_2 !== undefined) {
    mapped.hs_object_source_detail_2 =
      input.hs_object_source_detail_2 !== null &&
      input.hs_object_source_detail_2 !== ""
        ? input.hs_object_source_detail_2
        : null;
  }

  if (input.hs_object_source_detail_3 !== undefined) {
    mapped.hs_object_source_detail_3 =
      input.hs_object_source_detail_3 !== null &&
      input.hs_object_source_detail_3 !== ""
        ? input.hs_object_source_detail_3
        : null;
  }

  if (input.hs_object_source_label !== undefined) {
    mapped.hs_object_source_label =
      input.hs_object_source_label !== null &&
      input.hs_object_source_label !== ""
        ? input.hs_object_source_label
        : null;
  }

  if (input.hs_shared_team_ids !== undefined) {
    mapped.hs_shared_team_ids =
      input.hs_shared_team_ids !== null && input.hs_shared_team_ids !== ""
        ? input.hs_shared_team_ids
        : null;
  }

  if (input.hs_shared_user_ids !== undefined) {
    mapped.hs_shared_user_ids =
      input.hs_shared_user_ids !== null && input.hs_shared_user_ids !== ""
        ? input.hs_shared_user_ids
        : null;
  }

  if (input.hubspot_owner_assigneddate !== undefined) {
    mapped.hubspot_owner_assigneddate =
      input.hubspot_owner_assigneddate !== null &&
      input.hubspot_owner_assigneddate !== ""
        ? input.hubspot_owner_assigneddate
        : null;
  }

  if (input.hubspot_team_id !== undefined) {
    mapped.hubspot_team_id =
      input.hubspot_team_id !== null && input.hubspot_team_id !== ""
        ? input.hubspot_team_id
        : null;
  }

  // === SYSTEM TRACKING FIELDS ===
  if (input.change_log !== undefined) {
    mapped.change_log =
      input.change_log !== null && input.change_log !== ""
        ? input.change_log
        : null;
  }

  if (input.system_tracking_created_by !== undefined) {
    mapped.system_tracking_created_by =
      input.system_tracking_created_by !== null &&
      input.system_tracking_created_by !== ""
        ? input.system_tracking_created_by
        : null;
  }

  if (input.created_date !== undefined) {
    mapped.created_date =
      input.created_date !== null && input.created_date !== ""
        ? input.created_date
        : null;
  }

  if (input.last_modified_by !== undefined) {
    mapped.last_modified_by =
      input.last_modified_by !== null && input.last_modified_by !== ""
        ? input.last_modified_by
        : null;
  }

  if (input.last_modified_date !== undefined) {
    mapped.last_modified_date =
      input.last_modified_date !== null && input.last_modified_date !== ""
        ? input.last_modified_date
        : null;
  }

  if (input.next_review_date !== undefined) {
    mapped.next_review_date =
      input.next_review_date !== null && input.next_review_date !== ""
        ? input.next_review_date
        : null;
  }

  if (input.notes !== undefined) {
    mapped.notes =
      input.notes !== null && input.notes !== "" ? input.notes : null;
  }

  if (input.version_number !== undefined) {
    mapped.version_number =
      input.version_number !== null && input.version_number !== ""
        ? input.version_number
        : null;
  }

  if (input.created_by_user !== undefined) {
    mapped.created_by_user =
      input.created_by_user !== null && input.created_by_user !== ""
        ? input.created_by_user
        : null;
  }

  // === ELIGIBILITY CRITERIA FIELDS ===
  if (input.minimum_age !== undefined) {
    mapped.minimum_age =
      input.minimum_age !== null && input.minimum_age !== ""
        ? input.minimum_age
        : null;
  }

  if (input.maximum_age !== undefined) {
    mapped.maximum_age =
      input.maximum_age !== null && input.maximum_age !== ""
        ? input.maximum_age
        : null;
  }

  if (input.minimum_percentage_required !== undefined) {
    mapped.minimum_percentage_required =
      input.minimum_percentage_required !== null &&
      input.minimum_percentage_required !== ""
        ? input.minimum_percentage_required
        : null;
  }

  if (input.maximum_family_income !== undefined) {
    mapped.maximum_family_income =
      input.maximum_family_income !== null && input.maximum_family_income !== ""
        ? input.maximum_family_income
        : null;
  }

  if (input.minimum_family_income !== undefined) {
    mapped.minimum_family_income =
      input.minimum_family_income !== null && input.minimum_family_income !== ""
        ? input.minimum_family_income
        : null;
  }

  if (input.employment_criteria !== undefined) {
    mapped.employment_criteria =
      input.employment_criteria !== null && input.employment_criteria !== ""
        ? input.employment_criteria
        : null;
  }

  if (input.co_applicant_income_criteria !== undefined) {
    mapped.co_applicant_income_criteria =
      input.co_applicant_income_criteria !== null &&
      input.co_applicant_income_criteria !== ""
        ? input.co_applicant_income_criteria
        : null;
  }

  // === COLLATERAL AND SECURITY FIELDS ===
  if (input.collateral_margin !== undefined) {
    mapped.collateral_margin =
      input.collateral_margin !== null && input.collateral_margin !== ""
        ? input.collateral_margin
        : null;
  }

  if (input.collateral_threshold_amount !== undefined) {
    mapped.collateral_threshold_amount =
      input.collateral_threshold_amount !== null &&
      input.collateral_threshold_amount !== ""
        ? input.collateral_threshold_amount
        : null;
  }

  if (input.insurance_coverage_percentage !== undefined) {
    mapped.insurance_coverage_percentage =
      input.insurance_coverage_percentage !== null &&
      input.insurance_coverage_percentage !== ""
        ? input.insurance_coverage_percentage
        : null;
  }

  // === REPAYMENT TERMS FIELDS ===
  if (input.moratorium_period !== undefined) {
    mapped.moratorium_period =
      input.moratorium_period !== null && input.moratorium_period !== ""
        ? input.moratorium_period
        : null;
  }

  if (input.repayment_period_maximum !== undefined) {
    mapped.repayment_period_maximum =
      input.repayment_period_maximum !== null &&
      input.repayment_period_maximum !== ""
        ? input.repayment_period_maximum
        : null;
  }

  if (input.repayment_period_minimum !== undefined) {
    mapped.repayment_period_minimum =
      input.repayment_period_minimum !== null &&
      input.repayment_period_minimum !== ""
        ? input.repayment_period_minimum
        : null;
  }

  if (input.prepayment_charges !== undefined) {
    mapped.prepayment_charges =
      input.prepayment_charges !== null && input.prepayment_charges !== ""
        ? input.prepayment_charges
        : null;
  }

  if (input.prepayment_lock_in_period !== undefined) {
    mapped.prepayment_lock_in_period =
      input.prepayment_lock_in_period !== null &&
      input.prepayment_lock_in_period !== ""
        ? input.prepayment_lock_in_period
        : null;
  }

  if (input.foreclosure_allowed !== undefined) {
    mapped.foreclosure_allowed =
      input.foreclosure_allowed !== null && input.foreclosure_allowed !== ""
        ? input.foreclosure_allowed
        : null;
  }

  if (input.foreclosure_charges !== undefined) {
    mapped.foreclosure_charges =
      input.foreclosure_charges !== null && input.foreclosure_charges !== ""
        ? input.foreclosure_charges
        : null;
  }

  if (input.late_payment_charges !== undefined) {
    mapped.late_payment_charges =
      input.late_payment_charges !== null && input.late_payment_charges !== ""
        ? input.late_payment_charges
        : null;
  }

  if (input.bounce_charges !== undefined) {
    mapped.bounce_charges =
      input.bounce_charges !== null && input.bounce_charges !== ""
        ? input.bounce_charges
        : null;
  }

  if (input.part_payment_minimum !== undefined) {
    mapped.part_payment_minimum =
      input.part_payment_minimum !== null && input.part_payment_minimum !== ""
        ? input.part_payment_minimum
        : null;
  }

  // === APPLICATION AND PROCESSING FIELDS ===
  if (input.disbursement_timeline !== undefined) {
    mapped.disbursement_timeline =
      input.disbursement_timeline !== null && input.disbursement_timeline !== ""
        ? input.disbursement_timeline
        : null;
  }

  if (input.documentation_list !== undefined) {
    mapped.documentation_list =
      input.documentation_list !== null && input.documentation_list !== ""
        ? input.documentation_list
        : null;
  }

  if (input.mandatory_documents !== undefined) {
    mapped.mandatory_documents =
      input.mandatory_documents !== null && input.mandatory_documents !== ""
        ? input.mandatory_documents
        : null;
  }

  if (input.optional_documents !== undefined) {
    mapped.optional_documents =
      input.optional_documents !== null && input.optional_documents !== ""
        ? input.optional_documents
        : null;
  }

  // === GEOGRAPHIC COVERAGE FIELDS ===
  if (input.course_restrictions !== undefined) {
    mapped.course_restrictions =
      input.course_restrictions !== null && input.course_restrictions !== ""
        ? input.course_restrictions
        : null;
  }

  if (input.not_supported_universities !== undefined) {
    mapped.not_supported_universities =
      input.not_supported_universities !== null &&
      input.not_supported_universities !== ""
        ? input.not_supported_universities
        : null;
  }

  if (input.restricted_countries !== undefined) {
    mapped.restricted_countries =
      input.restricted_countries !== null && input.restricted_countries !== ""
        ? input.restricted_countries
        : null;
  }

  if (input.course_duration_minimum !== undefined) {
    mapped.course_duration_minimum =
      input.course_duration_minimum !== null &&
      input.course_duration_minimum !== ""
        ? input.course_duration_minimum
        : null;
  }

  if (input.course_duration_maximum !== undefined) {
    mapped.course_duration_maximum =
      input.course_duration_maximum !== null &&
      input.course_duration_maximum !== ""
        ? input.course_duration_maximum
        : null;
  }

  // === SPECIAL FEATURES FIELDS ===
  if (input.forex_tax_benefits !== undefined) {
    mapped.forex_tax_benefits =
      input.forex_tax_benefits !== null && input.forex_tax_benefits !== ""
        ? input.forex_tax_benefits
        : null;
  }

  if (input.grace_period_benefits !== undefined) {
    mapped.grace_period_benefits =
      input.grace_period_benefits !== null && input.grace_period_benefits !== ""
        ? input.grace_period_benefits
        : null;
  }

  if (input.insurance_coverage_included !== undefined) {
    mapped.insurance_coverage_included =
      input.insurance_coverage_included !== null &&
      input.insurance_coverage_included !== ""
        ? input.insurance_coverage_included
        : null;
  }

  if (input.loyalty_benefits !== undefined) {
    mapped.loyalty_benefits =
      input.loyalty_benefits !== null && input.loyalty_benefits !== ""
        ? input.loyalty_benefits
        : null;
  }

  // === PERFORMANCE METRICS FIELDS ===
  if (input.application_volume_monthly !== undefined) {
    mapped.application_volume_monthly =
      input.application_volume_monthly !== null &&
      input.application_volume_monthly !== ""
        ? input.application_volume_monthly
        : null;
  }

  if (input.application_volume_quarterly !== undefined) {
    mapped.application_volume_quarterly =
      input.application_volume_quarterly !== null &&
      input.application_volume_quarterly !== ""
        ? input.application_volume_quarterly
        : null;
  }

  if (input.application_volume_yearly !== undefined) {
    mapped.application_volume_yearly =
      input.application_volume_yearly !== null &&
      input.application_volume_yearly !== ""
        ? input.application_volume_yearly
        : null;
  }

  if (input.approval_rate !== undefined) {
    mapped.approval_rate =
      input.approval_rate !== null && input.approval_rate !== ""
        ? input.approval_rate
        : null;
  }

  if (input.average_loan_amount !== undefined) {
    mapped.average_loan_amount =
      input.average_loan_amount !== null && input.average_loan_amount !== ""
        ? input.average_loan_amount
        : null;
  }

  if (input.average_processing_days !== undefined) {
    mapped.average_processing_days =
      input.average_processing_days !== null &&
      input.average_processing_days !== ""
        ? input.average_processing_days
        : null;
  }

  if (input.customer_satisfaction_rating !== undefined) {
    mapped.customer_satisfaction_rating =
      input.customer_satisfaction_rating !== null &&
      input.customer_satisfaction_rating !== ""
        ? input.customer_satisfaction_rating
        : null;
  }

  if (input.product_popularity_score !== undefined) {
    mapped.product_popularity_score =
      input.product_popularity_score !== null &&
      input.product_popularity_score !== ""
        ? input.product_popularity_score
        : null;
  }

  // === SYSTEM INTEGRATION FIELDS ===
  if (input.technical_documentation_url !== undefined) {
    mapped.technical_documentation_url =
      input.technical_documentation_url !== null &&
      input.technical_documentation_url !== ""
        ? input.technical_documentation_url
        : null;
  }

  // === FINANCIAL TERMS FIELDS ===
  if (input.interest_rate_range_min !== undefined) {
    mapped.interest_rate_range_min =
      input.interest_rate_range_min !== null &&
      input.interest_rate_range_min !== ""
        ? input.interest_rate_range_min
        : null;
  }

  if (input.interest_rate_range_max !== undefined) {
    mapped.interest_rate_range_max =
      input.interest_rate_range_max !== null &&
      input.interest_rate_range_max !== ""
        ? input.interest_rate_range_max
        : null;
  }

  if (input.legal_charges !== undefined) {
    mapped.legal_charges =
      input.legal_charges !== null && input.legal_charges !== ""
        ? input.legal_charges
        : null;
  }

  if (input.loan_to_value_ratio !== undefined) {
    mapped.loan_to_value_ratio =
      input.loan_to_value_ratio !== null && input.loan_to_value_ratio !== ""
        ? input.loan_to_value_ratio
        : null;
  }

  if (input.rack_rate !== undefined) {
    mapped.rack_rate =
      input.rack_rate !== null && input.rack_rate !== ""
        ? input.rack_rate
        : null;
  }

  if (input.valuation_charges !== undefined) {
    mapped.valuation_charges =
      input.valuation_charges !== null && input.valuation_charges !== ""
        ? input.valuation_charges
        : null;
  }

  if (input.processing_fee_percentage !== undefined) {
    mapped.processing_fee_percentage =
      input.processing_fee_percentage !== null &&
      input.processing_fee_percentage !== ""
        ? input.processing_fee_percentage
        : null;
  }

  if (input.processing_fee_amount !== undefined) {
    mapped.processing_fee_amount =
      input.processing_fee_amount !== null && input.processing_fee_amount !== ""
        ? input.processing_fee_amount
        : null;
  }

  if (input.processing_fee_minimum !== undefined) {
    mapped.processing_fee_minimum =
      input.processing_fee_minimum !== null &&
      input.processing_fee_minimum !== ""
        ? input.processing_fee_minimum
        : null;
  }

  if (input.processing_fee_maximum !== undefined) {
    mapped.processing_fee_maximum =
      input.processing_fee_maximum !== null &&
      input.processing_fee_maximum !== ""
        ? input.processing_fee_maximum
        : null;
  }

  if (input.administrative_charges !== undefined) {
    mapped.administrative_charges =
      input.administrative_charges !== null &&
      input.administrative_charges !== ""
        ? input.administrative_charges
        : null;
  }

  if (input.margin_money_percentage !== undefined) {
    mapped.margin_money_percentage =
      input.margin_money_percentage !== null &&
      input.margin_money_percentage !== ""
        ? input.margin_money_percentage
        : null;
  }

  if (input.maximum_loan_amount_secured !== undefined) {
    mapped.maximum_loan_amount_secured =
      input.maximum_loan_amount_secured !== null &&
      input.maximum_loan_amount_secured !== ""
        ? input.maximum_loan_amount_secured
        : null;
  }

  if (input.maximum_loan_amount_unsecured !== undefined) {
    mapped.maximum_loan_amount_unsecured =
      input.maximum_loan_amount_unsecured !== null &&
      input.maximum_loan_amount_unsecured !== ""
        ? input.maximum_loan_amount_unsecured
        : null;
  }

  if (input.minimum_loan_amount_secured !== undefined) {
    mapped.minimum_loan_amount_secured =
      input.minimum_loan_amount_secured !== null &&
      input.minimum_loan_amount_secured !== ""
        ? input.minimum_loan_amount_secured
        : null;
  }

  if (input.minimum_loan_amount_unsecured !== undefined) {
    mapped.minimum_loan_amount_unsecured =
      input.minimum_loan_amount_unsecured !== null &&
      input.minimum_loan_amount_unsecured !== ""
        ? input.minimum_loan_amount_unsecured
        : null;
  }

  return mapped;
};
