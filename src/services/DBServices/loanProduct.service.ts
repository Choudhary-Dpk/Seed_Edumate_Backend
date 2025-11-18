export const categorizeLoanProductByTable = (
  mappedFields: Record<string, any>
) => {
  const categorized: Record<string, Record<string, any>> = {};

  // Main Loan Product Fields (HSLoanProducts)
  const mainProductFields = [
    // Basic Information
    "db_id",
    "lender_id",
    "lender_db_id",
    "lender_name",
    "partner_name",
    "product_name",
    "product_display_name",
    "product_description",
    "product_type",
    "product_category",
    "product_status",
    "last_updated_date",
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
    "source",

    // Audit Fields
    "is_active",
    "is_deleted",
    "created_by",
    "created_at",
    "updated_by",
    "updated_at",
    "deleted_by",
    "deleted_on",
  ];

  // System Tracking Fields (HSLoanProductsSystemTracking)
  const systemTrackingFields = [
    "change_log",
    "created_by_user",
    "created_date",
    "last_modified_by",
    "last_modified_date",
    "next_review_date",
    "notes",
    "product_record_status",
    "review_frequency",
    "version_number",
  ];

  // Competitive Analytics Fields (HSLoanProductsCompetitiveAnalytics)
  const competitiveAnalyticsFields = [
    "market_positioning", 
    "pricing_strategy"
  ];

  // Eligibility Criteria Fields (HSLoanProductsEligibilityCriteria)
  const eligibilityCriteriaFields = [
    "co_applicant_income_criteria",
    "co_applicant_relationship",
    "co_applicant_required",
    "employment_criteria",
    "entrance_exam_required",
    "maximum_age",
    "maximum_family_income",
    "minimum_age",
    "minimum_family_income",
    "minimum_percentage_required",
    "nationality_restrictions",
    "residency_requirements",
    "target_segment",
  ];

  // Collateral and Security Fields (HSLoanProductsCollateralAndSecurity)
  const collateralSecurityFields = [
    "collateral_margin",
    "collateral_required",
    "collateral_threshold_amount",
    "collateral_types_accepted",
    "guarantor_required",
    "insurance_coverage_percentage",
    "insurance_required",
    "third_party_guarantee_accepted",
  ];

  // Repayment Terms Fields (HSLoanProductsRepaymentTerms)
  const repaymentTermsFields = [
    "bounce_charges",
    "foreclosure_charges",
    "late_payment_charges",
    "moratorium_period",
    "moratorium_type",
    "part_payment_allowed",
    "part_payment_minimum",
    "prepayment_allowed",
    "prepayment_charges",
    "prepayment_lock_in_period",
    "repayment_frequency",
    "repayment_period_maximum",
    "repayment_period_minimum",
  ];

  // Application and Processing Fields (HSLoanProductsApplicationAndProcessing)
  const applicationProcessingFields = [
    "application_mode",
    "disbursement_process",
    "disbursement_timeline",
    "documentation_list",
    "mandatory_documents",
    "optional_documents",
  ];

  // Geographic Coverage Fields (HSLoanProductsGeographicCoverage)
  const geographicCoverageFields = [
    "course_duration_maximum",
    "course_duration_minimum",
    "course_restrictions",
    "not_supported_universities",
    "restricted_countries",
    "supported_course_types",
  ];

  // Special Features Fields (HSLoanProductsSpecialFeatures)
  const specialFeaturesFields = [
    "customer_support_features",
    "digital_features",
    "flexible_repayment_options",
    "forex_tax_benefits",
    "grace_period_benefits",
    "loyalty_benefits",
    "tax_benefits_available",
  ];

  // Performance Metrics Fields (HSLoanProductsPerformanceMetrics)
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

  // System Integration Fields (HSLoanProductsSystemIntegration)
  const systemIntegrationFields = [
    "api_availability",
    "data_format",
    "integration_complexity",
    "sandbox_environment",
    "technical_documentation_url",
    "webhook_support",
  ];

  // Financial Terms Fields (HSLoanProductsFinancialTerms)
  const financialTermsFields = [
    "administrative_charges",
    "interest_rate_range_max",
    "interest_rate_range_min",
    "interest_rate_type",
    "legal_charges",
    "loan_to_value_ratio",
    "margin_money_percentage",
    "maximum_loan_amount_secured",
    "maximum_loan_amount_unsecured",
    "minimum_loan_amount_secured",
    "minimum_loan_amount_unsecured",
    "processing_fee_amount",
    "processing_fee_maximum",
    "processing_fee_minimum",
    "processing_fee_percentage",
    "processing_fee_type",
    "rack_rate",
    "valuation_charges",
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
