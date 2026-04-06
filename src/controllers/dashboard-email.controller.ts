import { Request, Response } from "express";
import * as DashboardEmailService from "../services/dashboard-email.service";
import {
  SendDashboardEmailRequest,
  SendBulkDashboardEmailRequest,
  EmailHistoryQuery,
} from "../types/dashboard-email.types";
import { sendResponse } from "../utils/api";

/**
 * Send dashboard email to single partner
 * Supports both PDF attachments and HTML-only reports
 */
export const sendDashboardEmail = async (req: Request, res: Response) => {
  try {
    const {
      partnerId,
      recipientEmail,
      subject,
      message,
      pdfBase64,
      htmlContent,
      filters,
      emailSource = "manual",
    } = req.body as SendDashboardEmailRequest;

    if (!recipientEmail || !subject) {
      return sendResponse(res, 400, "recipientEmail and subject are required");
    }

    const adminUser = {
      id: req.user?.id || 0,
      full_name: req.user?.full_name || "Admin",
    };

    let finalHtmlContent = htmlContent;
    let finalSubject = subject;

    // Always generate report server-side (ignore frontend htmlContent)
    if (!pdfBase64) {
      // Resolve period from filters
      let resolvedPeriod = filters?.period;
      let resolvedMonth: number | undefined;
      let resolvedYear: number | undefined;

      const rawStartDate = filters?.startDate;
      const rawEndDate = filters?.endDate;

      if ((resolvedPeriod === "custom" || (!resolvedPeriod && rawStartDate)) && rawStartDate) {
        const start = new Date(rawStartDate);
        const end = rawEndDate ? new Date(rawEndDate) : start;
        const startM = start.getMonth() + 1;
        const startY = start.getFullYear();
        const endM = end.getMonth() + 1;
        const endY = end.getFullYear();

        if (startM === endM && startY === endY) {
          resolvedMonth = startM;
          resolvedYear = startY;
        } else {
          resolvedMonth = startM;
          resolvedYear = startY;
        }
        resolvedPeriod = undefined;
      }

      if (resolvedPeriod === "custom") {
        resolvedPeriod = undefined;
      }

      const report = await DashboardEmailService.generateAggregatedReportHtml({
        period: resolvedPeriod,
        month: resolvedMonth,
        year: resolvedYear,
        partnerId: partnerId || filters?.partnerId,
      });

      finalHtmlContent = report.html;
      finalSubject = subject || report.subject;
    }

    const result = await DashboardEmailService.sendDashboardEmail(
      {
        partnerId,
        recipientEmail,
        subject: finalSubject,
        message,
        pdfBase64,
        htmlContent: finalHtmlContent,
        filters,
        emailSource,
      },
      adminUser,
    );

    return sendResponse(res, 200, "Email sent successfully", result);
  } catch (error: any) {
    console.error("Error sending dashboard email:", error);
    return sendResponse(res, 500, error.message || "Failed to send email");
  }
};

/**
 * Send bulk dashboard emails
 */
export const sendBulkDashboardEmails = async (req: Request, res: Response) => {
  try {
    const requestData = req.body as SendBulkDashboardEmailRequest;

    if (!requestData.recipients || requestData.recipients.length === 0) {
      return sendResponse(res, 400, "recipients array is required and must not be empty");
    }

    const adminUser = {
      id: req.user?.id || 0,
      full_name: req.user?.full_name || "Admin",
    };

    const result = await DashboardEmailService.sendBulkDashboardEmails(
      requestData,
      adminUser,
    );

    return sendResponse(res, 200, "Bulk emails sent successfully", result);
  } catch (error: any) {
    console.error("Error sending bulk dashboard emails:", error);
    return sendResponse(res, 500, error.message || "Failed to send bulk emails");
  }
};

/**
 * Get email history
 */
export const getEmailHistory = async (req: Request, res: Response) => {
  try {
    const filters: EmailHistoryQuery = {
      partnerId: req.query.partnerId
        ? parseInt(req.query.partnerId as string)
        : undefined,
      status: req.query.status as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await DashboardEmailService.getEmailHistory(filters);

    return sendResponse(res, 200, "Email history fetched successfully", result);
  } catch (error: any) {
    console.error("Error getting email history:", error);
    return sendResponse(res, 500, error.message || "Failed to get email history");
  }
};

/**
 * Send server-generated performance report email
 * Aggregates data for all partners when no partnerId is provided
 */
export const sendPerformanceReport = async (req: Request, res: Response) => {
  try {
    const {
      recipientEmail,
      partnerId,
      period,
      month,
      year,
      message,
      filters,
      startDate,
      endDate,
    } = req.body;

    if (!recipientEmail) {
      return sendResponse(res, 400, "recipientEmail is required");
    }

    const adminUser = {
      id: req.user?.id || 0,
      full_name: req.user?.full_name || "Admin",
    };

    // Resolve filters — support both direct params and nested filters object (from frontend)
    let resolvedPeriod = period || filters?.period;
    let resolvedMonth = month ? parseInt(month) : undefined;
    let resolvedYear = year ? parseInt(year) : undefined;
    const resolvedPartnerId = partnerId ? parseInt(partnerId) : (filters?.partnerId ? parseInt(filters.partnerId) : undefined);

    // If period is "custom" or dates are provided, parse startDate/endDate into month/year
    const rawStartDate = startDate || filters?.startDate;
    const rawEndDate = endDate || filters?.endDate;

    if ((resolvedPeriod === "custom" || (!resolvedMonth && rawStartDate)) && rawStartDate) {
      const start = new Date(rawStartDate);
      const end = rawEndDate ? new Date(rawEndDate) : start;
      const startM = start.getMonth() + 1;
      const startY = start.getFullYear();
      const endM = end.getMonth() + 1;
      const endY = end.getFullYear();

      // If same month, use month/year directly
      if (startM === endM && startY === endY) {
        resolvedMonth = startM;
        resolvedYear = startY;
        resolvedPeriod = undefined;
      } else {
        // Multi-month range — find the best matching period preset or use start month
        resolvedMonth = startM;
        resolvedYear = startY;
        resolvedPeriod = undefined;
      }
    }

    // If period is "custom" but no dates resolved, clear it so it doesn't hit default
    if (resolvedPeriod === "custom") {
      resolvedPeriod = undefined;
    }

    // Generate report HTML with aggregated data
    const { html, subject } = await DashboardEmailService.generateAggregatedReportHtml({
      period: resolvedPeriod,
      month: resolvedMonth,
      year: resolvedYear,
      partnerId: resolvedPartnerId,
    });

    // Send using existing email infrastructure
    const result = await DashboardEmailService.sendDashboardEmail(
      {
        partnerId: partnerId ? parseInt(partnerId) : undefined,
        recipientEmail,
        subject,
        message,
        htmlContent: html,
        filters: { period, month, year, partnerId },
        emailSource: "manual",
      },
      adminUser,
    );

    return sendResponse(res, 200, "Performance report email sent successfully", result);
  } catch (error: any) {
    console.error("Error sending performance report:", error);
    return sendResponse(res, 500, error.message || "Failed to send performance report");
  }
};
