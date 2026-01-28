// src/services/mis-report.service.ts

import { Client } from "@hubspot/api-client";
import { PublicObjectSearchRequest } from "@hubspot/api-client/lib/codegen/crm/objects";
import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../config/prisma";
import { config } from "../config/config";
import { logger } from "../utils/logger";
import { handleHubSpotError } from "./hubspotClient.service";
import {
  MonthlyMISReport,
  MonthlyMISMetrics,
  HubSpotLoanApplicationWithHistory,
  MISReportGenerationResult,
} from "../types/mis-report.types";

const hubspotClient = new Client({ accessToken: config.hubspot.accessToken });
const LOAN_APPLICATION_OBJECT_TYPE =
  config.hubspot.customObjects.loanApplication || "2-46227735";

/**
 * Convert Decimal to number safely
 */
const toNumber = (value: Decimal | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return value.toNumber();
};

/**
 * Generate monthly MIS reports for all active B2B partners
 * Runs automatically on the 1st of each month for the previous month
 */
export const generateMonthlyMISReports =
  async (): Promise<MISReportGenerationResult> => {
    const startTime = Date.now();

    // Calculate previous month
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const reportMonth = previousMonth.getMonth() + 1; // 1-12
    const reportYear = previousMonth.getFullYear();

    logger.info("Starting monthly MIS report generation", {
      report_month: reportMonth,
      report_year: reportYear,
    });

    // Get all active B2B partners
    const activePartners = await prisma.hSB2BPartners.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      select: {
        id: true,
        partner_name: true,
        hs_object_id: true,
      },
    });

    logger.info("Found active partners to process", {
      count: activePartners.length,
    });

    const results: MISReportGenerationResult = {
      success: true,
      reports_generated: 0,
      reports_failed: 0,
      total_processing_time_seconds: 0,
      errors: [],
    };

    // Process each partner
    for (const partner of activePartners) {
      try {
        logger.debug("Processing partner", {
          partner_id: partner.id,
          partner_name: partner.partner_name,
        });

        const report = await generatePartnerMISReport(
          partner.id,
          partner.partner_name || "Unknown",
          partner.hs_object_id,
          reportMonth,
          reportYear,
        );

        // Store report in database
        await storeMonthlyReport(report);

        results.reports_generated++;

        logger.info("Successfully generated report for partner", {
          partner_id: partner.id,
          partner_name: partner.partner_name,
        });
      } catch (error) {
        results.reports_failed++;
        results.success = false;

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        results.errors.push({
          partner_id: partner.id,
          partner_name: partner.partner_name || "Unknown",
          error: errorMessage,
        });

        logger.error("Failed to generate report for partner", {
          partner_id: partner.id,
          partner_name: partner.partner_name,
          error: errorMessage,
        });

        // Store error report
        await storeErrorReport(
          partner.id,
          partner.partner_name || "Unknown",
          partner.hs_object_id,
          reportMonth,
          reportYear,
          errorMessage,
        );
      }
    }

    const endTime = Date.now();
    results.total_processing_time_seconds = Math.round(
      (endTime - startTime) / 1000,
    );

    logger.info("Completed monthly MIS report generation", {
      reports_generated: results.reports_generated,
      reports_failed: results.reports_failed,
      total_time_seconds: results.total_processing_time_seconds,
    });

    return results;
  };

/**
 * Generate MIS report for a single partner
 */
export const generatePartnerMISReport = async (
  partnerId: number,
  partnerName: string,
  partnerHubSpotId: string | null,
  month: number,
  year: number,
): Promise<MonthlyMISReport> => {
  const startTime = Date.now();
  let apiCallsCount = 0;

  logger.debug("Generating MIS report for partner", {
    partner_id: partnerId,
    month,
    year,
  });

  // Calculate date range
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Metric 2: Total Leads (from local DB)
  const totalLeads = await getLeadsCount(partnerId, startDate, endDate);

  // Metrics 3 & 4: Applications Initiated (from local DB)
  const { count: applicationsInitiated, totalAmount: totalRequestedAmount } =
    await getApplicationsInitiated(partnerId, startDate, endDate);

  // Metrics 5 & 6: Applications Approved (from local DB)
  const { count: applicationsApproved, totalAmount: totalApprovedAmount } =
    await getApplicationsApproved(partnerId, startDate, endDate);

  // Metrics 7 & 8: Disbursements (from HubSpot)
  let disbursementsInitiated = 0;
  let totalDisbursementAmount = 0;

  if (partnerHubSpotId) {
    const disbursementResult = await getDisbursements(
      partnerId,
      partnerHubSpotId,
      month,
      year,
      startDate,
      endDate,
    );

    disbursementsInitiated = disbursementResult.count;
    totalDisbursementAmount = disbursementResult.totalAmount;
    apiCallsCount = disbursementResult.apiCallsCount;
  } else {
    logger.warn("Partner has no HubSpot ID, skipping disbursement metrics", {
      partner_id: partnerId,
    });
  }

  const endTime = Date.now();
  const processingTimeSeconds = Math.round((endTime - startTime) / 1000);

  const metrics: MonthlyMISMetrics = {
    total_leads: totalLeads,
    applications_initiated: applicationsInitiated,
    total_requested_amount: totalRequestedAmount,
    applications_approved: applicationsApproved,
    total_approved_amount: totalApprovedAmount,
    disbursements_initiated: disbursementsInitiated,
    total_disbursement_amount: totalDisbursementAmount,
  };

  return {
    partner_id: partnerId,
    partner_name: partnerName,
    partner_hubspot_id: partnerHubSpotId,
    report_month: month,
    report_year: year,
    metrics,
    hubspot_api_calls_made: apiCallsCount,
    processing_time_seconds: processingTimeSeconds,
  };
};

/**
 * Get leads count from local database
 */
const getLeadsCount = async (
  partnerId: number,
  startDate: Date,
  endDate: Date,
): Promise<number> => {
  const count = await prisma.hSEdumateContacts.count({
    where: {
      b2b_partner_id: partnerId,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
      is_deleted: false,
    },
  });

  logger.debug("Retrieved leads count", { partner_id: partnerId, count });
  return count;
};

/**
 * Get applications initiated from local database
 */
const getApplicationsInitiated = async (
  partnerId: number,
  startDate: Date,
  endDate: Date,
): Promise<{ count: number; totalAmount: number }> => {
  const applications = await prisma.hSLoanApplications.findMany({
    where: {
      b2b_partner_id: partnerId,
      application_date: {
        gte: startDate,
        lte: endDate,
      },
      is_deleted: false,
    },
    include: {
      financial_requirements: {
        select: {
          loan_amount_requested: true,
        },
      },
    },
  });

  const count = applications.length;
  const totalAmount = applications.reduce((sum, app) => {
    const amount = app.financial_requirements?.loan_amount_requested;
    return sum + toNumber(amount);
  }, 0);

  logger.debug("Retrieved applications initiated", {
    partner_id: partnerId,
    count,
    total_amount: totalAmount,
  });

  return { count, totalAmount };
};

/**
 * Get applications approved from local database
 */
const getApplicationsApproved = async (
  partnerId: number,
  startDate: Date,
  endDate: Date,
): Promise<{ count: number; totalAmount: number }> => {
  const applications = await prisma.hSLoanApplications.findMany({
    where: {
      b2b_partner_id: partnerId,
      is_deleted: false,
      processing_timeline: {
        approval_date: {
          gte: startDate,
          lte: endDate,
          not: null,
        },
      },
    },
    include: {
      financial_requirements: {
        select: {
          loan_amount_approved: true,
        },
      },
    },
  });

  const count = applications.length;
  const totalAmount = applications.reduce((sum, app) => {
    const amount = app.financial_requirements?.loan_amount_approved;
    return sum + toNumber(amount);
  }, 0);

  logger.debug("Retrieved applications approved", {
    partner_id: partnerId,
    count,
    total_amount: totalAmount,
  });

  return { count, totalAmount };
};

/**
 * Get disbursements from HubSpot
 * Uses Search API to find applications with disbursements, then Batch Read for property history
 */
const getDisbursements = async (
  partnerId: number,
  partnerHubSpotId: string,
  month: number,
  year: number,
  startDate: Date,
  endDate: Date,
): Promise<{ count: number; totalAmount: number; apiCallsCount: number }> => {
  let apiCallsCount = 0;
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  try {
    // Step 1: Use Search API to find applications with disbursements in the date range
    logger.debug("Searching for applications with disbursements", {
      partner_id: partnerId,
      partner_hubspot_id: partnerHubSpotId,
      month,
      year,
    });

    const searchRequest: any = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "b2b_partner_id",
              operator: "EQ",
              value: partnerHubSpotId,
            },
            {
              propertyName: "last_loan_amount_disbursed",
              operator: "HAS_PROPERTY",
            },
          ],
        },
      ],
      properties: ["hs_object_id"],
      limit: 100,
      sorts: [],
      after: undefined,
    };

    const searchResults: string[] = [];
    let after: string | undefined = undefined;

    // Handle pagination
    do {
      if (after) {
        searchRequest.after = after;
      }

      const response = await hubspotClient.crm.objects.searchApi.doSearch(
        LOAN_APPLICATION_OBJECT_TYPE,
        searchRequest,
      );

      apiCallsCount++;

      searchResults.push(...response.results.map((r) => r.id));

      after = response.paging?.next?.after;

      logger.debug("Search API response", {
        results_count: response.results.length,
        has_more: !!after,
      });
    } while (after);

    if (searchResults.length === 0) {
      logger.debug("No applications with disbursements found", {
        partner_id: partnerId,
      });
      return { count: 0, totalAmount: 0, apiCallsCount };
    }

    logger.debug("Found applications with disbursements", {
      count: searchResults.length,
    });

    // Step 2: Batch Read to get property history
    const disbursementData = await fetchDisbursementHistory(searchResults);
    apiCallsCount += Math.ceil(searchResults.length / 100);

    // Step 3: Filter tranches by month and calculate metrics
    let count = 0;
    let totalAmount = 0;

    for (const record of disbursementData) {
      const history =
        record.propertiesWithHistory?.last_loan_amount_disbursed || [];

      for (const tranche of history) {
        const trancheDate = new Date(tranche.timestamp);
        const trancheTimestamp = trancheDate.getTime();

        // Check if tranche falls within the target month
        if (
          trancheTimestamp >= startTimestamp &&
          trancheTimestamp <= endTimestamp
        ) {
          count++;
          totalAmount += parseFloat(tranche.value || "0");

          logger.debug("Found disbursement tranche in range", {
            application_id: record.id,
            amount: tranche.value,
            date: tranche.timestamp,
          });
        }
      }
    }

    logger.debug("Calculated disbursement metrics", {
      partner_id: partnerId,
      count,
      total_amount: totalAmount,
      api_calls: apiCallsCount,
    });

    return { count, totalAmount, apiCallsCount };
  } catch (error) {
    logger.error("Error fetching disbursements from HubSpot", {
      partner_id: partnerId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

/**
 * Fetch disbursement property history using Batch Read API
 */
const fetchDisbursementHistory = async (
  applicationIds: string[],
): Promise<HubSpotLoanApplicationWithHistory[]> => {
  const allResults: HubSpotLoanApplicationWithHistory[] = [];

  // Process in batches of 100 (HubSpot limit)
  const batchSize = 100;
  for (let i = 0; i < applicationIds.length; i += batchSize) {
    const batch = applicationIds.slice(i, i + batchSize);

    try {
      const response = await hubspotClient.crm.objects.batchApi.read(
        LOAN_APPLICATION_OBJECT_TYPE,
        {
          inputs: batch.map((id) => ({ id })),
          properties: ["hs_object_id"],
          propertiesWithHistory: ["last_loan_amount_disbursed"],
        },
      );

      allResults.push(...(response.results as any[]));

      logger.debug("Fetched batch of property history", {
        batch_size: batch.length,
        results_count: response.results.length,
      });

      // Rate limiting - small delay between batches
      if (i + batchSize < applicationIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    } catch (error) {
      logger.error("Error fetching property history batch", {
        batch_start: i,
        batch_size: batch.length,
        error,
      });
      throw handleHubSpotError(error);
    }
  }

  return allResults;
};

/**
 * Store monthly report in database
 */
const storeMonthlyReport = async (report: MonthlyMISReport): Promise<void> => {
  await prisma.hSMonthlyMISReports.upsert({
    where: {
      b2b_partner_id_report_month_report_year: {
        b2b_partner_id: report.partner_id,
        report_month: report.report_month,
        report_year: report.report_year,
      },
    },
    update: {
      partner_name: report.partner_name,
      partner_hubspot_id: report.partner_hubspot_id,
      total_leads: report.metrics.total_leads,
      applications_initiated: report.metrics.applications_initiated,
      total_requested_amount: new Decimal(
        report.metrics.total_requested_amount,
      ),
      applications_approved: report.metrics.applications_approved,
      total_approved_amount: new Decimal(report.metrics.total_approved_amount),
      disbursements_initiated: report.metrics.disbursements_initiated,
      total_disbursement_amount: new Decimal(
        report.metrics.total_disbursement_amount,
      ),
      hubspot_api_calls_made: report.hubspot_api_calls_made,
      processing_time_seconds: report.processing_time_seconds,
      has_errors: false,
      error_message: null,
      report_generated_at: new Date(),
    },
    create: {
      b2b_partner_id: report.partner_id,
      report_month: report.report_month,
      report_year: report.report_year,
      partner_name: report.partner_name,
      partner_hubspot_id: report.partner_hubspot_id,
      total_leads: report.metrics.total_leads,
      applications_initiated: report.metrics.applications_initiated,
      total_requested_amount: new Decimal(
        report.metrics.total_requested_amount,
      ),
      applications_approved: report.metrics.applications_approved,
      total_approved_amount: new Decimal(report.metrics.total_approved_amount),
      disbursements_initiated: report.metrics.disbursements_initiated,
      total_disbursement_amount: new Decimal(
        report.metrics.total_disbursement_amount,
      ),
      hubspot_api_calls_made: report.hubspot_api_calls_made,
      processing_time_seconds: report.processing_time_seconds,
      has_errors: false,
    },
  });

  logger.info("Stored monthly report in database", {
    partner_id: report.partner_id,
    month: report.report_month,
    year: report.report_year,
  });
};

/**
 * Store error report in database
 */
const storeErrorReport = async (
  partnerId: number,
  partnerName: string,
  partnerHubSpotId: string | null,
  month: number,
  year: number,
  errorMessage: string,
): Promise<void> => {
  try {
    await prisma.hSMonthlyMISReports.upsert({
      where: {
        b2b_partner_id_report_month_report_year: {
          b2b_partner_id: partnerId,
          report_month: month,
          report_year: year,
        },
      },
      update: {
        has_errors: true,
        error_message: errorMessage,
        report_generated_at: new Date(),
      },
      create: {
        b2b_partner_id: partnerId,
        report_month: month,
        report_year: year,
        partner_name: partnerName,
        partner_hubspot_id: partnerHubSpotId,
        has_errors: true,
        error_message: errorMessage,
      },
    });

    logger.debug("Stored error report in database", {
      partner_id: partnerId,
      month,
      year,
    });
  } catch (error) {
    logger.error("Failed to store error report", {
      partner_id: partnerId,
      error,
    });
  }
};

/**
 * Get monthly report for a specific partner and month
 */
export const getMonthlyReport = async (
  partnerId: number,
  month: number,
  year: number,
) => {
  const report = await prisma.hSMonthlyMISReports.findUnique({
    where: {
      b2b_partner_id_report_month_report_year: {
        b2b_partner_id: partnerId,
        report_month: month,
        report_year: year,
      },
    },
  });

  return report;
};

/**
 * Get all reports for a specific month
 */
export const getMonthlyReportsForAllPartners = async (
  month: number,
  year: number,
) => {
  const reports = await prisma.hSMonthlyMISReports.findMany({
    where: {
      report_month: month,
      report_year: year,
    },
    orderBy: {
      partner_name: "asc",
    },
  });

  return reports;
};
