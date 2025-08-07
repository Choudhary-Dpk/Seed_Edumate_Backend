import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { fetchIpDetails } from "../services/user.service";
import { generateOtp, sendResponse } from "../utils/api";
import { createUsers } from "../models/helpers/user.helper";
import {
  generateJWTToken,
  generateRefreshToken,
  hashPassword,
} from "../utils/auth";
import moment from "moment";
import { getEmailTemplate } from "../models/helpers";
import { emailQueue } from "../utils/queue";
import logger from "../utils/logger";
import { RequestWithPayload } from "../types/api.types";
import { ResetPasswordPayload } from "../types/auth";
import {
  deleteOtps,
  deleteUserSession,
  revokePreviousEmailTokens,
  saveEmailToken,
  saveOtp,
  updatePassword,
  updateUserLastLoggedIn,
  updateUserSession,
  useEmailToken,
  useOtp,
  validateOtp,
} from "../models/helpers/auth";
import { FRONTEND_URL } from "../setup/secrets";

export const getIpInfo = async (req: Request, res: Response) => {
  try {
    const ip =
      (req.query.ip as string) ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0] || // real client IP
      req.socket?.remoteAddress || // fallback (usually local IP)
      "";

    // if (!ip) {
    //   return res.status(400).json({ message: 'Missing IP address in query params' });
    // }

    const data = await fetchIpDetails(ip);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch IP details" });
  }
};
export const getAllUsers = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;
    const user = await createUsers(
      null, // createdBy
      email,
      null, // passwordHash
      firstName,
      lastName,
      phone,
      address
    );

    logger.debug(`Generating refresh token`);
    const emailToken = await generateRefreshToken(30);
    logger.debug(`Email token generated successfully`);

    logger.debug(`Getting template for set password`);
    const content = await getEmailTemplate("set-password");
    logger.debug(`Email template fetched successfully`);
    if (!content) {
      throw new Error("set-password - Email template not found");
    }

    const expiry = moment().add(2, "days").toDate().toISOString();
    const redirectUri = `${process.env.FRONTEND_URL}/set-password?token=${emailToken}&expiry=${expiry}`;
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

    emailQueue.push({ to: email, subject, html, retry: 0 });

    sendResponse(res, 201, "User created successfully");
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (
  req: Request,
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

export const resetPassword = async (
  req: Request,
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

export const sendOtp = async (
  req: Request,
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
    const subject = "OSP - One time password";

    emailQueue.push({ to: email, subject, html, retry: 0 });

    sendResponse(res, 200, "Otp sent successfully");
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, id } = req.payload!;
    const { otp } = req.body;

    logger.debug(`Validating otp ${otp} for userId: ${id}`);
    const otpData = await validateOtp(id, otp);
    if (!otpData) {
      return sendResponse(res, 401, "Invalid otp");
    }
    logger.debug(`Otp validated successfully`);

    logger.debug(`Using otp ${otp} for userId: ${id}`);
    await useOtp(id, otp);
    logger.debug(`Otp used successfully`);

    logger.debug(`Generating sessionId`);
    const sessionId = await generateRefreshToken(20);
    logger.debug(`sessionId generated successfully`);

    logger.debug(`Generating JWT Token for userId: ${id} and email: ${email}`);
    const jwt = await generateJWTToken(id, email, sessionId);
    logger.debug(`JWT Token generated successfully`);

    logger.debug(`Updating user last loggedin`);
    await updateUserLastLoggedIn(id);
    logger.debug(`User last loggedin update successfully`);

    logger.debug(`Updating sesssion for userId: ${id}`);
    await updateUserSession(id, sessionId);
    logger.debug(`Session updated successfully`);

    sendResponse(res, 200, "User logged in successfully", jwt);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, id } = req.payload!;

    logger.debug(`Generating emailToken`);
    const emailToken = await generateRefreshToken(30);
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

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;

    logger.debug(`Deleting sesssion for userId: ${id}`);
    await deleteUserSession(id);
    logger.debug(`Session deleted successfully`);

    sendResponse(res, 200, "User logged out successfully");
  } catch (error) {
    next(error);
  }
};

