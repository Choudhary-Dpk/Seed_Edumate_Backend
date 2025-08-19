import { NextFunction,Request,Response } from "express";
import { sendResponse } from "../utils/api";
import { getUserByEmail } from "../models/helpers/user.helper";
import {
  getUserById,
  getUserDetailsFromToken,
  getUserSessionById,
} from "../models/helpers/auth";
import { getUserDetailsByEmail } from "../models/helpers";
import {
  decodeToken,
  generateEmailToken,
  validateUserPassword,
} from "../utils/auth";
import { JwtPayload } from "jsonwebtoken";
import { RequestWithPayload } from "../types/api.types";
import {
  LoginPayload,
  ProtectedPayload,
  ResetPasswordPayload,
} from "../types/auth";
import * as hubspotService from "../services/hubspot.service";
import {
  getPartnerById,
  getUserRoleById,
} from "../models/helpers/partners.helper";
import { fetchIpDetails } from "../services/user.service";
import { UAParser } from "ua-parser-js";
import { API_KEY, JWT_SECRET } from "../setup/secrets";
import moment from "moment";
import prisma from "../config/prisma";

export const validateCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, b2bId, roleId } = req.body;

    const existingEmail = await hubspotService.fetchPartnerByEmail(email);
    if (existingEmail.total > 0 || existingEmail.results?.length > 0) {
      return sendResponse(res, 400, "Email already exists in HubSpot");
    }

    const existingPartner = await getPartnerById(b2bId);
    if (!existingPartner) {
      return sendResponse(res, 400, "Partner does not exists");
    }

    const role = await getUserRoleById(roleId);
    if (!role) {
      return sendResponse(res, 400, "Role does not exists");
    }

    const userByEmail = await getUserByEmail(email);
    if (userByEmail) {
      return sendResponse(res, 400, "Email already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Error while validating creation");
  }
};

export const validateEmailToken = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailToken } = req.body as { emailToken?: string };

    if (!emailToken) {
      return sendResponse(res, 400, "Email token is required");
    }

    const details = await getUserDetailsFromToken(emailToken);
    if (!details?.id) {
      return sendResponse(res, 401, "Invalid token");
    }

    req.payload = {
      id: details.userId,
    };

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error");
  }
};

export const validateEmail = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;

    const userDetails = await getUserDetailsByEmail(email);
    if (!userDetails) {
      return sendResponse(res, 400, "User not found");
    }

    if (!userDetails.is_active) {
      return sendResponse(res, 400, "User is disabled");
    }

    req.payload = {
      id: userDetails.id,
      email: email,
      name: userDetails.full_name!,
      passwordHash: userDetails.password_hash,
      passwordSetOn: userDetails.updated_at,
    };
    next();
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const validatePassword = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { passwordHash, passwordSetOn } = req.payload!;
    const { password } = req.body;

    if (!passwordHash || !passwordSetOn) {
      return sendResponse(res, 403, "Password not set");
    }

    const isValid = await validateUserPassword(password, passwordHash);
    if (!isValid) {
      return sendResponse(res, 401, "Invalid password");
    }

    req.payload = {
      ...req.payload!,
    };

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error");
  }
};

export const validateToken = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, 401, "Missing or invalid Authorization header");
    }

    const token = authHeader.split(" ")[1];

    let decodedToken: JwtPayload;
    try {
      decodedToken = await decodeToken(token);
    } catch (error) {
      return sendResponse(res, 401, "Unauthorized user");
    }

    const user = await getUserById(decodedToken.id, true);
    if (!user) {
      return sendResponse(res, 401, "User not found");
    }

    if (!user.is_active) {
      return sendResponse(
        res,
        401,
        "Your account has been disabled, please contact system administrator"
      );
    }

    const userSession = await getUserSessionById(decodedToken.id);
    if (!userSession?.is_valid) {
      return sendResponse(res, 401, "Invalid user session");
    }

    req.payload = {
      id: user.id,
      email: user.email,
      passwordHash: user.password_hash,
    };

    next();
  } catch (error: any) {
    return sendResponse(
      res,
      500,
      error?.message?.toString() || "Internal server error"
    );
  }
};

export const validateChangePassword = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const passwordHash = req.payload?.passwordHash;
    const { password } = req.body;

    if (!passwordHash) {
      return sendResponse(res, 403, "Password not set");
    }

    const isValid = await validateUserPassword(password, passwordHash);
    if (!isValid) {
      return sendResponse(res, 401, "Invalid password");
    }

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error");
  }
};

export const getUserIpDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, email } = req.payload!;
    let ip =
      (req.query.ip as string) ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.socket?.remoteAddress ||
      "";

    // Fallback for local testing
    if (ip === "::1" || ip === "127.0.0.1") {
      ip = "8.8.8.8";
    }

    const ipDetails = await fetchIpDetails(ip);
    console.log("ipDetails", ipDetails);

    const parser = new UAParser(req.headers["user-agent"] || "");
    const uaResult = parser.getResult();

    const deviceInfo = {
      browser: `${uaResult.browser.name || "Unknown"} ${
        uaResult.browser.version || ""
      }`,
      os: `${uaResult.os.name || "Unknown"} ${uaResult.os.version || ""}`,
      device: uaResult.device.type || "desktop",
    };

    console.log("deviceInfo", deviceInfo);

    req.payload = {
      ...req.payload,
      id,
      email,
      ipDetails: ip,
      deviceDetails: deviceInfo,
    };

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error");
  }
};

export const validateRefreshToken = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendResponse(res, 400, "Refresh token is required");
    }

    const session = await prisma.session.findFirst({
      where: { refresh_token_hash: refreshToken, is_valid: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            is_active: true,
            password_hash: true,
          },
        },
      },
    });

    if (!session) {
      return sendResponse(res, 401, "Invalid or revoked refresh token");
    }

    if (session.expires_at && moment().isAfter(session.expires_at)) {
      return sendResponse(res, 401, "Refresh token expired");
    }

    if (!session.user) {
      return sendResponse(res, 401, "User not found");
    }

    req.payload = {
      id: session.user.id,
      email: session.user.email,
      passwordHash: session.user.password_hash,
    };

    next();
  } catch (error: any) {
    return sendResponse(res, 500, error?.message || "Internal server error");
  }
};

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientKey = req.headers["edumate-api-key"];

    if (!clientKey || clientKey !== API_KEY) {
      return sendResponse(res, 401, "Invalid or missing API Key");
    }

    next();
  } catch (error: any) {
    return sendResponse(
      res,
      500,
      error?.message?.toString() || "Internal server error"
    );
  }
};
