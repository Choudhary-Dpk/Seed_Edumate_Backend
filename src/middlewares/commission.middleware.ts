import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { checkCommissionSettlementFields } from "../models/helpers/commission.helper";
import prisma from "../config/prisma";
import logger from "../utils/logger";

export const checkDuplicateCommissionSettlementFields = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
      hs_object_id,
    );

    if (existing) {
      if (student_id && existing.student_id === student_id) {
        return sendResponse(
          res,
          409,
          "This student ID already has a commission settlement",
        );
      }

      if (
        settlement_reference_number &&
        existing.settlement_reference_number === settlement_reference_number
      ) {
        return sendResponse(
          res,
          409,
          "Settlement reference number already exists in the system",
        );
      }

      if (hs_object_id && existing.hs_object_id === hs_object_id) {
        return sendResponse(
          res,
          409,
          "HubSpot object ID already exists in the system",
        );
      }

      if (student_id && existing.student_id === student_id) {
        return sendResponse(
          res,
          409,
          "A settlement already exists for this partner and student for the specified period",
        );
      }

      return sendResponse(res, 409, "Commission Settlement already exists");
    }

    next();
  } catch (error) {
    console.error(
      "Error in duplicate commission settlement field check middleware:",
      error,
    );
  }
};

export const validateSettlementIds = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
          "Invalid commission settlement IDs format - must be valid JSON array",
        );
      }
    }

    // Check if it's an array after parsing
    if (!Array.isArray(commission_settlement_ids)) {
      return sendResponse(
        res,
        400,
        "Commission settlement IDs must be an array",
      );
    }

    if (commission_settlement_ids.length === 0) {
      return sendResponse(
        res,
        400,
        "Commission settlement IDs array cannot be empty",
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
        "Commission settlement IDs must contain valid numbers",
      );
    }

    if (settlementIdsArray.length !== commission_settlement_ids.length) {
      return sendResponse(
        res,
        400,
        "All commission settlement IDs must be valid numbers",
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
        status_history: true,
      },
    });

    // Check if all IDs exist
    if (existingSettlements.length !== settlementIdsArray.length) {
      const foundIds = existingSettlements.map((s) => s.id);
      const missingIds = settlementIdsArray.filter(
        (id) => !foundIds.includes(id),
      );

      return sendResponse(
        res,
        404,
        "Some commission settlement IDs do not exist or are inactive/deleted",
        { missingIds, foundIds },
      );
    }

    // PHASE 3: Block invoice upload unless partner has accepted (verified) the settlement
    const unverifiedSettlements = existingSettlements.filter(
      (s) => s.status_history?.verification_status !== "Verified",
    );

    if (unverifiedSettlements.length > 0) {
      const unverifiedIds = unverifiedSettlements.map((s) => s.id);
      return sendResponse(
        res,
        400,
        "Invoice upload is only allowed after accepting the settlement. Please accept the settlement first.",
        { unverifiedIds },
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

// ============================================================================
// PHASE 3: Validate Settlement Ownership (Partner can only act on own settlements)
// ============================================================================

export const validateSettlementOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    if (isNaN(settlementId)) {
      return sendResponse(res, 400, "Invalid settlement ID");
    }

    // Fetch settlement with all related tables needed by downstream controllers
    const settlement = await prisma.hSCommissionSettlements.findUnique({
      where: { id: settlementId },
      include: {
        status_history: true,
        hold_dispute: true,
        documentaion: true,
        calculation_details: true,
        loan_details: true,
        b2b_partner: {
          select: { id: true, partner_name: true, partner_display_name: true },
        },
      },
    });

    if (!settlement) {
      return sendResponse(res, 404, "Settlement not found");
    }

    if (settlement.is_deleted) {
      return sendResponse(res, 404, "Settlement has been deleted");
    }

    // Check ownership: partner user's b2b_id must match settlement's b2b_partner_id
    const user = (req as any).user;
    if (!user?.partnerId) {
      return sendResponse(res, 403, "Partner identity not found in token");
    }

    if (settlement.b2b_partner_id !== user.partnerId) {
      logger.warn("[Commission Middleware] Ownership check failed", {
        settlementId,
        settlementPartnerId: settlement.b2b_partner_id,
        requestPartnerId: user.partnerId,
        userId: user.id,
      });
      return sendResponse(res, 403, "You don't have access to this settlement");
    }

    // Attach settlement to request for downstream use
    (req as any).settlement = settlement;
    next();
  } catch (error: any) {
    logger.error("[Commission Middleware] Ownership validation error", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Error validating settlement ownership");
  }
};

// ============================================================================
// PHASE 3: Validate Settlement Status (Guard - check status before allowing action)
// ============================================================================

/**
 * Factory function that returns a middleware to check settlement status.
 *
 * @param allowedStatuses - Array of allowed status values (e.g., ["Pending"], ["Disputed"])
 * @param statusField - Which field to check: "settlement_status" or "verification_status"
 *
 * @example
 *   // Only allow when verification_status is "Pending"
 *   validateSettlementStatus(["Pending"], "verification_status")
 *
 *   // Only allow when settlement_status is "Disputed"
 *   validateSettlementStatus(["Disputed"], "settlement_status")
 */
export const validateSettlementStatus = (
  allowedStatuses: string[],
  statusField: "settlement_status" | "verification_status",
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let settlement = (req as any).settlement;

      // If settlement not already attached (e.g., admin routes without ownership check),
      // fetch it from DB
      if (!settlement) {
        const settlementId = parseInt(req.params.id);
        if (isNaN(settlementId)) {
          return sendResponse(res, 400, "Invalid settlement ID");
        }

        settlement = await prisma.hSCommissionSettlements.findUnique({
          where: { id: settlementId },
          include: {
            status_history: true,
            hold_dispute: true,
            documentaion: true,
            calculation_details: true,
            loan_details: true,
            b2b_partner: {
              select: {
                id: true,
                partner_name: true,
                partner_display_name: true,
              },
            },
          },
        });

        if (!settlement) {
          return sendResponse(res, 404, "Settlement not found");
        }

        if (settlement.is_deleted) {
          return sendResponse(res, 404, "Settlement has been deleted");
        }

        // Attach for downstream use
        (req as any).settlement = settlement;
      }

      // Check status_history exists
      if (!settlement.status_history) {
        return sendResponse(res, 400, "Settlement status history not found");
      }

      const currentStatus = settlement.status_history[statusField];

      if (!currentStatus || !allowedStatuses.includes(currentStatus)) {
        logger.warn("[Commission Middleware] Status guard blocked action", {
          settlementId: settlement.id,
          statusField,
          currentStatus,
          allowedStatuses,
        });
        return sendResponse(
          res,
          400,
          `Action not allowed. Current ${statusField} is '${currentStatus || "null"}'. Allowed: ${allowedStatuses.join(", ")}`,
        );
      }

      next();
    } catch (error: any) {
      logger.error("[Commission Middleware] Status validation error", {
        error: error.message,
        settlementId: req.params.id,
        statusField,
      });
      return sendResponse(res, 500, "Error validating settlement status");
    }
  };
};

// ============================================================================
// PHASE 4: Approval Role Guard
// ============================================================================

/**
 * Validates that the authenticated user has the required approval role.
 *
 * @param allowedRoles - Roles that can perform the action
 *
 * @example
 *   // Only L1 reviewers or admins
 *   validateApprovalRole(["commission_reviewer", "Admin", "super_admin"])
 *
 *   // Only L2 approvers or admins
 *   validateApprovalRole(["commission_approver", "Admin", "super_admin"])
 */
export const validateApprovalRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return sendResponse(res, 401, "Authentication required");
      }

      const userRole = user?.role || user?.userRole || "";
      const hasRole = allowedRoles.some(
        (role) => role.toLowerCase() === userRole.toLowerCase(),
      );

      if (!hasRole) {
        logger.warn("[Commission Middleware] Approval role check failed", {
          userId: user.id,
          userRole,
          allowedRoles,
          action: req.path,
        });
        return sendResponse(
          res,
          403,
          `You don't have permission to perform this action. Required role: ${allowedRoles.join(" or ")}`,
        );
      }

      next();
    } catch (error: any) {
      logger.error("[Commission Middleware] Approval role validation error", {
        error: error.message,
      });
      return sendResponse(res, 500, "Error validating approval role");
    }
  };
};
