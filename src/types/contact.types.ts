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
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  partnerName?: string;
  educationLevel?: string;
  admissionStatus?: string;
  targetDegreeLevel?: string;
  courseType?: string;
  studyDestination?: string;
  dateOfBirth?: Date;
  gender?: string;
  intakeYear?: string;
  intakeMonth?: string;
  userId?: number;
  createdBy?: number;
  b2bHubspotId?: string;
};

// ==================== EXISTING MAPPINGS ====================

export const genderMap: Record<string, Gender> = {
  Male: Gender.MALE,
  Female: Gender.FEMALE,
  Other: Gender.OTHER,
  "Prefer not to say": Gender.PREFER_NOT_TO_SAY,
};

export const reverseGenderMap: Record<string, string> = {
  [Gender.MALE]: "Male",
  [Gender.FEMALE]: "Female",
  [Gender.OTHER]: "Other",
  [Gender.PREFER_NOT_TO_SAY]: "Prefer not to say",
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

export const reverseCourseTypeMap: Record<string, string> = {
  [EdumateContactCourseType.STEM]: "STEM",
  [EdumateContactCourseType.BUSINESS]: "Business",
  [EdumateContactCourseType.OTHERS]: "Others",
};

export const LoanTypePreferenceMap: Record<string, LoanTypePreference> = {
  Secured: LoanTypePreference.SECURED,
  Unsecured: LoanTypePreference.UNSECURED,
  "Government Scheme": LoanTypePreference.GOVERNMENT_SCHEME,
  "No Preference": LoanTypePreference.NO_PREFERENCE,
};

// Reverse map for LoanTypePreference
export const reverseLoanTypePreferenceMap: Record<LoanTypePreference, string> =
  {
    [LoanTypePreference.SECURED]: "SECURED",
    [LoanTypePreference.UNSECURED]: "UNSECURED",
    [LoanTypePreference.GOVERNMENT_SCHEME]: "GOVERNMENT_SCHEME",
    [LoanTypePreference.NO_PREFERENCE]: "NO_PREFERENCE",
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
  Other: PreferredStudyDestination.OTHER,
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
