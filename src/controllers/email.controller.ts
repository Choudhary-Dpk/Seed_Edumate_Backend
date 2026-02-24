import { NextFunction, Request, Response } from "express";
import { EmailData, SendEmailRequest } from "../types/email.types";
import { PortalType } from "../types/auth";
import logger from "../utils/logger";
import { sendResponse } from "../utils/api";
import { getEmailTemplate } from "../models/helpers";
import moment from "moment";
import { FRONTEND_URL } from "../setup/secrets";
import { generateEmailToken } from "../utils/auth";
import { generateLoanApplicationEmail } from "../utils/email templates/loanEligibilityResult";
import { queueEmail } from "../services/email-queue.service";
import {
  EmailType,
  EmailCategory,
  SenderType,
  mapLegacyTypeToEmailType,
  inferCategoryFromType,
} from "../services/email-log.service";

/**
 *  UPDATED: Send loan eligibility result email
 *
 * Changes:
 * - No longer uses deprecated email.service.ts
 * - Uses unified queueEmail() system
 * - Proper email type and category
 */
export const sendLoanEligibilityResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload: EmailData = req.body;
    const recipientMail = payload?.personalInfo?.email;

    if (!recipientMail) {
      return sendResponse(res, 400, "Recipient email is required");
    }

    // Generate email HTML using existing template
    const emailHTML = generateLoanApplicationEmail(payload);

    //  NEW: Use unified email queue system
    await queueEmail({
      to: recipientMail,
      subject: "Welcome!",
      html: emailHTML,
      text: `Welcome! Thank you for joining our platform. We're excited to have you on board!`,
      email_type: EmailType.LOAN_ELIGIBILITY,
      category: EmailCategory.LOAN,
      sent_by_type: SenderType.SYSTEM,
      metadata: {
        applicationData: {
          personalInfo: payload.personalInfo,
          // Don't store entire payload - just key info
        },
      },
    });

    sendResponse(
      res,
      200,
      `Welcome email sent successfully to ${recipientMail}`,
    );
  } catch (error) {
    next(error);
  }
};

/**
 *  UPDATED: Send password reset email
 *
 * Changes:
 * - No longer uses deprecated email.service.ts
 * - Uses unified queueEmail() system
 * - Proper email type and category
 */
export const sendPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, resetLink } = req.body;

    if (!email || !resetLink) {
      return sendResponse(res, 400, "Email and resetLink are required");
    }

    const html = `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;
    const text = `Password Reset: ${resetLink} (expires in 1 hour)`;

    //  NEW: Use unified email queue system
    await queueEmail({
      to: email,
      subject: "Password Reset Request",
      html,
      text,
      email_type: EmailType.RESET_PASSWORD,
      category: EmailCategory.TRANSACTIONAL,
      sent_by_type: SenderType.SYSTEM,
      metadata: {
        resetLink,
      },
    });

    sendResponse(
      res,
      200,
      `Password reset email sent successfully to ${email}`,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Universal Email Controller - UPDATED with Unified Email System
 *
 * Changes:
 * - Uses queueEmail() instead of emailQueue.push()
 * - Uses type-safe EmailType enum
 * - Automatic email logging via queue service
 * - Better sender tracking
 * - Metadata support
 */
export const sendEmailController = async (
  req: Request<{}, {}, SendEmailRequest>,
  res: Response,
  next: NextFunction,
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
          `Using default variable replacement for emailType: ${emailType}`,
        );
        break;
    }

    const html = content;
    logger.debug("Template variables replaced successfully");

    //  NEW: Map legacy email type to new EmailType enum
    const mappedEmailType = mapLegacyTypeToEmailType(emailType);
    const category = inferCategoryFromType(mappedEmailType);

    logger.debug("Mapped email type", {
      legacyType: emailType,
      mappedType: mappedEmailType,
      category,
    });

    //  NEW: Prepare recipients (handle arrays)
    const recipients = Array.isArray(to) ? to.join(",") : to;
    const ccList = Array.isArray(cc) ? cc.join(",") : cc;
    const bccList = Array.isArray(bcc) ? bcc.join(",") : bcc;

    logger.debug(`Queueing ${emailType} email`, {
      to: recipients,
      cc: ccList,
      bcc: bccList,
    });

    //  NEW: Use unified email queue service
    const result = await queueEmail({
      to: recipients,
      subject,
      html,
      from,
      cc: ccList,
      bcc: bccList,
      email_type: mappedEmailType,
      category,
      sent_by_user_id: userId,
      sent_by_name: name,
      sent_by_type: SenderType.API, // Universal endpoint = API
      metadata: {
        portalType,
        otp,
        emailType, // Store original type for reference
      },
    });

    logger.info(`${emailType} email queued successfully`, {
      emailLogId: result.emailLog.id,
      queueItemId: result.queueItem.id,
      to: recipients,
      userId,
      subject,
    });

    return sendResponse(res, 200, "Email queued successfully", {
      emailType,
      to: recipients,
      subject,
      emailLogId: result.emailLog.id,
      queueItemId: result.queueItem.id,
    });
  } catch (error: any) {
    logger.error("Failed to queue email", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
