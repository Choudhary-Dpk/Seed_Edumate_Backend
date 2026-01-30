// src/types/dashboard.types.ts

/**
 * Date period presets for quick filtering
 */
export type DatePeriod =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "ytd" // Year to date
  | "last_year"
  | "custom";

/**
 * Comparison types
 */
export type ComparisonType = "none" | "previous" | "last_year" | "custom";

/**
 * Aggregation levels for trends
 */
export type AggregationLevel = "daily" | "monthly" | "quarterly" | "yearly";

/**
 * Dashboard filter parameters
 */
export interface DashboardFilters {
  // Date filters (use ONE of these approaches)
  month?: number; // 1-12
  year?: number; // 2024, 2025, etc.
  startDate?: string; // ISO format: "2024-10-01"
  endDate?: string; // ISO format: "2024-12-31"
  period?: DatePeriod; // Quick presets

  // Comparison
  compare?: ComparisonType;
  compareStartDate?: string;
  compareEndDate?: string;

  // Partner filters
  partnerId?: number; // Single partner
  partnerIds?: number[]; // Multiple partners

  // Pagination
  limit?: number;
  offset?: number;

  // Aggregation (for trends)
  aggregation?: AggregationLevel;
}

/**
 * Date range result
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
  month?: number;
  year?: number;
  label?: string;
}

/**
 * Key metrics data structure
 */
export interface KeyMetricsData {
  total_partners: number;
  active_partners_this_period: number;
  total_leads: number;
  total_applications: number;
  total_approvals: number;
  total_disbursements: number;
  total_requested_amount: number;
  total_approved_amount: number;
  total_disbursed_amount: number;
  conversion_rate: number;
  period: DateRange;
}

/**
 * Key metrics with comparison
 */
export interface KeyMetricsWithComparison {
  current: KeyMetricsData;
  comparison?: KeyMetricsData;
  growth?: {
    leads: number;
    applications: number;
    approvals: number;
    disbursements: number;
    requested_amount: number;
    approved_amount: number;
    disbursed_amount: number;
    conversion_rate: number;
  };
}

/**
 * Top partner data
 */
export interface TopPartnerData {
  id: number;
  b2b_partner_id: number;
  partner_name: string | null;
  total_leads: number;
  applications_initiated: number;
  applications_approved: number;
  disbursements_initiated: number;
  total_requested_amount: number;
  total_approved_amount: number;
  total_disbursement_amount: number;
  conversion_rate: number;
}

/**
 * Monthly trend data point
 */
export interface MonthlyTrendData {
  month: number;
  year: number;
  month_name: string;
  date: string; // ISO format for easier charting
  leads: number;
  applications: number;
  approvals: number;
  disbursements: number;
  requested_amount: number;
  approved_amount: number;
  disbursed_amount: number;
  conversion_rate: number;
  partners_count: number;
}

/**
 * Pipeline status data
 */
export interface PipelineStatusData {
  status: string;
  count: number;
  percentage: number;
  total_amount?: number;
}

/**
 * Funnel stage data
 */
export interface FunnelStageData {
  stage: string;
  count: number;
  percentage: number;
  conversion_from_previous?: number;
}