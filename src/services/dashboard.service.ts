// src/services/dashboard.service.ts
// COMPLETE VERSION WITH FILTERING - Phase 1 & 2

import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../config/prisma";
import { logger } from "../utils/logger";
import { application } from "express";

/**
 * Convert Decimal to number safely
 */
const toNumber = (value: Decimal | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "toNumber" in value) {
    return value.toNumber();
  }
  return Number(value);
};

/**
 * Date period presets
 */
export interface DateRange {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
}

/**
 * Parse period preset into date range
 */
export const parsePeriodPreset = (period: string): DateRange => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  switch (period) {
    case "this_month":
      return {
        startMonth: currentMonth,
        startYear: currentYear,
        endMonth: currentMonth,
        endYear: currentYear,
      };

    case "last_month": {
      const lastMonth = new Date(currentYear, currentMonth - 2, 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();
      return {
        startMonth: month,
        startYear: year,
        endMonth: month,
        endYear: year,
      };
    }

    case "last_3_months": {
      const threeMonthsAgo = new Date(currentYear, currentMonth - 4, 1);
      return {
        startMonth: threeMonthsAgo.getMonth() + 1,
        startYear: threeMonthsAgo.getFullYear(),
        endMonth: currentMonth,
        endYear: currentYear,
      };
    }

    case "last_6_months": {
      const sixMonthsAgo = new Date(currentYear, currentMonth - 7, 1);
      return {
        startMonth: sixMonthsAgo.getMonth() + 1,
        startYear: sixMonthsAgo.getFullYear(),
        endMonth: currentMonth,
        endYear: currentYear,
      };
    }

    case "ytd": {
      return {
        startMonth: 1,
        startYear: currentYear,
        endMonth: currentMonth,
        endYear: currentYear,
      };
    }

    case "last_year": {
      return {
        startMonth: 1,
        startYear: currentYear - 1,
        endMonth: 12,
        endYear: currentYear - 1,
      };
    }

    default:
      // Default to current month
      return {
        startMonth: currentMonth,
        startYear: currentYear,
        endMonth: currentMonth,
        endYear: currentYear,
      };
  }
};

/**
 * Get month list from date range
 */
const getMonthsInRange = (
  dateRange: DateRange,
): Array<{ month: number; year: number }> => {
  const months: Array<{ month: number; year: number }> = [];
  let currentDate = new Date(dateRange.startYear, dateRange.startMonth - 1, 1);
  const endDate = new Date(dateRange.endYear, dateRange.endMonth - 1, 1);

  while (currentDate <= endDate) {
    months.push({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
};

/**
 * Calculate percentage growth
 */
const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * Get comparison period based on compare mode
 */
const getComparisonPeriod = (
  dateRange: DateRange,
  compareMode: string,
): DateRange | null => {
  if (!compareMode || compareMode === "none") return null;

  const months = getMonthsInRange(dateRange);
  const periodLength = months.length;

  switch (compareMode) {
    case "previous": {
      // Compare with previous period of same length
      const startDate = new Date(
        dateRange.startYear,
        dateRange.startMonth - 1 - periodLength,
        1,
      );
      const endDate = new Date(
        dateRange.startYear,
        dateRange.startMonth - 2,
        1,
      );

      return {
        startMonth: startDate.getMonth() + 1,
        startYear: startDate.getFullYear(),
        endMonth: endDate.getMonth() + 1,
        endYear: endDate.getFullYear(),
      };
    }

    case "last_year": {
      // Compare with same period last year
      return {
        startMonth: dateRange.startMonth,
        startYear: dateRange.startYear - 1,
        endMonth: dateRange.endMonth,
        endYear: dateRange.endYear - 1,
      };
    }

    default:
      return null;
  }
};

/**
 * Fetch aggregated metrics for a date range
 */
const fetchMetricsForRange = async (
  dateRange: DateRange,
  partnerId?: number,
): Promise<{
  leads: number;
  applications: number;
  approvals: number;
  disbursements: number;
  requested_amount: number;
  approved_amount: number;
  disbursed_amount: number;
  partners_count: number;
}> => {
  const months = getMonthsInRange(dateRange);

  const whereClause: any = {
    has_errors: false,
    OR: months.map(({ month, year }) => ({
      report_month: month,
      report_year: year,
    })),
  };

  if (partnerId) {
    whereClause.b2b_partner_id = partnerId;
  }

  const reports = await prisma.hSMonthlyMISReports.findMany({
    where: whereClause,
  });

  // Aggregate metrics
  const leads = reports.reduce((sum, r) => sum + r.total_leads, 0);
  const applications = reports.reduce(
    (sum, r) => sum + r.applications_initiated,
    0,
  );
  const approvals = reports.reduce(
    (sum, r) => sum + r.applications_approved,
    0,
  );
  const disbursements = reports.reduce(
    (sum, r) => sum + r.disbursements_initiated,
    0,
  );
  const requested_amount = reports.reduce(
    (sum, r) => sum + toNumber(r.total_requested_amount),
    0,
  );
  const approved_amount = reports.reduce(
    (sum, r) => sum + toNumber(r.total_approved_amount),
    0,
  );
  const disbursed_amount = reports.reduce(
    (sum, r) => sum + toNumber(r.total_disbursement_amount),
    0,
  );

  // Count unique partners
  const uniquePartners = new Set(reports.map((r) => r.b2b_partner_id));

  return {
    leads,
    applications,
    approvals,
    disbursements,
    requested_amount,
    approved_amount,
    disbursed_amount,
    partners_count: uniquePartners.size,
  };
};

/**
 * Get key metrics with filtering
 */
export const getKeyMetrics = async (filters: {
  month?: number;
  year?: number;
  period?: string;
  partnerId?: number;
  compare?: string;
}) => {
  try {
    logger.debug("Fetching key metrics with filters", filters);

    // Determine date range
    let dateRange: DateRange;

    if (filters.period) {
      dateRange = parsePeriodPreset(filters.period);
    } else if (filters.month && filters.year) {
      dateRange = {
        startMonth: filters.month,
        startYear: filters.year,
        endMonth: filters.month,
        endYear: filters.year,
      };
    } else {
      // Default to current month
      const now = new Date();
      dateRange = {
        startMonth: now.getMonth() + 1,
        startYear: now.getFullYear(),
        endMonth: now.getMonth() + 1,
        endYear: now.getFullYear(),
      };
    }

    // Fetch current period metrics
    const currentMetrics = await fetchMetricsForRange(
      dateRange,
      filters.partnerId,
    );

    // Calculate conversion rate
    const conversionRate =
      currentMetrics.applications > 0
        ? Number(
            (
              (currentMetrics.approvals / currentMetrics.applications) *
              100
            ).toFixed(2),
          )
        : 0;

    // Get total partners count (not filtered by date)
    const totalPartnersCount = await prisma.hSB2BPartners.count({
      where: {
        is_active: true,
        is_deleted: false,
        ...(filters.partnerId && { id: filters.partnerId }),
      },
    });

    const result: any = {
      total_partners: totalPartnersCount,
      active_partners_in_period: currentMetrics.partners_count,
      leads: currentMetrics.leads,
      applications: currentMetrics.applications,
      approvals: currentMetrics.approvals,
      disbursements: currentMetrics.disbursements,
      requested_amount: currentMetrics.requested_amount,
      approved_amount: currentMetrics.approved_amount,
      disbursed_amount: currentMetrics.disbursed_amount,
      conversion_rate: conversionRate,
      period: {
        start_month: dateRange.startMonth,
        start_year: dateRange.startYear,
        end_month: dateRange.endMonth,
        end_year: dateRange.endYear,
      },
    };

    // Add comparison if requested
    if (filters.compare && filters.compare !== "none") {
      const comparisonPeriod = getComparisonPeriod(dateRange, filters.compare);

      if (comparisonPeriod) {
        const comparisonMetrics = await fetchMetricsForRange(
          comparisonPeriod,
          filters.partnerId,
        );
        const comparisonConversionRate =
          comparisonMetrics.applications > 0
            ? Number(
                (
                  (comparisonMetrics.approvals /
                    comparisonMetrics.applications) *
                  100
                ).toFixed(2),
              )
            : 0;

        result.comparison = {
          period: {
            start_month: comparisonPeriod.startMonth,
            start_year: comparisonPeriod.startYear,
            end_month: comparisonPeriod.endMonth,
            end_year: comparisonPeriod.endYear,
          },
          metrics: {
            leads: comparisonMetrics.leads,
            applications: comparisonMetrics.applications,
            approvals: comparisonMetrics.approvals,
            disbursements: comparisonMetrics.disbursements,
            conversion_rate: comparisonConversionRate,
          },
          growth: {
            leads: calculateGrowth(
              currentMetrics.leads,
              comparisonMetrics.leads,
            ),
            applications: calculateGrowth(
              currentMetrics.applications,
              comparisonMetrics.applications,
            ),
            approvals: calculateGrowth(
              currentMetrics.approvals,
              comparisonMetrics.approvals,
            ),
            disbursements: calculateGrowth(
              currentMetrics.disbursements,
              comparisonMetrics.disbursements,
            ),
            requested_amount: calculateGrowth(
              currentMetrics.requested_amount,
              comparisonMetrics.requested_amount,
            ),
            approved_amount: calculateGrowth(
              currentMetrics.approved_amount,
              comparisonMetrics.approved_amount,
            ),
            disbursed_amount: calculateGrowth(
              currentMetrics.disbursed_amount,
              comparisonMetrics.disbursed_amount,
            ),
            conversion_rate: Number(
              (conversionRate - comparisonConversionRate).toFixed(2),
            ),
          },
        };
      }
    }

    logger.info("Key metrics calculated successfully", {
      period: result.period,
      has_comparison: !!result.comparison,
    });

    return result;
  } catch (error) {
    logger.error("Error fetching key metrics", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Get top performing partners with filtering
 */
export const getTopPartners = async (filters: {
  limit?: number;
  month?: number;
  year?: number;
  period?: string;
  partnerId?: number;
  sortBy?: string;
}) => {
  try {
    const limit = filters.limit || 10;

    logger.debug("Fetching top partners with filters", filters);

    // Determine date range
    let dateRange: DateRange;

    if (filters.period) {
      dateRange = parsePeriodPreset(filters.period);
    } else if (filters.month && filters.year) {
      dateRange = {
        startMonth: filters.month,
        startYear: filters.year,
        endMonth: filters.month,
        endYear: filters.year,
      };
    } else {
      const now = new Date();
      dateRange = {
        startMonth: now.getMonth() + 1,
        startYear: now.getFullYear(),
        endMonth: now.getMonth() + 1,
        endYear: now.getFullYear(),
      };
    }

    const months = getMonthsInRange(dateRange);

    const whereClause: any = {
      has_errors: false,
      OR: months.map(({ month, year }) => ({
        report_month: month,
        report_year: year,
      })),
    };

    if (filters.partnerId) {
      whereClause.b2b_partner_id = filters.partnerId;
    }

    // Fetch reports
    const reports = await prisma.hSMonthlyMISReports.findMany({
      where: whereClause,
      select: {
        id: true,
        b2b_partner_id: true,
        partner_name: true,
        total_leads: true,
        applications_initiated: true,
        applications_approved: true,
        disbursements_initiated: true,
        total_requested_amount: true,
        total_approved_amount: true,
        total_disbursement_amount: true,
        report_month: true,
        report_year: true,
      },
    });

    // Aggregate by partner if multiple months
    const partnerMap = new Map();

    reports.forEach((report) => {
      const partnerId = report.b2b_partner_id;

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          partner_id: partnerId,
          partner_name: report.partner_name,
          total_leads: 0,
          applications_initiated: 0,
          applications_approved: 0,
          disbursements_initiated: 0,
          total_requested_amount: 0,
          total_approved_amount: 0,
          total_disbursement_amount: 0,
        });
      }

      const partner = partnerMap.get(partnerId);
      partner.total_leads += report.total_leads;
      partner.applications_initiated += report.applications_initiated;
      partner.applications_approved += report.applications_approved;
      partner.disbursements_initiated += report.disbursements_initiated;
      partner.total_requested_amount += toNumber(report.total_requested_amount);
      partner.total_approved_amount += toNumber(report.total_approved_amount);
      partner.total_disbursement_amount += toNumber(
        report.total_disbursement_amount,
      );
    });

    // Convert to array and calculate conversion rate
    const partnersArray = Array.from(partnerMap.values()).map((partner) => ({
      ...partner,
      conversion_rate:
        partner.applications_initiated > 0
          ? Number(
              (
                (partner.applications_approved /
                  partner.applications_initiated) *
                100
              ).toFixed(2),
            )
          : 0,
    }));

    // Sort by requested field
    const sortBy = filters.sortBy || "total_disbursement_amount";
    partnersArray.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] as number;
      const bValue = b[sortBy as keyof typeof b] as number;
      return bValue - aValue;
    });

    const topPartners = partnersArray.slice(0, limit);

    logger.info("Top partners fetched successfully", {
      count: topPartners.length,
      period: dateRange,
    });

    return {
      partners: topPartners,
      period: {
        start_month: dateRange.startMonth,
        start_year: dateRange.startYear,
        end_month: dateRange.endMonth,
        end_year: dateRange.endYear,
      },
    };
  } catch (error) {
    logger.error("Error fetching top partners", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Get monthly trends (Phase 2)
 */
export const getMonthlyTrends = async (filters: {
  months?: number;
  partnerId?: number;
}) => {
  try {
    const monthsCount = filters.months || 6;

    logger.debug("Fetching monthly trends", {
      months: monthsCount,
      partnerId: filters.partnerId,
    });

    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsCount + 1,
      1,
    );

    const dateRange: DateRange = {
      startMonth: startDate.getMonth() + 1,
      startYear: startDate.getFullYear(),
      endMonth: now.getMonth() + 1,
      endYear: now.getFullYear(),
    };

    const months = getMonthsInRange(dateRange);

    // Fetch reports for all months
    const whereClause: any = {
      has_errors: false,
      OR: months.map(({ month, year }) => ({
        report_month: month,
        report_year: year,
      })),
    };

    if (filters.partnerId) {
      whereClause.b2b_partner_id = filters.partnerId;
    }

    const reports = await prisma.hSMonthlyMISReports.findMany({
      where: whereClause,
    });

    // Aggregate by month
    const monthlyData = months.map(({ month, year }) => {
      const monthReports = reports.filter(
        (r) => r.report_month === month && r.report_year === year,
      );

      const leads = monthReports.reduce((sum, r) => sum + r.total_leads, 0);
      const applications = monthReports.reduce(
        (sum, r) => sum + r.applications_initiated,
        0,
      );
      const approvals = monthReports.reduce(
        (sum, r) => sum + r.applications_approved,
        0,
      );
      const disbursements = monthReports.reduce(
        (sum, r) => sum + r.disbursements_initiated,
        0,
      );
      const requested_amount = monthReports.reduce(
        (sum, r) => sum + toNumber(r.total_requested_amount),
        0,
      );
      const approved_amount = monthReports.reduce(
        (sum, r) => sum + toNumber(r.total_approved_amount),
        0,
      );
      const disbursed_amount = monthReports.reduce(
        (sum, r) => sum + toNumber(r.total_disbursement_amount),
        0,
      );

      const conversionRate =
        applications > 0
          ? Number(((approvals / applications) * 100).toFixed(2))
          : 0;

      return {
        month,
        year,
        month_name: new Date(year, month - 1).toLocaleString("default", {
          month: "long",
        }),
        leads,
        applications,
        approvals,
        disbursements,
        requested_amount,
        approved_amount,
        disbursed_amount,
        conversion_rate: conversionRate,
        partners_count: monthReports.length,
      };
    });

    logger.info("Monthly trends fetched successfully", {
      months_count: monthlyData.length,
    });

    return monthlyData;
  } catch (error) {
    logger.error("Error fetching monthly trends", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Get pipeline status breakdown (Phase 2)
 */
export const getPipelineStatus = async (filters: { partnerId?: number }) => {
  try {
    logger.debug("Fetching pipeline status", filters);

    const whereClause: any = {
      is_deleted: false,
    };

    if (filters.partnerId) {
      whereClause.b2b_partner_id = filters.partnerId;
    }

    // Get counts by status
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      disbursedApplications,
      rejectedApplications,
    ] = await Promise.all([
      prisma.hSLoanApplications.count({ where: whereClause }),
      prisma.hSLoanApplications.count({
        where: {
          ...whereClause,
          processing_timeline: {
            approval_date: null,
          },
        },
      }),
      prisma.hSLoanApplications.count({
        where: {
          ...whereClause,
          processing_timeline: {
            approval_date: { not: null },
            disbursement_date: null,
          },
        },
      }),
      prisma.hSLoanApplications.count({
        where: {
          ...whereClause,
          processing_timeline: {
            disbursement_date: { not: null },
          },
        },
      }),
      prisma.hSLoanApplications.count({
        where: {
          ...whereClause,
          loan_application_status: {
            application_status: "rejected",
          },
        },
      }),
    ]);

    const pipeline = [
      {
        status: "pending",
        label: "Pending Review",
        count: pendingApplications,
        percentage:
          totalApplications > 0
            ? Number(
                ((pendingApplications / totalApplications) * 100).toFixed(2),
              )
            : 0,
      },
      {
        status: "approved",
        label: "Approved (Awaiting Disbursement)",
        count: approvedApplications,
        percentage:
          totalApplications > 0
            ? Number(
                ((approvedApplications / totalApplications) * 100).toFixed(2),
              )
            : 0,
      },
      {
        status: "disbursed",
        label: "Disbursed",
        count: disbursedApplications,
        percentage:
          totalApplications > 0
            ? Number(
                ((disbursedApplications / totalApplications) * 100).toFixed(2),
              )
            : 0,
      },
      {
        status: "rejected",
        label: "Rejected",
        count: rejectedApplications,
        percentage:
          totalApplications > 0
            ? Number(
                ((rejectedApplications / totalApplications) * 100).toFixed(2),
              )
            : 0,
      },
    ];

    logger.info("Pipeline status fetched successfully", {
      total: totalApplications,
    });

    return {
      total_applications: totalApplications,
      pipeline,
    };
  } catch (error) {
    logger.error("Error fetching pipeline status", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Get partner activity status
 */
export const getPartnerActivityStatus = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    logger.debug("Fetching partner activity status", { month, year });

    const [
      totalPartners,
      activePartners,
      partnersWithReportsThisMonth,
      inactivePartnersThisMonth,
    ] = await Promise.all([
      prisma.hSB2BPartners.count({ where: { is_deleted: false } }),
      prisma.hSB2BPartners.count({
        where: { is_active: true, is_deleted: false },
      }),
      prisma.hSMonthlyMISReports.count({
        where: { report_month: month, report_year: year, has_errors: false },
      }),
      prisma.hSMonthlyMISReports.count({
        where: {
          report_month: month,
          report_year: year,
          has_errors: false,
          total_leads: 0,
          applications_initiated: 0,
        },
      }),
    ]);

    return {
      total_partners: totalPartners,
      active_partners: activePartners,
      inactive_partners: totalPartners - activePartners,
      partners_with_activity_this_month: partnersWithReportsThisMonth,
      partners_with_zero_performance: inactivePartnersThisMonth,
      activity_rate:
        activePartners > 0
          ? Number(
              ((partnersWithReportsThisMonth / activePartners) * 100).toFixed(
                2,
              ),
            )
          : 0,
    };
  } catch (error) {
    logger.error("Error fetching partner activity status", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};
