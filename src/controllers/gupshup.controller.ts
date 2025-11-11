import { Request, Response } from "express";
import * as gupshupService from "../services/gupshup.service";
import { ApiResponse } from "../types";
import { asyncHandler } from "../middlewares/errorHandler";
import logger from "../utils/logger";

export const processAssignmentWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      sessionId,
      agentName,
      assignedTo,
      agentEmailId,
      customerName,
      customerPhone,
    } = req?.body || "";

    logger.info("Processing Gupshup assignment webhook", {
      sessionId: sessionId,
      agentName: agentName,
      customerName: customerName,
      customerPhone: customerPhone,
    });

    const result = await gupshupService.syncContactOwnerFromAssignment({
      agentId: assignedTo,
      agentEmail: agentEmailId,
      customerName: customerName,
      customerPhone: customerPhone,
      sessionId: sessionId,
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: result.synced
        ? "Contact owner synced successfully"
        : "Assignment processed - no sync needed",
      meta: {
        operation: `gupshup_assignment_sync of customer - ${customerName}`,
      },
    };

    res.json(response);
  }
);
