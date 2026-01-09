import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { checkCommissionSettlementFields } from "../models/helpers/commission.helper";
import prisma from "../config/prisma";

export const checkDuplicateCommissionSettlementFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { student_id, settlement_reference_number, hs_object_id } = req.body;

    // Skip if no relevant fields provided
    if (!student_id && !settlement_reference_number && !hs_object_id) {
      return next();
    }

    // Check for existing record using helper function
    const existing = await checkCommissionSettlementFields(
      student_id,
      settlement_reference_number,
      hs_object_id
    );

    if (existing) {
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

export const validateSettlementIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let commission_settlement_ids = req.body.commission_settlement_ids;

    // Check if commission_settlement_ids is provided
    if (!commission_settlement_ids) {
      return sendResponse(res, 400, "Commission settlement IDs are required");
    }

    if (typeof commission_settlement_ids === "string") {
      try {
        commission_settlement_ids = JSON.parse(commission_settlement_ids);
        console.log("Parsed IDs:", commission_settlement_ids);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return sendResponse(
          res,
          400,
          "Invalid commission settlement IDs format - must be valid JSON array"
        );
      }
    }

    // Check if it's an array after parsing
    if (!Array.isArray(commission_settlement_ids)) {
      return sendResponse(
        res,
        400,
        "Commission settlement IDs must be an array"
      );
    }

    if (commission_settlement_ids.length === 0) {
      return sendResponse(
        res,
        400,
        "Commission settlement IDs array cannot be empty"
      );
    }

    // Validate all elements are numbers - with proper type guard
    const settlementIdsArray: number[] = commission_settlement_ids
      .map((id: any) => {
        if (typeof id === "string") {
          const parsed = parseInt(id, 10);
          return isNaN(parsed) ? null : parsed;
        }
        if (typeof id === "number" && !isNaN(id)) {
          return id;
        }
        return null;
      })
      .filter((id): id is number => id !== null);

    console.log("Final settlement IDs array:", settlementIdsArray);

    if (settlementIdsArray.length === 0) {
      return sendResponse(
        res,
        400,
        "Commission settlement IDs must contain valid numbers"
      );
    }

    if (settlementIdsArray.length !== commission_settlement_ids.length) {
      return sendResponse(
        res,
        400,
        "All commission settlement IDs must be valid numbers"
      );
    }

    // Validate that all settlement IDs exist in database
    const existingSettlements = await prisma.hSCommissionSettlements.findMany({
      where: {
        id: {
          in: settlementIdsArray, // ← Now TypeScript knows this is number[]
        },
        is_deleted: false,
        is_active: true,
      },
      include: {
        calculation_details: true,
        documentaion: true,
      },
    });

    console.log("Found settlements:", existingSettlements.length);

    // Check if all IDs exist
    if (existingSettlements.length !== settlementIdsArray.length) {
      const foundIds = existingSettlements.map((s) => s.id);
      const missingIds = settlementIdsArray.filter(
        (id) => !foundIds.includes(id)
      );

      return sendResponse(
        res,
        404,
        "Some commission settlement IDs do not exist or are inactive/deleted",
        { missingIds, foundIds }
      );
    }

    // Attach validated settlements to request object for use in controller
    (req as any).validatedSettlements = {
      settlements: existingSettlements,
      settlementIds: settlementIdsArray,
    };

    next();
  } catch (error: any) {
    console.error("Error validating settlement IDs:", error);
    return sendResponse(res, 500, "Error validating settlement IDs");
  }
};
