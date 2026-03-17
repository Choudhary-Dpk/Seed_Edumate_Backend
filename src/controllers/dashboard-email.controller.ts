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

    if (!pdfBase64 && !htmlContent) {
      return sendResponse(res, 400, "Either pdfBase64 or htmlContent must be provided");
    }

    const adminUser = {
      id: req.user?.id || 0,
      full_name: req.user?.full_name || "Admin",
    };

    const result = await DashboardEmailService.sendDashboardEmail(
      {
        partnerId,
        recipientEmail,
        subject,
        message,
        pdfBase64,
        htmlContent,
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
