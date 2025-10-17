import { Response, Request, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { checkLoanProductFields } from "../models/helpers/loanProduct.helper";

export const checkDuplicateLoanProductFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lender_id, product_display_name, hs_object_id } = req.body;

    // Skip if no relevant fields provided
    if (!lender_id && !product_display_name && !hs_object_id) {
      return next();
    }

    // Check for existing record using helper function
    const existing = await checkLoanProductFields(
      lender_id,
      product_display_name,
      hs_object_id
    );

    if (existing) {
      // Check which specific field is duplicate and return appropriate message
      if (
        lender_id &&
        product_display_name &&
        existing.lender_id === lender_id &&
        existing.product_display_name === product_display_name
      ) {
        return sendResponse(
          res,
          409,
          "A loan product with this name already exists for this lender"
        );
      }

      if (hs_object_id && existing.hs_object_id === hs_object_id) {
        return sendResponse(
          res,
          409,
          "HubSpot object ID already exists in the system"
        );
      }

      // Fallback
      return sendResponse(res, 409, "Loan Product already exists");
    }

    next();
  } catch (error) {
    console.error(
      "Error in duplicate loan product field check middleware:",
      error
    );
    return sendResponse(
      res,
      500,
      "Internal server error during duplicate validation"
    );
  }
};
