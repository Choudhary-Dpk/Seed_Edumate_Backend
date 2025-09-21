import { NextFunction, Response } from "express";
import { sendResponse } from "../utils/api";
import { RequestWithPayload } from "../types/api.types";
import { ProtectedPayload } from "../types/auth";
import { getModulePermissions } from "../models/helpers";
import logger from "../utils/logger";

export const getPermissions = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.payload?.id!;

    logger.debug(`Fetching module permissions`);
    const permission = await getModulePermissions(userId);
    logger.debug(`Permissions fetch successfully`);

    const userPermissions = permission
      .flatMap((item) => item.role.permissions)
      .map((r) => r.permission);

    sendResponse(res, 200, "Permissions fetched successfully", userPermissions);
  } catch (error) {
    next(error);
  }
};
