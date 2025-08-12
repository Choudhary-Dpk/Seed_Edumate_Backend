// src/types/loan-schedule.types.ts
export interface RepaymentScheduleRequest {
  principal: number;
  annualRate: number;
  tenureYears: number;
  toEmail?: string;
  fromName?: string;
  subject?: string;
  message?: string;
  sendEmail?: boolean;
  requestId?: string;
}

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
  status: 'sent' | 'not-sent';
  loanDetails: LoanDetails;
  monthlySchedule: MonthlyPayment[];
  yearlyBreakdown: YearlyBreakdown[];
  email?: {
    to: string;
    subject: string;
    sentAt: string;
  };
  pdfFileName?: string;
  requestId: string;
}

export interface CalculationResult {
  loanDetails: LoanDetails;
  monthlySchedule: MonthlyPayment[];
  yearlyBreakdown: YearlyBreakdown[];
}