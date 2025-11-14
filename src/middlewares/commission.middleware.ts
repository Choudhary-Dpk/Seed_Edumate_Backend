import { Request, Response, NextFunction } from "express";
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
    } = req.body;

    // Skip if no relevant fields provided
    if (
      !lead_reference_id &&
      !student_id &&
      !settlement_reference_number &&
      !hs_object_id
    ) {
      return next();
    }

    // Check for existing record using helper function
    const existing = await checkCommissionSettlementFields(
      lead_reference_id,
      student_id,
      settlement_reference_number,
      hs_object_id
    );

    if (existing) {
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

      if (student_id && existing.student_id === student_id) {
        return sendResponse(
          res,
          409,
          "A settlement already exists for this partner and student for the specified period"
        );
      }

      return sendResponse(res, 409, "Commission Settlement already exists");
    }

    next();
  } catch (error) {
    console.error(
      "Error in duplicate commission settlement field check middleware:",
      error
    );
  }
};
