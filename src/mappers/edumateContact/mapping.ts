import { Prisma } from "@prisma/client";
import { AcademicProfileInput, ApplicationJourneyInput, EdumateContactInput, FinancialInfoInput, LeadAttributionInput, LoanPreferencesInput, PersonalInformationInput, SystemTrackingInput } from "../../types/DBTypes/edumateContact.types";
import { convertCurrency } from "../../services/loan.service";
import { admissionStatusMap, coApplicantOccupationMap, coApplicantRelationshipMap, collateralAvailableMap, collateralTypeMap, courseTypeMap, currentEducationLevelMap, currentStatusDispositionMap, dataSourceMap, financialCurrencyMap, gdprConsentMap, genderMap, intendedStartTermMap, leadSourceMap, LoanTypePreferenceMap, marketingConsentMap, partnerCommissionApplicableMap, preferredStudyDestinationMap, priorityLevelMap, repaymentTypePreferenceMap, statusDispositionReasonMap, studentRecordStatusMap, targetDegreeLevelMap } from "../../types/contact.types";

export const FIELD_MAPPINGS = {
  // Main Contact Table
  mainContact: [
    'deleted_by_id',
    'b2b_partner_id',
    'hs_created_by_user_id',
    'hs_createdate',
    'hs_lastmodifieddate',
    'hs_object_id',
    'hs_updated_by_user_id',
    'hubspot_owner_id',
    'base_currency',
    'study_destination_currency',
    'user_selected_currency',
    'course_type',
    'co_applicant_1_email',
    'co_applicant_1_mobile_number',
    'is_deleted',
  ],

  // Personal Information
  personalInformation: [
    'first_name',
    'last_name',
    'email',
    'phone_number',
    'date_of_birth',
    'gender',
    'nationality',
    'current_address',
    'city_current_address',
    'state_current_address',
    'country_current_address',
    'pincode_current_address',
    'permanent_address',
    'city_permanent_address',
    'state_permanent_address',
    'country_permanent_address',
    'pincode_permanent_address',
  ],

  // Academic Profile
  academicProfile: [
    'admission_status',
    'current_education_level',
    'current_institution',
    'current_course_major',
    'current_cgpa_percentage',
    'current_graduation_year',
    'course_duration_months',
    'cat_score',
    'gre_score',
    'gmat_score',
    'toefl_score',
    'ielts_score',
    'sat_score',
    'duolingo_score',
    'nmat_score',
    'xat_score',
    'other_test_scores',
    'target_degree_level',
    'target_course_major',
    'preferred_study_destination',
    'target_universities',
    'intended_start_term',
    'intended_start_date',
    'intake_month',
    'intake_year',
  ],

  // Application Journey
  applicationJourney: [
    'assigned_counselor',
    'counselor_notes',
    'current_status_disposition',
    'current_status_disposition_reason',
    'priority_level',
    'first_contact_date',
    'last_contact_date',
    'follow_up_date',
    'next_follow_up_date',
  ],

  // Financial Info
  financialInfo: [
    'annual_family_income',
    'currency',
    'co_applicant_1_name',
    'co_applicant_1_income',
    'co_applicant_1_occupation',
    'co_applicant_1_relationship',
    'co_applicant_2_name',
    'co_applicant_2_income',
    'co_applicant_2_occupation',
    'co_applicant_2_relationship',
    'co_applicant_3_name',
    'co_applicant_3_income',
    'co_applicant_3_occupation',
    'co_applicant_3_relationship',
    'collateral_available',
    'collateral_type',
    'collateral_value',
    'collateral_2_available',
    'collateral_2_type',
    'collateral_2_value',
    'living_expenses',
    'other_expenses',
    'total_course_cost',
    'tuition_fee',
    'loan_amount_required',
    'scholarship_amount',
    'self_funding_amount',
  ],

  // Lead Attribution
  leadAttribution: [
    'lead_source',
    'lead_source_detail',
    'lead_quality_score',
    'lead_reference_code',
    'b2b_partner_id',
    'b2b_partner_name',
    'partner_commission_applicable',
    'referral_person_name',
    'referral_person_contact',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ],

  // Loan Preferences
  loanPreferences: [
    'loan_type_preference',
    'preferred_lenders',
    'repayment_type_preference',
  ],

  // System Tracking
  systemTracking: [
    'created_by',
    'created_date',
    'last_modified_by',
    'last_modified_date',
    'data_source',
    'student_record_status',
    'tags',
    'gdpr_consent',
    'marketing_consent',
  ],
};

// ==================== MAPPING FUNCTIONS ====================

export const mapMainContact = (data: Record<string, any>) => {
  return {
    deleted_by_id: data.deleted_by_id,
    b2b_partner_id: data.b2b_partner_id,
    hs_created_by_user_id: data.hs_created_by_user_id,
    hs_createdate: data.hs_createdate,
    hs_lastmodifieddate: data.hs_lastmodifieddate,
    hs_object_id: data.hs_object_id,
    hs_updated_by_user_id: data.hs_updated_by_user_id,
    hubspot_owner_id: data.hubspot_owner_id,
    base_currency: data.base_currency,
    study_destination_currency: data.study_destination_currency,
    user_selected_currency: data.user_selected_currency,
    course_type: data.course_type as any,
    co_applicant_1_email: data.co_applicant_1_email,
    co_applicant_1_mobile_number: data.co_applicant_1_mobile_number,
    is_deleted: data.is_deleted ?? false,
  };
};

export const mapPersonalInformation = (data: Record<string, any>) => {
  return {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone_number: data.phone_number,
    date_of_birth: data.date_of_birth,
    gender: data.gender as any,
    nationality: data.nationality as any,
    current_address: data.current_address,
    city_current_address: data.city_current_address,
    state_current_address: data.state_current_address,
    country_current_address: data.country_current_address,
    pincode_current_address: data.pincode_current_address,
    permanent_address: data.permanent_address,
    city_permanent_address: data.city_permanent_address,
    state_permanent_address: data.state_permanent_address,
    country_permanent_address: data.country_permanent_address,
    pincode_permanent_address: data.pincode_permanent_address,
  };
};

export const mapAcademicProfile = (data: Record<string, any>) => {
  return {
    admission_status: data.admission_status as any,
    current_education_level: data.current_education_level as any,
    current_institution: data.current_institution,
    current_course_major: data.current_course_major,
    current_cgpa_percentage: data.current_cgpa_percentage,
    current_graduation_year: data.current_graduation_year,
    course_duration_months: data.course_duration_months,
    cat_score: data.cat_score,
    gre_score: data.gre_score,
    gmat_score: data.gmat_score,
    toefl_score: data.toefl_score,
    ielts_score: data.ielts_score,
    sat_score: data.sat_score,
    duolingo_score: data.duolingo_score,
    nmat_score: data.nmat_score,
    xat_score: data.xat_score,
    other_test_scores: data.other_test_scores,
    target_degree_level: data.target_degree_level as any,
    target_course_major: data.target_course_major,
    preferred_study_destination: data.preferred_study_destination as any,
    target_universities: data.target_universities,
    intended_start_term: data.intended_start_term as any,
    intended_start_date: data.intended_start_date,
    intake_month: data.intake_month,
    intake_year: data.intake_year,
  };
};

export const mapApplicationJourney = (data: Record<string, any>) => {
  return {
    assigned_counselor: data.assigned_counselor,
    counselor_notes: data.counselor_notes,
    current_status_disposition: data.current_status_disposition as any,
    current_status_disposition_reason: data.current_status_disposition_reason as any,
    priority_level: data.priority_level as any,
    first_contact_date: data.first_contact_date,
    last_contact_date: data.last_contact_date,
    follow_up_date: data.follow_up_date,
    next_follow_up_date: data.next_follow_up_date,
  };
};

export const mapFinancialInfo = (data: Record<string, any>) => {
  return {
    annual_family_income: data.annual_family_income,
    currency: data.currency as any,
    co_applicant_1_name: data.co_applicant_1_name,
    co_applicant_1_income: data.co_applicant_1_income,
    co_applicant_1_occupation: data.co_applicant_1_occupation as any,
    co_applicant_1_relationship: data.co_applicant_1_relationship as any,
    co_applicant_2_name: data.co_applicant_2_name,
    co_applicant_2_income: data.co_applicant_2_income,
    co_applicant_2_occupation: data.co_applicant_2_occupation as any,
    co_applicant_2_relationship: data.co_applicant_2_relationship as any,
    co_applicant_3_name: data.co_applicant_3_name,
    co_applicant_3_income: data.co_applicant_3_income,
    co_applicant_3_occupation: data.co_applicant_3_occupation as any,
    co_applicant_3_relationship: data.co_applicant_3_relationship as any,
    collateral_available: data.collateral_available as any,
    collateral_type: data.collateral_type as any,
    collateral_value: data.collateral_value,
    collateral_2_available: data.collateral_2_available as any,
    collateral_2_type: data.collateral_2_type as any,
    collateral_2_value: data.collateral_2_value,
    living_expenses: data.living_expenses,
    other_expenses: data.other_expenses,
    total_course_cost: data.total_course_cost,
    tuition_fee: data.tuition_fee,
    loan_amount_required: data.loan_amount_required,
    scholarship_amount: data.scholarship_amount,
    self_funding_amount: data.self_funding_amount,
  };
};

export const mapLeadAttribution = (data: Record<string, any>) => {
  return {
    lead_source: data.lead_source as any,
    lead_source_detail: data.lead_source_detail,
    lead_quality_score: data.lead_quality_score,
    lead_reference_code: data.lead_reference_code,
    b2b_partner_id: data.b2b_partner_id,
    b2b_partner_name: data.b2b_partner_name,
    partner_commission_applicable: data.partner_commission_applicable as any,
    referral_person_name: data.referral_person_name,
    referral_person_contact: data.referral_person_contact,
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    utm_term: data.utm_term,
    utm_content: data.utm_content,
  };
};

export const mapLoanPreferences = (data: Record<string, any>) => {
  return {
    loan_type_preference: data.loan_type_preference as any,
    preferred_lenders: data.preferred_lenders as any,
    repayment_type_preference: data.repayment_type_preference as any,
  };
};

export const mapSystemTracking = (data: Record<string, any>) => {
  return {
    created_by: data.created_by,
    created_date: data.created_date,
    last_modified_by: data.last_modified_by,
    last_modified_date: data.last_modified_date,
    data_source: data.data_source as any,
    student_record_status: data.student_record_status as any,
    tags: data.tags,
    gdpr_consent: data.gdpr_consent as any,
    marketing_consent: data.marketing_consent as any,
  };
};

export const mapAllFields = async (input: Record<string, any>): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};
  
  // Currency conversions
  const loanAmount = input?.selectedLoanCurrency && input?.selectedLoanCurrency != 'INR' && input?.loanAmount 
    ? await convertCurrency(parseInt(input?.loanAmount) || 0, input?.selectedLoanCurrency || 'INR', 'INR') 
    : input?.loanAmount;
    
  const coApplicantAnnualIncome = input?.baseCurrency != 'INR' && input?.coApplicantAnnualIncome 
    ? await convertCurrency(parseInt(input?.coApplicantAnnualIncome), input?.baseCurrency || 'INR', 'INR') 
    : input?.coApplicantAnnualIncome;
  
  // ===== MAIN CONTACT FIELDS =====
  if (input.deleted_by_id !== undefined) mapped.deleted_by_id = input.deleted_by_id;
  if (input.b2b_partner_id !== undefined) mapped.b2b_partner_id = input.b2b_partner_id;
  if (input.hs_created_by_user_id !== undefined) mapped.hs_created_by_user_id = input.hs_created_by_user_id;
  if (input.hs_createdate !== undefined) mapped.hs_createdate = input.hs_createdate;
  if (input.hs_lastmodifieddate !== undefined) mapped.hs_lastmodifieddate = input.hs_lastmodifieddate;
  if (input.hs_object_id !== undefined) mapped.hs_object_id = input.hs_object_id;
  if (input.hs_updated_by_user_id !== undefined) mapped.hs_updated_by_user_id = input.hs_updated_by_user_id;
  if (input.hubspot_owner_id !== undefined) mapped.hubspot_owner_id = input.hubspot_owner_id;
  if (input.base_currency !== undefined) mapped.base_currency = input.base_currency;
  if (input.study_destination_currency !== undefined) mapped.study_destination_currency = input.study_destination_currency;
  if (input.user_selected_currency !== undefined) mapped.user_selected_currency = input.user_selected_currency;
  if (input.courseType !== undefined) mapped.course_type = input.courseType ? courseTypeMap[input.courseType] : null;
  if (input.co_applicant_1_email !== undefined) mapped.co_applicant_1_email = input.co_applicant_1_email;
  if (input.co_applicant_1_mobile_number !== undefined) mapped.co_applicant_1_mobile_number = input.co_applicant_1_mobile_number;
  if (input.is_deleted !== undefined) mapped.is_deleted = input.is_deleted;

  // ===== PERSONAL INFORMATION FIELDS =====
  if (input.firstName !== undefined) mapped.first_name = input.firstName || null;
  if (input.lastName !== undefined) mapped.last_name = input.lastName || null;
  if (input.email !== undefined) mapped.email = input.email || null;
  if (input.phoneNumber !== undefined) mapped.phone_number = input.phoneNumber || null;
  if (input.dateOfBirth !== undefined) mapped.date_of_birth = input.dateOfBirth.toISOString().split('T')[0] || null;
  if (input.gender !== undefined) mapped.gender = input.gender ? genderMap[input.gender] : null;
  if (input.nationality !== undefined) mapped.nationality = input.nationality || null;
  if (input.current_address !== undefined) mapped.current_address = input.current_address || null;
  if (input.city_current_address !== undefined) mapped.city_current_address = input.city_current_address || null;
  if (input.state_current_address !== undefined) mapped.state_current_address = input.state_current_address || null;
  if (input.country_current_address !== undefined) mapped.country_current_address = input.country_current_address || null;
  if (input.pincode_current_address !== undefined) mapped.pincode_current_address = input.pincode_current_address || null;
  if (input.permanent_address !== undefined) mapped.permanent_address = input.permanent_address || null;
  if (input.city_permanent_address !== undefined) mapped.city_permanent_address = input.city_permanent_address || null;
  if (input.state_permanent_address !== undefined) mapped.state_permanent_address = input.state_permanent_address || null;
  if (input.country_permanent_address !== undefined) mapped.country_permanent_address = input.country_permanent_address || null;
  if (input.pincode_permanent_address !== undefined) mapped.pincode_permanent_address = input.pincode_permanent_address || null;

  // ===== ACADEMIC PROFILE FIELDS =====
  if (input.admissionStatus !== undefined) mapped.admission_status = input.admissionStatus ? admissionStatusMap[input.admissionStatus] : null;
  if (input.levelOfEducation !== undefined) mapped.current_education_level = input.levelOfEducation ? currentEducationLevelMap[input.levelOfEducation] : null;
  if (input.current_institution !== undefined) mapped.current_institution = input.current_institution || null;
  if (input.current_course_major !== undefined) mapped.current_course_major = input.current_course_major || null;
  if (input.current_cgpa_percentage !== undefined) mapped.current_cgpa_percentage = input.current_cgpa_percentage || null;
  if (input.current_graduation_year !== undefined) mapped.current_graduation_year = input.current_graduation_year || null;
  if (input.course_duration_months !== undefined) mapped.course_duration_months = input.course_duration_months || null;
  if (input?.analyticalExam?.CAT !== undefined) mapped.cat_score = parseInt(input?.analyticalExam?.CAT) || null;
  if (input?.analyticalExam?.GRE !== undefined) mapped.gre_score = parseInt(input?.analyticalExam?.GRE) || null;
  if (input?.analyticalExam?.GMAT !== undefined) mapped.gmat_score = parseInt(input?.analyticalExam?.GMAT) || null;
  if (input?.languageExam?.TOEFL !== undefined) mapped.toefl_score = parseInt(input?.languageExam?.TOEFL) || null;
  if (input?.languageExam?.IELTS !== undefined) mapped.ielts_score = parseInt(input?.languageExam?.IELTS) || null;
  if (input?.analyticalExam?.SAT !== undefined) mapped.sat_score = parseInt(input?.analyticalExam?.SAT) || null;
  if (input?.languageExam?.Duolingo !== undefined) mapped.duolingo_score = parseInt(input?.languageExam?.Duolingo) || null;
  if (input?.analyticalExam?.NMAT !== undefined) mapped.nmat_score = parseInt(input?.analyticalExam?.NMAT) || null;
  if (input?.analyticalExam?.XAT !== undefined) mapped.xat_score = parseInt(input?.analyticalExam?.XAT) || null;
  if (input.other_test_scores !== undefined) mapped.other_test_scores = parseInt(input.other_test_scores) || null;
  if (input.targetDegreeLevel !== undefined) mapped.target_degree_level = input.targetDegreeLevel ? targetDegreeLevelMap[input.targetDegreeLevel] : null;
  if (input.target_course_major !== undefined) mapped.target_course_major = input.target_course_major || null;
  if (input.studyDestination !== undefined) mapped.preferred_study_destination = input.studyDestination ? preferredStudyDestinationMap[input.studyDestination] : null;
  if (input.target_universities !== undefined) mapped.target_universities = input.target_universities || null;
  if (input.intended_start_term !== undefined) mapped.intended_start_term = input.intended_start_term ? intendedStartTermMap[input.intended_start_term] : null;
  if (input.intended_start_date !== undefined) mapped.intended_start_date = input.intended_start_date || null;
  if (input.intakeMonth !== undefined) mapped.intake_month = input.intakeMonth || null;
  if (input.intakeYear !== undefined) mapped.intake_year = input.intakeYear || null;

  // ===== APPLICATION JOURNEY FIELDS =====
  if (input.assigned_counselor !== undefined) mapped.assigned_counselor = input.assigned_counselor || null;
  if (input.counselor_notes !== undefined) mapped.counselor_notes = input.counselor_notes || null;
  if (input.current_status_disposition !== undefined) mapped.current_status_disposition = input.current_status_disposition ? currentStatusDispositionMap[input.current_status_disposition] : null;
  if (input.current_status_disposition_reason !== undefined) mapped.current_status_disposition_reason = input.current_status_disposition_reason ? statusDispositionReasonMap[input.current_status_disposition_reason] : null;
  if (input.priority_level !== undefined) mapped.priority_level = input.priority_level ? priorityLevelMap[input.priority_level] : null;
  if (input.first_contact_date !== undefined) mapped.first_contact_date = input.first_contact_date || null;
  if (input.last_contact_date !== undefined) mapped.last_contact_date = input.last_contact_date || null;
  if (input.follow_up_date !== undefined) mapped.follow_up_date = input.follow_up_date || null;
  if (input.next_follow_up_date !== undefined) mapped.next_follow_up_date = input.next_follow_up_date || null;

  // ===== FINANCIAL INFO FIELDS =====
  if (input.annual_family_income !== undefined) mapped.annual_family_income = input.annual_family_income || null;
  if (input.currency !== undefined) mapped.currency = input.currency ? financialCurrencyMap[input.currency] : null;
  if (input.co_applicant_1_name !== undefined) mapped.co_applicant_1_name = input.co_applicant_1_name || null;
  if (input.coApplicantAnnualIncome !== undefined) mapped.co_applicant_1_income = coApplicantAnnualIncome || null;
  if (input.coApplicantIncomeType !== undefined) mapped.co_applicant_1_occupation = input.coApplicantIncomeType ? coApplicantOccupationMap[input.coApplicantIncomeType] : null;
  if (input.coApplicant !== undefined) mapped.co_applicant_1_relationship = input.coApplicant ? coApplicantRelationshipMap[input.coApplicant] : null;
  if (input.co_applicant_2_name !== undefined) mapped.co_applicant_2_name = input.co_applicant_2_name || null;
  if (input.co_applicant_2_income !== undefined) mapped.co_applicant_2_income = input.co_applicant_2_income || null;
  if (input.co_applicant_2_occupation !== undefined) mapped.co_applicant_2_occupation = input.co_applicant_2_occupation ? coApplicantOccupationMap[input.co_applicant_2_occupation] : null;
  if (input.co_applicant_2_relationship !== undefined) mapped.co_applicant_2_relationship = input.co_applicant_2_relationship ? coApplicantRelationshipMap[input.co_applicant_2_relationship] : null;
  if (input.co_applicant_3_name !== undefined) mapped.co_applicant_3_name = input.co_applicant_3_name || null;
  if (input.co_applicant_3_income !== undefined) mapped.co_applicant_3_income = input.co_applicant_3_income || null;
  if (input.co_applicant_3_occupation !== undefined) mapped.co_applicant_3_occupation = input.co_applicant_3_occupation ? coApplicantOccupationMap[input.co_applicant_3_occupation] : null;
  if (input.co_applicant_3_relationship !== undefined) mapped.co_applicant_3_relationship = input.co_applicant_3_relationship ? coApplicantRelationshipMap[input.co_applicant_3_relationship] : null;
  if (input.collateral_available !== undefined) mapped.collateral_available = input.collateral_available ? collateralAvailableMap[input.collateral_available] : null;
  if (input.collateral_type !== undefined) mapped.collateral_type = input.collateral_type ? collateralTypeMap[input.collateral_type] : null;
  if (input.collateral_value !== undefined) mapped.collateral_value = input.collateral_value || null;
  if (input.collateral_2_available !== undefined) mapped.collateral_2_available = input.collateral_2_available ? collateralAvailableMap[input.collateral_2_available] : null;
  if (input.collateral_2_type !== undefined) mapped.collateral_2_type = input.collateral_2_type ? collateralTypeMap[input.collateral_2_type] : null;
  if (input.collateral_2_value !== undefined) mapped.collateral_2_value = input.collateral_2_value || null;
  if (input.living_expenses !== undefined) mapped.living_expenses = input.living_expenses || null;
  if (input.other_expenses !== undefined) mapped.other_expenses = input.other_expenses || null;
  if (input.total_course_cost !== undefined) mapped.total_course_cost = input.total_course_cost || null;
  if (input.tuition_fee !== undefined) mapped.tuition_fee = input.tuition_fee || null;
  if (loanAmount !== undefined) mapped.loan_amount_required = loanAmount || input?.loanAmount || null;
  if (input.scholarship_amount !== undefined) mapped.scholarship_amount = input.scholarship_amount || null;
  if (input.self_funding_amount !== undefined) mapped.self_funding_amount = input.self_funding_amount || null;

  // ===== LEAD ATTRIBUTION FIELDS =====
  if (input.lead_source !== undefined) mapped.lead_source = input.lead_source ? leadSourceMap[input.lead_source] : null;
  if (input.lead_source_detail !== undefined) mapped.lead_source_detail = input.lead_source_detail || null;
  if (input.lead_quality_score !== undefined) mapped.lead_quality_score = input.lead_quality_score || null;
  if (input.lead_reference_code !== undefined) mapped.lead_reference_code = input.lead_reference_code || null;
  if (input.b2b_partner_name !== undefined) mapped.b2b_partner_name = input.b2b_partner_name || null;
  if (input.partner_commission_applicable !== undefined) mapped.partner_commission_applicable = input.partner_commission_applicable ? partnerCommissionApplicableMap[input.partner_commission_applicable] : null;
  if (input.referral_person_name !== undefined) mapped.referral_person_name = input.referral_person_name || null;
  if (input.referral_person_contact !== undefined) mapped.referral_person_contact = input.referral_person_contact || null;
  if (input.utm_source !== undefined) mapped.utm_source = input.utm_source || null;
  if (input.utm_medium !== undefined) mapped.utm_medium = input.utm_medium || null;
  if (input.utm_campaign !== undefined) mapped.utm_campaign = input.utm_campaign || null;
  if (input.utm_term !== undefined) mapped.utm_term = input.utm_term || null;
  if (input.utm_content !== undefined) mapped.utm_content = input.utm_content || null;

  // ===== LOAN PREFERENCES FIELDS =====
  if (input.loanPreference !== undefined) mapped.loan_type_preference = input.loanPreference ? LoanTypePreferenceMap[input.loanPreference] : null;
  if (input.preferred_lenders !== undefined) mapped.preferred_lenders = input.preferred_lenders || null;
  if (input.repayment_type_preference !== undefined) mapped.repayment_type_preference = input.repayment_type_preference ? repaymentTypePreferenceMap[input.repayment_type_preference] : null;

  // ===== SYSTEM TRACKING FIELDS =====
  if (input.created_by !== undefined) mapped.created_by = input.created_by || null;
  if (input.created_date !== undefined) mapped.created_date = input.created_date || null;
  if (input.last_modified_by !== undefined) mapped.last_modified_by = input.last_modified_by || null;
  if (input.last_modified_date !== undefined) mapped.last_modified_date = input.last_modified_date || null;
  if (input.data_source !== undefined) mapped.data_source = input.data_source ? dataSourceMap[input.data_source] : null;
  if (input.student_record_status !== undefined) mapped.student_record_status = input.student_record_status ? studentRecordStatusMap[input.student_record_status] : null;
  if (input.tags !== undefined) mapped.tags = input.tags || null;
  if (input.gdpr_consent !== undefined) mapped.gdpr_consent = input.gdpr_consent ? gdprConsentMap[input.gdpr_consent] : null;
  if (input.marketing_consent !== undefined) mapped.marketing_consent = input.marketing_consent ? marketingConsentMap[input.marketing_consent] : null;

  return mapped;
};