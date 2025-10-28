/**
 * Enum value mapping for HubSpot
 * Maps Prisma enum values to HubSpot internal names
 */
/**
 * Enum value mapping for HubSpot
 * Keys = Prisma enum constant names (UPPER_CASE)
 * Values = HubSpot internal names
 */
const ENUM_MAPPINGS: Record<string, Record<string, string>> = {
  // Current Education Level
  current_education_level: {
    "HIGH_SCHOOL": "High School",
    "BACHELORS": "Bachelors",
    "MASTERS": "Masters",
    "PHD": "PhD",
    "DIPLOMA": "Diploma",
    "OTHER": "Other",
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
  
  // Target Degree Level
  target_degree_level: {
    "BACHELORS": "Bachelors",
    "MASTERS": "Masters",
    "PHD": "PhD",
    "DIPLOMA": "Diploma",
    "CERTIFICATE": "Certificate",
    "PROFESSIONAL_COURSE": "Professional Course",
  },
  
  // Gender
  gender: {
    "MALE": "Male",
    "FEMALE": "Female",
    "OTHER": "Other",
    "PREFER_NOT_TO_SAY": "Prefer Not to Say",
  },
  
  // Course Type
  course_type: {
    "STEM": "STEM",
    "BUSINESS": "Business",
    "OTHERS": "Others",
  },
  
  // Preferred Study Destination
  preferred_study_destination: {
    "US": "US",
    "UK": "UK",
    "CANADA": "Canada",
    "AUSTRALIA": "Australia",
    "GERMANY": "Germany",
    "FRANCE": "France",
    "SINGAPORE": "Singapore",
    "ITALY": "Italy",
    "UAE": "UAE",
    "JAPAN": "Japan",
    "CHINA": "China",
    "INDIA": "India",
    "NEW_ZEALAND": "New Zealand",
    "OTHER": "Other",
  },
  
  // Intended Start Term
  intended_start_term: {
    "FALL": "Fall",
    "SPRING": "Spring",
    "SUMMER": "Summer",
    "WINTER": "Winter",
  },
  
  // Lead Source
  lead_source: {
    "ORGANIC_SEARCH": "Organic Search",
    "SOCIAL_MEDIA": "Social Media",
    "B2B_PARTNER": "B2B Partner",
    "REFERRAL": "Referral",
    "ADVERTISEMENT": "Advertisement",
    "WEBSITE": "Website",
    "WALK_IN": "Walk-in",
    "OTHER": "Other",
  },
  
  // Co-applicant Occupation
  co_applicant_occupation: {
    "SALARIED": "Salaried",
    "SELF_EMPLOYED": "Self-Employed",
    "RETIRED": "Retired",
    "OTHERS": "Others",
  },
  
  // Co-applicant Relationship
  co_applicant_relationship: {
    "FATHER": "Father",
    "MOTHER": "Mother",
    "SPOUSE": "Spouse",
    "SIBLING": "Sibling",
    "UNCLE": "Uncle",
    "AUNT": "Aunt",
    "GRAND_FATHER": "Grandfather",
    "GRAND_MOTHER": "Grandmother",
    "OTHERS": "Others",
  },
  
  // Collateral Available
  collateral_available: {
    "YES": "Yes",
    "NO": "No",
  },
  
  // Collateral Type
  collateral_type: {
    "PROPERTY": "Property",
    "FD": "FD",
    "NA_PLOT": "NA Plot",
    "OTHER": "Other",
  },
  
  // Financial Currency
  currency: {
    "INR": "INR",
    "USD": "USD",
    "EUR": "EUR",
    "GBP": "GBP",
    "CAD": "CAD",
    "AUD": "AUD",
    "OTHER": "Other",
  },
  
  // Loan Type Preference
  loan_type_preference: {
    "SECURED": "Secured",
    "UNSECURED": "Unsecured",
    "GOVERNMENT_SCHEME": "Government Scheme",
    "NO_PREFERENCE": "No Preference",
  },
  
  // Repayment Type Preference
  repayment_type_preference: {
    "EMI": "EMI",
    "SIMPLE_INT": "Simple Interest",
    "PARTIAL_INT": "Partial Interest",
    "COMPLETE_MORAT": "Complete Moratorium",
  },
  
  // Priority Level
  priority_level: {
    "HIGH": "High",
    "MEDIUM": "Medium",
    "LOW": "Low",
    "URGENT": "Urgent",
  },
  
  // Current Status Disposition
  current_status_disposition: {
    "NOT_INTERESTED": "Not Interested",
    "WRONG_NUMBER": "Wrong Number",
    "CALL_NOT_ANSWERED": "Call Not Answered",
    "FOLLOW_UP": "Follow Up",
    "INT_FOR_NEXT_YEAR": "Interested for Next Year",
    "PARTIAL_DOCUMENTS_RECEIVED": "Partial Documents Received",
  },
  
  // Status Disposition Reason
  status_disposition_reason: {
    "ALREADY_APPLIED": "Already Applied",
    "NOT_LOOKING_AT_LOAN": "Not Looking at Loan",
    "SELF_FUNDING": "Self Funding",
    "OTHERS": "Others",
  },
  
  // Partner Commission Applicable
  partner_commission_applicable: {
    "YES": "Yes",
    "NO": "No",
  },
  
  // Nationality (sample - add full list if needed)
  nationality: {
    "INDIA": "India",
    "UNITED_STATES": "United States",
    "UNITED_KINGDOM": "United Kingdom",
    "CANADA": "Canada",
    "AUSTRALIA": "Australia",
    "GERMANY": "Germany",
    "FRANCE": "France",
    "CHINA": "China",
    "JAPAN": "Japan",
    // ... add others as needed
  },
};

/**
 * Map enum value from Prisma to HubSpot
 */
export function mapEnumValue(fieldName: string, value: any): any {
  if (!value) return null;
  
  const mapping = ENUM_MAPPINGS[fieldName];
  if (!mapping) return value; // No mapping defined, return as-is
  
  return mapping[value] || value; // Return mapped value or original
}