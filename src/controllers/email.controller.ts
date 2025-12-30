import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  sendLoanEligibilityResultEmail,
  sendPasswordResetEmail,
} from "../services/email.service";
import { EmailData } from "../types/email.types";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload, PortalType } from "../types/auth";
import logger from "../utils/logger";
import { sendResponse } from "../utils/api";
import { emailQueue } from "../utils/queue";
import { getEmailTemplate } from "../models/helpers";
import { logEmailHistory } from "../models/helpers/email.helper";
import moment from "moment";
import { FRONTEND_URL } from "../setup/secrets";
import { generateEmailToken } from "../utils/auth";

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  return null;
};

export const sendLoanEligibilityResult = async (
  req: Request,
  res: Response
) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const payload: EmailData = req.body;
    const recipientMail = payload?.personalInfo?.email;

    await sendLoanEligibilityResultEmail(recipientMail, payload);

    res.status(200).json({
      success: true,
      message: `Welcome email sent successfully to ${recipientMail}`,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send welcome email",
    });
  }
};

export const sendPasswordReset = async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { email, resetLink } = req.body;

    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({
      success: true,
      message: `Password reset email sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send password reset email",
    });
  }
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

interface SendEmailRequest {
  emailType: string;
  to: string | string[];
  userId?: number;
  variables?: Record<string, string>;
  subject: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Universal Email Controller - Final Version
 * - Takes name directly from req.body
 * - Generates reset URLs internally based on emailType
 * - Handles all email types with proper variable replacement
 */
interface SendEmailRequest {
  emailType: string;
  to: string | string[];
  userId?: number;
  name?: string;
  subject: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
  otp?: string; // For OTP emails
  emailToken?: string; // For password-related emails
  portalType?: PortalType; // For admin/partner portal differentiation
  exploreLoansUrl?: string; // For show interest emails
}

export const sendEmailController = async (
  req: Request<{}, {}, SendEmailRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      emailType,
      to,
      userId,
      name,
      subject,
      from,
      cc,
      bcc,
      attachments,
      otp,
      portalType,
    } = req.body;

    if (!emailType) {
      return sendResponse(res, 400, "emailType is required");
    }

    if (!subject) {
      return sendResponse(res, 400, "subject is required");
    }

    if (!to) {
      return sendResponse(res, 400, "Recipient email (to) is required");
    }

    logger.debug(`Processing ${emailType} email`, {
      to: Array.isArray(to) ? to.join(", ") : to,
      userId,
      emailType,
    });

    logger.debug(`Getting ${emailType} template`);
    let content = await getEmailTemplate(emailType);

    if (!content) {
      logger.error(`Email template not found`, { emailType });
      return sendResponse(res, 500, `Email template '${emailType}' not found`);
    }
    logger.debug(`${emailType} template fetched successfully`);

    logger.debug("Replacing template variables");
    // Always replace current year
    content = content.replace(/{%currentYear%}/g, moment().format("YYYY"));

    const userName = name || "User";
    const capitalizedName =
      userName.charAt(0).toUpperCase() + userName.slice(1);
    content = content.replace(/{%name%}/g, capitalizedName);

    // Handle specific replacements based on email type
    switch (emailType) {
      case "Otp":
        // Validate OTP is provided
        if (!otp) {
          return sendResponse(res, 400, "OTP is required for OTP email type");
        }
        // Replace {%otp%}
        content = content.replace(/{%otp%}/g, otp);
        break;

      case "Forgot Password":
        const expiry = moment().add(30, "minutes").toDate().toISOString();
        const emailToken = await generateEmailToken(30);
        const forgotPortalPath =
          portalType === PortalType.ADMIN ? "admin" : "partners";
        const resetUri = `${FRONTEND_URL}/${forgotPortalPath}/reset-password?token=${emailToken}&expiry=${expiry}`;

        logger.debug(`Reset URI generated: ${resetUri}`);

        // Replace {%reset-password-url%}
        content = content.replace(/{%reset-password-url%}/g, resetUri);
        break;

      case "Set Password":
        const setExpiry = moment().add(30, "minutes").toDate().toISOString();
        const token = await generateEmailToken(30);
        const setPortalPath =
          portalType === PortalType.ADMIN ? "admin" : "partners";
        const setPasswordUri = `${FRONTEND_URL}/${setPortalPath}/set-password?token=${token}&expiry=${setExpiry}`;

        logger.debug(`Set password URI generated: ${setPasswordUri}`);

        // Replace {%set-password-url%}
        content = content.replace(/{%set-password-url%}/g, setPasswordUri);
        break;

      case "Show Interest":
        break;

      default:
        // For any other email type, just use name replacement (already done above)
        logger.debug(
          `Using default variable replacement for emailType: ${emailType}`
        );
        break;
    }

    const html = content;
    logger.debug("Template variables replaced successfully");

    const emailOptions: EmailOptions = {
      to,
      subject,
      html,
      from,
      cc,
      bcc,
      attachments,
    };

    logger.debug("EmailOptions prepared", {
      to: Array.isArray(emailOptions.to)
        ? emailOptions.to.join(", ")
        : emailOptions.to,
      subject: emailOptions.subject,
      hasAttachments:
        !!emailOptions.attachments && emailOptions.attachments.length > 0,
    });

    logger.debug(`Adding ${emailType} email to queue`, {
      to: Array.isArray(emailOptions.to)
        ? emailOptions.to.join(", ")
        : emailOptions.to,
    });

    emailQueue.push({
      to: Array.isArray(emailOptions.to)
        ? emailOptions.to.join(", ")
        : emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html!,
      from: emailOptions.from,
      cc: Array.isArray(emailOptions.cc)
        ? emailOptions.cc.join(", ")
        : emailOptions.cc,
      bcc: Array.isArray(emailOptions.bcc)
        ? emailOptions.bcc.join(", ")
        : emailOptions.bcc,
      retry: 0,
    });

    logger.debug("Email added to queue successfully");

    if (userId || to) {
      logger.debug(`Saving email history`);
      await logEmailHistory({
        to: Array.isArray(emailOptions.to)
          ? emailOptions.to.join(", ")
          : emailOptions.to,
        cc: Array.isArray(emailOptions.cc)
          ? emailOptions.cc?.join(", ")
          : emailOptions.cc,
        bcc: Array.isArray(emailOptions.bcc)
          ? emailOptions.bcc?.join(", ")
          : emailOptions.bcc,
        subject: emailOptions.subject,
        type: emailType,
      });
      logger.debug("Email history saved successfully");
    }

    logger.info(`${emailType} email sent successfully`, {
      to: Array.isArray(emailOptions.to)
        ? emailOptions.to.join(", ")
        : emailOptions.to,
      userId,
      subject: emailOptions.subject,
    });

    return sendResponse(res, 200, "Email sent successfully", {
      emailType,
      to: emailOptions.to,
      subject: emailOptions.subject,
    });
  } catch (error: any) {
    logger.error("Failed to send email", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
