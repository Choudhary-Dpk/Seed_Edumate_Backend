export type LoanProductFilters = {
  // Existing filters
  ids?: number[] | null;
  lender_name?: string | null;
  product_type?: string | null;
  product_category?: string | null;
  product_status?: string | null;
  partner_name?: string | null;

  // Financial filters
  interest_rate?: number | null;
  interest_rate_max?: number | null;
  loan_amount_min?: number | null;
  loan_amount_max?: number | null;
  processing_fee_max?: number | null;

  // Eligibility filters
  study_level?: string | null;
  target_segment?: string | null;
  minimum_age?: number | null;
  maximum_age?: number | null;
  nationality_restrictions?: string | null;

  // Geographic filters
  supported_course_types?: string | null;
  restricted_countries?: string | null;
  course_duration_min?: number | null;
  course_duration_max?: number | null;
  supported_nationality?: string | null;
  supported_countries?: string | null;

  // Intake period filters
  intake_month?: string | null;
  intake_year?: number | null;

  // Application filters
  school_name?: string | null;
  program_name?: string | null;

  // Additional financial filters
  total_tuition_fee?: number | null;
  cost_of_living?: number | null;

  // Collateral filters
  collateral_required?: string | null;
  guarantor_required?: string | null;

  // Repayment filters
  repayment_period_min?: number | null;
  repayment_period_max?: number | null;
  moratorium_available?: boolean | null;

  // Special features
  tax_benefits_available?: string | null;
  digital_features?: string | null;
};
