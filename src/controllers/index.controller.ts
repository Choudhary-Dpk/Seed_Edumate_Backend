import { NextFunction, Response } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import logger from "../utils/logger";
import { fetchCurrencyConfigs } from "../models/helpers";

export const getCurrencyConfigs = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.debug(`Fetching currency configs`);
    const data = await fetchCurrencyConfigs();
    logger.debug(`Currency configs fetched successfully`);
    sendResponse(res, 200, "Contacts Lead created successfully", data);
  } catch (error) {
    next(error);
  }
};
