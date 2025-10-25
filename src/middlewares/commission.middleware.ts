import { Request, Response,NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { checkCommissionSettlementFields } from "../models/helpers/commission.helper";

export const checkDuplicateCommissionSettlementFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      lead_reference_id,
      student_id,
      settlement_reference_number,
      hs_object_id,
      partner_id,
      settlement_month,
      settlement_year,
    } = req.body;

    // Skip if no relevant fields provided
    if (
      !lead_reference_id &&
      !student_id &&
      !settlement_reference_number &&
      !hs_object_id &&
      !partner_id
    ) {
      return next();
    }

    // Check for existing record using helper function
    const existing = await checkCommissionSettlementFields(
      lead_reference_id,
      student_id,
      settlement_reference_number,
      hs_object_id,
      partner_id,
      settlement_month,
      settlement_year
    );

    if (existing) {
      // Check which specific field is duplicate and return appropriate message
      if (
        lead_reference_id &&
        existing.lead_reference_id === lead_reference_id
      ) {
        return sendResponse(
          res,
          409,
          "This lead reference ID already has a commission settlement"
        );
      }

      if (student_id && existing.student_id === student_id) {
        return sendResponse(
          res,
          409,
          "This student ID already has a commission settlement"
        );
      }

      if (
        settlement_reference_number &&
        existing.settlement_reference_number === settlement_reference_number
      ) {
        return sendResponse(
          res,
          409,
          "Settlement reference number already exists in the system"
        );
      }

      if (hs_object_id && existing.hs_object_id === hs_object_id) {
        return sendResponse(
          res,
          409,
          "HubSpot object ID already exists in the system"
        );
      }

      // Check for duplicate partner + student + period combination
      if (
        partner_id &&
        student_id &&
        settlement_month &&
        settlement_year &&
        existing.partner_id === partner_id &&
        existing.student_id === student_id &&
        existing.settlement_month === settlement_month &&
        existing.settlement_year === settlement_year
      ) {
        return sendResponse(
          res,
          409,
          "A settlement already exists for this partner and student for the specified period"
        );
      }

      // Fallback
      return sendResponse(res, 409, "Commission Settlement already exists");
    }

    next();
  } catch (error) {
    console.error(
      "Error in duplicate commission settlement field check middleware:",
      error
    );
    return sendResponse(
      res,
      500,
      "Internal server error during duplicate validation"
    );
  }
};
