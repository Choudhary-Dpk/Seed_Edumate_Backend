import { NextFunction,Request,Response } from "express";
import { sendResponse } from "../utils/api";
import { getUserByEmail, getUserByPhone } from "../models/helpers/user.helper";
import { getUserById, getUserDetailsFromToken } from "../models/helpers/auth";
import { getUserDetailsByEmail } from "../models/helpers";
import { decodeToken, validateUserPassword } from "../utils/auth";
import { JwtPayload } from "jsonwebtoken";
import { RequestWithPayload } from "../types/api.types";
import {
  LoginPayload,
  ProtectedPayload,
  ResetPasswordPayload,
} from "../types/auth";

export const validateCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone } = req.body;

    const userByEmail = await getUserByEmail(email, null);
    if (userByEmail) {
      return sendResponse(res, 400, "Email already exists");
    }

    const userByPhone = await getUserByPhone(phone, null);
    if (userByPhone) {
      return sendResponse(res, 400, "Phone number already exists");
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

    const userDetails = await getUserDetailsByEmail(email, false);
    if (!userDetails) {
      return sendResponse(res, 400, "User not found");
    }

    if (!userDetails.activationStatus) {
      return sendResponse(res, 400, "User is disabled");
    }

    req.payload = {
      id: userDetails.id,
      email: email,
      passwordHash: userDetails.passwordHash,
      passwordSetOn: userDetails.passwordSetOn,
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
    const { token } = req.body;
    if (!token) {
      return sendResponse(res, 401, "Missing Session Token");
    }

    let decodedToken: JwtPayload;
    try {
      decodedToken = await decodeToken(token);
    } catch (error) {
      return sendResponse(res, 401, "Invalid token");
    }

    const user = await getUserById(decodedToken.id, false, true);
    if (!user) {
      return sendResponse(res, 403, "Invalid user");
    }

    if (!user.activationStatus) {
      return sendResponse(
        res,
        403,
        "Your account has been disabled, please contact system administrator"
      );
    }

    req.payload = {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
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
