// src/controllers/dashboard.controller.ts
// COMPLETE VERSION WITH FILTERING - Phase 1 & 2

import { Request, Response } from "express";
import {
  getKeyMetrics,
  getTopPartners,
  getMonthlyTrends,
  getPipelineStatus,
  getPartnerActivityStatus,
} from "../services/dashboard.service";
import { logger } from "../utils/logger";
import prisma from "../config/prisma";

/**
 * Parse and validate query parameters
 */
const parseFilters = (query: any) => {
  const filters: any = {};

  // Month filter (1-12)
  if (query.month) {
    const month = parseInt(query.month);
    if (!isNaN(month) && month >= 1 && month <= 12) {
      filters.month = month;
    }
  }

  // Year filter
  if (query.year) {
    const year = parseInt(query.year);
    if (!isNaN(year) && year >= 2020 && year <= 2030) {
      filters.year = year;
    }
  }

  // Period preset
  if (query.period) {
    const validPeriods = [
      "this_month",
      "last_month",
      "last_3_months",
      "last_6_months",
      "ytd",
      "last_year",
    ];
    if (validPeriods.includes(query.period)) {
      filters.period = query.period;
    }
  }

  // Partner ID filter
  if (query.partnerId) {
    const partnerId = parseInt(query.partnerId);
    if (!isNaN(partnerId)) {
      filters.partnerId = partnerId;
    }
  }

  // Comparison mode
  if (query.compare) {
    const validComparisons = ["none", "previous", "last_year"];
    if (validComparisons.includes(query.compare)) {
      filters.compare = query.compare;
    }
  }

  // Limit for top partners
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (!isNaN(limit) && limit >= 1 && limit <= 100) {
      filters.limit = limit;
    }
  }

  // Sort by field
  if (query.sortBy) {
    const validSortFields = [
      "total_disbursement_amount",
      "total_approved_amount",
      "applications_approved",
      "conversion_rate",
      "total_leads",
    ];
    if (validSortFields.includes(query.sortBy)) {
      filters.sortBy = query.sortBy;
    }
  }

  // Months count for trends
  if (query.months) {
    const months = parseInt(query.months);
    if (!isNaN(months) && months >= 1 && months <= 24) {
      filters.months = months;
    }
  }

  return filters;
};

/**
 * Get key metrics for dashboard cards
 * @route GET /api/dashboard/key-metrics
 * @query month, year, period, partnerId, compare
 */
export const fetchKeyMetrics = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    
    logger.debug("Fetching key metrics via API", { filters });

    const metrics = await getKeyMetrics(filters);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error("Error fetching key metrics via API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch key metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get top performing partners
 * @route GET /api/dashboard/top-partners
 * @query limit, month, year, period, partnerId, sortBy
 */
export const fetchTopPartners = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    
    logger.debug("Fetching top partners via API", { filters });

    const result = await getTopPartners(filters);

    res.status(200).json({
      success: true,
      count: result.partners.length,
      period: result.period,
      data: result.partners,
    });
  } catch (error) {
    logger.error("Error fetching top partners via API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch top partners",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get monthly trends (Phase 2)
 * @route GET /api/dashboard/trends
 * @query months, partnerId
 */
export const fetchMonthlyTrends = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    
    logger.debug("Fetching monthly trends via API", { filters });

    const trends = await getMonthlyTrends(filters);

    res.status(200).json({
      success: true,
      count: trends.length,
      data: trends,
    });
  } catch (error) {
    logger.error("Error fetching monthly trends via API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly trends",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get pipeline status breakdown (Phase 2)
 * @route GET /api/dashboard/pipeline-status
 * @query partnerId
 */
export const fetchPipelineStatus = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    
    logger.debug("Fetching pipeline status via API", { filters });

    const pipeline = await getPipelineStatus(filters);

    res.status(200).json({
      success: true,
      data: pipeline,
    });
  } catch (error) {
    logger.error("Error fetching pipeline status via API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch pipeline status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get partner activity status
 * @route GET /api/dashboard/partner-activity
 */
export const fetchPartnerActivity = async (req: Request, res: Response) => {
  try {
    logger.debug("Fetching partner activity status via API");

    const activity = await getPartnerActivityStatus();

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error("Error fetching partner activity via API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch partner activity status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get complete dashboard data (all Phase 1 endpoints in one)
 * @route GET /api/dashboard/overview
 * @query month, year, period, partnerId, compare, limit
 */
export const fetchDashboardOverview = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    
    logger.debug("Fetching complete dashboard overview via API", { filters });

    // Fetch all data in parallel
    const [keyMetrics, topPartners, partnerActivity] = await Promise.all([
      getKeyMetrics(filters),
      getTopPartners(filters),
      getPartnerActivityStatus(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        key_metrics: keyMetrics,
        top_partners: topPartners,
        partner_activity: partnerActivity,
      },
      filters: filters,
    });
  } catch (error) {
    logger.error("Error fetching dashboard overview via API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get available filter options (helper endpoint)
 * @route GET /api/dashboard/filter-options
 */
export const fetchFilterOptions = async (req: Request, res: Response) => {
  try {
    logger.debug("Fetching filter options");

    // Get available years from reports
    const reports = await prisma.hSMonthlyMISReports.findMany({
      select: {
        report_year: true,
        report_month: true,
      },
      distinct: ["report_year", "report_month"],
      orderBy: [{ report_year: "desc" }, { report_month: "desc" }],
    });

    const years = [...new Set(reports.map(r => r.report_year))].sort((a, b) => b - a);
    
    // Get available partners
    const partners = await prisma.hSB2BPartners.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      select: {
        id: true,
        partner_name: true,
      },
      orderBy: {
        partner_name: "asc",
      },
    });

    const filterOptions = {
      periods: [
        { value: "this_month", label: "This Month" },
        { value: "last_month", label: "Last Month" },
        { value: "last_3_months", label: "Last 3 Months" },
        { value: "last_6_months", label: "Last 6 Months" },
        { value: "ytd", label: "Year to Date" },
        { value: "last_year", label: "Last Year" },
      ],
      years: years.map(year => ({ value: year, label: year.toString() })),
      months: Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(2024, i).toLocaleString("default", { month: "long" }),
      })),
      comparison_modes: [
        { value: "none", label: "No Comparison" },
        { value: "previous", label: "Previous Period" },
        { value: "last_year", label: "Same Period Last Year" },
      ],
      partners: partners.map(p => ({
        value: p.id,
        label: p.partner_name || "Unknown",
      })),
      sort_options: [
        { value: "total_disbursement_amount", label: "Disbursement Amount" },
        { value: "total_approved_amount", label: "Approved Amount" },
        { value: "applications_approved", label: "Approvals Count" },
        { value: "conversion_rate", label: "Conversion Rate" },
        { value: "total_leads", label: "Leads Count" },
      ],
    };

    res.status(200).json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    logger.error("Error fetching filter options via API", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch filter options",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ============================================================================
// EXPORT ENDPOINTS
// ============================================================================

/**
 * Export key metrics to CSV
 * @route GET /api/dashboard/export/key-metrics
 * @query Same as key-metrics endpoint
 */
export const exportKeyMetricsCSV = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const metrics = await getKeyMetrics(filters);
    
    // Import export utility
    const { exportKeyMetricsToCSV } = require("../utils/dashboard-export.util");
    exportKeyMetricsToCSV(metrics, res);
  } catch (error) {
    logger.error("Error exporting key metrics", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      message: "Failed to export key metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Export top partners to CSV
 * @route GET /api/dashboard/export/top-partners
 * @query Same as top-partners endpoint
 */
export const exportTopPartnersCSV = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const result = await getTopPartners(filters);
    
    const { exportTopPartnersToCSV } = require("../utils/dashboard-export.util");
    exportTopPartnersToCSV(result, res);
  } catch (error) {
    logger.error("Error exporting top partners", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      message: "Failed to export top partners",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Export monthly trends to CSV
 * @route GET /api/dashboard/export/trends
 * @query Same as trends endpoint
 */
export const exportTrendsCSV = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const trends = await getMonthlyTrends(filters);
    
    const { exportMonthlyTrendsToCSV } = require("../utils/dashboard-export.util");
    exportMonthlyTrendsToCSV(trends, res);
  } catch (error) {
    logger.error("Error exporting trends", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      message: "Failed to export trends",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Export pipeline status to CSV
 * @route GET /api/dashboard/export/pipeline-status
 * @query Same as pipeline-status endpoint
 */
export const exportPipelineStatusCSV = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const pipeline = await getPipelineStatus(filters);
    
    const { exportPipelineStatusToCSV } = require("../utils/dashboard-export.util");
    exportPipelineStatusToCSV(pipeline, res);
  } catch (error) {
    logger.error("Error exporting pipeline status", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      message: "Failed to export pipeline status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};