import { Response, NextFunction, Request } from "express";
import { sendResponse } from "../utils/api";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import {
  checkLoanApplicationFields,
  getLeadById,
} from "../models/helpers/loanApplication.helper";
import multer from "../setup/multer";
import { FileData } from "../types/leads.types";
import { parseCSVWithCsvParse } from "../utils/helper";
const upload = multer(10);

// Enhanced middleware that prepares file data
export const validateAndParseCSVFile =
  (fileType: string) =>
  async (
    req: RequestWithPayload<LoginPayload, FileData>,
    res: Response,
    next: NextFunction,
  ) => {
    const id = parseInt(req.payload?.id || req.body?.id);
    try {
      upload.single("file")(req, res, async (err: any) => {
        if (!req.file) {
          return sendResponse(res, 400, "No file uploaded");
        }

        if (err && err.code === "LIMIT_FILE_SIZE") {
          return sendResponse(
            res,
            413,
            "File is too large. Max size allowed is 5 MB",
          );
        }

        const allowedMimes = ["text/csv", "application/vnd.ms-excel"];
        const isCsvMime = allowedMimes.includes(req.file.mimetype);
        const isCsvExt = req.file.originalname.toLowerCase().endsWith(".csv");

        if (!isCsvMime || !isCsvExt) {
          return sendResponse(
            res,
            400,
            "Invalid file type. Only .csv files are allowed",
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
