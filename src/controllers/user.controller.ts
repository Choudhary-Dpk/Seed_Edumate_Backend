import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import {
  fetchCurrencyConversion,
  fetchIpDetails,
} from "../services/user.service";
import { sendResponse } from "../utils/api";
import {
  assignRole,
  createUsers,
  getUserProfile,
} from "../models/helpers/user.helper";
import { generateEmailToken, hashPassword } from "../utils/auth";
import moment from "moment";
import { getEmailTemplate } from "../models/helpers";
import logger from "../utils/logger";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload, PortalType, ProtectedPayload } from "../types/auth";
import {
  revokePreviousEmailTokens,
  saveEmailToken,
  updateAdminPassword,
  updatePassword,
} from "../models/helpers/auth";
import { FRONTEND_URL } from "../setup/secrets";
import { queueEmail } from "../services/email-queue.service";
import { 
  EmailType, 
  EmailCategory, 
  SenderType 
} from "../services/email-log.service";

export const getIpInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip =
      (req.query.ip as string) ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0] || // real client IP
      req.socket?.remoteAddress || // fallback (usually local IP)
      "";

    const data = await fetchIpDetails(ip);
    return sendResponse(res, 200, "Success", data);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (_: Request, res: Response) => {
  const users = await prisma.b2BPartnersUsers.findMany();
  res.json(users);
};

/**
 * ✅ UPDATED: Create partner user and send set password email
 * 
 * Changes:
 * - Removed old emailQueue.push() and logEmailHistory()
 * - Uses unified queueEmail() system
 * - Proper email type (SET_PASSWORD)
 * - Partner sender tracking
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email, b2bId, roleId } = req.body;

    logger.debug(`Creating user in database`);
    const user = await createUsers(
      email,
      b2bId,
      null, // passwordHash
      fullName
    );
    logger.debug(`User created successfully`);

    logger.debug(`Assigning role to user`);
    await assignRole(user.id, roleId);
    logger.debug(`Role assigned to user succesfully`);

    logger.debug(`Generating refresh token`);
    const emailToken = await generateEmailToken(30);
    logger.debug(`Email token generated successfully`);

    logger.debug(`Getting template for set password`);
    let content = await getEmailTemplate("Set Password");
    logger.debug(`Email template fetched successfully`);
    if (!content) {
      throw new Error("Set Password - Email template not found");
    }

    const expiry = moment().add(2, "days").toDate().toISOString();
    const redirectUri = `${FRONTEND_URL}/partners/set-password?token=${emailToken}&expiry=${expiry}`;
    content = content.replace(/{%currentYear%}/, moment().format("YYYY"));
    content = content.replace(
      /{%name%}/g,
      fullName.charAt(0).toUpperCase() + fullName.slice(1)
    );
    const html = content.replace("{%set-password-url%}", redirectUri);
    const subject = "Set Password";

    logger.debug(`Revoking previous email tokens`);
    await revokePreviousEmailTokens(user.id);
    logger.debug(
      `Previous email tokens revoked successfully for userId: ${user.id}`
    );

    logger.debug(`Saving email token for userId: ${user.id}`);
    await saveEmailToken(user.id, emailToken);
    logger.debug(`Email token saved successfully`);

    // ✅ NEW: Use unified email queue system
    logger.debug(`Queueing set password email for ${email}`);
    await queueEmail({
      to: email,
      subject,
      html,
      email_type: EmailType.SET_PASSWORD,
      category: EmailCategory.TRANSACTIONAL,
      sent_by_type: SenderType.PARTNER, // Partner portal user creation
      reference_type: "user",
      reference_id: user.id,
      metadata: {
        userId: user.id,
        fullName,
        b2bId,
        roleId,
        expiry,
        portalType: PortalType.PARTNER,
        action: "user_creation",
      },
    });
    logger.debug(`Set password email queued successfully`);

    sendResponse(res, 201, "User created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ UPDATED: UNIFIED CHANGE PASSWORD
 * Works for both Admin and Partner portals
 * Portal type is automatically detected by authenticate() middleware
 * Requires authenticated user to provide current password before changing
 * 
 * Changes:
 * - Removed logEmailHistory() (wasn't sending actual email)
 * - Now optionally sends password change notification via queueEmail()
 */
export const changePassword = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, email } = req.payload!;
    const { newPassword, sendNotification = false } = req.body; // Optional notification

    logger.debug(
      `Changing password for userId: ${id}, portal: ${req.portalType}`
    );

    logger.debug(`Hashing new password for userId: ${id}`);
    const hashedPassword = await hashPassword(newPassword);
    logger.debug(`Password hashed successfully`);

    // Update password based on portal type
    logger.debug(`Updating password for userId: ${id}`);
    if (req.portalType === PortalType.ADMIN) {
      await updateAdminPassword(id, hashedPassword);
    } else if (req.portalType === PortalType.PARTNER) {
      await updatePassword(id, hashedPassword);
    }
    logger.debug(`Password updated successfully`);

    // ✅ NEW: Optionally send password change notification email
    if (sendNotification && email) {
      logger.debug(`Sending password change notification to ${email}`);
      
      // Simple notification email
      const html = `
        <h2>Password Changed</h2>
        <p>Your password was successfully changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        <p><strong>Changed at:</strong> ${moment().format('MMMM Do YYYY, h:mm:ss a')}</p>
        <p><strong>Portal:</strong> ${req.portalType}</p>
      `;

      await queueEmail({
        to: email,
        subject: "Password Changed Successfully",
        html,
        text: `Your password was successfully changed on ${moment().format('MMMM Do YYYY, h:mm:ss a')}. If you did not make this change, please contact support immediately.`,
        email_type: EmailType.PASSWORD_CHANGED,
        category: EmailCategory.TRANSACTIONAL,
        sent_by_type: SenderType.SYSTEM,
        reference_type: "user",
        reference_id: id,
        metadata: {
          userId: id,
          portalType: req.portalType,
          changedAt: moment().toISOString(),
        },
      });
      
      logger.debug(`Password change notification queued successfully`);
    }

    sendResponse(res, 200, "Password changed successfully", {
      portalType: req.portalType, // Optional: inform frontend
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;

    const profile = await getUserProfile(id);
    if (!profile) {
      return sendResponse(res, 404, "Profile not found");
    }

    sendResponse(res, 200, "Profile fetched successfully", profile);
  } catch (error) {
    next(error);
  }
};

export const getCurrencyConversion = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { base } = req.query;

    // Validation
    if (!base || typeof base !== "string") {
      throw new Error("Base currency is required");
    }

    const baseCurrency = base.toUpperCase().trim();

    // Validate currency code format (3 letters)
    if (!/^[A-Z]{3}$/.test(baseCurrency)) {
      throw new Error(
        "Invalid currency code. Must be a 3-letter code (e.g., USD, EUR, INR)"
      );
    }

    logger.debug(
      `Fetching currency conversion rates for base: ${baseCurrency}`
    );

    const data = await fetchCurrencyConversion(baseCurrency);

    logger.debug(
      `Currency conversion rates fetched successfully for ${baseCurrency}`
    );

    sendResponse(
      res,
      200,
      "Currency conversion rates fetched successfully",
      data
    );
  } catch (error) {
    next(error);
  }
};