/**
 * Enum value mapping for Loan Applications to HubSpot
 * Maps Prisma enum values to HubSpot internal names
 * Keys = Prisma enum constant names (UPPER_CASE)
 * Values = HubSpot internal names
 */

const LOAN_ENUM_MAPPINGS: Record<string, Record<string, string>> = {
  // Application Source
  application_source: {
    "DIRECT": "Direct",
    "B2B_PARTNER": "B2B Partner",
    "WEBSITE": "Website",
    "REFERRAL": "Referral",
    "ADVERTISEMENT": "Advertisement",
  },
  
  // Course Level
  course_level: {
    "BACHELORS": "Bachelors",
    "MASTERS": "Masters",
    "PHD": "PhD",
    "DIPLOMA": "Diploma",
    "CERTIFICATE": "Certificate",
    "PROFESSIONAL": "Professional",
  },
  
  // Admission Status
  admission_status: {
    "NOT_APPLIED": "Not Applied",
    "APPLIED": "Applied",
    "INTERVIEW_SCHEDULED": "Interview Scheduled",
    "WAITLISTED": "Waitlisted",
    "ADMITTED": "Admitted",
    "REJECTED": "Rejected",
  },
  
  // Visa Status
  visa_status: {
    "NOT_APPLIED": "Not Applied",
    "APPLIED": "Applied",
    "APPROVED": "Approved",
    "REJECTED": "Rejected",
    "PENDING": "Pending",
  },
  
  // I20/CAS Status
  i20_cas_received: {
    "YES": "Yes",
    "NO": "No",
    "NOT_APPLICABLE": "Not Applicable",
    "PENDING": "Pending",
  },
  
  // Application Status
  status: {
    "PRE_APPROVED": "Pre-Approved",
    "APPROVED": "Approved",
    "SANCTION_LETTER_ISSUED": "Sanction Letter Issued",
    "DISBURSEMENT_PENDING": "Disbursement Pending",
    "DISBURSED": "Disbursed",
    "REJECTED": "Rejected",
    "ON_HOLD": "On Hold",
    "WITHDRAWN": "Withdrawn",
    "CANCELLED": "Cancelled",
  },
  
  // Priority Level
  priority_level: {
    "HIGH": "High",
    "MEDIUM": "Medium",
    "LOW": "Low",
    "URGENT": "Urgent",
  },
  
  // Record Status
  record_status: {
    "ACTIVE": "Active",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled",
    "ARCHIVED": "Archived",
  },
  
  // Loan Product Type
  loan_product_type: {
    "SECURED": "Secured",
    "UNSECURED": "Unsecured",
    "GOVERNMENT_SCHEME": "Government Scheme",
  },
  
  // Interest Rate Type
  interest_rate_type: {
    "FIXED": "Fixed",
    "FLOATING": "Floating",
    "HYBRID": "Hybrid",
    "CHOICE_BASED": "Choice Based",
  },
  
  // Delay Reason
  delay_reason: {
    "INCOMPLETE_DOCUMENTS": "Incomplete Documents",
    "CUSTOMER_NOT_RESPONDING": "Customer Not Responding",
    "LENDER_PROCESSING": "Lender Processing",
    "INTERNAL_REVIEW": "Internal Review",
    "COMPLIANCE_CHECK": "Compliance Check",
    "OTHER": "Other",
  },
  
  // Rejection Reason
  rejection_reason: {
    "INSUFFICIENT_INCOME": "Insufficient Income",
    "POOR_CREDIT_SCORE": "Poor Credit Score",
    "INCOMPLETE_DOCUMENTS": "Incomplete Documents",
    "COURSE_NOT_APPROVED": "Course Not Approved",
    "UNIVERSITY_NOT_APPROVED": "University Not Approved",
    "HIGH_RISK_PROFILE": "High Risk Profile",
    "POLICY_CHANGES": "Policy Changes",
    "INVALID_FORMAT": "Invalid Format",
    "EXPIRED_DOCUMENT": "Expired Document",
    "UNCLEAR_IMAGE": "Unclear Image",
    "INCOMPLETE_INFORMATION": "Incomplete Information",
    "MISMATCH_DATA": "Mismatch Data",
    "FRAUDULENT": "Fraudulent",
    "WRONG_DOCUMENT": "Wrong Document",
    "NOT_CERTIFIED": "Not Certified",
    "OTHER": "Other",
  },
  
  // Appeal Outcome
  appeal_outcome: {
    "PENDING": "Pending",
    "APPROVED": "Approved",
    "REJECTED": "Rejected",
    "NOT_APPLICABLE": "Not Applicable",
  },
  
  // Communication Channel
  communication_preference: {
    "PHONE": "Phone",
    "EMAIL": "Email",
    "WHATSAPP": "Whatsapp",
    "SMS": "Sms",
    "VIDEO_CALL": "Video Call",
  },
  
  // Follow Up Frequency
  follow_up_frequency: {
    "DAILY": "Daily",
    "WEEKLY": "Weekly",
    "BI_WEEKLY": "Bi Weekly",
    "MONTHLY": "Monthly",
    "AS_NEEDED": "As Needed",
  },
  
  // Application Source System
  application_source_system: {
    "MANUAL_ENTRY": "Manual Entry",
    "WEBSITE_FORM": "Website Form",
    "PARTNER_PORTAL": "Partner Portal",
    "IMPORT": "Import",
    "API": "API",
  },
  
  // Integration Status
  integration_status: {
    "SYNCED": "Synced",
    "PENDING_SYNC": "Pending Sync",
    "SYNC_FAILED": "Sync Failed",
    "NOT_REQUIRED": "Not Required",
  },
  
  // Commission Base
  commission_calculation_base: {
    "LOAN_AMOUNT": "Loan Amount",
    "FIXED_AMOUNT": "Fixed Amount",
    "TIERED": "Tiered",
  },
  
  // Commission Status
  commission_status: {
    "NOT_APPLICABLE": "Not Applicable",
    "PENDING_CALCULATION": "Pending Calculation",
    "CALCULATED": "Calculated",
    "APPROVED_FOR_PAYMENT": "Approved For Payment",
    "PAID": "Paid",
    "ON_HOLD": "On Hold",
  },
  
  // Application Record Status
  application_record_status: {
    "ACTIVE": "Active",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled",
    "ARCHIVED": "Archived",
  },
};

/**
 * Map enum value from Prisma to HubSpot
 */
export function mapLoanEnumValue(fieldName: string, value: any): any {
  if (!value) return null;
  
  const mapping = LOAN_ENUM_MAPPINGS[fieldName];
  if (!mapping) return value; // No mapping defined, return as-is
  
  return mapping[value] || value; // Return mapped value or original
}
