// src/types/mis-report.types.ts

export interface MonthlyMISMetrics {
  total_leads: number;
  applications_initiated: number;
  total_requested_amount: number;
  applications_approved: number;
  total_approved_amount: number;
  disbursements_initiated: number;
  total_disbursement_amount: number;
}

export interface MonthlyMISReport {
  partner_id: number;
  partner_name: string;
  partner_hubspot_id: string | null;
  report_month: number;
  report_year: number;
  metrics: MonthlyMISMetrics;
  hubspot_api_calls_made: number;
  processing_time_seconds: number;
}

export interface DisbursementTranche {
  value: string;
  timestamp: string;
  sourceType: string;
  sourceId?: string;
  updatedByUserId?: number;
}

export interface HubSpotLoanApplicationWithHistory {
  id: string;
  properties: {
    hs_object_id: string;
    application_date?: string;
    loan_amount_requested?: string;
    approval_date?: string;
    loan_amount_approved?: string;
    [key: string]: any;
  };
  propertiesWithHistory?: {
    last_loan_amount_disbursed?: DisbursementTranche[];
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface MISReportGenerationResult {
  success: boolean;
  reports_generated: number;
  reports_failed: number;
  total_processing_time_seconds: number;
  errors: Array<{
    partner_id: number;
    partner_name: string;
    error: string;
  }>;
}