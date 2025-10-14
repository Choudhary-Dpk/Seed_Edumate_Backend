import { convertCurrency } from "../../services/loan.service";
import {
  admissionStatusMap,
  coApplicantOccupationMap,
  coApplicantRelationshipMap,
  collateralAvailableMap,
  collateralTypeMap,
  courseTypeMap,
  currentEducationLevelMap,
  currentStatusDispositionMap,
  dataSourceMap,
  financialCurrencyMap,
  gdprConsentMap,
  genderMap,
  intendedStartTermMap,
  leadSourceMap,
  LoanTypePreferenceMap,
  marketingConsentMap,
  partnerCommissionApplicableMap,
  preferredStudyDestinationMap,
  priorityLevelMap,
  repaymentTypePreferenceMap,
  statusDispositionReasonMap,
  studentRecordStatusMap,
  targetDegreeLevelMap,
} from "../../types/contact.types";

// Helper function to normalize date strings
const parseDate = (
  inputDate?: string | Date | null,
  asDateOnly = false
): string | null => {
  if (!inputDate) return null;
  const dateObj = new Date(inputDate);
  if (isNaN(dateObj.getTime())) return null; // invalid date
  return asDateOnly
    ? dateObj.toISOString().split("T")[0] // YYYY-MM-DD
    : dateObj.toISOString(); // full ISO-8601
};

export const FIELD_MAPPINGS = {
  // Main Contact Table
  mainContact: [
    "deleted_by_id",
    "b2b_partner_id",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
    "base_currency",
    "study_destination_currency",
    "user_selected_currency",
    "course_type",
    "co_applicant_1_email",
    "co_applicant_1_mobile_number",
    "is_deleted",
  ],

  // Personal Information
  personalInformation: [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "date_of_birth",
    "gender",
    "nationality",
    "current_address",
    "city_current_address",
    "state_current_address",
    "country_current_address",
    "pincode_current_address",
    "permanent_address",
    "city_permanent_address",
    "state_permanent_address",
    "country_permanent_address",
    "pincode_permanent_address",
  ],

  // Academic Profile
  academicProfile: [
    "admission_status",
    "current_education_level",
    "current_institution",
    "current_course_major",
    "current_cgpa_percentage",
    "current_graduation_year",
    "course_duration_months",
    "cat_score",
    "gre_score",
    "gmat_score",
    "toefl_score",
    "ielts_score",
    "sat_score",
    "duolingo_score",
    "nmat_score",
    "xat_score",
    "other_test_scores",
    "target_degree_level",
    "target_course_major",
    "preferred_study_destination",
    "target_universities",
    "intended_start_term",
    "intended_start_date",
    "intake_month",
    "intake_year",
  ],

  // Application Journey
  applicationJourney: [
    "assigned_counselor",
    "counselor_notes",
    "current_status_disposition",
    "current_status_disposition_reason",
    "priority_level",
    "first_contact_date",
    "last_contact_date",
    "follow_up_date",
    "next_follow_up_date",
  ],

  // Financial Info
  financialInfo: [
    "annual_family_income",
    "currency",
    "co_applicant_1_name",
    "co_applicant_1_income",
    "co_applicant_1_occupation",
    "co_applicant_1_relationship",
    "co_applicant_2_name",
    "co_applicant_2_income",
    "co_applicant_2_occupation",
    "co_applicant_2_relationship",
    "co_applicant_3_name",
    "co_applicant_3_income",
    "co_applicant_3_occupation",
    "co_applicant_3_relationship",
    "collateral_available",
    "collateral_type",
    "collateral_value",
    "collateral_2_available",
    "collateral_2_type",
    "collateral_2_value",
    "living_expenses",
    "other_expenses",
    "total_course_cost",
    "tuition_fee",
    "loan_amount_required",
    "scholarship_amount",
    "self_funding_amount",
  ],

  // Lead Attribution
  leadAttribution: [
    "lead_source",
    "lead_source_detail",
    "lead_quality_score",
    "lead_reference_code",
    "b2b_partner_id",
    "b2b_partner_name",
    "partner_commission_applicable",
    "referral_person_name",
    "referral_person_contact",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ],

  // Loan Preferences
  loanPreferences: [
    "loan_type_preference",
    "preferred_lenders",
    "repayment_type_preference",
  ],

  // System Tracking
  systemTracking: [
    "created_by",
    "created_date",
    "last_modified_by",
    "last_modified_date",
    "data_source",
    "student_record_status",
    "tags",
    "gdpr_consent",
    "marketing_consent",
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
    current_status_disposition_reason:
      data.current_status_disposition_reason as any,
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

export const mapAllFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // Currency conversions
  const loanAmount =
    input?.selectedLoanCurrency &&
    input?.selectedLoanCurrency != "INR" &&
    input?.loanAmount
      ? await convertCurrency(
          parseInt(input?.loanAmount) || 0,
          input?.selectedLoanCurrency || "INR",
          "INR"
        )
      : input?.loanAmount;

  const coApplicantAnnualIncome =
    input?.baseCurrency != "INR" && input?.coApplicantAnnualIncome
      ? await convertCurrency(
          parseInt(input?.coApplicantAnnualIncome),
          input?.baseCurrency || "INR",
          "INR"
        )
      : input?.coApplicantAnnualIncome;

  // ===== MAIN CONTACT FIELDS =====
  if (input.deletedById !== undefined || input.deleted_by_id !== undefined) {
    mapped.deleted_by_id = input.deletedById ?? input.deleted_by_id ?? null;
  }

  if (input.b2bPartnerId !== undefined || input.b2b_partner_id !== undefined) {
    mapped.b2b_partner_id = input.b2bPartnerId ?? input.b2b_partner_id ?? null;
  }

  if (
    input.hsCreatedByUserId !== undefined ||
    input.hs_created_by_user_id !== undefined
  ) {
    mapped.hs_created_by_user_id =
      input.hsCreatedByUserId ?? input.hs_created_by_user_id ?? null;
  }

  if (input.hsCreatedate !== undefined || input.hs_createdate !== undefined) {
    const hsDate = input.hsCreatedate ?? input.hs_createdate;
    mapped.hs_createdate = parseDate(hsDate);
  }

  if (
    input.hsLastmodifieddate !== undefined ||
    input.hs_lastmodifieddate !== undefined
  ) {
    const hsModified = input.hsLastmodifieddate ?? input.hs_lastmodifieddate;
    mapped.hs_lastmodifieddate = parseDate(hsModified);
  }

  if (input.hsObjectId !== undefined || input.hs_object_id !== undefined) {
    mapped.hs_object_id = input.hsObjectId ?? input.hs_object_id ?? null;
  }

  if (
    input.hsUpdatedByUserId !== undefined ||
    input.hs_updated_by_user_id !== undefined
  ) {
    mapped.hs_updated_by_user_id =
      input.hsUpdatedByUserId ?? input.hs_updated_by_user_id ?? null;
  }

  if (
    input.hubspotOwnerId !== undefined ||
    input.hubspot_owner_id !== undefined
  ) {
    mapped.hubspot_owner_id =
      input.hubspotOwnerId ?? input.hubspot_owner_id ?? null;
  }

  if (input.baseCurrency !== undefined || input.base_currency !== undefined) {
    mapped.base_currency = input.baseCurrency ?? input.base_currency ?? null;
  }

  if (
    input.studyDestinationCurrency !== undefined ||
    input.study_destination_currency !== undefined
  ) {
    mapped.study_destination_currency =
      input.studyDestinationCurrency ??
      input.study_destination_currency ??
      null;
  }

  if (
    input.userSelectedCurrency !== undefined ||
    input.user_selected_currency !== undefined
  ) {
    mapped.user_selected_currency =
      input.userSelectedCurrency ?? input.user_selected_currency ?? null;
  }

  if (input.courseType !== undefined || input.course_type !== undefined) {
    const type = input.courseType ?? input.course_type;
    mapped.course_type = type ? courseTypeMap[type] : null;
  }

  if (
    input.coApplicant1Email !== undefined ||
    input.co_applicant_1_email !== undefined
  ) {
    mapped.co_applicant_1_email =
      input.coApplicant1Email ?? input.co_applicant_1_email ?? null;
  }

  if (
    input.coApplicant1MobileNumber !== undefined ||
    input.co_applicant_1_mobile_number !== undefined
  ) {
    mapped.co_applicant_1_mobile_number =
      input.coApplicant1MobileNumber ??
      input.co_applicant_1_mobile_number ??
      null;
  }

  if (input.isDeleted !== undefined || input.is_deleted !== undefined) {
    mapped.is_deleted = input.isDeleted ?? input.is_deleted ?? null;
  }

  // ===== PERSONAL INFORMATION FIELDS =====
  if (input.firstName !== undefined || input.first_name !== undefined) {
    mapped.first_name = input.firstName ?? input.first_name ?? null;
  }

  if (input.lastName !== undefined || input.last_name !== undefined) {
    mapped.last_name = input.lastName ?? input.last_name ?? null;
  }

  if (input.email !== undefined) {
    mapped.email = input.email ?? null;
  }

  if (input.phoneNumber !== undefined || input.phone_number !== undefined) {
    mapped.phone_number = input.phoneNumber ?? input.phone_number ?? null;
  }

  if (input.dateOfBirth !== undefined || input.date_of_birth !== undefined) {
    const dob = input.dateOfBirth ?? input.date_of_birth;
    mapped.date_of_birth = parseDate(dob);
  }

  if (input.gender !== undefined) {
    mapped.gender = input.gender ? genderMap[input.gender] : null;
  }

  if (input.nationality !== undefined) {
    mapped.nationality = input.nationality ?? null;
  }

  if (
    input.currentAddress !== undefined ||
    input.current_address !== undefined
  ) {
    mapped.current_address =
      input.currentAddress ?? input.current_address ?? null;
  }

  if (
    input.cityCurrentAddress !== undefined ||
    input.city_current_address !== undefined
  ) {
    mapped.city_current_address =
      input.cityCurrentAddress ?? input.city_current_address ?? null;
  }

  if (
    input.stateCurrentAddress !== undefined ||
    input.state_current_address !== undefined
  ) {
    mapped.state_current_address =
      input.stateCurrentAddress ?? input.state_current_address ?? null;
  }

  if (
    input.countryCurrentAddress !== undefined ||
    input.country_current_address !== undefined
  ) {
    mapped.country_current_address =
      input.countryCurrentAddress ?? input.country_current_address ?? null;
  }

  if (
    input.pincodeCurrentAddress !== undefined ||
    input.pincode_current_address !== undefined
  ) {
    mapped.pincode_current_address =
      input.pincodeCurrentAddress ?? input.pincode_current_address ?? null;
  }

  if (
    input.permanentAddress !== undefined ||
    input.permanent_address !== undefined
  ) {
    mapped.permanent_address =
      input.permanentAddress ?? input.permanent_address ?? null;
  }

  if (
    input.cityPermanentAddress !== undefined ||
    input.city_permanent_address !== undefined
  ) {
    mapped.city_permanent_address =
      input.cityPermanentAddress ?? input.city_permanent_address ?? null;
  }

  if (
    input.statePermanentAddress !== undefined ||
    input.state_permanent_address !== undefined
  ) {
    mapped.state_permanent_address =
      input.statePermanentAddress ?? input.state_permanent_address ?? null;
  }

  if (
    input.countryPermanentAddress !== undefined ||
    input.country_permanent_address !== undefined
  ) {
    mapped.country_permanent_address =
      input.countryPermanentAddress ?? input.country_permanent_address ?? null;
  }

  if (
    input.pincodePermanentAddress !== undefined ||
    input.pincode_permanent_address !== undefined
  ) {
    mapped.pincode_permanent_address =
      input.pincodePermanentAddress ?? input.pincode_permanent_address ?? null;
  }

  // ===== ACADEMIC PROFILE FIELDS =====
  if (
    input.admissionStatus !== undefined ||
    input.admission_status !== undefined
  ) {
    const status = input.admissionStatus ?? input.admission_status;
    mapped.admission_status = status ? admissionStatusMap[status] : null;
  }

  if (
    input.levelOfEducation !== undefined ||
    input.current_education_level !== undefined
  ) {
    const level = input.levelOfEducation ?? input.current_education_level;
    mapped.current_education_level = level
      ? currentEducationLevelMap[level]
      : null;
  }

  if (
    input.currentInstitution !== undefined ||
    input.current_institution !== undefined
  ) {
    mapped.current_institution =
      input.currentInstitution ?? input.current_institution ?? null;
  }

  if (
    input.currentCourseMajor !== undefined ||
    input.current_course_major !== undefined
  ) {
    mapped.current_course_major =
      input.currentCourseMajor ?? input.current_course_major ?? null;
  }

  if (
    input.currentCgpaPercentage !== undefined ||
    input.current_cgpa_percentage !== undefined
  ) {
    mapped.current_cgpa_percentage =
      input.currentCgpaPercentage ?? input.current_cgpa_percentage ?? null;
  }

  if (
    input.currentGraduationYear !== undefined ||
    input.current_graduation_year !== undefined
  ) {
    mapped.current_graduation_year =
      input.currentGraduationYear ?? input.current_graduation_year ?? null;
  }

  if (
    input.courseDurationMonths !== undefined ||
    input.course_duration_months !== undefined
  ) {
    mapped.course_duration_months =
      input.courseDurationMonths ?? input.course_duration_months ?? null;
  }

  // Analytical exams
  if (input?.analyticalExam?.CAT !== undefined) {
    mapped.cat_score = parseInt(input.analyticalExam.CAT) || null;
  }
  if (input?.analyticalExam?.GRE !== undefined) {
    mapped.gre_score = parseInt(input.analyticalExam.GRE) || null;
  }
  if (input?.analyticalExam?.GMAT !== undefined) {
    mapped.gmat_score = parseInt(input.analyticalExam.GMAT) || null;
  }
  if (input?.analyticalExam?.SAT !== undefined) {
    mapped.sat_score = parseInt(input.analyticalExam.SAT) || null;
  }
  if (input?.analyticalExam?.NMAT !== undefined) {
    mapped.nmat_score = parseInt(input.analyticalExam.NMAT) || null;
  }
  if (input?.analyticalExam?.XAT !== undefined) {
    mapped.xat_score = parseInt(input.analyticalExam.XAT) || null;
  }

  // Language exams
  if (input?.languageExam?.TOEFL !== undefined) {
    mapped.toefl_score = parseInt(input.languageExam.TOEFL) || null;
  }
  if (input?.languageExam?.IELTS !== undefined) {
    mapped.ielts_score = parseInt(input.languageExam.IELTS) || null;
  }
  if (input?.languageExam?.Duolingo !== undefined) {
    mapped.duolingo_score = parseInt(input.languageExam.Duolingo) || null;
  }

  if (
    input.otherTestScores !== undefined ||
    input.other_test_scores !== undefined
  ) {
    mapped.other_test_scores =
      parseInt(input.otherTestScores ?? input.other_test_scores) || null;
  }

  if (
    input.targetDegreeLevel !== undefined ||
    input.target_degree_level !== undefined
  ) {
    const degree = input.targetDegreeLevel ?? input.target_degree_level;
    mapped.target_degree_level = degree ? targetDegreeLevelMap[degree] : null;
  }

  if (
    input.targetCourseMajor !== undefined ||
    input.target_course_major !== undefined
  ) {
    mapped.target_course_major =
      input.targetCourseMajor ?? input.target_course_major ?? null;
  }

  if (
    input.studyDestination !== undefined ||
    input.countryOfStudy !== undefined ||
    input.preferred_study_destination !== undefined
  ) {
    const destination =
      input.countryOfStudy?.trim() ||
      input.studyDestination?.trim() ||
      input.preferred_study_destination?.trim() ||
      null;

    mapped.preferred_study_destination = destination
      ? preferredStudyDestinationMap[destination] ?? null
      : null;
  }

  if (
    input.targetUniversities !== undefined ||
    input.target_universities !== undefined
  ) {
    mapped.target_universities =
      input.targetUniversities ?? input.target_universities ?? null;
  }

  if (
    input.intendedStartTerm !== undefined ||
    input.intended_start_term !== undefined
  ) {
    const term = input.intendedStartTerm ?? input.intended_start_term;
    mapped.intended_start_term = term ? intendedStartTermMap[term] : null;
  }

  if (
    input.intendedStartDate !== undefined ||
    input.intended_start_date !== undefined
  ) {
    const startDate = input.intendedStartDate ?? input.intended_start_date;
    mapped.intended_start_date = parseDate(startDate, true); // date only
  }

  if (input.intakeMonth !== undefined || input.intake_month !== undefined) {
    mapped.intake_month = input.intakeMonth ?? input.intake_month ?? null;
  }

  if (input.intakeYear !== undefined || input.intake_year !== undefined) {
    mapped.intake_year = input.intakeYear ?? input.intake_year ?? null;
  }

  // ===== APPLICATION JOURNEY FIELDS =====
  if (
    input.assignedCounselor !== undefined ||
    input.assigned_counselor !== undefined
  ) {
    mapped.assigned_counselor =
      input.assignedCounselor ?? input.assigned_counselor ?? null;
  }

  if (
    input.counselorNotes !== undefined ||
    input.counselor_notes !== undefined
  ) {
    mapped.counselor_notes =
      input.counselorNotes ?? input.counselor_notes ?? null;
  }

  if (
    input.currentStatusDisposition !== undefined ||
    input.current_status_disposition !== undefined
  ) {
    const disp =
      input.currentStatusDisposition ?? input.current_status_disposition;
    mapped.current_status_disposition = disp
      ? currentStatusDispositionMap[disp]
      : null;
  }

  if (
    input.currentStatusDispositionReason !== undefined ||
    input.current_status_disposition_reason !== undefined
  ) {
    const reason =
      input.currentStatusDispositionReason ??
      input.current_status_disposition_reason;
    mapped.current_status_disposition_reason = reason
      ? statusDispositionReasonMap[reason]
      : null;
  }

  if (input.priorityLevel !== undefined || input.priority_level !== undefined) {
    const priority = input.priorityLevel ?? input.priority_level;
    mapped.priority_level = priority ? priorityLevelMap[priority] : null;
  }

  if (
    input.firstContactDate !== undefined ||
    input.first_contact_date !== undefined
  ) {
    const firstContact = input.firstContactDate ?? input.first_contact_date;
    mapped.first_contact_date = parseDate(firstContact, true);
  }

  if (
    input.lastContactDate !== undefined ||
    input.last_contact_date !== undefined
  ) {
    const lastContact = input.lastContactDate ?? input.last_contact_date;
    mapped.last_contact_date = parseDate(lastContact, true);
  }

  if (input.followUpDate !== undefined || input.follow_up_date !== undefined) {
    const followUp = input.followUpDate ?? input.follow_up_date;
    mapped.follow_up_date = parseDate(followUp, true);
  }

  if (
    input.nextFollowUpDate !== undefined ||
    input.next_follow_up_date !== undefined
  ) {
    const nextFollowUp = input.nextFollowUpDate ?? input.next_follow_up_date;
    mapped.next_follow_up_date = parseDate(nextFollowUp, true);
  }

  // ===== FINANCIAL INFO FIELDS =====
  if (
    input.annualFamilyIncome !== undefined ||
    input.annual_family_income !== undefined
  ) {
    mapped.annual_family_income =
      input.annualFamilyIncome ?? input.annual_family_income ?? null;
  }

  if (input.currency !== undefined) {
    mapped.currency = input.currency
      ? financialCurrencyMap[input.currency]
      : null;
  }

  if (
    input.coApplicant1Name !== undefined ||
    input.co_applicant_1_name !== undefined
  ) {
    mapped.co_applicant_1_name =
      input.coApplicant1Name ?? input.co_applicant_1_name ?? null;
  }

  // if (
  //   input.coApplicantAnnualIncome !== undefined ||
  //   input.co_applicant_1_income !== undefined
  // ) {
  //   mapped.co_applicant_1_income =
  //     coApplicantAnnualIncome ?? input.co_applicant_1_income ?? null;
  // }

  if (
    input.coApplicantAnnualIncome !== undefined ||
    input.co_applicant_1_income !== undefined
  ) {
    const income =
      coApplicantAnnualIncome ?? input.co_applicant_1_income ?? null;

    mapped.co_applicant_1_income =
      income === "" || income === undefined ? null : income;
  }

  if (
    input.coApplicantIncomeType !== undefined ||
    input.co_applicant_1_occupation !== undefined
  ) {
    const occ = input.coApplicantIncomeType ?? input.co_applicant_1_occupation;
    mapped.co_applicant_1_occupation = occ
      ? coApplicantOccupationMap[occ]
      : null;
  }

  if (
    input.coApplicant !== undefined ||
    input.co_applicant_1_relationship !== undefined
  ) {
    const rel = input.coApplicant ?? input.co_applicant_1_relationship;
    mapped.co_applicant_1_relationship = rel
      ? coApplicantRelationshipMap[rel]
      : null;
  }

  if (
    input.coApplicant2Name !== undefined ||
    input.co_applicant_2_name !== undefined
  ) {
    mapped.co_applicant_2_name =
      input.coApplicant2Name ?? input.co_applicant_2_name ?? null;
  }

  if (
    input.coApplicant2Income !== undefined ||
    input.co_applicant_2_income !== undefined
  ) {
    mapped.co_applicant_2_income =
      input.coApplicant2Income ?? input.co_applicant_2_income ?? null;
  }

  if (
    input.coApplicant2Occupation !== undefined ||
    input.co_applicant_2_occupation !== undefined
  ) {
    const occ = input.coApplicant2Occupation ?? input.co_applicant_2_occupation;
    mapped.co_applicant_2_occupation = occ
      ? coApplicantOccupationMap[occ]
      : null;
  }

  if (
    input.coApplicant2Relationship !== undefined ||
    input.co_applicant_2_relationship !== undefined
  ) {
    const rel =
      input.coApplicant2Relationship ?? input.co_applicant_2_relationship;
    mapped.co_applicant_2_relationship = rel
      ? coApplicantRelationshipMap[rel]
      : null;
  }

  if (
    input.coApplicant3Name !== undefined ||
    input.co_applicant_3_name !== undefined
  ) {
    mapped.co_applicant_3_name =
      input.coApplicant3Name ?? input.co_applicant_3_name ?? null;
  }

  if (
    input.coApplicant3Income !== undefined ||
    input.co_applicant_3_income !== undefined
  ) {
    mapped.co_applicant_3_income =
      input.coApplicant3Income ?? input.co_applicant_3_income ?? null;
  }

  if (
    input.coApplicant3Occupation !== undefined ||
    input.co_applicant_3_occupation !== undefined
  ) {
    const occ = input.coApplicant3Occupation ?? input.co_applicant_3_occupation;
    mapped.co_applicant_3_occupation = occ
      ? coApplicantOccupationMap[occ]
      : null;
  }

  if (
    input.coApplicant3Relationship !== undefined ||
    input.co_applicant_3_relationship !== undefined
  ) {
    const rel =
      input.coApplicant3Relationship ?? input.co_applicant_3_relationship;
    mapped.co_applicant_3_relationship = rel
      ? coApplicantRelationshipMap[rel]
      : null;
  }

  if (
    input.collateralAvailable !== undefined ||
    input.collateral_available !== undefined
  ) {
    const val = input.collateralAvailable ?? input.collateral_available;
    mapped.collateral_available = val ? collateralAvailableMap[val] : null;
  }

  if (
    input.collateralType !== undefined ||
    input.collateral_type !== undefined
  ) {
    const type = input.collateralType ?? input.collateral_type;
    mapped.collateral_type = type ? collateralTypeMap[type] : null;
  }

  if (
    input.collateralValue !== undefined ||
    input.collateral_value !== undefined
  ) {
    mapped.collateral_value =
      input.collateralValue ?? input.collateral_value ?? null;
  }

  if (
    input.collateral2Available !== undefined ||
    input.collateral_2_available !== undefined
  ) {
    const val = input.collateral2Available ?? input.collateral_2_available;
    mapped.collateral_2_available = val ? collateralAvailableMap[val] : null;
  }

  if (
    input.collateral2Type !== undefined ||
    input.collateral_2_type !== undefined
  ) {
    const type = input.collateral2Type ?? input.collateral_2_type;
    mapped.collateral_2_type = type ? collateralTypeMap[type] : null;
  }

  if (
    input.collateral2Value !== undefined ||
    input.collateral_2_value !== undefined
  ) {
    mapped.collateral_2_value =
      input.collateral2Value ?? input.collateral_2_value ?? null;
  }

  if (
    input.livingExpenses !== undefined ||
    input.living_expenses !== undefined
  ) {
    mapped.living_expenses =
      input.livingExpenses ?? input.living_expenses ?? null;
  }

  if (input.otherExpenses !== undefined || input.other_expenses !== undefined) {
    mapped.other_expenses = input.otherExpenses ?? input.other_expenses ?? null;
  }

  if (
    input.totalCourseCost !== undefined ||
    input.total_course_cost !== undefined
  ) {
    mapped.total_course_cost =
      input.totalCourseCost ?? input.total_course_cost ?? null;
  }

  if (input.tuitionFee !== undefined || input.tuition_fee !== undefined) {
    mapped.tuition_fee = input.tuitionFee ?? input.tuition_fee ?? null;
  }

  if (
    input.loanAmount !== undefined ||
    input.loan_amount_required !== undefined
  ) {
    mapped.loan_amount_required =
      loanAmount ?? input.loan_amount_required ?? null;
  }

  if (
    input.scholarshipAmount !== undefined ||
    input.scholarship_amount !== undefined
  ) {
    mapped.scholarship_amount =
      input.scholarshipAmount ?? input.scholarship_amount ?? null;
  }

  if (
    input.selfFundingAmount !== undefined ||
    input.self_funding_amount !== undefined
  ) {
    mapped.self_funding_amount =
      input.selfFundingAmount ?? input.self_funding_amount ?? null;
  }

  // ===== LEAD ATTRIBUTION FIELDS =====
  if (input.leadSource !== undefined || input.lead_source !== undefined) {
    const src = input.leadSource ?? input.lead_source;
    mapped.lead_source = src ? leadSourceMap[src] : null;
  }

  if (
    input.leadSourceDetail !== undefined ||
    input.lead_source_detail !== undefined
  ) {
    mapped.lead_source_detail =
      input.leadSourceDetail ?? input.lead_source_detail ?? null;
  }

  if (
    input.leadQualityScore !== undefined ||
    input.lead_quality_score !== undefined
  ) {
    mapped.lead_quality_score =
      input.leadQualityScore ?? input.lead_quality_score ?? null;
  }

  if (
    input.leadReferenceCode !== undefined ||
    input.lead_reference_code !== undefined
  ) {
    mapped.lead_reference_code =
      input.leadReferenceCode ?? input.lead_reference_code ?? null;
  }

  if (
    input.b2bPartnerName !== undefined ||
    input.b2b_partner_name !== undefined
  ) {
    mapped.b2b_partner_name =
      input.b2bPartnerName ?? input.b2b_partner_name ?? null;
  }

  if (
    input.partnerCommissionApplicable !== undefined ||
    input.partner_commission_applicable !== undefined
  ) {
    const val =
      input.partnerCommissionApplicable ?? input.partner_commission_applicable;
    mapped.partner_commission_applicable = val
      ? partnerCommissionApplicableMap[val]
      : null;
  }

  if (
    input.referralPersonName !== undefined ||
    input.referral_person_name !== undefined
  ) {
    mapped.referral_person_name =
      input.referralPersonName ?? input.referral_person_name ?? null;
  }

  if (
    input.referralPersonContact !== undefined ||
    input.referral_person_contact !== undefined
  ) {
    mapped.referral_person_contact =
      input.referralPersonContact ?? input.referral_person_contact ?? null;
  }

  if (input.utmSource !== undefined || input.utm_source !== undefined) {
    mapped.utm_source = input.utmSource ?? input.utm_source ?? null;
  }

  if (input.utmMedium !== undefined || input.utm_medium !== undefined) {
    mapped.utm_medium = input.utmMedium ?? input.utm_medium ?? null;
  }

  if (input.utmCampaign !== undefined || input.utm_campaign !== undefined) {
    mapped.utm_campaign = input.utmCampaign ?? input.utm_campaign ?? null;
  }

  if (input.utmTerm !== undefined || input.utm_term !== undefined) {
    mapped.utm_term = input.utmTerm ?? input.utm_term ?? null;
  }

  if (input.utmContent !== undefined || input.utm_content !== undefined) {
    mapped.utm_content = input.utmContent ?? input.utm_content ?? null;
  }

  // ===== LOAN PREFERENCES FIELDS =====
  if (
    input.loanPreference !== undefined ||
    input.loan_type_preference !== undefined
  ) {
    const pref = input.loanPreference ?? input.loan_type_preference;
    mapped.loan_type_preference = pref ? LoanTypePreferenceMap[pref] : null;
  }

  if (
    input.preferredLenders !== undefined ||
    input.preferred_lenders !== undefined
  ) {
    mapped.preferred_lenders =
      input.preferredLenders ?? input.preferred_lenders ?? null;
  }

  if (
    input.repaymentTypePreference !== undefined ||
    input.repayment_type_preference !== undefined
  ) {
    const rep =
      input.repaymentTypePreference ?? input.repayment_type_preference;
    mapped.repayment_type_preference = rep
      ? repaymentTypePreferenceMap[rep]
      : null;
  }

  // ===== SYSTEM TRACKING FIELDS =====
  if (input.createdBy !== undefined || input.created_by !== undefined) {
    mapped.created_by = input.createdBy ?? input.created_by ?? null;
  }

  if (input.createdDate !== undefined || input.created_date !== undefined) {
    const created = input.createdDate ?? input.created_date;
    mapped.created_date = parseDate(created); // full ISO-8601
  }

  if (
    input.lastModifiedBy !== undefined ||
    input.last_modified_by !== undefined
  ) {
    mapped.last_modified_by =
      input.lastModifiedBy ?? input.last_modified_by ?? null;
  }

  if (
    input.lastModifiedDate !== undefined ||
    input.last_modified_date !== undefined
  ) {
    const modified = input.lastModifiedDate ?? input.last_modified_date;
    mapped.last_modified_date = parseDate(modified); // full ISO-8601
  }

  if (input.dataSource !== undefined || input.data_source !== undefined) {
    const ds = input.dataSource ?? input.data_source;
    mapped.data_source = ds ? dataSourceMap[ds] : null;
  }

  if (
    input.studentRecordStatus !== undefined ||
    input.student_record_status !== undefined
  ) {
    const status = input.studentRecordStatus ?? input.student_record_status;
    mapped.student_record_status = status
      ? studentRecordStatusMap[status]
      : null;
  }

  if (input.tags !== undefined) {
    mapped.tags = input.tags ?? null;
  }

  if (input.gdprConsent !== undefined || input.gdpr_consent !== undefined) {
    const val = input.gdprConsent ?? input.gdpr_consent;
    mapped.gdpr_consent = val ? gdprConsentMap[val] : null;
  }

  if (
    input.marketingConsent !== undefined ||
    input.marketing_consent !== undefined
  ) {
    const val = input.marketingConsent ?? input.marketing_consent;
    mapped.marketing_consent = val ? marketingConsentMap[val] : null;
  }

  return mapped;
};
