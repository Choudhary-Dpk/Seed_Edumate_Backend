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
