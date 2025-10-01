export interface EdumateContactInput {
  // Main contact fields
  deleted_by_id?: number;
  b2b_partner_id?: number;
  hs_created_by_user_id?: number;
  hs_createdate?: Date;
  hs_lastmodifieddate?: Date;
  hs_object_id?: string;
  hs_updated_by_user_id?: number;
  hubspot_owner_id?: string;
  base_currency?: string;
  study_destination_currency?: string;
  user_selected_currency?: string;
  course_type?: string;
  co_applicant_1_email?: string;
  co_applicant_1_mobile_number?: string;
  is_deleted?: boolean;

  // Nested data
  personal_information?: PersonalInformationInput;
  academic_profile?: AcademicProfileInput;
  application_journey?: ApplicationJourneyInput;
  financial_Info?: FinancialInfoInput;
  leads?: LeadAttributionInput;
  loan_preference?: LoanPreferencesInput;
  system_tracking?: SystemTrackingInput;
}

export interface PersonalInformationInput {
  first_name: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: Date;
  gender?: string;
  nationality?: string;
  current_address?: string;
  city_current_address?: string;
  state_current_address?: string;
  country_current_address?: string;
  pincode_current_address?: string;
  permanent_address?: string;
  city_permanent_address?: string;
  state_permanent_address?: string;
  country_permanent_address?: string;
  pincode_permanent_address?: string;
}

export interface AcademicProfileInput {
  admission_status?: string;
  current_education_level?: string;
  current_institution?: string;
  current_course_major?: string;
  current_cgpa_percentage?: number;
  current_graduation_year?: number;
  course_duration_months?: number;
  cat_score?: number;
  gre_score?: number;
  gmat_score?: number;
  toefl_score?: number;
  ielts_score?: number;
  sat_score?: number;
  duolingo_score?: number;
  nmat_score?: number;
  xat_score?: number;
  other_test_scores?: string;
  target_degree_level?: string;
  target_course_major?: string;
  preferred_study_destination?: string;
  target_universities?: string;
  intended_start_term?: string;
  intended_start_date?: Date;
  intake_month?: string;
  intake_year?: string;
}

export interface ApplicationJourneyInput {
  assigned_counselor?: string;
  counselor_notes?: string;
  current_status_disposition?: string;
  current_status_disposition_reason?: string;
  priority_level?: string;
  first_contact_date?: Date;
  last_contact_date?: Date;
  follow_up_date?: Date;
  next_follow_up_date?: Date;
}

export interface FinancialInfoInput {
  annual_family_income?: number;
  currency?: string;
  co_applicant_1_name?: string;
  co_applicant_1_income?: number;
  co_applicant_1_occupation?: string;
  co_applicant_1_relationship?: string;
  co_applicant_2_name?: string;
  co_applicant_2_income?: number;
  co_applicant_2_occupation?: string;
  co_applicant_2_relationship?: string;
  co_applicant_3_name?: string;
  co_applicant_3_income?: number;
  co_applicant_3_occupation?: string;
  co_applicant_3_relationship?: string;
  collateral_available?: string;
  collateral_type?: string;
  collateral_value?: number;
  collateral_2_available?: string;
  collateral_2_type?: string;
  collateral_2_value?: number;
  living_expenses?: number;
  other_expenses?: number;
  total_course_cost?: number;
  tuition_fee?: number;
  loan_amount_required?: number;
  scholarship_amount?: number;
  self_funding_amount?: number;
}

export interface LeadAttributionInput {
  lead_source?: string;
  lead_source_detail?: string;
  lead_quality_score?: number;
  lead_reference_code?: string;
  b2b_partner_id?: string;
  b2b_partner_name?: string;
  partner_commission_applicable?: string;
  referral_person_name?: string;
  referral_person_contact?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface LoanPreferencesInput {
  loan_type_preference?: string;
  preferred_lenders?: string[];
  repayment_type_preference?: string;
}

export interface SystemTrackingInput {
  created_by?: number;
  created_date?: Date;
  last_modified_by?: string;
  last_modified_date?: Date;
  data_source?: string;
  student_record_status?: string;
  tags?: string;
  gdpr_consent?: string;
  marketing_consent?: string;
}
