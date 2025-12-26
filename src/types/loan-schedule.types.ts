export interface StrategyConfig {
  stepup?: {
    annualIncrease: number;
  };
  prepayment?: {
    amount: number;
    year: number;
  };
  secured?: {
    newRate: number;
  };
}

export interface RepaymentScheduleRequest {
  principal: number;
  annualRate: number;
  tenureYears: number;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  fromName?: string;
  subject?: string;
  message?: string;
  sendEmail?: boolean;
  strategyType?: 'stepup' | 'prepayment' | 'secured';
  strategyConfig?: StrategyConfig;
  emi?: number;
}

// Response and calculation interfaces (unchanged)
export interface MonthlyPayment {
  month: number;
  emi: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface YearlyBreakdown {
  year: number;
  totalEMI: number;
  totalPrincipal: number;
  totalInterest: number;
  remainingBalance: number;
}

export interface LoanDetails {
  principal: number;
  annualRate: number;
  tenureYears: number;
  monthlyEMI: number;
  totalAmount: number;
  totalInterest: number;
}

export interface RepaymentScheduleResponse {
  status: "sent" | "not-sent";
  loanDetails: LoanDetails;
  monthlySchedule: MonthlyPayment[];
  yearlyBreakdown: YearlyBreakdown[];
  email?: {
    to: string;
    subject: string;
    sentAt: string;
    hasPdfAttachment?: boolean;
  };
  pdfFileName?: string;
  pdf?: {
    base64: string;
    fileName?: string;
    mimeType: string;
    size: number;
  };
  warnings?: {
    pdfGeneration?: string;
    message?: string;
  };
  requestId: string;
}

export interface CalculationResult {
  loanDetails: LoanDetails;
  monthlySchedule: MonthlyPayment[];
  yearlyBreakdown: YearlyBreakdown[];
}

export type StrategyType = 'stepup' | 'prepayment' | 'secured';