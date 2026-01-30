// src/routes/dashboard.routes.ts
// COMPLETE VERSION WITH FILTERING - Phase 1 & 2

import { Router } from "express";
import {
  fetchKeyMetrics,
  fetchTopPartners,
  fetchMonthlyTrends,
  fetchPipelineStatus,
  fetchPartnerActivity,
  fetchDashboardOverview,
  fetchFilterOptions,
  exportKeyMetricsCSV,
  exportTopPartnersCSV,
  exportTrendsCSV,
  exportPipelineStatusCSV,
} from "../controllers/dashboard.controller";
import { getEmailHistory, sendBulkDashboardEmails, sendDashboardEmail } from "../controllers/dashboard-email.controller";

const router = Router();

// ============================================================================
// PHASE 1 ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/dashboard/key-metrics
 * @desc    Get key metrics for dashboard cards with filtering
 * @access  Private/Admin
 * @query   month (1-12), year, period, partnerId, compare
 * 
 * Examples:
 * - Current month: /api/dashboard/key-metrics
 * - Specific month: /api/dashboard/key-metrics?month=12&year=2024
 * - Period preset: /api/dashboard/key-metrics?period=last_3_months
 * - With comparison: /api/dashboard/key-metrics?period=this_month&compare=previous
 * - Specific partner: /api/dashboard/key-metrics?partnerId=12&period=last_month
 */
router.get("/key-metrics", fetchKeyMetrics);

/**
 * @route   GET /api/dashboard/top-partners
 * @desc    Get top performing partners with filtering
 * @access  Private/Admin
 * @query   limit (1-100, default: 10), month, year, period, partnerId, sortBy
 * 
 * Examples:
 * - Top 10 current month: /api/dashboard/top-partners
 * - Top 20 last month: /api/dashboard/top-partners?limit=20&period=last_month
 * - Sort by approvals: /api/dashboard/top-partners?sortBy=applications_approved
 * - Specific partner: /api/dashboard/top-partners?partnerId=12&period=last_6_months
 */
router.get("/top-partners", fetchTopPartners);

/**
 * @route   GET /api/dashboard/partner-activity
 * @desc    Get partner activity status (not filterable, always shows current status)
 * @access  Private/Admin
 */
router.get("/partner-activity", fetchPartnerActivity);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get complete dashboard data (all Phase 1 endpoints combined)
 * @access  Private/Admin
 * @query   month, year, period, partnerId, compare, limit
 * 
 * Examples:
 * - Full dashboard current month: /api/dashboard/overview
 * - Full dashboard last 3 months: /api/dashboard/overview?period=last_3_months
 * - Full dashboard with comparison: /api/dashboard/overview?period=this_month&compare=previous
 */
router.get("/overview", fetchDashboardOverview);

// ============================================================================
// PHASE 2 ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/dashboard/trends
 * @desc    Get monthly trends for charts (Phase 2)
 * @access  Private/Admin
 * @query   months (1-24, default: 6), partnerId
 * 
 * Examples:
 * - Last 6 months trend: /api/dashboard/trends
 * - Last 12 months trend: /api/dashboard/trends?months=12
 * - Specific partner trend: /api/dashboard/trends?partnerId=12&months=6
 */
router.get("/trends", fetchMonthlyTrends);

/**
 * @route   GET /api/dashboard/pipeline-status
 * @desc    Get pipeline status breakdown (Phase 2)
 * @access  Private/Admin
 * @query   partnerId (optional)
 * 
 * Examples:
 * - All applications: /api/dashboard/pipeline-status
 * - Specific partner: /api/dashboard/pipeline-status?partnerId=12
 */
router.get("/pipeline-status", fetchPipelineStatus);

// ============================================================================
// UTILITY ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/dashboard/filter-options
 * @desc    Get available filter options for dropdowns
 * @access  Private/Admin
 * 
 * Returns: Available periods, years, months, partners, comparison modes, sort options
 */
router.get("/filter-options", fetchFilterOptions);

// ============================================================================
// EXPORT ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/dashboard/export/key-metrics
 * @desc    Export key metrics to CSV
 * @access  Private/Admin
 * @query   Same as /key-metrics endpoint
 * 
 * Returns: CSV file download
 */
router.get("/export/key-metrics", exportKeyMetricsCSV);

/**
 * @route   GET /api/dashboard/export/top-partners
 * @desc    Export top partners to CSV
 * @access  Private/Admin
 * @query   Same as /top-partners endpoint
 * 
 * Returns: CSV file download
 */
router.get("/export/top-partners", exportTopPartnersCSV);

/**
 * @route   GET /api/dashboard/export/trends
 * @desc    Export monthly trends to CSV
 * @access  Private/Admin
 * @query   Same as /trends endpoint
 * 
 * Returns: CSV file download
 */
router.get("/export/trends", exportTrendsCSV);

/**
 * @route   GET /api/dashboard/export/pipeline-status
 * @desc    Export pipeline status to CSV
 * @access  Private/Admin
 * @query   Same as /pipeline-status endpoint
 * 
 * Returns: CSV file download
 */
router.get("/export/pipeline-status", exportPipelineStatusCSV);

/**
 * POST /admin/dashboard/email-report
 * Send dashboard report to single partner
 */
router.post("/email-report", sendDashboardEmail);

/**
 * POST /admin/dashboard/email-bulk
 * Send dashboard reports to multiple partners
 */
router.post("/email-bulk", sendBulkDashboardEmails);

/**
 * GET /admin/dashboard/email-history
 * Get email history with filters
 */
router.get("/email-history", getEmailHistory);

export { router as dashboardRoutes };