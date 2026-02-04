import { DashboardFilters } from "./dashboard.types";

export interface SendDashboardEmailRequest {
  partnerId?: number;
  recipientEmail: string;
  subject: string;
  message?: string;
  filters: DashboardFilters;
  
  // Either PDF or HTML content (or both)
  pdfBase64?: string;      // For PDF attachment (existing)
  htmlContent?: string;    // For HTML-only reports (new)
  
  emailSource?: "auto" | "manual";
}

export interface BulkEmailRecipient {
  partnerId: number;
  email: string;
  emailSource: "auto" | "manual";
}

export interface SendBulkDashboardEmailRequest {
  recipients: BulkEmailRecipient[];
  subject: string;
  message?: string;
  templateId?: number;
  filters: DashboardFilters;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables?: Record<string, string>;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  body: string;
  variables?: Record<string, string>;
}

export interface EmailLogEntry {
  id: number;
  partnerId?: number;
  partnerName?: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  sentBy: number;
  sentByName?: string;
  filters?: DashboardFilters;
  metadata?: {
    emailSource?: "auto" | "manual";
    autoEmail?: string;
    reportType?: "dashboard_pdf" | "monthly_report";
  };
  sentAt: Date;
  errorMsg?: string;
}

export interface DashboardEmailLog extends EmailLogEntry {}

export interface EmailHistoryQuery {
  page?: number;
  limit?: number;
  partnerId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface EmailHistoryFilters extends EmailHistoryQuery {}

export interface PartnerWithEmail {
  id: number;
  partner_name: string;
  partner_display_name?: string;
  email?: string;
  hasEmail: boolean;
}