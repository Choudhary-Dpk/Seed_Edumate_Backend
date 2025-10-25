import { Response, NextFunction } from "express";
import moment from "moment";
import { getEmailTemplate } from "../../../models/helpers";
import {
  updateUserLastLoggedIn,
  storeAdminRefreshToken,
  revokePreviousAdminEmailTokens,
  saveAdminEmailToken,
  useAdminEmailToken,
  updateAdminPassword,
  deleteAdminSession,
} from "../../../models/helpers/auth";
import { logEmailHistory } from "../../../models/helpers/email.helper";
import { getAdminRole } from "../../../models/helpers/partners.helper";
import { FRONTEND_URL } from "../../../setup/secrets";
import { RequestWithPayload } from "../../../types/api.types";
import {
  LoginPayload,
  ResetPasswordPayload,
  ProtectedPayload,
} from "../../../types/auth";
import { sendResponse } from "../../../utils/api";
import {
  generateJWTToken,
  generateRefreshToken,
  generateEmailToken,
  hashPassword,
} from "../../../utils/auth";
import logger from "../../../utils/logger";
import { emailQueue } from "../../../utils/queue";
import { getAdminUserProfile } from "../../../models/helpers/user.helper";

export const adminLoginController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, id, ipDetails, deviceDetails } = req.payload!;
    // const { otp } = req.body;

    // logger.debug(`Validating otp ${otp} for userId: ${id}`);
    // const otpData = await validateOtp(id, otp);
    // if (!otpData) {
    //   return sendResponse(res, 401, "Invalid otp");
    // }
    // logger.debug(`Otp validated successfully`);

    // logger.debug(`Using otp ${otp} for userId: ${id}`);
    // await useOtp(id, otp);
    // logger.debug(`Otp used successfully`);

    logger.debug(`Generating JWT Token for userId: ${id} and email: ${email}`);
    const jwt = await generateJWTToken(id, email);
    logger.debug(`JWT Token generated successfully`);

    logger.debug(`Generating Refresh Token for userId: ${id}`);
    const refreshToken = await generateRefreshToken(id, email);
    logger.debug(`Refresh Token generated successfully`);

    logger.debug(`Storing refresh token in database`);
    await storeAdminRefreshToken(
      id,
      refreshToken,
      ipDetails,
      deviceDetails?.device
    );
    logger.debug(`Refresh token stored successfully`);

    logger.debug(`Updating login history for userId: ${id}`);
    await updateUserLastLoggedIn(
      id,
      ipDetails,
      "success",
      deviceDetails?.device
    );
    logger.debug(`User login history updated successfully`);

    logger.debug(`Fetching role of userId: ${id}`);
    const role = await getAdminRole(id);
    logger.debug(`Role fetched successfully`);

    sendResponse(res, 200, "User logged in successfully", {
      jwtToken: jwt,
      refreshToken: refreshToken,
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotAdminPassword = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, id, name } = req.payload!;

    logger.debug(`Generating emailToken`);
    const emailToken = await generateEmailToken(30);
    logger.debug(`Email token generated successfully`);

    logger.debug(`Getting forgot password template`);
    let content = await getEmailTemplate("forgot-password");
    if (!content) {
      return sendResponse(res, 500, "Email template not found");
    }
    logger.debug(`Forgot password template fetched successfully`);

    const expiry = moment().add(30, "minutes").toDate().toISOString();
    const redirectUri = `${FRONTEND_URL}/admin/reset-password?token=${emailToken}&expiry=${expiry}`;
    console.log("Redirect URI:", redirectUri);
    content = content.replace(/{%currentYear%}/, moment().format("YYYY"));
    content = content.replace(
      /{%name%}/g,
      name!.charAt(0).toUpperCase() + name!.slice(1)
    );
    const html = content.replace("{%reset-password-url%}", redirectUri);
    const subject = "Forgot Password";

    logger.debug(`Revoking previous email tokens`);
    await revokePreviousAdminEmailTokens(id);
    logger.debug(`Email tokens revoked successfully`);

    logger.debug(`Saving email token for userId: ${id}`);
    await saveAdminEmailToken(id, emailToken);
    logger.debug(`Email token saved successfully`);

    logger.debug(`Saving email history for userId: ${id}`);
    await logEmailHistory({
      userId: id,
      to: email,
      subject,
      type: "Forgot Password",
    });
    logger.debug(`Email history saved successfully`);

    emailQueue.push({ to: email, subject: subject, html: html, retry: 0 });

    sendResponse(res, 200, "Forgot password request sent successfully");
  } catch (error) {
    next(error);
  }
};

export const resetAdminPassword = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailToken, password } = req.body;
    const { id, email } = req.payload!;

    logger.debug(`Using emailToken: ${emailToken} for userId: ${id}`);
    await useAdminEmailToken(id, emailToken);
    logger.debug(`Email token used successfully`);

    logger.debug(`Hashing password for userId: ${id}`);
    const hashedPassword = await hashPassword(password);
    logger.debug(`Password hashed successfully`);

    logger.debug(`Updating password for userId: ${id}`);
    await updateAdminPassword(id, hashedPassword);
    logger.debug(`Password updated successfully`);

    logger.debug(`Saving email history for userId: ${id}`);
    await logEmailHistory({
      userId: id,
      to: email,
      subject: "Reset Password",
      type: "Reset Password",
    });
    logger.debug(`Email history saved successfully`);

    sendResponse(res, 200, "Password reset successfully");
  } catch (error) {
    next(error);
  }
};

export const setAdminPassword = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailToken, password } = req.body;
    const { id, email } = req.payload!;

    logger.debug(`Using email token for userId: ${id}`);
    await useAdminEmailToken(id, emailToken);
    logger.debug(`Email token used successfully`);

    logger.debug(`Hashing password for userId: ${id}`);
    const hashedPassword = await hashPassword(password);
    logger.debug(`Password hashed successfully`);

    logger.debug(`Updating password for userId: ${id}`);
    await updateAdminPassword(id, hashedPassword);
    logger.debug(`Password updated successfully`);

    logger.debug(`Saving email history for userId: ${id}`);
    await logEmailHistory({
      userId: id,
      to: email,
      subject: "Reset Password",
      type: "Reset Password",
    });
    logger.debug(`Email history saved successfully`);

    sendResponse(res, 200, "Password set successfully");
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;

    logger.debug(`Deleting sesssion for userId: ${id}`);
    await deleteAdminSession(id, "logout");
    logger.debug(`Session deleted successfully`);

    sendResponse(res, 200, "User logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const changeAdminPassword = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const { newPassword } = req.body;

    logger.debug(`Encrypting password for userId: ${id}`);
    const hash = await hashPassword(newPassword);
    logger.debug(`Password encrypted successfully`);

    logger.debug(`Updating password for userId: ${id}`);
    await updateAdminPassword(id, hash);
    logger.debug(`Password updated successfully`);

    sendResponse(res, 200, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;

    const profile = await getAdminUserProfile(id);
    if (!profile) {
      return sendResponse(res, 404, "Profile not found");
    }

    sendResponse(res, 200, "Profile fetched successfully", profile);
  } catch (error) {
    next(error);
  }
};
