import { Response,NextFunction } from "express";
import { RequestWithPayload } from "../../types/api.types";
import { LoginPayload, ProtectedPayload, ResetPasswordPayload } from "../../types/auth";
import logger from "../../utils/logger";
import {
  deleteOtps,
  deleteUserSession,
  revokePreviousEmailTokens,
  saveEmailToken,
  saveOtp,
  storeRefreshToken,
  updatePassword,
  updateUserLastLoggedIn,
  useEmailToken,
  useOtp,
  validateOtp,
} from "../../models/helpers/auth";
import { generateOtp, sendResponse } from "../../utils/api";
import {
  generateJWTToken,
  hashPassword,
  generateEmailToken,
  generateRefreshToken,
} from "../../utils/auth";
import { getEmailTemplate } from "../../models/helpers";
import { emailQueue } from "../../utils/queue";
import moment from "moment";
import { FRONTEND_URL } from "../../setup/secrets";

export const login = async (
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
    await storeRefreshToken(id, refreshToken, ipDetails, deviceDetails?.device);
    logger.debug(`Refresh token stored successfully`);

    logger.debug(`Updating login history for userId: ${id}`);
    await updateUserLastLoggedIn(
      id,
      ipDetails,
      "success",
      deviceDetails?.device
    );
    logger.debug(`User login history updated successfully`);

    sendResponse(res, 200, "User logged in successfully", {
      jwtToken: jwt,
      refreshToken: refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, id } = req.payload!;

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
    const emailTemplate = await getEmailTemplate("otp");
    if (!emailTemplate) {
      return sendResponse(res, 500, "Email template not found");
    }

    const html = emailTemplate.replace(`{%otp%}`, otp);
    const subject = "SEED - One time password";

    emailQueue.push({ to: email, subject, html, retry: 0 });

    sendResponse(res, 200, "Otp sent successfully");
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, id } = req.payload!;

    logger.debug(`Generating emailToken`);
    const emailToken = await generateEmailToken(30);
    logger.debug(`Email token generated successfully`);

    logger.debug(`Getting forgot password template`);
    const content = await getEmailTemplate("forgot-password");
    if (!content) {
      return sendResponse(res, 500, "Email template not found");
    }
    logger.debug(`Forgot password template fetched successfully`);

    const expiry = moment().add(30, "minutes").toDate().toISOString();
    const redirectUri = `${FRONTEND_URL}/auth/reset-password?token=${emailToken}&expiry=${expiry}`;
    console.log("Redirect URI:", redirectUri);
    const html = content.replace("{%reset-password-url%}", redirectUri);
    const subject = "Forgot Password";

    logger.debug(`Revoking previous email tokens`);
    await revokePreviousEmailTokens(id);
    logger.debug(`Email tokens revoked successfully`);

    logger.debug(`Saving email token for userId: ${id}`);
    await saveEmailToken(id, emailToken);
    logger.debug(`Email token saved successfully`);

    emailQueue.push({ to: email, subject: subject, html: html, retry: 0 });

    sendResponse(res, 200, "Forgot password request sent successfully");
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailToken, password } = req.body;
    const { id } = req.payload!;

    logger.debug(`Using emailToken: ${emailToken} for userId: ${id}`);
    await useEmailToken(id, emailToken);
    logger.debug(`Email token used successfully`);

    logger.debug(`Hashing password for userId: ${id}`);
    const hashedPassword = await hashPassword(password);
    logger.debug(`Password hashed successfully`);

    logger.debug(`Updating password for userId: ${id}`);
    await updatePassword(id, hashedPassword);
    logger.debug(`Password updated successfully`);

    sendResponse(res, 200, "Password reset successfully");
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailToken, password } = req.body;
    const { id } = req.payload!;

    logger.debug(`Using email token for userId: ${id}`);
    await useEmailToken(id, emailToken);
    logger.debug(`Email token used successfully`);

    logger.debug(`Hashing password for userId: ${id}`);
    const hashedPassword = await hashPassword(password);
    logger.debug(`Password hashed successfully`);

    logger.debug(`Updating password for userId: ${id}`);
    await updatePassword(id, hashedPassword);
    logger.debug(`Password updated successfully`);

    sendResponse(res, 200, "Password set successfully");
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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