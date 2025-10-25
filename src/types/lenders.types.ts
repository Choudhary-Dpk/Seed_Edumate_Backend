export const lenderCategoryMap: Record<string, string> = {
  Domestic: "DOMESTIC",
  International: "INTERNATIONAL",
  Both: "BOTH",
};

export const lenderCategoryReverseMap: Record<string, string> = {
  DOMESTIC: "Domestic",
  INTERNATIONAL: "International",
  BOTH: "Both",
};

// Lender Type Mapping
export const lenderTypeMap: Record<string, string> = {
  "Public Bank": "PUBLIC_BANK",
  "Private Bank": "PRIVATE_BANK",
  Nbfc: "NBFC",
  "Credit Union": "CREDIT_UNION",
  "International Lender": "INTERNATIONAL_LENDER",
  Fintech: "FINTECH",
};

export const lenderTypeReverseMap: Record<string, string> = {
  PUBLIC_BANK: "Public Bank",
  PRIVATE_BANK: "Private Bank",
  NBFC: "Nbfc",
  CREDIT_UNION: "Credit Union",
  INTERNATIONAL_LENDER: "International Lender",
  FINTECH: "Fintech",
};

// Lender Data Source Mapping
export const lenderDataSourceMap: Record<string, string> = {
  "Manual Entry": "MANUAL_ENTRY",
  Import: "IMPORT",
  "Api Integration": "API_INTEGRATION",
};

export const lenderDataSourceReverseMap: Record<string, string> = {
  MANUAL_ENTRY: "Manual Entry",
  IMPORT: "Import",
  API_INTEGRATION: "Api Integration",
};

// Lender Record Status Mapping
export const lenderRecordStatusMap: Record<string, string> = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  "Under Review": "UNDER_REVIEW",
  Suspended: "SUSPENDED",
};

export const lenderRecordStatusReverseMap: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  UNDER_REVIEW: "Under Review",
  SUSPENDED: "Suspended",
};

// Performance Rating Mapping
export const performanceRatingMap: Record<string, string> = {
  Excellent: "EXCELLENT",
  Good: "GOOD",
  Average: "AVERAGE",
  Poor: "POOR",
};

export const performanceRatingReverseMap: Record<string, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  AVERAGE: "Average",
  POOR: "Poor",
};

// Co-Signer Requirement Mapping
export const coSignerRequirementMap: Record<string, string> = {
  "Always Required": "ALWAYS_REQUIRED",
  "Sometimes Required": "SOMETIMES_REQUIRED",
  "Not Required": "NOT_REQUIRED",
};

export const coSignerRequirementReverseMap: Record<string, string> = {
  ALWAYS_REQUIRED: "Always Required",
  SOMETIMES_REQUIRED: "Sometimes Required",
  NOT_REQUIRED: "Not Required",
};

// Lender Collateral Type Mapping
export const lenderCollateralTypeMap: Record<string, string> = {
  Property: "PROPERTY",
  "Fixed Deposits": "FIXED_DEPOSITS",
  "Lic Policies": "LIC_POLICIES",
  Securities: "SECURITIES",
  "Guarantor Only": "GUARANTOR_ONLY",
  "No Collateral": "NO_COLLATERAL",
  "Na Plot": "NA_PLOT",
};

export const lenderCollateralTypeReverseMap: Record<string, string> = {
  PROPERTY: "Property",
  FIXED_DEPOSITS: "Fixed Deposits",
  LIC_POLICIES: "Lic Policies",
  SECURITIES: "Securities",
  GUARANTOR_ONLY: "Guarantor Only",
  NO_COLLATERAL: "No Collateral",
  NA_PLOT: "Na Plot",
};

// Supported Course Types Mapping
export const supportedCourseTypesMap: Record<string, string> = {
  Undergraduate: "UNDERGRADUATE",
  Graduate: "GRADUATE",
  Phd: "PHD",
  Diploma: "DIPLOMA",
  Certificate: "CERTIFICATE",
  Professional: "PROFESSIONAL",
  Technical: "TECHNICAL",
};

export const supportedCourseTypesReverseMap: Record<string, string> = {
  UNDERGRADUATE: "Undergraduate",
  GRADUATE: "Graduate",
  PHD: "Phd",
  DIPLOMA: "Diploma",
  CERTIFICATE: "Certificate",
  PROFESSIONAL: "Professional",
  TECHNICAL: "Technical",
};

// Supported Destinations Mapping
export const supportedDestinationsMap: Record<string, string> = {
  Us: "US",
  Uk: "UK",
  Canada: "CANADA",
  Australia: "AUSTRALIA",
  Germany: "GERMANY",
  France: "FRANCE",
  Singapore: "SINGAPORE",
  Italy: "ITALY",
  Uae: "UAE",
  Other: "OTHER",
};

export const supportedDestinationsReverseMap: Record<string, string> = {
  US: "Us",
  UK: "Uk",
  CANADA: "Canada",
  AUSTRALIA: "Australia",
  GERMANY: "Germany",
  FRANCE: "France",
  SINGAPORE: "Singapore",
  ITALY: "Italy",
  UAE: "Uae",
  OTHER: "Other",
};

// API Connectivity Status Mapping
export const apiConnectivityStatusMap: Record<string, string> = {
  Connected: "CONNECTED",
  Disconnected: "DISCONNECTED",
  "In Progress": "IN_PROGRESS",
  Failed: "FAILED",
  "Not Applicable": "NOT_APPLICABLE",
};

export const apiConnectivityStatusReverseMap: Record<string, string> = {
  CONNECTED: "Connected",
  DISCONNECTED: "Disconnected",
  IN_PROGRESS: "In Progress",
  FAILED: "Failed",
  NOT_APPLICABLE: "Not Applicable",
};

// Integration Level Mapping
export const integrationLevelMap: Record<string, string> = {
  "Full Digital": "FULL_DIGITAL",
  "Partial Digital": "PARTIAL_DIGITAL",
  Manual: "MANUAL",
  Hybrid: "HYBRID",
};

export const integrationLevelReverseMap: Record<string, string> = {
  FULL_DIGITAL: "Full Digital",
  PARTIAL_DIGITAL: "Partial Digital",
  MANUAL: "Manual",
  HYBRID: "Hybrid",
};

// Holiday Processing Mapping
export const holidayProcessingMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Limited: "LIMITED",
};

export const holidayProcessingReverseMap: Record<string, string> = {
  YES: "Yes",
  NO: "No",
  LIMITED: "Limited",
};

// Repayment Options Mapping
export const repaymentOptionsMap: Record<string, string> = {
  Emi: "EMI",
  "Simple Int": "SIMPLE_INT",
  "Partial Int": "PARTIAL_INT",
  "Complete Morat": "COMPLETE_MORAT",
};

export const repaymentOptionsReverseMap: Record<string, string> = {
  EMI: "Emi",
  SIMPLE_INT: "Simple Int",
  PARTIAL_INT: "Partial Int",
  COMPLETE_MORAT: "Complete Morat",
};

// Partnership Status Mapping
export const partnershipStatusMap: Record<string, string> = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Pending: "PENDING",
  Terminated: "TERMINATED",
  "On Hold": "ON_HOLD",
};

export const partnershipStatusReverseMap: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING: "Pending",
  TERMINATED: "Terminated",
  ON_HOLD: "On Hold",
};

// Payout Terms Mapping
export const payoutTermsMap: Record<string, string> = {
  Custom: "CUSTOM",
  Monthly: "MONTHLY",
  Quarterly: "QUARTERLY",
  Yearly: "YEARLY",
};

export const payoutTermsReverseMap: Record<string, string> = {
  CUSTOM: "Custom",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};
