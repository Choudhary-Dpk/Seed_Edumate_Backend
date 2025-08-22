import { Response, NextFunction, Request } from "express";
import { sendResponse } from "../utils/api";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { getLeadByEmail } from "../models/helpers/leads.helper";
import multer from "../setup/multer";
import * as hubspotService from "../services/hubspot.service";
const upload = multer(10);

export const validateCreateLeads = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, loanAmountRequested, loanAmountApproved } = req.body;

    if (loanAmountRequested <= 0) {
      return sendResponse(
        res,
        400,
        "Loan Amount Requested must be greater than 0"
      );
    }

    if (loanAmountApproved !== undefined && loanAmountApproved !== null) {
      if (loanAmountApproved < 0) {
        return sendResponse(
          res,
          400,
          "Loan Amount Approved cannot be negative"
        );
      }
      if (loanAmountApproved > loanAmountRequested) {
        return sendResponse(
          res,
          400,
          "Loan Amount Approved cannot be greater than Loan Amount Requested"
        );
      }
    }

    const existingEmail = await hubspotService.fetchLeadByEmail(email);
    if (existingEmail.total > 0 || existingEmail.results?.length > 0) {
      return sendResponse(res, 400, "Email already exists in HubSpot");
    }

    const existingLead = await getLeadByEmail(email);
    if (existingLead) {
      return sendResponse(res, 400, "Lead already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Error while creating leads");
  }
};

export const validateCSVFile = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    upload.single("file")(req, res, (err: any) => {
      if (!req.file) {
        return sendResponse(res, 400, "No file uploaded");
      }

      if (err && err.code === "LIMIT_FILE_SIZE") {
        return sendResponse(
          res,
          413,
          "File is too large. Max size allowed is 5 MB"
        );
      }

      const allowedMimes = ["text/csv", "application/vnd.ms-excel"];
      const isCsvMime = allowedMimes.includes(req.file.mimetype);
      const isCsvExt = req.file.originalname.toLowerCase().endsWith(".csv");

      if (!isCsvMime || !isCsvExt) {
        return sendResponse(
          res,
          400,
          "Invalid file type. Only .csv files are allowed"
        );
      }

      if (err) {
        return sendResponse(res, 400, "File upload error", [], [err.message]);
      }

      if (!req.file) {
        return sendResponse(res, 400, "No file uploaded");
      }

      next();
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Error while validating CSV file");
  }
};
