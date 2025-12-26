import {
  AdmissionStatus,
  CollateralAvailable,
  CoApplicantOccupation,
  CoApplicantRelationship,
  CurrentEducationLevel,
  CurrentStatusDisposition,
  DataSource,
  EdumateContactCollateralType,
  EdumateContactCourseType,
  FinancialCurrency,
  GDPRConsent,
  Gender,
  IntendedStartTerm,
  LeadSource,
  LoanTypePreference,
  MarketingConsent,
  PartnerCommissionApplicable,
  PreferredStudyDestination,
  PriorityLevel,
  RepaymentTypePreference,
  StatusDispositionReason,
  StudentRecordStatus,
  TargetDegreeLevel,
} from "@prisma/client";

export type ContactsLead = {
  // ===== MAIN CONTACT FIELDS =====
  favourite?: number[] | [];
  interested?: number[] | [];
  source?: string | null;
  hs_b2b_partner_id?: string | null;
  created_by_user?: string | null;
  createdByUser?: string | null;
  deletedOn?: string | null;
  deleted_on?: string | null;
  hubspot_team_id?: string | null;
  hubspotTeamId?: string | null;
  hubspot_owner_assigneddate?: string | null;
  hubspotOwnerAssigneddate?: string | null;
  hs_shared_user_ids?: string | null;
  hsSharedUserIds?: string | null;
  hs_shared_team_ids?: string | null;
  hsSharedTeamIds?: string | null;
  hs_object_source_label?: string | null;
  hsObjectSourceLabel?: string | null;
  hsObjectSourceDetail3?: string | null;
  hs_object_source_detail_3?: string | null;
  hsObjectSourceDetail2?: string | null;
  hs_object_source_detail_2?: string | null;
  hs_object_source_detail_1?: string | null;
  hsObjectSourceDetail1?: string | null;
  hsMergedObjectIds?: string | null;
  hs_merged_object_ids?: string | null;
  seed_contact?: string | null;
  email?: string | null;
  phone_number?: string | null;
  phoneNumber?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;

  deleted_by_id?: number | string | null;
  deletedById?: number | string | null;

  b2b_partner_id?: string | null;
  b2bPartnerId?: string | null;

  hs_created_by_user_id?: string | null;
  hsCreatedByUserId?: string | null;

  hs_createdate?: string | Date | null;
  hsCreatedate?: string | Date | null;

  hs_lastmodifieddate?: string | Date | null;
  hsLastmodifieddate?: string | Date | null;

  hs_object_id?: string | null;
  hsObjectId?: string | null;

  hs_updated_by_user_id?: string | null;
  hsUpdatedByUserId?: string | null;

  hubspot_owner_id?: string | null;
  hubspotOwnerId?: string | null;

  base_currency?: string | null;
  baseCurrency?: string | null;

  study_destination_currency?: string | null;
  studyDestinationCurrency?: string | null;

  user_selected_currency?: string | null;
  userSelectedCurrency?: string | null;

  preferred_currency?: string | null;
  preferredCurrency?: string | null;

  course_type?: string | null;
  courseType?: string | null;

  co_applicant_1_email?: string | null;
  coApplicant1Email?: string | null;

  co_applicant_1_mobile_number?: string | null;
  coApplicant1MobileNumber?: string | null;

  is_deleted?: boolean | null;
  isDeleted?: boolean | null;

  // ===== PERSONAL INFORMATION =====
  date_of_birth?: Date | null;
  dateOfBirth?: Date | null;

  gender?: string | null;

  nationality?: string | null;

  current_address?: string | null;
  currentAddress?: string | null;

  city_current_address?: string | null;
  cityCurrentAddress?: string | null;

  state_current_address?: string | null;
  stateCurrentAddress?: string | null;

  country_current_address?: string | null;
  countryCurrentAddress?: string | null;

  pincode_current_address?: string | null;
  pincodeCurrentAddress?: string | null;

  permanent_address?: string | null;
  permanentAddress?: string | null;

  city_permanent_address?: string | null;
  cityPermanentAddress?: string | null;

  state_permanent_address?: string | null;
  statePermanentAddress?: string | null;

  country_permanent_address?: string | null;
  countryPermanentAddress?: string | null;

  pincode_permanent_address?: string | null;
  pincodePermanentAddress?: string | null;

  // ===== ACADEMIC PROFILE =====
  admission_status?: string | null;
  admissionStatus?: string | null;

  current_education_level?: string | null;
  levelOfEducation?: string | null;

  current_institution?: string | null;
  currentInstitution?: string | null;

  current_course_major?: string | null;
  currentCourseMajor?: string | null;

  current_cgpa_percentage?: string | number | null;
  currentCgpaPercentage?: string | number | null;

  current_graduation_year?: string | number | null;
  currentGraduationYear?: string | number | null;

  course_duration_months?: number | null;
  courseDurationMonths?: number | null;

  // Analytical Exams (nested object)
  analyticalExam?: {
    CAT?: string | number;
    GRE?: string | number;
    GMAT?: string | number;
    SAT?: string | number;
    NMAT?: string | number;
    XAT?: string | number;
  };

  // Analytical Exam Scores (flat)
  cat_score?: number | null;
  gre_score?: number | null;
  gmat_score?: number | null;
  sat_score?: number | null;
  nmat_score?: number | null;
  xat_score?: number | null;

  // Language Exams (nested object)
  languageExam?: {
    TOEFL?: string | number;
    IELTS?: string | number;
    Duolingo?: string | number;
  };

  // Language Exam Scores (flat)
  toefl_score?: number | null;
  ielts_score?: number | null;
  duolingo_score?: number | null;

  other_test_scores?: number | null;
  otherTestScores?: number | null;

  // Target Education
  study_level?: string | null;
  studyLevel?: string | null;
  target_degree_level?: string | null;
  targetDegreeLevel?: string | null;

  target_course_major?: string | null;
  targetCourseMajor?: string | null;

  preferred_study_destination?: string | null;
  countryOfStudy?: string;
  studyDestination?: string | null;

  target_universities?: string | null;
  targetUniversities?: string | null;

  intended_start_term?: string | null;
  intendedStartTerm?: string | null;

  intended_start_date?: string | Date | null;
  intendedStartDate?: string | Date | null;

  intake_month?: string | null;
  intakeMonth?: string | null;

  intake_year?: string | number | null;
  intakeYear?: string | number | null;

  // ===== APPLICATION JOURNEY =====
  assigned_counselor?: string | null;
  assignedCounselor?: string | null;

  counselor_notes?: string | null;
  counselorNotes?: string | null;

  current_status_disposition?: string | null;
  currentStatusDisposition?: string | null;

  current_status_disposition_reason?: string | null;
  currentStatusDispositionReason?: string | null;

  priority_level?: string | null;
  priorityLevel?: string | null;

  first_contact_date?: string | Date | null;
  firstContactDate?: string | Date | null;

  last_contact_date?: string | Date | null;
  lastContactDate?: string | Date | null;

  follow_up_date?: string | Date | null;
  followUpDate?: string | Date | null;

  next_follow_up_date?: string | Date | null;
  nextFollowUpDate?: string | Date | null;

  // ===== FINANCIAL INFORMATION =====
  annual_family_income?: string | number | null;
  annualFamilyIncome?: string | number | null;

  currency?: string | null;

  // Currency conversion related
  selectedLoanCurrency?: string | null;
  loanAmount?: string | number | null;
  coApplicantAnnualIncome?: string | number | null;

  // Co-applicant 1
  co_applicant_1_name?: string | null;
  coApplicant1Name?: string | null;

  co_applicant_1_income?: string | number | null;

  co_applicant_1_occupation?: string | null;
  coApplicantIncomeType?: string | null;

  co_applicant_1_relationship?: string | null;
  coApplicant?: string | null;

  // Co-applicant 2
  co_applicant_2_name?: string | null;
  coApplicant2Name?: string | null;

  coApplicantEmail?: string | null;
  coApplicantMobile?: string | null;

  co_applicant_2_income?: string | number | null;
  coApplicant2Income?: string | number | null;

  co_applicant_2_occupation?: string | null;
  coApplicant2Occupation?: string | null;

  co_applicant_2_relationship?: string | null;
  coApplicant2Relationship?: string | null;

  // Co-applicant 3
  co_applicant_3_name?: string | null;
  coApplicant3Name?: string | null;

  co_applicant_3_income?: string | number | null;
  coApplicant3Income?: string | number | null;

  co_applicant_3_occupation?: string | null;
  coApplicant3Occupation?: string | null;

  co_applicant_3_relationship?: string | null;
  coApplicant3Relationship?: string | null;

  // Collateral 1
  collateral_available?: string | null;
  collateralAvailable?: string | null;

  collateral_type?: string | null;
  collateralType?: string | null;

  collateral_value?: string | number | null;
  collateralValue?: string | number | null;

  // Collateral 2
  collateral_2_available?: string | null;
  collateral2Available?: string | null;

  collateral_2_type?: string | null;
  collateral2Type?: string | null;

  collateral_2_value?: string | number | null;
  collateral2Value?: string | number | null;

  // Expenses & Costs
  living_expenses?: string | number | null;
  livingExpenses?: string | number | null;

  other_expenses?: string | number | null;
  otherExpenses?: string | number | null;

  total_course_cost?: string | number | null;
  totalCourseCost?: string | number | null;

  tuition_fee?: string | number | null;
  tuitionFee?: string | number | null;

  loan_amount_required?: string | number | null;

  scholarship_amount?: string | number | null;
  scholarshipAmount?: string | number | null;

  self_funding_amount?: string | number | null;
  selfFundingAmount?: string | number | null;

  // ===== LEAD ATTRIBUTION =====
  lead_source?: string | null;
  leadSource?: string | null;

  lead_source_detail?: string | null;
  leadSourceDetail?: string | null;

  lead_quality_score?: number | null;
  leadQualityScore?: number | null;

  lead_reference_code?: string | null;
  leadReferenceCode?: string | null;

  b2b_partner_name?: string | null;
  b2bPartnerName?: string | null;

  partner_commission_applicable?: string | null;
  partnerCommissionApplicable?: string | null;

  referral_person_name?: string | null;
  referralPersonName?: string | null;

  referral_person_contact?: string | null;
  referralPersonContact?: string | null;

  // UTM Parameters
  utm_source?: string | null;
  utmSource?: string | null;

  utm_medium?: string | null;
  utmMedium?: string | null;

  utm_campaign?: string | null;
  utmCampaign?: string | null;

  utm_term?: string | null;
  utmTerm?: string | null;

  utm_content?: string | null;
  utmContent?: string | null;

  // ===== LOAN PREFERENCES =====
  loan_type_preference?: string | null;
  loanPreference?: string | null;

  preferred_lenders?: string | null;
  preferredLenders?: string | null;

  repayment_type_preference?: string | null;
  repaymentTypePreference?: string | null;

  // ===== SYSTEM TRACKING =====
  created_by?: string | number | null;
  createdBy?: string | number | null;

  created_date?: string | Date | null;
  createdDate?: string | Date | null;

  last_modified_by?: string | number | null;
  lastModifiedBy?: string | number | null;

  last_modified_date?: string | Date | null;
  lastModifiedDate?: string | Date | null;

  data_source?: string | null;
  dataSource?: string | null;

  student_record_status?: string | null;
  studentRecordStatus?: string | null;

  tags?: string | null;

  gdpr_consent?: string | null;
  gdprConsent?: string | null;

  marketing_consent?: string | null;
  marketingConsent?: string | null;

  // ===== LEGACY FIELDS =====
  userId?: number;
  b2bHubspotId?: string;
  partnerName?: string;
  educationLevel?: string;
  phone?: string;
};

export type CategorizedContactData = {
  mainContact?: {
    deleted_by_id?: number | string | null;
    b2b_partner_id?: string | null;
    hs_created_by_user_id?: string | null;
    hs_createdate?: string | Date | null;
    hs_lastmodifieddate?: string | Date | null;
    hs_object_id?: string | null;
    hs_updated_by_user_id?: string | null;
    hubspot_owner_id?: string | null;
    base_currency?: string | null;
    study_destination_currency?: string | null;
    user_selected_currency?: string | null;
    course_type?: string | null;
    co_applicant_1_email?: string | null;
    co_applicant_1_mobile_number?: string | null;
    is_deleted?: boolean | null;
  };

  personalInformation?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    date_of_birth?: string | Date | null;
    gender?: string | null;
    nationality?: string | null;
    current_address?: string | null;
    city_current_address?: string | null;
    state_current_address?: string | null;
    country_current_address?: string | null;
    pincode_current_address?: string | null;
    permanent_address?: string | null;
    city_permanent_address?: string | null;
    state_permanent_address?: string | null;
    country_permanent_address?: string | null;
    pincode_permanent_address?: string | null;
  };

  academicProfile?: {
    admission_status?: string | null;
    current_education_level?: string | null;
    current_institution?: string | null;
    current_course_major?: string | null;
    current_cgpa_percentage?: string | number | null;
    current_graduation_year?: string | number | null;
    course_duration_months?: number | null;
    cat_score?: number | null;
    gre_score?: number | null;
    gmat_score?: number | null;
    toefl_score?: number | null;
    ielts_score?: number | null;
    sat_score?: number | null;
    duolingo_score?: number | null;
    nmat_score?: number | null;
    xat_score?: number | null;
    other_test_scores?: number | null;
    study_level?: string | null;
    studyLevel?: string | null;
    target_degree_level?: string | null;
    target_course_major?: string | null;
    preferred_study_destination?: string | null;
    target_universities?: string | null;
    intended_start_term?: string | null;
    intended_start_date?: string | Date | null;
    intake_month?: string | null;
    intake_year?: string | number | null;
  };

  applicationJourney?: {
    assigned_counselor?: string | null;
    counselor_notes?: string | null;
    current_status_disposition?: string | null;
    current_status_disposition_reason?: string | null;
    priority_level?: string | null;
    first_contact_date?: string | Date | null;
    last_contact_date?: string | Date | null;
    follow_up_date?: string | Date | null;
    next_follow_up_date?: string | Date | null;
  };

  financialInfo?: {
    annual_family_income?: string | number | null;
    currency?: string | null;
    co_applicant_1_name?: string | null;
    co_applicant_1_income?: string | number | null;
    co_applicant_1_occupation?: string | null;
    co_applicant_1_relationship?: string | null;
    co_applicant_2_name?: string | null;
    co_applicant_2_income?: string | number | null;
    co_applicant_2_occupation?: string | null;
    co_applicant_2_relationship?: string | null;
    co_applicant_3_name?: string | null;
    co_applicant_3_income?: string | number | null;
    co_applicant_3_occupation?: string | null;
    co_applicant_3_relationship?: string | null;
    collateral_available?: string | null;
    collateral_type?: string | null;
    collateral_value?: string | number | null;
    collateral_2_available?: string | null;
    collateral_2_type?: string | null;
    collateral_2_value?: string | number | null;
    living_expenses?: string | number | null;
    other_expenses?: string | number | null;
    total_course_cost?: string | number | null;
    tuition_fee?: string | number | null;
    loan_amount_required?: string | number | null;
    scholarship_amount?: string | number | null;
    self_funding_amount?: string | number | null;
  };

  leadAttribution?: {
    lead_source?: string | null;
    lead_source_detail?: string | null;
    lead_quality_score?: number | null;
    lead_reference_code?: string | null;
    b2b_partner_name?: string | null;
    partner_commission_applicable?: string | null;
    referral_person_name?: string | null;
    referral_person_contact?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
  };

  loanPreferences?: {
    loan_type_preference?: string | null;
    preferred_lenders?: string | null;
    repayment_type_preference?: string | null;
  };

  systemTracking?: {
    created_by?: string | number | null;
    created_date?: string | Date | null;
    last_modified_by?: string | number | null;
    last_modified_date?: string | Date | null;
    data_source?: string | null;
    student_record_status?: string | null;
    tags?: string | null;
    gdpr_consent?: string | null;
    marketing_consent?: string | null;
  };
};
// ==================== EXISTING MAPPINGS ====================

export const genderMap: Record<string, Gender> = {
  Male: Gender.MALE,
  Female: Gender.FEMALE,
  Other: Gender.OTHER,
  "Prefer not to say": Gender.PREFER_NOT_TO_SAY,
};

export const admissionStatusMap: Record<string, AdmissionStatus> = {
  "Not Applied": AdmissionStatus.NOT_APPLIED,
  Applied: AdmissionStatus.APPLIED,
  "Interview Scheduled": AdmissionStatus.INTERVIEW_SCHEDULED,
  Waitlisted: AdmissionStatus.WAITLISTED,
  Admitted: AdmissionStatus.ADMITTED,
  Rejected: AdmissionStatus.REJECTED,
};

export const targetDegreeLevelMap: Record<string, TargetDegreeLevel> = {
  Bachelors: TargetDegreeLevel.BACHELORS,
  Masters: TargetDegreeLevel.MASTERS,
  PhD: TargetDegreeLevel.PHD,
  Diploma: TargetDegreeLevel.DIPLOMA,
  Certificate: TargetDegreeLevel.CERTIFICATE,
  "Professional Course": TargetDegreeLevel.PROFESSIONAL_COURSE,
};

export const courseTypeMap: Record<string, EdumateContactCourseType> = {
  STEM: EdumateContactCourseType.STEM,
  Business: EdumateContactCourseType.BUSINESS,
  Others: EdumateContactCourseType.OTHERS,
};

export const LoanTypePreferenceMap: Record<string, LoanTypePreference> = {
  Secured: LoanTypePreference.SECURED,
  Unsecured: LoanTypePreference.UNSECURED,
  "Government Scheme": LoanTypePreference.GOVERNMENT_SCHEME,
  "No Preference": LoanTypePreference.NO_PREFERENCE,
};

export const preferredStudyDestinationMap: Record<
  string,
  PreferredStudyDestination
> = {
  US: PreferredStudyDestination.US,
  UK: PreferredStudyDestination.UK,
  UAE: PreferredStudyDestination.UAE,
  Canada: PreferredStudyDestination.CANADA,
  Australia: PreferredStudyDestination.AUSTRALIA,
  Germany: PreferredStudyDestination.GERMANY,
  France: PreferredStudyDestination.FRANCE,
  Singapore: PreferredStudyDestination.SINGAPORE,
  Italy: PreferredStudyDestination.ITALY,
  Japan: PreferredStudyDestination.JAPAN,
  China: PreferredStudyDestination.CHINA,
  India: PreferredStudyDestination.INDIA,
  "New Zealand": PreferredStudyDestination.NEW_ZEALAND,
  Ireland: PreferredStudyDestination.IRELAND,
  Other: PreferredStudyDestination.OTHER,
};

export const preferredStudyDestinationReverseMap: Record<string, string> = {
  US: "US",
  UK: "UK",
  UAE: "UAE",
  CANADA: "Canada",
  AUSTRALIA: "Australia",
  GERMANY: "Germany",
  FRANCE: "France",
  SINGAPORE: "Singapore",
  ITALY: "Italy",
  JAPAN: "Japan",
  CHINA: "China",
  INDIA: "India",
  NEW_ZEALAND: "New Zealand",
  IRELAND: "Ireland",
  OTHER: "Other",
};

export const currentEducationLevelMap: Record<string, CurrentEducationLevel> = {
  "High School": CurrentEducationLevel.HIGH_SCHOOL,
  Bachelors: CurrentEducationLevel.BACHELORS,
  Masters: CurrentEducationLevel.MASTERS,
  PhD: CurrentEducationLevel.PHD,
  Diploma: CurrentEducationLevel.DIPLOMA,
  Other: CurrentEducationLevel.OTHER,
};

// ==================== NEW MAPPINGS ====================

export const coApplicantOccupationMap: Record<string, CoApplicantOccupation> = {
  Salaried: CoApplicantOccupation.SALARIED,
  "Self Employed": CoApplicantOccupation.SELF_EMPLOYED,
  Retired: CoApplicantOccupation.RETIRED,
  Others: CoApplicantOccupation.OTHERS,
};

export const coApplicantRelationshipMap: Record<
  string,
  CoApplicantRelationship
> = {
  Father: CoApplicantRelationship.FATHER,
  Mother: CoApplicantRelationship.MOTHER,
  Spouse: CoApplicantRelationship.SPOUSE,
  Sibling: CoApplicantRelationship.SIBLING,
  Uncle: CoApplicantRelationship.UNCLE,
  Aunt: CoApplicantRelationship.AUNT,
  "Grand Father": CoApplicantRelationship.GRAND_FATHER,
  "Grand Mother": CoApplicantRelationship.GRAND_MOTHER,
  Others: CoApplicantRelationship.OTHERS,
};

export const collateralAvailableMap: Record<string, CollateralAvailable> = {
  Yes: CollateralAvailable.YES,
  No: CollateralAvailable.NO,
};

export const collateralTypeMap: Record<string, EdumateContactCollateralType> = {
  Property: EdumateContactCollateralType.PROPERTY,
  FD: EdumateContactCollateralType.FD,
  "NA Plot": EdumateContactCollateralType.NA_PLOT,
  Other: EdumateContactCollateralType.OTHER,
};

export const financialCurrencyMap: Record<string, FinancialCurrency> = {
  INR: FinancialCurrency.INR,
  USD: FinancialCurrency.USD,
  EUR: FinancialCurrency.EUR,
  GBP: FinancialCurrency.GBP,
  CAD: FinancialCurrency.CAD,
  AUD: FinancialCurrency.AUD,
  Other: FinancialCurrency.OTHER,
};

export const leadSourceMap: Record<string, LeadSource> = {
  "Organic Search": LeadSource.ORGANIC_SEARCH,
  "Social Media": LeadSource.SOCIAL_MEDIA,
  "B2B Partner": LeadSource.B2B_PARTNER,
  Referral: LeadSource.REFERRAL,
  Advertisement: LeadSource.ADVERTISEMENT,
  Website: LeadSource.WEBSITE,
  "Walk-in": LeadSource.WALK_IN,
  Other: LeadSource.OTHER,
};

export const partnerCommissionApplicableMap: Record<
  string,
  PartnerCommissionApplicable
> = {
  Yes: PartnerCommissionApplicable.YES,
  No: PartnerCommissionApplicable.NO,
};

export const repaymentTypePreferenceMap: Record<
  string,
  RepaymentTypePreference
> = {
  EMI: RepaymentTypePreference.EMI,
  "Simple Int": RepaymentTypePreference.SIMPLE_INT,
  "Partial Int": RepaymentTypePreference.PARTIAL_INT,
  "Complete Morat": RepaymentTypePreference.COMPLETE_MORAT,
};

export const dataSourceMap: Record<string, DataSource> = {
  "Manual Entry": DataSource.MANUAL_ENTRY,
  "API Sync": DataSource.API_SYNC,
  Import: DataSource.IMPORT,
  "Third Party": DataSource.THIRD_PARTY,
  "System Generated": DataSource.SYSTEM_GENERATED,
  API: DataSource.API,
  "Website Form": DataSource.WEBSITE_FORM,
  "Partner Integration": DataSource.PARTNER_INTEGRATION,
};

export const studentRecordStatusMap: Record<string, StudentRecordStatus> = {
  Active: StudentRecordStatus.ACTIVE,
  Inactive: StudentRecordStatus.INACTIVE,
  Duplicate: StudentRecordStatus.DUPLICATE,
  Merged: StudentRecordStatus.MERGED,
};

export const gdprConsentMap: Record<string, GDPRConsent> = {
  Yes: GDPRConsent.YES,
  No: GDPRConsent.NO,
  Pending: GDPRConsent.PENDING,
};

export const marketingConsentMap: Record<string, MarketingConsent> = {
  Yes: MarketingConsent.YES,
  No: MarketingConsent.NO,
};

export const currentStatusDispositionMap: Record<
  string,
  CurrentStatusDisposition
> = {
  "Not Interested": CurrentStatusDisposition.NOT_INTERESTED,
  "Wrong Number": CurrentStatusDisposition.WRONG_NUMBER,
  "Call Not Answered": CurrentStatusDisposition.CALL_NOT_ANSWERED,
  "Follow Up": CurrentStatusDisposition.FOLLOW_UP,
  "Int For Next Year": CurrentStatusDisposition.INT_FOR_NEXT_YEAR,
  "Partial Documents Received":
    CurrentStatusDisposition.PARTIAL_DOCUMENTS_RECEIVED,
};

export const statusDispositionReasonMap: Record<
  string,
  StatusDispositionReason
> = {
  "Already Applied": StatusDispositionReason.ALREADY_APPLIED,
  "Not Looking At Loan": StatusDispositionReason.NOT_LOOKING_AT_LOAN,
  "Self Funding": StatusDispositionReason.SELF_FUNDING,
  Others: StatusDispositionReason.OTHERS,
};

export const priorityLevelMap: Record<string, PriorityLevel> = {
  High: PriorityLevel.HIGH,
  Medium: PriorityLevel.MEDIUM,
  Low: PriorityLevel.LOW,
  Urgent: PriorityLevel.URGENT,
};

export const intendedStartTermMap: Record<string, IntendedStartTerm> = {
  Fall: IntendedStartTerm.FALL,
  Spring: IntendedStartTerm.SPRING,
  Summer: IntendedStartTerm.SUMMER,
  Winter: IntendedStartTerm.WINTER,
};

export type ContactsValidationResult = {
  validRows: ContactsLead[];
  errors: { row: number; reason: string }[];
};

export type RecordError = {
  batchNumber: number;
  recordIndex: number;
  email: string;
  firstName?: string;
  lastName?: string;
  stage: "hubspot" | "database" | "tracking";
  reason: string;
  timestamp: string;
};

export type BatchResult = {
  inserted: number;
  failed: number;
  hubspotResults: any[];
  errors: RecordError[];
};
