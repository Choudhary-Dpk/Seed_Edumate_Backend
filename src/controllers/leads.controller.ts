import path from "path";
import fs from "fs";
import { NextFunction, Response, Request } from "express";
import logger from "../utils/logger";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { createLead } from "../models/helpers/leads.helper";
import { sendResponse } from "../utils/api";

export const createPartnerLeads = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      applicationStatus,
      loanAmountRequested,
      loanAmountApproved,
      loanTenureYears,
      email
    } = req.body;
    const { id } = req.payload!;
    logger.debug(`Creating leads for userId: ${id}`);
    const lead = await createLead(
      id,
      applicationStatus,
      loanAmountRequested,
      loanAmountApproved,
      loanTenureYears,
      email
    );
    logger.debug(
      `Lead created successfully in hubspot for userId: ${id} with lead ${lead.id}`
    );

    sendResponse(res, 200, "Lead created successfully");
  } catch (error) {
    next(error);
  }
};

const resolveLeadsCsvPath = (): string => {
  const root = process.cwd();
  const prodPath = path.join(root, "dist", "utils", "csvTemplates", "leads.csv");
  if (fs.existsSync(prodPath)) return prodPath;

  // Fallback for dev
  return path.join(root, "src", "utils", "csvTemplates", "leads.csv");
};

export const downloadTemplate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = resolveLeadsCsvPath();

    // Download as leads_template.csv
    res.download(filePath, "leads_template.csv", (err) => {
      if (err) return next(err);
    });
  } catch (error) {
    next(error);
  }
};

