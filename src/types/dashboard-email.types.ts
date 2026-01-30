// src/types/dashboard-email.types.ts

import { DashboardFilters } from "./dashboard.types";

export interface SendDashboardEmailRequest {
  partnerId?: number;
  recipientEmail: string;
  subject: string;
  message?: string;
  pdfBase64: string;
  filters: DashboardFilters;
}

export interface SendBulkDashboardEmailRequest {
  recipients: BulkEmailRecipient[];
  subject: string;
  message?: string;
  templateId?: number;
  filters: DashboardFilters;
}

export interface BulkEmailRecipient {
  partnerId: number;
  email: string;
  emailSource: "auto" | "manual";
}

export interface EmailPreviewRequest {
  partnerId: number;
  templateId?: number;
  filters: DashboardFilters;
}

export interface DashboardEmailLog {
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
    emailSource: "auto" | "manual";
    autoEmail?: string;
  };
  sentAt: Date;
  errorMsg?: string;
}

export interface DashboardEmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables?: Record<string, any>;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailHistoryFilters {
  partnerId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface EmailHistoryResponse {
  data: DashboardEmailLog[];
  total: number;
  page: number;
  limit: number;
}