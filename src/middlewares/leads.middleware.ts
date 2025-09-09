import { Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { getLeadByEmail, getLeadById } from "../models/helpers/leads.helper";
import multer from "../setup/multer";
import * as hubspotService from "../services/hubspot.service";
import { FileData } from "../types/leads.types";
import { parseCSVWithCsvParse } from "../utils/helper";
const upload = multer(10);

export const validateLeadPayload = async (
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
    if (existingLead && existingLead.is_deleted === false) {
      return sendResponse(res, 400, "Lead already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Error while creating leads");
  }
};

export const validateUpdateLeads = async (
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
    sendResponse(res, 500, "Error while updating leads");
  }
};

// Enhanced middleware that prepares file data
export const validateAndParseCSVFile =
  (fileType: string) =>
  async (
    req: RequestWithPayload<LoginPayload, FileData>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.payload!;
    try {
      upload.single("file")(req, res, async (err: any) => {
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

        const parsedData = await parseCSVWithCsvParse(req.file.buffer);
        if (!parsedData || parsedData.length === 0) {
          return sendResponse(res, 400, "CSV file is empty or invalid");
        }

        // Attach prepared data to request for controller
        req.fileData = {
          filename: req.file.originalname,
          mime_type: req.file.mimetype,
          file_data: parsedData,
          total_records: parsedData.length,
          uploaded_by_id: id,
          entity_type: req.body.entity_type || fileType,
        };

        next();
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Error while validating CSV file");
    }
  };

export const validateLeadById = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const leadDetails = await getLeadById(+id);
    if (!leadDetails || leadDetails.is_deleted === true) {
      return sendResponse(res, 404, "Lead not found");
    }

    next();
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Error while validating lead id");
  }
};