import { Request, Response, NextFunction } from "express";
import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../config/prisma";
import {
  generatePartnerMISReport,
  getMonthlyReport,
  getMonthlyReportsForAllPartners,
} from "../services/mis-report.service";
import { logger } from "../utils/logger";
import { triggerMonthlyMISReportManually } from "../setup/cron";
import { sendResponse } from "../utils/api";

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: any; // or define a proper User type
    }
  }
}

/**
 * Generate monthly MIS reports for all active partners
 * @route POST /api/mis-reports/generate
 */
export const generateAllReports = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    logger.info("Manual MIS report generation triggered via API", {
      user: req.user || "system",
      ip: req.ip,
    });

    const result = await triggerMonthlyMISReportManually();

    // Handle undefined result
    if (!result) {
      sendResponse(
        res,
        500,
        "Failed to generate monthly MIS reports - no result returned",
        null,
        [{ error: "Report generation returned no result" }],
      );
      return;
    }

    sendResponse(res, 200, "Monthly MIS reports generated successfully", {
      reports_generated: result.reports_generated,
      reports_failed: result.reports_failed,
      total_processing_time_seconds: result.total_processing_time_seconds,
      errors: result.errors,
    });
  } catch (error) {
    logger.error("Error in manual MIS report generation API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(error);
  }
};

/**
 * Generate MIS report for a specific partner and month
 * @route POST /api/mis-reports/generate/:partnerId/:year/:month
 */
export const generatePartnerReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    // Validation
    if (
      isNaN(partnerId) ||
      isNaN(year) ||
      isNaN(month) ||
      month < 1 ||
      month > 12
    ) {
      sendResponse(
        res,
        400,
        "Invalid parameters. Provide valid partnerId, year, and month (1-12)",
        null,
        [{ field: "params", message: "Invalid parameters" }],
      );
      return;
    }

    // Validate year range
    const currentYear = new Date().getFullYear();
    if (year < 2020 || year > currentYear + 1) {
      sendResponse(
        res,
        400,
        `Invalid year. Must be between 2020 and ${currentYear + 1}`,
        null,
        [{ field: "year", message: "Invalid year range" }],
      );
      return;
    }

    // Get partner details
    const partner = await prisma.hSB2BPartners.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        partner_name: true,
        hs_object_id: true,
        is_active: true,
        is_deleted: true,
      },
    });

    if (!partner) {
      sendResponse(res, 404, "Partner not found");
      return;
    }

    if (partner.is_deleted) {
      sendResponse(
        res,
        400,
        "Cannot generate report for deleted partner",
        null,
        [{ field: "partnerId", message: "Partner is deleted" }],
      );
      return;
    }

    logger.info("Generating MIS report for specific partner", {
      partner_id: partnerId,
      partner_name: partner.partner_name,
      month,
      year,
      user: req.user || "system",
    });

    const report = await generatePartnerMISReport(
      partner.id,
      partner.partner_name || "Unknown",
      partner.hs_object_id,
      month,
      year,
    );

    // Store the report with proper Decimal conversion
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
        total_approved_amount: new Decimal(
          report.metrics.total_approved_amount,
        ),
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
        total_approved_amount: new Decimal(
          report.metrics.total_approved_amount,
        ),
        disbursements_initiated: report.metrics.disbursements_initiated,
        total_disbursement_amount: new Decimal(
          report.metrics.total_disbursement_amount,
        ),
        hubspot_api_calls_made: report.hubspot_api_calls_made,
        processing_time_seconds: report.processing_time_seconds,
        has_errors: false,
      },
    });

    logger.info("MIS report generated and stored successfully", {
      partner_id: partnerId,
      month,
      year,
    });

    sendResponse(res, 200, "MIS report generated successfully", report);
  } catch (error) {
    logger.error("Error generating specific partner MIS report", {
      partner_id: req.params.partnerId,
      month: req.params.month,
      year: req.params.year,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(error);
  }
};

/**
 * Get existing MIS report for a specific partner and month
 * @route GET /api/mis-reports/:partnerId/:year/:month
 */
export const getPartnerReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    // Validation
    if (
      isNaN(partnerId) ||
      isNaN(year) ||
      isNaN(month) ||
      month < 1 ||
      month > 12
    ) {
      sendResponse(
        res,
        400,
        "Invalid parameters. Provide valid partnerId, year, and month (1-12)",
        null,
        [{ field: "params", message: "Invalid parameters" }],
      );
      return;
    }

    logger.debug("Retrieving MIS report", {
      partner_id: partnerId,
      month,
      year,
    });

    const report = await getMonthlyReport(partnerId, month, year);

    if (!report) {
      sendResponse(
        res,
        404,
        "Report not found for the specified partner and month",
        {
          suggestion: `Generate report using POST /api/mis-reports/generate/${partnerId}/${year}/${month}`,
        },
      );
      return;
    }

    sendResponse(res, 200, "Report retrieved successfully", report);
  } catch (error) {
    logger.error("Error retrieving MIS report", {
      partner_id: req.params.partnerId,
      month: req.params.month,
      year: req.params.year,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
};

/**
 * Get all MIS reports for a specific month (all partners)
 * @route GET /api/mis-reports/:year/:month
 */
export const getAllReportsForMonth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    // Validation
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      sendResponse(
        res,
        400,
        "Invalid parameters. Provide valid year and month (1-12)",
        null,
        [{ field: "params", message: "Invalid parameters" }],
      );
      return;
    }

    logger.debug("Retrieving all MIS reports for month", {
      month,
      year,
    });

    const reports = await getMonthlyReportsForAllPartners(month, year);

    // Helper function to safely convert Decimal to number
    const toNumber = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === "number") return value;
      if (typeof value === "object" && "toNumber" in value) {
        return value.toNumber();
      }
      return Number(value);
    };

    // Calculate summary statistics
    const summary = {
      total_partners: reports.length,
      partners_with_errors: reports.filter((r) => r.has_errors).length,
      total_leads: reports.reduce((sum, r) => sum + r.total_leads, 0),
      total_applications: reports.reduce(
        (sum, r) => sum + r.applications_initiated,
        0,
      ),
      total_approvals: reports.reduce(
        (sum, r) => sum + r.applications_approved,
        0,
      ),
      total_disbursements: reports.reduce(
        (sum, r) => sum + r.disbursements_initiated,
        0,
      ),
      total_requested_amount: reports.reduce(
        (sum, r) => sum + toNumber(r.total_requested_amount),
        0,
      ),
      total_approved_amount: reports.reduce(
        (sum, r) => sum + toNumber(r.total_approved_amount),
        0,
      ),
      total_disbursement_amount: reports.reduce(
        (sum, r) => sum + toNumber(r.total_disbursement_amount),
        0,
      ),
    };

    sendResponse(res, 200, "Reports retrieved successfully", {
      month,
      year,
      count: reports.length,
      summary,
      reports,
    });
  } catch (error) {
    logger.error("Error retrieving monthly reports", {
      month: req.params.month,
      year: req.params.year,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
};

/**
 * Get all reports for a specific partner (all months)
 * @route GET /api/mis-reports/partner/:partnerId
 */
export const getPartnerAllReports = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;

    if (isNaN(partnerId)) {
      sendResponse(res, 400, "Invalid partner ID", null, [
        { field: "partnerId", message: "Invalid partner ID" },
      ]);
      return;
    }

    logger.debug("Retrieving all reports for partner", {
      partner_id: partnerId,
      year,
    });

    const whereClause: any = {
      b2b_partner_id: partnerId,
    };

    if (year) {
      whereClause.report_year = year;
    }

    const reports = await prisma.hSMonthlyMISReports.findMany({
      where: whereClause,
      orderBy: [{ report_year: "desc" }, { report_month: "desc" }],
    });

    if (reports.length === 0) {
      sendResponse(res, 404, "No reports found for this partner");
      return;
    }

    sendResponse(res, 200, "Reports retrieved successfully", {
      partner_id: partnerId,
      partner_name: reports[0].partner_name,
      count: reports.length,
      reports,
    });
  } catch (error) {
    logger.error("Error retrieving partner reports", {
      partner_id: req.params.partnerId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
};

/**
 * Get MIS report statistics
 * @route GET /api/mis-reports/stats
 */
export const getReportStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    logger.debug("Retrieving MIS report statistics");

    const [totalReports, reportsWithErrors, latestReports, partnersCount] =
      await Promise.all([
        prisma.hSMonthlyMISReports.count(),
        prisma.hSMonthlyMISReports.count({
          where: { has_errors: true },
        }),
        prisma.hSMonthlyMISReports.findMany({
          orderBy: { report_generated_at: "desc" },
          take: 10,
          select: {
            id: true,
            partner_name: true,
            report_month: true,
            report_year: true,
            report_generated_at: true,
            has_errors: true,
          },
        }),
        prisma.hSB2BPartners.count({
          where: {
            is_active: true,
            is_deleted: false,
          },
        }),
      ]);

    const stats = {
      total_reports_generated: totalReports,
      reports_with_errors: reportsWithErrors,
      active_partners: partnersCount,
      latest_reports: latestReports,
    };

    sendResponse(res, 200, "Statistics retrieved successfully", stats);
  } catch (error) {
    logger.error("Error retrieving report statistics", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
};

/**
 * Delete a specific MIS report
 * @route DELETE /api/mis-reports/:partnerId/:year/:month
 */
export const deleteReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (
      isNaN(partnerId) ||
      isNaN(year) ||
      isNaN(month) ||
      month < 1 ||
      month > 12
    ) {
      sendResponse(res, 400, "Invalid parameters", null, [
        { field: "params", message: "Invalid parameters" },
      ]);
      return;
    }

    logger.info("Deleting MIS report", {
      partner_id: partnerId,
      month,
      year,
      user: req.user || "system",
    });

    const deletedReport = await prisma.hSMonthlyMISReports.delete({
      where: {
        b2b_partner_id_report_month_report_year: {
          b2b_partner_id: partnerId,
          report_month: month,
          report_year: year,
        },
      },
    });

    sendResponse(res, 200, "Report deleted successfully", {
      partner_id: deletedReport.b2b_partner_id,
      month: deletedReport.report_month,
      year: deletedReport.report_year,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      sendResponse(res, 404, "Report not found");
      return;
    }

    logger.error("Error deleting MIS report", {
      partner_id: req.params.partnerId,
      month: req.params.month,
      year: req.params.year,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
};
