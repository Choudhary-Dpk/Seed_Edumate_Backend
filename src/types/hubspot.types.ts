// src/types/hubspot.types.ts
// Use HubSpot SDK types directly - no custom redefinition needed

// Internal representation types for mapping
export interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    website?: string;
    lifecyclestage?: string;
    hubspot_owner_id?: string;
    createdate?: string;
    lastmodifieddate?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name?: string;
    domain?: string;
    industry?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    hubspot_owner_id?: string;
    createdate?: string;
    lastmodifieddate?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    amount?: string;
    dealstage?: string;
    pipeline?: string;
    closedate?: string;
    hubspot_owner_id?: string;
    createdate?: string;
    lastmodifieddate?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

// Edumate Contact Custom Object Types
export type AdmissionStatus = "Not Applied" | "Applied" | "Interview Scheduled" | "Waitlisted" | "Admitted" | "Rejected";
export type EducationLevel = "High School" | "Bachelor's" | "Master's" | "PhD" | "Other";
export type TargetDegreeLevel = "Bachelor's" | "Master's" | "PhD" | "Diploma" | "Certificate" | "Professional Course";
export type StudyDestination = "US" | "UK" | "Canada" | "Australia" | "Germany" | "France" | "Singapore" | "Italy" | "UAE" | "Other";
export type LeadSource = "Organic Search" | "Social Media" | "B2B Partner" | "Referral" | "Advertisement" | "Website" | "Walk-in" | "Other";
export type StatusDisposition = "Not Interested" | "Wrong Number" | "Call not Answered" | "Follow Up" | "Int for Next Year" | "Partial Documents Received";
export type PriorityLevel = "High" | "Medium" | "Low";
export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";
export type LoanTypePreference = "Secured" | "Unsecured" | "Education Loan" | "Personal Loan";
export type RepaymentType = "EMI" | "Bullet Payment" | "Interest Only";

export interface HubSpotEdumateContact {
  id: string;
  properties: {
    // Academic Information
    admission_status?: AdmissionStatus;
    course_duration_months?: number;
    current_cgpa_percentage?: number;
    current_course_major?: string;
    current_education_level?: EducationLevel;
    current_graduation_year?: number;
    current_institution?: string;
    gmat_score?: number;
    gre_score?: number;
    ielts_score?: number;
    intended_start_date?: string;
    intended_start_term?: string;
    other_test_scores?: string;
    preferred_study_destination?: StudyDestination;
    target_course_major?: string;
    target_degree_level?: TargetDegreeLevel;
    target_universities?: string;
    toefl_score?: number;

    // Application Journey
    assigned_counselor?: string;
    counselor_notes?: string;
    current_status_disposition?: StatusDisposition;
    current_status_disposition_reason?: string;
    first_contact_date?: string;
    follow_up_date?: string;
    last_contact_date?: string;
    next_follow_up_date?: string;
    priority_level?: PriorityLevel;

    // System Properties
    hs_created_by_user_id?: number;
    hs_createdate?: string;
    hs_lastmodifieddate?: string;
    hs_object_id?: number;
    hs_object_source_detail_1?: string;
    hs_object_source_detail_2?: string;
    hs_object_source_detail_3?: string;
    hs_object_source_label?: string;
    hs_updated_by_user_id?: number;
    hubspot_owner_assigneddate?: string;
    hubspot_owner_id?: string;
    hubspot_team_id?: string;

    // Financial Information
    annual_family_income?: number;
    co_applicant_1_income?: number;
    co_applicant_1_name?: string;
    co_applicant_1_occupation?: string;
    co_applicant_1_relationship?: string;
    co_applicant_2_income?: number;
    co_applicant_2_name?: string;
    co_applicant_2_occupation?: string;
    co_applicant_2_relationship?: string;
    co_applicant_3_income?: number;
    co_applicant_3_name?: string;
    co_applicant_3_occupation?: string;
    co_applicant_3_relationship?: string;
    collateral_available?: string;
    collateral_type?: string;
    collateral_value?: number;
    collateral_2_available?: string;
    collateral_2_type?: string;
    collateral_2_value?: number;
    currency?: string;
    living_expenses?: number;
    loan_amount_required?: number;
    other_expenses?: number;
    scholarship_amount?: number;
    self_funding_amount?: number;
    total_course_cost?: number;
    tuition_fee?: number;

    // Lead Attribution
    b2b_partner_id?: string;
    b2b_partner_name?: string;
    lead_quality_score?: number;
    lead_reference_code?: string;
    lead_source?: LeadSource;
    lead_source_detail?: string;
    partner_commission_applicable?: string;
    referral_person_contact?: string;
    referral_person_name?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_medium?: string;
    utm_source?: string;
    utm_term?: string;

    // Loan Preferences
    loan_type_preference?: LoanTypePreference;
    preferred_lenders?: string;
    repayment_type_preference?: RepaymentType;

    // Personal Information
    city__current_address_?: string;
    city__permanent_address_?: string;
    country__current_address_?: string;
    country__permanent_address_?: string;
    current_address?: string;
    date_of_birth?: string;
    email?: string;
    first_name?: string;
    gender?: Gender;
    last_name?: string;
    nationality?: string;
    permanent_address?: string;
    phone_number?: string;
    pincode__current_address_?: string;
    pincode__permanent_address_?: string;
    state__current_address_?: string;
    state__permanent_address_?: string;

    // System Tracking
    created_by?: string;
    created_date?: string;
    data_source?: string;
    gdpr_consent?: string;
    last_modified_by?: string;
    last_modified_date?: string;
    marketing_consent?: string;
    student_record_status?: string;
    tags?: string;

    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

export interface HubSpotPaginatedResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
  total?: number;
}

export interface HubSpotError {
  status: string;
  message: string;
  correlationId: string;
  category: string;
  subCategory?: string;
  errors?: {
    message: string;
    in: string;
    code: string;
  }[];
}

// src/types/mapped.types.ts
export interface MappedContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  company?: string;
  website?: string;
  lifecycleStage?: string;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
  customProperties?: Record<string, any>;
}

export interface MappedCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
  customProperties?: Record<string, any>;
}

export interface MappedDeal {
  id: string;
  name: string;
  amount?: number;
  stage?: string;
  pipeline?: string;
  closeDate?: Date;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
  customProperties?: Record<string, any>;
}

// Mapped Edumate Contact Interface
export interface MappedEdumateContactEduToFrontend {
  id: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  
  // Address Information
  currentAddress?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  permanentAddress?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  
  // Academic Information
  currentEducation?: {
    level?: string;
    institution?: string;
    major?: string;
    cgpaPercentage?: number;
    graduationYear?: number;
  };
  
  targetEducation?: {
    degreeLevel?: string;
    courseMajor?: string;
    universities?: string;
    studyDestination?: string;
    intendedStartDate?: Date;
    intendedStartTerm?: string;
    courseDurationMonths?: number;
  };
  
  testScores?: {
    gmat?: number;
    gre?: number;
    toefl?: number;
    ielts?: number;
    other?: string;
  };
  
  // Application Journey
  admissionStatus?: string;
  applicationJourney?: {
    assignedCounselor?: string;
    counselorNotes?: string;
    currentStatusDisposition?: string;
    currentStatusDispositionReason?: string;
    priorityLevel?: string;
    firstContactDate?: Date;
    lastContactDate?: Date;
    nextFollowUpDate?: Date;
    followUpDate?: Date;
  };
  
  // Financial Information
  financialProfile?: {
    annualFamilyIncome?: number;
    totalCourseCost?: number;
    tuitionFee?: number;
    livingExpenses?: number;
    otherExpenses?: number;
    loanAmountRequired?: number;
    selfFundingAmount?: number;
    scholarshipAmount?: number;
    currency?: string;
  };
  
  coApplicants?: Array<{
    name?: string;
    relationship?: string;
    occupation?: string;
    income?: number;
  }>;
  
  collateral?: Array<{
    available?: string;
    type?: string;
    value?: number;
  }>;
  
  // Loan Preferences
  loanPreferences?: {
    loanTypePreference?: string;
    preferredLenders?: string;
    repaymentTypePreference?: string;
  };
  
  // Lead Attribution
  leadAttribution?: {
    leadSource?: string;
    leadSourceDetail?: string;
    leadQualityScore?: number;
    leadReferenceCode?: string;
    b2bPartnerName?: string;
    b2bPartnerId?: string;
    partnerCommissionApplicable?: string;
    referralPersonName?: string;
    referralPersonContact?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
  };
  
  // System Information
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
  dataSource?: string;
  gdprConsent?: string;
  marketingConsent?: string;
  studentRecordStatus?: string;
  tags?: string;
  
  // Custom properties that don't fit into structured categories
  customProperties?: Record<string, any>;
}

export interface MappedEdumateContact {
  id: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  
  levelOfEducation?: string;
  studyDestination?: string;
  courseType?: string;
  nonUsaCountry?: string;
  loanPreference?: string;
  intakeMonth?: string;
  intakeYear?: string;
  loanAmount?: string;
}

// src/types/common.types.ts
export interface PaginationOptions {
  limit?: number;
  after?: string;
}

export interface SearchOptions extends PaginationOptions {
  properties?: string[];
  sorts?: {
    propertyName: string;
    direction: 'ASCENDING' | 'DESCENDING';
  }[];
}

// src/types/index.ts
// Re-export all types for easier importing
export * from './hubspot.types';
export * from './mapped.types';
export * from './common.types';

// Type guards for runtime type checking
export const isHubSpotContact = (obj: any): obj is HubSpotContact => {
  return obj && typeof obj.id === 'string' && obj.properties && obj.createdAt && obj.updatedAt;
};

export const isHubSpotEdumateContact = (obj: any): obj is HubSpotEdumateContact => {
  return obj && typeof obj.id === 'string' && obj.properties && obj.createdAt && obj.updatedAt;
};

export const isMappedEdumateContact = (obj: any): obj is MappedEdumateContact => {
  return obj && typeof obj.id === 'string' && obj.firstName && obj.lastName && obj.createdAt && obj.updatedAt;
};