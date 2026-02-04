// src/controllers/dashboard-email.controller.ts

import { Request, Response } from "express";
import * as DashboardEmailService from "../services/dashboard-email.service";
import { SendDashboardEmailRequest, SendBulkDashboardEmailRequest, EmailHistoryQuery } from "../types/dashboard-email.types";

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
      htmlContent,  // NEW: HTML content support
      filters,
      emailSource = "manual",
    } = req.body as SendDashboardEmailRequest;

    // Validation
    if (!recipientEmail || !subject) {
      return res.status(400).json({
        success: false,
        message: "recipientEmail and subject are required",
      });
    }

    // Must have either PDF or HTML
    if (!pdfBase64 && !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Either pdfBase64 or htmlContent must be provided",
      });
    }

    // Get admin user from request
    const adminUser = {
      id: req.user?.id || 0,
      full_name: req.user?.full_name || "Admin",
    };

    // Send email
    const result = await DashboardEmailService.sendDashboardEmail(
      {
        partnerId,
        recipientEmail,
        subject,
        message,
        pdfBase64,
        htmlContent,  // Pass HTML content
        filters,
        emailSource,
      },
      adminUser
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Error sending dashboard email:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
};

/**
 * Send bulk dashboard emails
 */
export const sendBulkDashboardEmails = async (req: Request, res: Response) => {
  try {
    const requestData = req.body as SendBulkDashboardEmailRequest;

    // Validation
    if (!requestData.recipients || requestData.recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "recipients array is required and must not be empty",
      });
    }

    // Get admin user from request
    const adminUser = {
      id: req.user?.id || 0,
      full_name: req.user?.full_name || "Admin",
    };

    // Send bulk emails
    const result = await DashboardEmailService.sendBulkDashboardEmails(
      requestData,
      adminUser
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Error sending bulk dashboard emails:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send bulk emails",
    });
  }
};

/**
 * Get email history
 */
export const getEmailHistory = async (req: Request, res: Response) => {
  try {
    const filters: EmailHistoryQuery = {
      partnerId: req.query.partnerId ? parseInt(req.query.partnerId as string) : undefined,
      status: req.query.status as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await DashboardEmailService.getEmailHistory(filters);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error getting email history:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get email history",
    });
  }
};