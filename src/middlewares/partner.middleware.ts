import { Response, Request, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { checkB2BPartnerFields } from "../models/helpers/partners.helper";

// Middleware - without showing actual values
export const checkDuplicateB2BPartnerFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      gst_number,
      pan_number,
      registration_number,
      partner_name,
      partner_display_name,
    } = req.body;

    // Skip if no relevant fields provided
    if (
      !gst_number &&
      !pan_number &&
      !registration_number &&
      !partner_name &&
      !partner_display_name
    ) {
      return next();
    }

    const existing = await checkB2BPartnerFields(
      gst_number,
      pan_number,
      registration_number,
      partner_name,
      partner_display_name
    );

    if (existing) {
      // Check which specific field is duplicate and return appropriate message
      if (gst_number && existing.gst_number === gst_number) {
        return sendResponse(
          res,
          409,
          "GST number already exists in the system"
        );
      }

      if (pan_number && existing.pan_number === pan_number) {
        return sendResponse(
          res,
          409,
          "PAN number already exists in the system"
        );
      }

      if (
        registration_number &&
        existing.registration_number === registration_number
      ) {
        return sendResponse(
          res,
          409,
          "Registration number already exists in the system"
        );
      }

      if (partner_name && existing.partner_name === partner_name) {
        return sendResponse(
          res,
          409,
          "Partner name already exists in the system"
        );
      }

      if (
        partner_display_name &&
        existing.partner_display_name === partner_display_name
      ) {
        return sendResponse(
          res,
          409,
          "Partner display name already exists in the system"
        );
      }

      // Fallback
      return sendResponse(res, 409, "B2B Partner already exists");
    }

    next();
  } catch (error) {
    console.error(
      "Error in duplicate B2B partner field check middleware:",
      error
    );
    return sendResponse(
      res,
      500,
      "Internal server error during duplicate validation"
    );
  }
};
