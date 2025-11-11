export interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Gmail configuration
export const gmailConfig: EmailConfig = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: "tuyg kpwj osmc cark",
  },
};

export const EMAIL_TEMPLATES = {
  subjects: {
    eligible: "🎉 Loan Pre-Approval Confirmed - Next Steps Inside",
    notEligible: "📋 Loan Application Received - Under Review",
    processing: "📋 Loan Application Received - Processing",
  },
  links: {
    contactTeam:
      process.env.CONTACT_TEAM_URL ||
      "https://calendly.com/priyank-edumateglobal/speak-to-our-financing-expert?month=2025-07",
    checkEligibility: process.env.CHECK_ELIGIBILITY_URL || "#",
  },
  contact_info: {
    phone_number: process.env.CONTACT_PHONE,
    email: process.env.CONTACT_EMAIL,
  },
} as const;

export const DEFAULT_COMPANY_NAME = "Edumate";
