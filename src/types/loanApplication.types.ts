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

// Auto Extraction Possible Mapping
export const autoExtractionPossibleMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Partial: "PARTIAL",
};

// OCR Compatibility Mapping
export const ocrCompatibilityMap: Record<string, string> = {
  High: "HIGH",
  Medium: "MEDIUM",
  Low: "LOW",
  "Not Compatible": "NOT_COMPATIBLE",
};

// Parallel Processing Allowed Mapping
export const parallelProcessingAllowedMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Preferred: "PREFERRED",
};

// Resubmission Allowed Mapping
export const resubmissionAllowedMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Limited Attempts": "LIMITED_ATTEMPTS",
};

// Accepted Formats Mapping
export const acceptedFormatsMap: Record<string, string> = {
  Pdf: "PDF",
  Jpg: "JPG",
  Jpeg: "JPEG",
  Png: "PNG",
  Tiff: "TIFF",
  Doc: "DOC",
  Docx: "DOCX",
  "Original Hard Copy": "ORIGINAL_HARD_COPY",
  "Scanned Copy": "SCANNED_COPY",
  "Digital Copy": "DIGITAL_COPY",
};

// Color Requirements Mapping
export const colorRequirementsMap: Record<string, string> = {
  "Color Only": "COLOR_ONLY",
  "Black White Only": "BLACK_WHITE_ONLY",
  "Both Acceptable": "BOTH_ACCEPTABLE",
  "Color Preferred": "COLOR_PREFERRED",
};

// Combined Document Allowed Mapping
export const combinedDocumentAllowedMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Single Page Only": "SINGLE_PAGE_ONLY",
};

// Language Requirements Mapping
export const languageRequirementsMap: Record<string, string> = {
  English: "ENGLISH",
  Hindi: "HINDI",
  "Regional With Translation": "REGIONAL_WITH_TRANSLATION",
  "Notarized Translation Required": "NOTARIZED_TRANSLATION_REQUIRED",
};

// Multiple Pages Allowed Mapping
export const multiplePagesAllowedMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Single Page Only": "SINGLE_PAGE_ONLY",
};

// Quality Standards Mapping
export const qualityStandardsMap: Record<string, string> = {
  "Clear Legible": "CLEAR_LEGIBLE",
  "All Corners Visible": "ALL_CORNERS_VISIBLE",
  "No Shadows": "NO_SHADOWS",
  "Original Colors": "ORIGINAL_COLORS",
  "Stamped Signed": "STAMPED_SIGNED",
  Notarized: "NOTARIZED",
  Apostilled: "APOSTILLED",
};

// Applicability Status Mapping
export const applicabilityStatusMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Conditional: "CONDITIONAL",
};

// Collateral Dependency Mapping
export const collateralDependencyMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Not Applicable": "NOT_APPLICABLE",
};

// Required For Countries Mapping
export const requiredForCountriesMap: Record<string, string> = {
  Us: "US",
  Uk: "UK",
  Canada: "CANADA",
  Australia: "AUSTRALIA",
  Germany: "GERMANY",
  France: "FRANCE",
  Other: "OTHER",
};

// Required For Courses Mapping
export const requiredForCoursesMap: Record<string, string> = {
  Engineering: "ENGINEERING",
  Mba: "MBA",
  Ms: "MS",
  Medicine: "MEDICINE",
  Law: "LAW",
  Arts: "ARTS",
  Science: "SCIENCE",
  Other: "OTHER",
};

// Data Sensitivity Mapping
export const dataSensitivityMap: Record<string, string> = {
  "Highly Sensitive": "HIGHLY_SENSITIVE",
  Sensitive: "SENSITIVE",
  Moderate: "MODERATE",
  Low: "LOW",
  Public: "PUBLIC",
};

// GDPR Relevance Mapping
export const gdprRelevanceMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Partial: "PARTIAL",
  "Not Applicable": "NOT_APPLICABLE",
};

// Document Availability Mapping
export const documentAvailabilityMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Planned: "PLANNED",
  "Not Required": "NOT_REQUIRED",
};

// Automated Processing Mapping
export const automatedProcessingMap: Record<string, string> = {
  Full: "FULL",
  Partial: "PARTIAL",
  "Manual Only": "MANUAL_ONLY",
  Hybrid: "HYBRID",
};

// Blockchain Verification Mapping
export const blockchainVerificationMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Not Applicable": "NOT_APPLICABLE",
  Future: "FUTURE",
};

// Digital Signature Required Mapping
export const digitalSignatureRequiredMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Optional: "OPTIONAL",
  Preferred: "PREFERRED",
};

// E-Signature Accepted Mapping
export const eSignatureAcceptedMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Case By Case": "CASE_BY_CASE",
};

// Real Time Verification Mapping
export const realTimeVerificationMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Planned: "PLANNED",
  "Not Applicable": "NOT_APPLICABLE",
};

// Application Source Mapping
export const applicationSourceMap: Record<string, string> = {
  "Direct": "DIRECT",
  "B2b Partner": "B2B_PARTNER",
  "Website": "WEBSITE",
  "Referral": "REFERRAL",
  "Advertisement": "ADVERTISEMENT",
};

// Admission Status Mapping
export const admissionStatusMap: Record<string, string> = {
  "Not Applied": "NOT_APPLIED",
  "Applied": "APPLIED",
  "Interview Scheduled": "INTERVIEW_SCHEDULED",
  "Waitlisted": "WAITLISTED",
  "Admitted": "ADMITTED",
  "Rejected": "REJECTED",
};

// Visa Status Mapping
export const visaStatusMap: Record<string, string> = {
  "Not Applied": "NOT_APPLIED",
  "Applied": "APPLIED",
  "Approved": "APPROVED",
  "Rejected": "REJECTED",
  "Pending": "PENDING",
};

// I20/CAS Status Mapping
export const i20CasStatusMap: Record<string, string> = {
  "Yes": "YES",
  "No": "NO",
  "Not Applicable": "NOT_APPLICABLE",
  "Pending": "PENDING",
};

// Application Status Enum Mapping
export const applicationStatusEnumMap: Record<string, string> = {
  "Pre-Approved": "PRE_APPROVED",
  "Approved": "APPROVED",
  "Sanction Letter Issued": "SANCTION_LETTER_ISSUED",
  "Disbursement Pending": "DISBURSEMENT_PENDING",
  "Disbursed": "DISBURSED",
  "Rejected": "REJECTED",
  "On Hold": "ON_HOLD",
  "Withdrawn": "WITHDRAWN",
  "Cancelled": "CANCELLED",
};

// Priority Level Mapping
export const priorityLevelMap: Record<string, string> = {
  "High": "HIGH",
  "Medium": "MEDIUM",
  "Low": "LOW",
  "Urgent": "URGENT",
};

// Record Status Mapping
export const recordStatusMap: Record<string, string> = {
  "Active": "ACTIVE",
  "Completed": "COMPLETED",
  "Cancelled": "CANCELLED",
  "Archived": "ARCHIVED",
};

// Loan Product Type Mapping
export const loanProductTypeMap: Record<string, string> = {
  "Secured": "SECURED",
  "Unsecured": "UNSECURED",
  "Government Scheme": "GOVERNMENT_SCHEME",
};

// Interest Rate Type Mapping
export const interestRateTypeMap: Record<string, string> = {
  "Fixed": "FIXED",
  "Floating": "FLOATING",
  "Hybrid": "HYBRID",
  "Choice Based": "CHOICE_BASED",
};

// Delay Reason Mapping
export const delayReasonMap: Record<string, string> = {
  "Incomplete Documents": "INCOMPLETE_DOCUMENTS",
  "Customer Not Responding": "CUSTOMER_NOT_RESPONDING",
  "Lender Processing": "LENDER_PROCESSING",
  "Internal Review": "INTERNAL_REVIEW",
  "Compliance Check": "COMPLIANCE_CHECK",
  "Other": "OTHER",
};

// Rejection Reason Mapping
export const rejectionReasonMap: Record<string, string> = {
  // Loan-related
  "Insufficient Income": "INSUFFICIENT_INCOME",
  "Poor Credit Score": "POOR_CREDIT_SCORE",
  "Incomplete Documents": "INCOMPLETE_DOCUMENTS",
  "Course Not Approved": "COURSE_NOT_APPROVED",
  "University Not Approved": "UNIVERSITY_NOT_APPROVED",
  "High Risk Profile": "HIGH_RISK_PROFILE",
  "Policy Changes": "POLICY_CHANGES",
  
  // Document-related
  "Invalid Format": "INVALID_FORMAT",
  "Expired Document": "EXPIRED_DOCUMENT",
  "Unclear Image": "UNCLEAR_IMAGE",
  "Incomplete Information": "INCOMPLETE_INFORMATION",
  "Mismatch Data": "MISMATCH_DATA",
  "Fraudulent": "FRAUDULENT",
  "Wrong Document": "WRONG_DOCUMENT",
  "Not Certified": "NOT_CERTIFIED",
  
  "Other": "OTHER",
};

// Appeal Outcome Mapping
export const appealOutcomeMap: Record<string, string> = {
  "Pending": "PENDING",
  "Approved": "APPROVED",
  "Rejected": "REJECTED",
  "Not Applicable": "NOT_APPLICABLE",
};

// Communication Channel Mapping
export const communicationChannelMap: Record<string, string> = {
  "Phone": "PHONE",
  "Email": "EMAIL",
  "Whatsapp": "WHATSAPP",
  "Sms": "SMS",
  "Video Call": "VIDEO_CALL",
};

// Follow Up Frequency Mapping
export const followUpFrequencyMap: Record<string, string> = {
  "Daily": "DAILY",
  "Weekly": "WEEKLY",
  "Bi Weekly": "BI_WEEKLY",
  "Monthly": "MONTHLY",
  "As Needed": "AS_NEEDED",
};

// Application Source System Mapping
export const applicationSourceSystemMap: Record<string, string> = {
  "Manual Entry": "MANUAL_ENTRY",
  "Website Form": "WEBSITE_FORM",
  "Partner Portal": "PARTNER_PORTAL",
  "Import": "IMPORT",
  "Api": "API",
};

// Integration Status Mapping
export const integrationStatusMap: Record<string, string> = {
  "Synced": "SYNCED",
  "Pending Sync": "PENDING_SYNC",
  "Sync Failed": "SYNC_FAILED",
  "Not Required": "NOT_REQUIRED",
};

// Commission Base Mapping
export const commissionBaseMap: Record<string, string> = {
  "Loan Amount": "LOAN_AMOUNT",
  "Fixed Amount": "FIXED_AMOUNT",
  "Tiered": "TIERED",
};

// Commission Status Mapping
export const commissionStatusMap: Record<string, string> = {
  "Not Applicable": "NOT_APPLICABLE",
  "Pending Calculation": "PENDING_CALCULATION",
  "Calculated": "CALCULATED",
  "Approved For Payment": "APPROVED_FOR_PAYMENT",
  "Paid": "PAID",
  "On Hold": "ON_HOLD",
};
// Course Level Mapping
export const courseLevelMap: Record<string, string> = {
  "Bachelors": "BACHELORS",
  "Masters": "MASTERS",
  "PhD": "PHD",
  "Diploma": "DIPLOMA",
  "Certificate": "CERTIFICATE",
  "Professional": "PROFESSIONAL",
};