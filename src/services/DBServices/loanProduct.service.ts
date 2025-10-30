export const categorizeLoanProductByTable = (
  mappedFields: Record<string, any>
) => {
  const categorized: Record<string, Record<string, any>> = {};

  // Main Loan Product Fields
  const mainProductFields = [
    "deleted_by_id",
    "is_deleted",
    "lender_id",
    "lender_name",
    "partner_name",
    "product_description",
    "product_display_name",
    "product_category",
    "product_status",
    "product_type",
    "last_updated_date",
    "is_active",
    "created_by",
    "updated_by",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
  ];

  // System Tracking Fields
  const systemTrackingFields = [
    "change_log",
    "system_tracking_created_by",
    "created_date",
    "last_modified_by",
    "last_modified_date",
    "next_review_date",
    "notes",
    "product_record_status",
    "review_frequency",
    "version_number",
  ];

  // Competitive Analytics Fields
  const competitiveAnalyticsFields = ["market_positioning", "pricing_strategy"];

  // Eligibility Criteria Fields
  const eligibilityCriteriaFields = [
    "criteria_type",
    "criteria_name",
    "criteria_description",
    "is_mandatory",
    "validation_rule",
    "min_age",
    "max_age",
    "max_age_at_maturity",
    "min_academic_percentage",
    "entrance_exam_required",
    "entrance_exam_list",
    "minimum_percentage_required",
    "nationality_restrictions",
    "residency_requirements",
    "target_segment",
    "maximum_family_income",
    "minimum_family_income",
    "min_annual_income",
    "min_co_applicant_income",
    "employment_criteria",
    "co_applicant_income_criteria",
    "co_applicant_required",
    "co_applicant_relationship",
    "guarantor_required",
    "min_credit_score",
    "credit_history_required",
    "indian_citizen_only",
    "nri_eligible",
    "pio_oci_eligible",
    "work_experience_required",
    "min_work_experience_months",
    "admission_confirmation_required",
  ];

  // Collateral and Security Fields
  const collateralSecurityFields = [
    "collateral_margin",
    "collateral_required",
    "collateral_threshold_amount",
    "collateral_types_accepted",
    "collateral_guarantor_required",
    "insurance_coverage_percentage",
    "insurance_required",
    "third_party_guarantee_required",
  ];

  // Repayment Terms Fields
  const repaymentTermsFields = [
    "moratorium_type",
    "moratorium_period",
    "repayment_frequency",
    "repayment_period_maximum",
    "repayment_period_minimum",
    "prepayment_allowed",
    "prepayment_charges",
    "prepayment_lock_in_period",
    "foreclosure_allowed",
    "foreclosure_charges",
    "late_payment_charges",
    "bounce_charges",
    "part_payment_allowed",
    "part_payment_minimum",
  ];

  // Application and Processing Fields
  const applicationProcessingFields = [
    "application_mode",
    "disbursement_process",
    "disbursement_timeline",
    "partial_disbursement_allowed",
    "disbursement_stages",
    "documentation_list",
    "mandatory_documents",
    "optional_documents",
  ];

  // Geographic Coverage Fields
  const geographicCoverageFields = [
    "course_restrictions",
    "not_supported_universities",
    "restricted_countries",
    "course_duration_minimum",
    "course_duration_maximum",
    "supported_course_types",
  ];

  // Special Features Fields
  const specialFeaturesFields = [
    "digital_features",
    "customer_support_features",
    "flexible_repayment_options",
    "tax_benefits_available",
    "forex_tax_benefits",
    "grace_period_benefits",
    "insurance_coverage_included",
    "loyalty_benefits",
  ];

  // Performance Metrics Fields
  const performanceMetricsFields = [
    "application_volume_monthly",
    "application_volume_quarterly",
    "application_volume_yearly",
    "approval_rate",
    "average_loan_amount",
    "average_processing_days",
    "customer_satisfaction_rating",
    "product_popularity_score",
  ];

  // System Integration Fields
  const systemIntegrationFields = [
    "api_availability",
    "technical_documentation_url",
    "integration_complexity",
    "data_format",
    "sandbox_environment",
    "webhook_support",
  ];

  // Financial Terms Fields
  const financialTermsFields = [
    "interest_rate_type",
    "interest_rate_range_min",
    "interest_rate_range_max",
    "legal_charges",
    "loan_to_value_ratio",
    "rack_rate",
    "valuation_charges",
    "processing_fee_type",
    "processing_fee_percentage",
    "processing_fee_amount",
    "processing_fee_minimum",
    "processing_fee_maximum",
    "administrative_charges",
    "margin_money_percentage",
    "maximum_loan_amount_secured",
    "maximum_loan_amount_unsecured",
    "minimum_loan_amount_secured",
    "minimum_loan_amount_unsecured",
  ];

  // Categorize main product
  const mainProduct: Record<string, any> = {};
  for (const field of mainProductFields) {
    if (field in mappedFields) {
      mainProduct[field] = mappedFields[field];
    }
  }
  if (Object.keys(mainProduct).length > 0) {
    categorized.mainProduct = mainProduct;
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

  // Categorize competitive analytics
  const competitiveAnalytics: Record<string, any> = {};
  for (const field of competitiveAnalyticsFields) {
    if (field in mappedFields) {
      competitiveAnalytics[field] = mappedFields[field];
    }
  }
  if (Object.keys(competitiveAnalytics).length > 0) {
    categorized.competitiveAnalytics = competitiveAnalytics;
  }

  // Categorize eligibility criteria
  const eligibilityCriteria: Record<string, any> = {};
  for (const field of eligibilityCriteriaFields) {
    if (field in mappedFields) {
      eligibilityCriteria[field] = mappedFields[field];
    }
  }
  if (Object.keys(eligibilityCriteria).length > 0) {
    categorized.eligibilityCriteria = eligibilityCriteria;
  }

  // Categorize collateral security
  const collateralSecurity: Record<string, any> = {};
  for (const field of collateralSecurityFields) {
    if (field in mappedFields) {
      collateralSecurity[field] = mappedFields[field];
    }
  }
  if (Object.keys(collateralSecurity).length > 0) {
    categorized.collateralSecurity = collateralSecurity;
  }

  // Categorize repayment terms
  const repaymentTerms: Record<string, any> = {};
  for (const field of repaymentTermsFields) {
    if (field in mappedFields) {
      repaymentTerms[field] = mappedFields[field];
    }
  }
  if (Object.keys(repaymentTerms).length > 0) {
    categorized.repaymentTerms = repaymentTerms;
  }

  // Categorize application processing
  const applicationProcessing: Record<string, any> = {};
  for (const field of applicationProcessingFields) {
    if (field in mappedFields) {
      applicationProcessing[field] = mappedFields[field];
    }
  }
  if (Object.keys(applicationProcessing).length > 0) {
    categorized.applicationProcessing = applicationProcessing;
  }

  // Categorize geographic coverage
  const geographicCoverage: Record<string, any> = {};
  for (const field of geographicCoverageFields) {
    if (field in mappedFields) {
      geographicCoverage[field] = mappedFields[field];
    }
  }
  if (Object.keys(geographicCoverage).length > 0) {
    categorized.geographicCoverage = geographicCoverage;
  }

  // Categorize special features
  const specialFeatures: Record<string, any> = {};
  for (const field of specialFeaturesFields) {
    if (field in mappedFields) {
      specialFeatures[field] = mappedFields[field];
    }
  }
  if (Object.keys(specialFeatures).length > 0) {
    categorized.specialFeatures = specialFeatures;
  }

  // Categorize performance metrics
  const performanceMetrics: Record<string, any> = {};
  for (const field of performanceMetricsFields) {
    if (field in mappedFields) {
      performanceMetrics[field] = mappedFields[field];
    }
  }
  if (Object.keys(performanceMetrics).length > 0) {
    categorized.performanceMetrics = performanceMetrics;
  }

  // Categorize system integration
  const systemIntegration: Record<string, any> = {};
  for (const field of systemIntegrationFields) {
    if (field in mappedFields) {
      systemIntegration[field] = mappedFields[field];
    }
  }
  if (Object.keys(systemIntegration).length > 0) {
    categorized.systemIntegration = systemIntegration;
  }

  // Categorize financial terms
  const financialTerms: Record<string, any> = {};
  for (const field of financialTermsFields) {
    if (field in mappedFields) {
      financialTerms[field] = mappedFields[field];
    }
  }
  if (Object.keys(financialTerms).length > 0) {
    categorized.financialTerms = financialTerms;
  }

  return categorized;
};
