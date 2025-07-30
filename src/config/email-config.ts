// src/config/email.ts
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
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass:  'tuyg kpwj osmc cark',
  },
};

export const EMAIL_TEMPLATES = {
  subjects: {
    eligible: '🎉 Loan Pre-Approval Confirmed - Next Steps Inside',
    notEligible: '📋 Loan Application Received - Under Review',
    processing: '📋 Loan Application Received - Processing'
  },
  links: {
    contactTeam: process.env.CONTACT_TEAM_URL || 'https://bit.ly/4iSmtux',
    checkEligibility: process.env.CHECK_ELIGIBILITY_URL || '#'
  }
} as const;

export const DEFAULT_COMPANY_NAME = 'Edumate';