// Product Category Mapping
export const productCategoryMap: Record<string, string> = {
  Domestic: "DOMESTIC",
  International: "INTERNATIONAL",
  Both: "BOTH",
  Vocational: "VOCATIONAL",
  Professional: "PROFESSIONAL",
};

// Product Status Mapping
export const productStatusMap: Record<string, string> = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Discontinued: "DISCONTINUED",
  "Coming Soon": "COMING_SOON",
  "Under Review": "UNDER_REVIEW",
};

// Product Type Mapping
export const productTypeMap: Record<string, string> = {
  "Secured Education Loan": "SECURED_EDUCATION_LOAN",
  "Unsecured Education Loan": "UNSECURED_EDUCATION_LOAN",
  "Government Scheme": "GOVERNMENT_SCHEME",
  "Scholar Loan": "SCHOLAR_LOAN",
  "Express Loan": "EXPRESS_LOAN",
  "Premium Loan": "PREMIUM_LOAN",
  "Skill Development Loan": "SKILL_DEVELOPMENT_LOAN",
};

// Product Record Status Mapping
export const productRecordStatusMap: Record<string, string> = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  "Under Review": "UNDER_REVIEW",
  Discontinued: "DISCONTINUED",
};

// Review Frequency Mapping
export const reviewFrequencyMap: Record<string, string> = {
  Monthly: "MONTHLY",
  Quarterly: "QUARTERLY",
  "Half-yearly": "HALF_YEARLY",
  Yearly: "YEARLY",
};

// Loan Product Market Positioning Mapping
export const loanProductMarketPositioningMap: Record<string, string> = {
  Premium: "PREMIUM",
  "Mid-Market": "MID_MARKET",
  Budget: "BUDGET",
  Niche: "NICHE",
  "Mass Market": "MASS_MARKET",
};

// Pricing Strategy Mapping
export const pricingStrategyMap: Record<string, string> = {
  Competitive: "COMPETITIVE",
  Premium: "PREMIUM",
  Penetration: "PENETRATION",
  "Value Based": "VALUE_BASED",
};

// Nationality Restrictions Mapping
export const nationalityRestrictionsMap: Record<string, string> = {
  Indian: "INDIAN",
  Others: "OTHERS",
};

// Residency Requirements Mapping
export const residencyRequirementsMap: Record<string, string> = {
  Resident: "RESIDENT",
  "Non-Resident": "NON_RESIDENT",
};

// Target Segment Mapping
export const targetSegmentMap: Record<string, string> = {
  Undergraduate: "UNDERGRADUATE",
  Graduate: "GRADUATE",
  Phd: "PHD",
  Diploma: "DIPLOMA",
  Certificate: "CERTIFICATE",
  Professional: "PROFESSIONAL",
  Technical: "TECHNICAL",
  Medical: "MEDICAL",
  Management: "MANAGEMENT",
};

// Collateral Requirement Mapping
export const collateralRequirementMap: Record<string, string> = {
  "Always Required": "ALWAYS_REQUIRED",
  "Above Threshold": "ABOVE_THRESHOLD",
  "Not Required": "NOT_REQUIRED",
  Optional: "OPTIONAL",
};

// Collateral Type Mapping
export const collateralTypeMap: Record<string, string> = {
  "Residential Property": "RESIDENTIAL_PROPERTY",
  "Commercial Property": "COMMERCIAL_PROPERTY",
  "Non Agricultural Land": "NON_AGRICULTURAL_LAND",
  "Fixed Deposits": "FIXED_DEPOSITS",
  "Government Securities": "GOVERNMENT_SECURITIES",
  "Lic Policies": "LIC_POLICIES",
  "Nsc Kvp": "NSC_KVP",
  Gold: "GOLD",
  "Shares Mutual Funds": "SHARES_MUTUAL_FUNDS",
  Property: "PROPERTY",
  Securities: "SECURITIES",
  "Guarantor Only": "GUARANTOR_ONLY",
  "No Collateral": "NO_COLLATERAL",
  "Na Plot": "NA_PLOT",
};

// Guarantor Required Mapping
export const guarantorRequiredMap: Record<string, string> = {
  Always: "ALWAYS",
  "Above Threshold": "ABOVE_THRESHOLD",
  "Not Required": "NOT_REQUIRED",
  Optional: "OPTIONAL",
};

// Insurance Required Mapping
export const insuranceRequiredMap: Record<string, string> = {
  "Life Insurance": "LIFE_INSURANCE",
  "Property Insurance": "PROPERTY_INSURANCE",
  Both: "BOTH",
  "Not Required": "NOT_REQUIRED",
};

// Third Party Guarantee Required Mapping
export const thirdPartyGuaranteeRequiredMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Case By Case": "CASE_BY_CASE",
};

// Moratorium Type Mapping
export const moratoriumTypeMap: Record<string, string> = {
  Complete: "COMPLETE",
  "Interest Only": "INTEREST_ONLY",
  "Partial Emi": "PARTIAL_EMI",
  "No Moratorium": "NO_MORATORIUM",
};

// Repayment Frequency Mapping
export const repaymentFrequencyMap: Record<string, string> = {
  Monthly: "MONTHLY",
  Quarterly: "QUARTERLY",
  "Half Yearly": "HALF_YEARLY",
  Annually: "ANNUALLY",
  Flexible: "FLEXIBLE",
  Custom: "CUSTOM",
};

// Part Payment Allowed Mapping
export const partPaymentAllowedMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Minimum Amount": "MINIMUM_AMOUNT",
};

// Application Mode Mapping
export const applicationModeMap: Record<string, string> = {
  Online: "ONLINE",
  Offline: "OFFLINE",
  Hybrid: "HYBRID",
  "Mobile App": "MOBILE_APP",
  Portal: "PORTAL",
};

// Disbursement Process Mapping
export const disbursementProcessMap: Record<string, string> = {
  "Direct To University": "DIRECT_TO_UNIVERSITY",
  "Direct To Student": "DIRECT_TO_STUDENT",
  "Installment Based": "INSTALLMENT_BASED",
  "Full Amount": "FULL_AMOUNT",
  "Partial Disbursement": "PARTIAL_DISBURSEMENT",
};

// Loan Product Course Types Mapping
export const loanProductCourseTypesMap: Record<string, string> = {
  "Full Time": "FULL_TIME",
  "Part Time": "PART_TIME",
  "Distance Learning": "DISTANCE_LEARNING",
  Online: "ONLINE",
  Executive: "EXECUTIVE",
  Regular: "REGULAR",
  Accelerated: "ACCELERATED",
};

// Digital Features Mapping
export const digitalFeaturesMap: Record<string, string> = {
  "Online Application": "ONLINE_APPLICATION",
  "Digital Documentation": "DIGITAL_DOCUMENTATION",
  "E-Statements": "E_STATEMENTS",
  "Mobile App": "MOBILE_APP",
  "Sms Alerts": "SMS_ALERTS",
  "Email Notifications": "EMAIL_NOTIFICATIONS",
};

// Customer Support Features Mapping
export const customerSupportFeaturesMap: Record<string, string> = {
  "24x7 Support": "TWENTY_FOUR_SEVEN_SUPPORT",
  "Dedicated Rm": "DEDICATED_RM",
  "Online Chat": "ONLINE_CHAT",
  "Video Kyc": "VIDEO_KYC",
  "Door Step Service": "DOOR_STEP_SERVICE",
};

// Flexible Repayment Options Mapping
export const flexibleRepaymentOptionsMap: Record<string, string> = {
  "Step Up Emi": "STEP_UP_EMI",
  "Step Down Emi": "STEP_DOWN_EMI",
  "Bullet Payment": "BULLET_PAYMENT",
  "Flexible Emi": "FLEXIBLE_EMI",
  "Holiday Options": "HOLIDAY_OPTIONS",
};

// API Availability Mapping
export const apiAvailabilityMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Under Development": "UNDER_DEVELOPMENT",
  Planned: "PLANNED",
};

// Integration Complexity Mapping
export const integrationComplexityMap: Record<string, string> = {
  Simple: "SIMPLE",
  Moderate: "MODERATE",
  Complex: "COMPLEX",
  "Very Complex": "VERY_COMPLEX",
};

// Data Format Mapping
export const dataFormatMap: Record<string, string> = {
  Json: "JSON",
  Xml: "XML",
  Csv: "CSV",
  Api: "API",
  Manual: "MANUAL",
};

// Sandbox Environment Mapping
export const sandboxEnvironmentMap: Record<string, string> = {
  Available: "AVAILABLE",
  "Not Available": "NOT_AVAILABLE",
  "On Request": "ON_REQUEST",
};

// WebHook Support Mapping
export const webHookSupportMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Limited: "LIMITED",
};

// Interest Rate Type Mapping
export const interestRateTypeMap: Record<string, string> = {
  Fixed: "FIXED",
  Floating: "FLOATING",
  Hybrid: "HYBRID",
  "Choice Based": "CHOICE_BASED",
};

// Processing Fee Type Mapping
export const processingFeeTypeMap: Record<string, string> = {
  Percentage: "PERCENTAGE",
  "Fixed Amount": "FIXED_AMOUNT",
  Nil: "NIL",
  Tiered: "TIERED",
};
