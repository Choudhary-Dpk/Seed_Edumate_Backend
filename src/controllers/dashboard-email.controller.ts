// src/controllers/dashboard-email.controller.ts

import { Request, Response, NextFunction } from "express";
import { DashboardEmailService } from "../services/dashboard-email.service";
import { sendResponse } from "../utils/api";
import logger from "../utils/logger";
import {
  SendDashboardEmailRequest,
  SendBulkDashboardEmailRequest,
  EmailHistoryFilters,
} from "../types/dashboard-email.types";

/**
 * Send dashboard email to single partner
 */
export const sendDashboardEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData: SendDashboardEmailRequest = req.body;
    const adminUser = (req as any).user; // From auth middleware

    // Validate required fields
    if (!requestData.recipientEmail) {
      return sendResponse(res, 400, "Recipient email is required");
    }

    if (!requestData.subject) {
      return sendResponse(res, 400, "Subject is required");
    }

    if (!requestData.pdfBase64) {
      return sendResponse(res, 400, "PDF attachment is required");
    }

    if (!requestData.filters) {
      return sendResponse(res, 400, "Dashboard filters are required");
    }

    // Send email
    const result = await DashboardEmailService.sendDashboardEmail(
      requestData,
      adminUser
    );

    return sendResponse(res, 200, result.message, result.data);
  } catch (error: any) {
    logger.error("Send dashboard email error", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * Send bulk dashboard emails
 */
export const sendBulkDashboardEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData: SendBulkDashboardEmailRequest = req.body;
    const adminUser = (req as any).user; // From auth middleware

    // Validate required fields
    if (!requestData.recipients || requestData.recipients.length === 0) {
      return sendResponse(res, 400, "Recipients list is required");
    }

    if (!requestData.subject) {
      return sendResponse(res, 400, "Subject is required");
    }

    if (!requestData.filters) {
      return sendResponse(res, 400, "Dashboard filters are required");
    }

    // Send emails
    const result = await DashboardEmailService.sendBulkDashboardEmails(
      requestData,
      adminUser
    );

    return sendResponse(res, 200, result.message, result.data);
  } catch (error: any) {
    logger.error("Send bulk dashboard emails error", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * Get email history
 */
export const getEmailHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: EmailHistoryFilters = {
      partnerId: req.query.partnerId
        ? parseInt(req.query.partnerId as string)
        : undefined,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await DashboardEmailService.getEmailHistory(filters);

    return sendResponse(res, 200, "Email history retrieved successfully", result);
  } catch (error: any) {
    logger.error("Get email history error", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};