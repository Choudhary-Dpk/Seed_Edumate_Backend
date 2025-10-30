import { Request,Response,NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { checkLenderFields } from "../models/helpers/lender.helper";

export const checkDuplicateLenderFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      lender_name,
      lender_display_name,
    } = req.body;

    // Check for duplicates
    const existing = await checkLenderFields({
      lender_name,
      lender_display_name,
    });

    if (existing) {
      return sendResponse(res, 409, "Lender already exists in the system");
    }

    next();
  } catch (error) {
    console.error(
      "Error in duplicate Lender field",
      error
    );
  }
};