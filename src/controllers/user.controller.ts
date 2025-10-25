import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { fetchIpDetails } from "../services/user.service";
import { sendResponse } from "../utils/api";
import {
  assignRole,
  createUsers,
  getUserProfile,
} from "../models/helpers/user.helper";
import { generateEmailToken, hashPassword } from "../utils/auth";
import moment from "moment";
import { getEmailTemplate } from "../models/helpers";
import { emailQueue } from "../utils/queue";
import logger from "../utils/logger";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload, ProtectedPayload } from "../types/auth";
import {
  revokePreviousEmailTokens,
  saveEmailToken,
  updatePassword,
} from "../models/helpers/auth";
import { FRONTEND_URL } from "../setup/secrets";
import { logEmailHistory } from "../models/helpers/email.helper";

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
  const users = await prisma.b2BPartnersUsers.findMany();
  res.json(users);
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email, b2bId, roleId } = req.body;

    // logger.debug(`Creating hubspot partner`);
    // const hubspotPartner = await createPartner(email, fullName);
    // logger.debug(
    //   `Hubspot partner created successfully for partnerId: ${hubspotPartner.id}`
    // );

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
    let content = await getEmailTemplate("set-password");
    logger.debug(`Email template fetched successfully`);
    if (!content) {
      throw new Error("set-password - Email template not found");
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

    logger.debug(`Saving email history for userId: ${user.id}`);
    await logEmailHistory({
      userId: user.id,
      to: email,
      subject,
      type: "Set Password",
    });
    logger.debug(`Email history saved successfully`);

    emailQueue.push({ to: email, subject, html, retry: 0 });

    sendResponse(res, 201, "User created successfully");
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
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
    await updatePassword(id, hash);
    logger.debug(`Password updated successfully`);

    sendResponse(res, 200, "Password changed successfully");
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
