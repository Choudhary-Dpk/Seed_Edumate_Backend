import { convertCurrency } from "../../services/loan.service";
import { ContactsLead } from "../../types/contact.types";
import { enumMappingService } from "../enumMapping";

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
    created_by: String(data.created_by),
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
  input: ContactsLead
): Promise<Partial<ContactsLead>> => {
  const mapped: Record<string, any> = {};
  // Currency conversions
  const loanAmount =
    input?.selectedLoanCurrency &&
    input?.selectedLoanCurrency != "INR" &&
    input?.loanAmount
      ? await convertCurrency(
          Number(input?.loanAmount) || 0,
          input?.selectedLoanCurrency || "INR",
          "INR"
        )
      : input?.loanAmount;

  const coApplicantAnnualIncome =
    input?.baseCurrency != "INR" && input?.coApplicantAnnualIncome
      ? await convertCurrency(
          Number(input?.coApplicantAnnualIncome),
          input?.baseCurrency || "INR",
          "INR"
        )
      : input?.coApplicantAnnualIncome;

  // ===== MAIN CONTACT FIELDS =====

  if (input.favourite !== undefined) {
    mapped.favourite = Array.isArray(input.favourite)
      ? input.favourite.filter(
          (id: any) => typeof id === "number" && !isNaN(id)
        )
      : [];
  }

  if (input.interested !== undefined) {
    mapped.interested = Array.isArray(input.interested)
      ? input.interested.filter(
          (id: any) => typeof id === "number" && !isNaN(id)
        )
      : [];
  }

  if (input.source !== undefined)
    mapped.source =
      input.source !== null && input.source !== "" ? input.source : null;

  if (input.hs_b2b_partner_id !== undefined)
    mapped.hs_b2b_partner_id =
      input.hs_b2b_partner_id !== null && input.hs_b2b_partner_id !== ""
        ? input.hs_b2b_partner_id
        : null;

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

  // ===== NEW: ADDITIONAL HUBSPOT SYSTEM FIELDS =====
  if (
    input.hsMergedObjectIds !== undefined ||
    input.hs_merged_object_ids !== undefined
  ) {
    mapped.hs_merged_object_ids =
      input.hsMergedObjectIds ?? input.hs_merged_object_ids ?? null;
  }

  if (input.hsObjectId !== undefined || input.hs_object_id !== undefined) {
    mapped.hs_object_id = input.hsObjectId ?? input.hs_object_id ?? null;
  }

  if (
    input.hsObjectSourceDetail1 !== undefined ||
    input.hs_object_source_detail_1 !== undefined
  ) {
    mapped.hs_object_source_detail_1 =
      input.hsObjectSourceDetail1 ?? input.hs_object_source_detail_1 ?? null;
  }

  if (
    input.hsObjectSourceDetail2 !== undefined ||
    input.hs_object_source_detail_2 !== undefined
  ) {
    mapped.hs_object_source_detail_2 =
      input.hsObjectSourceDetail2 ?? input.hs_object_source_detail_2 ?? null;
  }

  if (
    input.hsObjectSourceDetail3 !== undefined ||
    input.hs_object_source_detail_3 !== undefined
  ) {
    mapped.hs_object_source_detail_3 =
      input.hsObjectSourceDetail3 ?? input.hs_object_source_detail_3 ?? null;
  }

  if (
    input.hsObjectSourceLabel !== undefined ||
    input.hs_object_source_label !== undefined
  ) {
    mapped.hs_object_source_label =
      input.hsObjectSourceLabel ?? input.hs_object_source_label ?? null;
  }

  if (
    input.hsSharedTeamIds !== undefined ||
    input.hs_shared_team_ids !== undefined
  ) {
    mapped.hs_shared_team_ids =
      input.hsSharedTeamIds ?? input.hs_shared_team_ids ?? null;
  }

  if (
    input.hsSharedUserIds !== undefined ||
    input.hs_shared_user_ids !== undefined
  ) {
    mapped.hs_shared_user_ids =
      input.hsSharedUserIds ?? input.hs_shared_user_ids ?? null;
  }

  if (
    input.hsUpdatedByUserId !== undefined ||
    input.hs_updated_by_user_id !== undefined
  ) {
    mapped.hs_updated_by_user_id =
      input.hsUpdatedByUserId ?? input.hs_updated_by_user_id ?? null;
  }

  if (
    input.hubspotOwnerAssigneddate !== undefined ||
    input.hubspot_owner_assigneddate !== undefined
  ) {
    const assignedDate =
      input.hubspotOwnerAssigneddate ?? input.hubspot_owner_assigneddate;
    mapped.hubspot_owner_assigneddate = parseDate(assignedDate);
  }

  if (
    input.hubspotOwnerId !== undefined ||
    input.hubspot_owner_id !== undefined
  ) {
    mapped.hubspot_owner_id =
      input.hubspotOwnerId ?? input.hubspot_owner_id ?? null;
  }

  if (
    input.hubspotTeamId !== undefined ||
    input.hubspot_team_id !== undefined
  ) {
    mapped.hubspot_team_id =
      input.hubspotTeamId ?? input.hubspot_team_id ?? null;
  }

  if (input.seed_contact !== undefined) {
    mapped.seed_contact = input.seed_contact;
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

  // ===== NEW: AUDIT FIELD - DELETED_ON =====
  if (input.deletedOn !== undefined || input.deleted_on !== undefined) {
    const deletedDate = input.deletedOn ?? input.deleted_on;
    mapped.deleted_on = parseDate(deletedDate);
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

  if (
    input.phoneNumber !== undefined ||
    input.phone !== undefined ||
    input.phone_number !== undefined
  ) {
    mapped.phone_number =
      input.phoneNumber ?? input.phone ?? input.phone_number ?? null;
  }

  if (input.dateOfBirth !== undefined || input.date_of_birth !== undefined) {
    const dob = input.dateOfBirth ?? input.date_of_birth;
    mapped.date_of_birth = dob;
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
    mapped.cat_score = Number(input.analyticalExam.CAT) || null;
  }
  if (input?.analyticalExam?.GRE !== undefined) {
    mapped.gre_score = Number(input.analyticalExam.GRE) || null;
  }
  if (input?.analyticalExam?.GMAT !== undefined) {
    mapped.gmat_score = Number(input.analyticalExam.GMAT) || null;
  }
  if (input?.analyticalExam?.SAT !== undefined) {
    mapped.sat_score = Number(input.analyticalExam.SAT) || null;
  }
  if (input?.analyticalExam?.NMAT !== undefined) {
    mapped.nmat_score = Number(input.analyticalExam.NMAT) || null;
  }
  if (input?.analyticalExam?.XAT !== undefined) {
    mapped.xat_score = Number(input.analyticalExam.XAT) || null;
  }

  // Language exams
  if (input?.languageExam?.TOEFL !== undefined) {
    mapped.toefl_score = Number(input.languageExam.TOEFL) || null;
  }
  if (input?.languageExam?.IELTS !== undefined) {
    mapped.ielts_score = Number(input.languageExam.IELTS) || null;
  }
  if (input?.languageExam?.Duolingo !== undefined) {
    mapped.duolingo_score = Number(input.languageExam.Duolingo) || null;
  }

  if (
    input.otherTestScores !== undefined ||
    input.other_test_scores !== undefined
  ) {
    mapped.other_test_scores =
      Number(input.otherTestScores ?? input.other_test_scores) || null;
  }

  if (
    input.targetCourseMajor !== undefined ||
    input.target_course_major !== undefined
  ) {
    mapped.target_course_major =
      input.targetCourseMajor ?? input.target_course_major ?? null;
  }

  if (
    input.targetUniversities !== undefined ||
    input.target_universities !== undefined
  ) {
    mapped.target_universities =
      input.targetUniversities ?? input.target_universities ?? null;
  }

  if (
    input.intendedStartDate !== undefined ||
    input.intended_start_date !== undefined
  ) {
    const startDate = input.intendedStartDate ?? input.intended_start_date;
    (mapped.intended_start_date = startDate), true; // date only
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
    input.firstContactDate !== undefined ||
    input.first_contact_date !== undefined
  ) {
    const firstContact = input.firstContactDate ?? input.first_contact_date;
    mapped.first_contact_date = parseDate(firstContact, false);
  }

  if (
    input.lastContactDate !== undefined ||
    input.last_contact_date !== undefined
  ) {
    const lastContact = input.lastContactDate ?? input.last_contact_date;
    mapped.last_contact_date = parseDate(lastContact, false);
  }

  if (input.followUpDate !== undefined || input.follow_up_date !== undefined) {
    const followUp = input.followUpDate ?? input.follow_up_date;
    mapped.follow_up_date = parseDate(followUp, false);
  }

  if (
    input.nextFollowUpDate !== undefined ||
    input.next_follow_up_date !== undefined
  ) {
    const nextFollowUp = input.nextFollowUpDate ?? input.next_follow_up_date;
    mapped.next_follow_up_date = parseDate(nextFollowUp, false);
  }

  // ===== FINANCIAL INFO FIELDS =====
  if (
    input.annualFamilyIncome !== undefined ||
    input.annual_family_income !== undefined
  ) {
    mapped.annual_family_income =
      input.annualFamilyIncome ?? input.annual_family_income ?? null;
  }

  if (
    input.coApplicant1Name !== undefined ||
    input.co_applicant_1_name !== undefined
  ) {
    mapped.co_applicant_1_name =
      input.coApplicant1Name ?? input.co_applicant_1_name ?? null;
  }

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
    input.collateralValue !== undefined ||
    input.collateral_value !== undefined
  ) {
    mapped.collateral_value =
      input.collateralValue ?? input.collateral_value ?? null;
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
    input.preferredLenders !== undefined ||
    input.preferred_lenders !== undefined
  ) {
    mapped.preferred_lenders =
      input.preferredLenders ?? input.preferred_lenders ?? null;
  }

  // ===== SYSTEM TRACKING FIELDS =====
  if (input.createdBy !== undefined || input.created_by !== undefined) {
    mapped.created_by = input.createdBy ?? input.created_by ?? null;
  }

  if (input.createdDate !== undefined || input.created_date !== undefined) {
    const created = input.createdDate ?? input.created_date;
    mapped.created_date = parseDate(created); // full ISO-8601
  }

  // ===== NEW: SYSTEM TRACKING created_by_user (String field) =====
  if (
    input.createdByUser !== undefined ||
    input.created_by_user !== undefined
  ) {
    mapped.created_by_user =
      input.createdByUser ?? input.created_by_user ?? null;
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

  if (input.tags !== undefined) {
    mapped.tags = input.tags ?? null;
  }

  // ===== ENUM TRANSLATIONS COLLECTION =====
  const enumTranslations = [];

  // 1. Admission Status
  if (
    input.admissionStatus !== undefined ||
    input.admission_status !== undefined
  ) {
    const status = input.admissionStatus ?? input.admission_status;
    if (status !== null && status !== "" && status !== undefined) {
      enumTranslations.push({
        field: "admission_status",
        enumName: "admissionStatus",
        sourceValue: status,
      });
    }
  }

  // 2. Current Education Level
  if (
    input.levelOfEducation !== undefined ||
    input.educationLevel !== undefined ||
    input.current_education_level !== undefined
  ) {
    const level =
      input.levelOfEducation ??
      input.educationLevel ??
      input.current_education_level;
    if (level !== null && level !== "" && level !== undefined) {
      enumTranslations.push({
        field: "current_education_level",
        enumName: "currentEducationLevel",
        sourceValue: level,
      });
    }
  }

  // 3. Intended Start Term
  if (
    input.intendedStartTerm !== undefined ||
    input.intended_start_term !== undefined
  ) {
    const term = input.intendedStartTerm ?? input.intended_start_term;
    if (term !== null && term !== "" && term !== undefined) {
      enumTranslations.push({
        field: "intended_start_term",
        enumName: "intendedStartTerm",
        sourceValue: term,
      });
    }
  }

  // 4. Preferred Study Destination
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
    if (
      destination !== null &&
      destination !== "" &&
      destination !== undefined
    ) {
      enumTranslations.push({
        field: "preferred_study_destination",
        enumName: "preferredStudyDestination",
        sourceValue: destination,
      });
    }
  }

  // 5. Target Degree Level
if (
  input.targetDegreeLevel !== undefined ||
  input.target_degree_level !== undefined ||
  input.levelOfEducation !== undefined ||
  input.studyLevel !== undefined ||
  input.study_level !== undefined
) {
  // Check all possible field names and use the first valid value
  const degree =
    input.targetDegreeLevel ??
    input.target_degree_level ??
    input.levelOfEducation??
    input.studyLevel ??
    input.study_level;

  if (degree !== null && degree !== "" && degree !== undefined) {
    enumTranslations.push({
      field: "target_degree_level",
      enumName: "targetDegreeLevel",
      sourceValue: degree,
    });
  }
}

  // 6. Current Status Disposition
  if (
    input.currentStatusDisposition !== undefined ||
    input.current_status_disposition !== undefined
  ) {
    const disp =
      input.currentStatusDisposition ?? input.current_status_disposition;
    if (disp !== null && disp !== "" && disp !== undefined) {
      enumTranslations.push({
        field: "current_status_disposition",
        enumName: "currentStatusDisposition",
        sourceValue: disp,
      });
    }
  }

  // 7. Current Status Disposition Reason
  if (
    input.currentStatusDispositionReason !== undefined ||
    input.current_status_disposition_reason !== undefined
  ) {
    const reason =
      input.currentStatusDispositionReason ??
      input.current_status_disposition_reason;
    if (reason !== null && reason !== "" && reason !== undefined) {
      enumTranslations.push({
        field: "current_status_disposition_reason",
        enumName: "currentStatusDispositionReason",
        sourceValue: reason,
      });
    }
  }

  // 8. Priority Level
  if (input.priorityLevel !== undefined || input.priority_level !== undefined) {
    const priority = input.priorityLevel ?? input.priority_level;
    if (priority !== null && priority !== "" && priority !== undefined) {
      enumTranslations.push({
        field: "priority_level",
        enumName: "priorityLevel",
        sourceValue: priority,
      });
    }
  }

  // 9. Course Type
  if (input.courseType !== undefined || input.course_type !== undefined) {
    const type = input.courseType ?? input.course_type;
    if (type !== null && type !== "" && type !== undefined) {
      enumTranslations.push({
        field: "course_type",
        enumName: "courseType",
        sourceValue: type,
      });
    }
  }

  // 10. Gender
  if (input.gender !== undefined) {
    if (
      input.gender !== null &&
      input.gender !== "" &&
      input.gender !== undefined
    ) {
      enumTranslations.push({
        field: "gender",
        enumName: "gender",
        sourceValue: input.gender,
      });
    }
  }

  // 11. Currency
  if (input.currency !== undefined) {
    if (
      input.currency !== null &&
      input.currency !== "" &&
      input.currency !== undefined
    ) {
      enumTranslations.push({
        field: "currency",
        enumName: "currency",
        sourceValue: input.currency,
      });
    }
  }

  // 12. Co-applicant 1 Occupation
  if (
    input.coApplicantIncomeType !== undefined ||
    input.co_applicant_1_occupation !== undefined
  ) {
    const occ = input.coApplicantIncomeType ?? input.co_applicant_1_occupation;
    if (occ !== null && occ !== "" && occ !== undefined) {
      enumTranslations.push({
        field: "co_applicant_1_occupation",
        enumName: "coApplicant1Occupation",
        sourceValue: occ,
      });
    }
  }

  // 13. Co-applicant 1 Relationship
  if (
    input.coApplicant !== undefined ||
    input.co_applicant_1_relationship !== undefined
  ) {
    const rel = input.coApplicant ?? input.co_applicant_1_relationship;
    if (rel !== null && rel !== "" && rel !== undefined) {
      enumTranslations.push({
        field: "co_applicant_1_relationship",
        enumName: "coApplicant1Relationship",
        sourceValue: rel,
      });
    }
  }

  // 14. Co-applicant 2 Occupation
  if (
    input.coApplicant2Occupation !== undefined ||
    input.co_applicant_2_occupation !== undefined
  ) {
    const occ = input.coApplicant2Occupation ?? input.co_applicant_2_occupation;
    if (occ !== null && occ !== "" && occ !== undefined) {
      enumTranslations.push({
        field: "co_applicant_2_occupation",
        enumName: "coApplicant2Occupation",
        sourceValue: occ,
      });
    }
  }

  // 15. Co-applicant 2 Relationship
  if (
    input.coApplicant2Relationship !== undefined ||
    input.co_applicant_2_relationship !== undefined
  ) {
    const rel =
      input.coApplicant2Relationship ?? input.co_applicant_2_relationship;
    if (rel !== null && rel !== "" && rel !== undefined) {
      enumTranslations.push({
        field: "co_applicant_2_relationship",
        enumName: "coApplicant2Relationship",
        sourceValue: rel,
      });
    }
  }

  // 16. Co-applicant 3 Occupation
  if (
    input.coApplicant3Occupation !== undefined ||
    input.co_applicant_3_occupation !== undefined
  ) {
    const occ = input.coApplicant3Occupation ?? input.co_applicant_3_occupation;
    if (occ !== null && occ !== "" && occ !== undefined) {
      enumTranslations.push({
        field: "co_applicant_3_occupation",
        enumName: "coApplicant3Occupation",
        sourceValue: occ,
      });
    }
  }

  // 17. Co-applicant 3 Relationship
  if (
    input.coApplicant3Relationship !== undefined ||
    input.co_applicant_3_relationship !== undefined
  ) {
    const rel =
      input.coApplicant3Relationship ?? input.co_applicant_3_relationship;
    if (rel !== null && rel !== "" && rel !== undefined) {
      enumTranslations.push({
        field: "co_applicant_3_relationship",
        enumName: "coApplicant3Relationship",
        sourceValue: rel,
      });
    }
  }

  // 18. Collateral Available
  if (
    input.collateralAvailable !== undefined ||
    input.collateral_available !== undefined
  ) {
    const val = input.collateralAvailable ?? input.collateral_available;
    if (val !== null && val !== "" && val !== undefined) {
      enumTranslations.push({
        field: "collateral_available",
        enumName: "collateralAvailable",
        sourceValue: val,
      });
    }
  }

  // 19. Collateral Type
  if (
    input.collateralType !== undefined ||
    input.collateral_type !== undefined
  ) {
    const type = input.collateralType ?? input.collateral_type;
    if (type !== null && type !== "" && type !== undefined) {
      enumTranslations.push({
        field: "collateral_type",
        enumName: "collateralType",
        sourceValue: type,
      });
    }
  }

  // 20. Collateral 2 Available
  if (
    input.collateral2Available !== undefined ||
    input.collateral_2_available !== undefined
  ) {
    const val = input.collateral2Available ?? input.collateral_2_available;
    if (val !== null && val !== "" && val !== undefined) {
      enumTranslations.push({
        field: "collateral_2_available",
        enumName: "collateral2Available",
        sourceValue: val,
      });
    }
  }

  // 21. Collateral 2 Type
  if (
    input.collateral2Type !== undefined ||
    input.collateral_2_type !== undefined
  ) {
    const type = input.collateral2Type ?? input.collateral_2_type;
    if (type !== null && type !== "" && type !== undefined) {
      enumTranslations.push({
        field: "collateral_2_type",
        enumName: "collateral2Type",
        sourceValue: type,
      });
    }
  }

  // 22. Lead Source
  if (input.leadSource !== undefined || input.lead_source !== undefined) {
    const src = input.leadSource ?? input.lead_source;
    if (src !== null && src !== "" && src !== undefined) {
      enumTranslations.push({
        field: "lead_source",
        enumName: "leadSource",
        sourceValue: src,
      });
    }
  }

  // 23. Partner Commission Applicable
  if (
    input.partnerCommissionApplicable !== undefined ||
    input.partner_commission_applicable !== undefined
  ) {
    const val =
      input.partnerCommissionApplicable ?? input.partner_commission_applicable;
    if (val !== null && val !== "" && val !== undefined) {
      enumTranslations.push({
        field: "partner_commission_applicable",
        enumName: "partnerCommissionApplicable",
        sourceValue: val,
      });
    }
  }

  // 24. Loan Type Preference
  if (
    input.loanPreference !== undefined ||
    input.loan_type_preference !== undefined
  ) {
    const pref = input.loanPreference ?? input.loan_type_preference;
    if (pref !== null && pref !== "" && pref !== undefined) {
      enumTranslations.push({
        field: "loan_type_preference",
        enumName: "loanTypePreference",
        sourceValue: pref,
      });
    }
  }

  // 25. Repayment Type Preference
  if (
    input.repaymentTypePreference !== undefined ||
    input.repayment_type_preference !== undefined
  ) {
    const rep =
      input.repaymentTypePreference ?? input.repayment_type_preference;
    if (rep !== null && rep !== "" && rep !== undefined) {
      enumTranslations.push({
        field: "repayment_type_preference",
        enumName: "repaymentTypePreference",
        sourceValue: rep,
      });
    }
  }

  // 26. Data Source
  if (input.dataSource !== undefined || input.data_source !== undefined) {
    const ds = input.dataSource ?? input.data_source;
    if (ds !== null && ds !== "" && ds !== undefined) {
      enumTranslations.push({
        field: "data_source",
        enumName: "dataSource",
        sourceValue: ds,
      });
    }
  }

  // 27. Student Record Status
  if (
    input.studentRecordStatus !== undefined ||
    input.student_record_status !== undefined
  ) {
    const status = input.studentRecordStatus ?? input.student_record_status;
    if (status !== null && status !== "" && status !== undefined) {
      enumTranslations.push({
        field: "student_record_status",
        enumName: "studentRecordStatus",
        sourceValue: status,
      });
    }
  }

  // 28. GDPR Consent
  if (input.gdprConsent !== undefined || input.gdpr_consent !== undefined) {
    const val = input.gdprConsent ?? input.gdpr_consent;
    if (val !== null && val !== "" && val !== undefined) {
      enumTranslations.push({
        field: "gdpr_consent",
        enumName: "gdprConsent",
        sourceValue: val,
      });
    }
  }

  // 29. Marketing Consent
  if (
    input.marketingConsent !== undefined ||
    input.marketing_consent !== undefined
  ) {
    const val = input.marketingConsent ?? input.marketing_consent;
    if (val !== null && val !== "" && val !== undefined) {
      enumTranslations.push({
        field: "marketing_consent",
        enumName: "marketingConsent",
        sourceValue: val,
      });
    }
  }

  // ===== TRANSLATE ALL ENUMS IN ONE BATCH DATABASE QUERY =====
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
      mapped[translation.field] = translated[key];
    }
  }

  return mapped;
};
