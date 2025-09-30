import { RequestWithPayload } from "../types/api.types";
import { NextFunction, Response } from "express";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import { createCheckerLeads, createMarketLeads } from "../models/helpers/emi.helper";

export const createEligibilityCheckerLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return sendResponse(res, 400, "Contact Id is required");
    }

    const lead = await createCheckerLeads(contactId)
    return sendResponse(
      res,
      200,
      "Eligibility lead created successfully",
      lead
    );
  } catch (error) {
    next(error);
  }
};

export const createEmiCalculatorLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return sendResponse(res, 400, "Contact Id is required");
    }

    const lead = await createMarketLeads(contactId)

    return sendResponse(res, 200, "EMI lead created successfully", lead);
  } catch (error) {
    next(error);
  }
};
