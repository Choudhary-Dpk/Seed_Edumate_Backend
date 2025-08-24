export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ExamData {
  status: 'taken' | 'not_taken' | 'scheduled';
  score: string;
}

export interface ExamResults {
  [examName: string]: ExamData;
}

export interface FormData {
  levelOfEducation?: string;
  countryOfStudy?: string;
  courseType?: string;
  loanPreference?: string;
  intakeMonth?: string;
  intakeYear?: string;
  loanAmount?: string;
  analyticalExam?: ExamResults;
  languageExam?: ExamResults;
  coApplicant?: string;
  coApplicantIncomeType?: string;
  coApplicantAnnualIncome?: string | null;
}

export interface EligibilityData {
  base_loan_amount?: string;
  study_destination_loan_amount?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  data?: EligibilityData | null;
}

export interface EmailData {
  eligibilityResult?: EligibilityResult;
  personalInfo: PersonalInfo;
  formdata: FormData;
}

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

export type EmailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export type LogEmailOptions = {
  userId: number | null;
  to: string;
  cc?: string;
  bcc?: string;
  type: string;
  subject: string;
};
