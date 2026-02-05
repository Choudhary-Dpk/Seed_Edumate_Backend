import { Response, NextFunction } from "express";
import { RequestWithPayload } from "../../types/api.types";
import {
  LoginPayload,
  PortalType,
  ProtectedPayload,
  ResetPasswordPayload,
} from "../../types/auth";
import logger from "../../utils/logger";
import {
  deleteOtps,
  deleteUserSession,
  revokePreviousAdminEmailTokens,
  revokePreviousEmailTokens,
  saveAdminEmailToken,
  saveEmailToken,
  saveOtp,
  storeAdminRefreshToken,
  storeRefreshToken,
  updateAdminPassword,
  updatePassword,
  updateUserLastLoggedIn,
  useAdminEmailToken,
  useEmailToken,
} from "../../models/helpers/auth";
import { generateOtp, sendResponse } from "../../utils/api";
import {
  generateJWTToken,
  hashPassword,
  generateEmailToken,
  generateRefreshToken,
} from "../../utils/auth";
import { getEmailTemplate } from "../../models/helpers";
import moment from "moment";
import { FRONTEND_URL } from "../../setup/secrets";
import {
  getAdminRole,
  getUserRole,
} from "../../models/helpers/partners.helper";
import prisma from "../../config/prisma";

// ✅ NEW: Import unified email services
import { queueEmail } from "../../services/email-queue.service";
import { 
  EmailType, 
  EmailCategory, 
  SenderType 
} from "../../services/email-log.service";

export const login = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, id, ipDetails, deviceDetails } = req.payload!;

    logger.debug(`Generating JWT Token for userId: ${id} and email: ${email}`);
    const jwt = await generateJWTToken(id, email, req.portalType);
    logger.debug(`JWT Token generated successfully`);

    logger.debug(`Generating Refresh Token for userId: ${id}`);
    const refreshToken = await generateRefreshToken(id, email);
    logger.debug(`Refresh Token generated successfully`);

    //  Store refresh token based on portal type
    logger.debug(
      `Storing refresh token in database for portal: ${req.portalType}`,
    );
    if (req.portalType === PortalType.ADMIN) {
      await storeAdminRefreshToken(
        id,
        refreshToken,
        ipDetails,
        deviceDetails?.device,
      );
    } else if (req.portalType === PortalType.PARTNER) {
      await storeRefreshToken(
        id,
        refreshToken,
        ipDetails,
        deviceDetails?.device,
      );
    }
    logger.debug(`Refresh token stored successfully`);

    if (req.portalType === PortalType.PARTNER) {
      logger.debug(
        `Reactivating partner user ${id} and updating last activity`,
      );

      try {
        await prisma.b2BPartnersUsers.update({
          where: { id },
          data: {
            is_active: true,
            last_activity_at: new Date(),
            updated_at: new Date(),
          },
        });
      } catch (error) {
        logger.error(`Failed to update partner user ${id}:`, error);
      }
    }

    //  Update login history based on portal type
    logger.debug(`Updating login history for userId: ${id}`);
    const userType = req.portalType === PortalType.ADMIN ? "admin" : "partner";
    await updateUserLastLoggedIn(
      id,
      userType,
      ipDetails,
      "success",
      deviceDetails?.device,
    );
    logger.debug(`User login history updated successfully`);

    //  Fetch role based on portal type
    logger.debug(
      `Fetching role of userId: ${id} for portal: ${req.portalType}`,
    );
    const role =
      req.portalType === PortalType.ADMIN
        ? await getAdminRole(id)
        : await getUserRole(id);
    logger.debug(`Role fetched successfully`);

    sendResponse(res, 200, "User logged in successfully", {
      jwtToken: jwt,
      refreshToken: refreshToken,
      role,
      portalType: req.portalType, // Return portal type to frontend
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, id, name } = req.payload!;

    logger.debug(`Generating otp for userId: ${id}`);
    const otp = await generateOtp();
    logger.debug(`Otp generated successfully`);

    logger.debug(`Deleting previous otps for userId: ${id}`);
    await deleteOtps(id);
    logger.debug(`Otp deleted successfully for userId: ${id}`);

    logger.debug(`Saving otp for userId: ${id}`);
    await saveOtp(id, otp);
    logger.debug(`Otp saved successfully`);

    logger.debug(`Fetching email template`);
    let emailTemplate = await getEmailTemplate("Otp");
    if (!emailTemplate) {
      return sendResponse(res, 500, "Email template not found");
    }

    emailTemplate = emailTemplate.replace(
      /{%currentYear%}/,
      moment().format("YYYY"),
    );
    emailTemplate = emailTemplate.replace(
      /{%name%}/g,
      name!.charAt(0).toUpperCase() + name!.slice(1),
    );
    const html = emailTemplate.replace(`{%otp%}`, otp);
    const subject = "EDUMATE - One time password";

    // ✅ NEW: Use unified email queue service
    logger.debug(`Queueing OTP email for userId: ${id}`);
    await queueEmail({
      to: email,
      subject,
      html,
      email_type: EmailType.OTP,
      category: EmailCategory.TRANSACTIONAL,
      sent_by_type: SenderType.SYSTEM,
      reference_type: "user",
      reference_id: id,
      metadata: {
        otp,
        userName: name,
        otpExpiry: "10 minutes",
      },
    });
    logger.debug(`OTP email queued successfully`);

    sendResponse(res, 200, "Otp sent successfully");
  } catch (error) {
    next(error);
  }
};

/**
 *  UNIFIED FORGOT PASSWORD
 * Works for both Admin and Partner portals
 * Portal type is automatically detected by validateEmail middleware
 */
export const forgotPassword = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, id, name } = req.payload!;

    logger.debug(
      `Generating emailToken for userId: ${id}, portal: ${req.portalType}`,
    );
    const emailToken = await generateEmailToken(30);
    logger.debug(`Email token generated successfully`);

    logger.debug(`Getting forgot password template`);
    let content = await getEmailTemplate("Forgot Password");
    if (!content) {
      return sendResponse(res, 500, "Email template not found");
    }
    logger.debug(`Forgot password template fetched successfully`);

    const expiry = moment().add(30, "minutes").toDate().toISOString();

    //  Different redirect URI based on portal type
    const portalPath =
      req.portalType === PortalType.ADMIN ? "admin" : "partners";
    const redirectUri = `${FRONTEND_URL}/${portalPath}/reset-password?token=${emailToken}&expiry=${expiry}`;

    logger.debug(`Redirect URI: ${redirectUri}`);

    // Replace template variables
    content = content.replace(/{%currentYear%}/, moment().format("YYYY"));
    content = content.replace(
      /{%name%}/g,
      name ? name.charAt(0).toUpperCase() + name.slice(1) : "User",
    );
    const html = content.replace("{%reset-password-url%}", redirectUri);
    const subject = "Forgot Password";

    //  Revoke previous tokens based on portal type
    logger.debug(
      `Revoking previous email tokens for portal: ${req.portalType}`,
    );
    if (req.portalType === PortalType.ADMIN) {
      await revokePreviousAdminEmailTokens(id);
    } else if (req.portalType === PortalType.PARTNER) {
      await revokePreviousEmailTokens(id);
    }
    logger.debug(`Email tokens revoked successfully`);

    //  Save email token based on portal type
    logger.debug(`Saving email token for userId: ${id}`);
    if (req.portalType === PortalType.ADMIN) {
      await saveAdminEmailToken(id, emailToken);
    } else if (req.portalType === PortalType.PARTNER) {
      await saveEmailToken(id, emailToken);
    }
    logger.debug(`Email token saved successfully`);

    // ✅ NEW: Use unified email queue service
    logger.debug(`Queueing forgot password email for userId: ${id}`);
    await queueEmail({
      to: email,
      subject,
      html,
      email_type: EmailType.FORGOT_PASSWORD,
      category: EmailCategory.TRANSACTIONAL,
      sent_by_type: SenderType.SYSTEM,
      reference_type: "user",
      reference_id: id,
      metadata: {
        portalType: req.portalType,
        expiry,
        resetUrl: redirectUri,
      },
    });
    logger.debug(`Forgot password email queued successfully`);

    sendResponse(res, 200, "Forgot password request sent successfully", {
      portalType: req.portalType, // Optional: inform frontend which portal
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { emailToken, password } = req.body;
    const { id, email } = req.payload!;

    logger.debug(
      `Using emailToken: ${emailToken} for userId: ${id}, portal: ${req.portalType}`,
    );

    //  Delete token based on portal type
    if (req.portalType === PortalType.ADMIN) {
      await useAdminEmailToken(id, emailToken);
    } else if (req.portalType === PortalType.PARTNER) {
      await useEmailToken(id, emailToken);
    }
    logger.debug(`Email token used successfully`);

    logger.debug(`Hashing password for userId: ${id}`);
    const hashedPassword = await hashPassword(password);
    logger.debug(`Password hashed successfully`);

    //  Update password based on portal type
    logger.debug(
      `Updating password for userId: ${id}, portal: ${req.portalType}`,
    );
    if (req.portalType === PortalType.ADMIN) {
      await updateAdminPassword(id, hashedPassword);
    } else if (req.portalType === PortalType.PARTNER) {
      await updatePassword(id, hashedPassword);
    }
    logger.debug(`Password updated successfully`);

    // ✅ OPTIONAL: Send password changed confirmation email
    // Uncomment if you want confirmation emails
    /*
    logger.debug(`Queueing password reset confirmation email`);
    await queueEmail({
      to: email,
      subject: "Password Reset Successful",
      html: "<p>Your password has been reset successfully. If you did not make this change, please contact support immediately.</p>",
      email_type: EmailType.PASSWORD_CHANGED,
      category: EmailCategory.TRANSACTIONAL,
      sent_by_type: SenderType.SYSTEM,
      reference_type: "user",
      reference_id: id,
      metadata: {
        portalType: req.portalType,
        resetDate: new Date().toISOString(),
      },
    });
    logger.debug(`Password reset confirmation email queued`);
    */

    sendResponse(res, 200, "Password reset successfully", {
      portalType: req.portalType, // Optional: inform frontend
    });
  } catch (error) {
    next(error);
  }
};

/**
 *  UNIFIED SET PASSWORD
 * Works for both Admin and Partner portals
 * Portal type is automatically detected by validateEmailToken middleware
 *
 * Note: This is functionally identical to resetPassword but with different messaging
 * Used for initial password setup vs password reset scenarios
 */
export const setPassword = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { emailToken, password } = req.body;
    const { id, email } = req.payload!;

    logger.debug(
      `Using emailToken for userId: ${id}, portal: ${req.portalType}`,
    );

    //  Delete token based on portal type
    if (req.portalType === PortalType.ADMIN) {
      await useAdminEmailToken(id, emailToken);
    } else if (req.portalType === PortalType.PARTNER) {
      await useEmailToken(id, emailToken);
    }
    logger.debug(`Email token used successfully`);

    logger.debug(`Hashing password for userId: ${id}`);
    const hashedPassword = await hashPassword(password);
    logger.debug(`Password hashed successfully`);

    //  Update password based on portal type
    logger.debug(
      `Updating password for userId: ${id}, portal: ${req.portalType}`,
    );
    if (req.portalType === PortalType.ADMIN) {
      await updateAdminPassword(id, hashedPassword);
    } else if (req.portalType === PortalType.PARTNER) {
      await updatePassword(id, hashedPassword);
    }
    logger.debug(`Password updated successfully`);

    // ✅ No confirmation email for set password (first time setup)
    // Users just set their password and can log in

    sendResponse(res, 200, "Password set successfully", {
      portalType: req.portalType, // Optional: inform frontend
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.payload!;

    logger.debug(`Deleting sesssion for userId: ${id}`);
    await deleteUserSession(id, "logout");
    logger.debug(`Session deleted successfully`);

    sendResponse(res, 200, "User logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const getAccessToken = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, email } = req.payload!;
    logger.debug(`Generating access token`);
    const refreshToken = await generateJWTToken(id, email);
    logger.debug(`Access token generated successfully`);

    sendResponse(res, 200, "Access token generated successfully", refreshToken);
  } catch (error) {
    next(error);
  }
};