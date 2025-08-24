import path from "path";
import fs from "fs";
import { NextFunction, Response, Request } from "express";
import logger from "../utils/logger";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import {
  addFileRecord,
  addFileType,
  createApplicationStatus,
  createCSVLeads,
  createFinancialRequirements,
  createLender,
  createLoan,
  updateFileRecord,
} from "../models/helpers/leads.helper";
import { sendResponse } from "../utils/api";
import {
  deduplicateInDb,
  deduplicateInFile,
  validateRows,
} from "../utils/helper";
import { createLoanLeads } from "../services/hubspot.service";
import { FileData } from "../types/leads.types";
import prisma from "../config/prisma";

export const createLeads = async (
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
      email,
      name,
    } = req.body;
    const { id } = req.payload!;

    logger.debug(`Creating hubspot loan application`);

    await createLoanLeads([
      {
        email,
        name,
        applicationStatus,
        loanAmountRequested,
        loanAmountApproved,
        loanTenureYears,
      },
    ]);
    logger.debug(`Hubspot loan application created successfully`);

    logger.debug(`Creating loan application for userId: ${id}`);
    const loan = await createLoan(id, email, name);
    logger.debug(
      `Loan application created successfully in hubspot for userId: ${id} with loan ${loan.id}`
    );

    logger.debug(`Creating financial requirement for userId: ${id}`);
    await createFinancialRequirements(
      loan.id,
      loanAmountRequested,
      loanAmountApproved
    );
    logger.debug(
      `Financial requirement created successfully for loanId: ${loan.id}`
    );

    logger.debug(`Creating Lender information for loanId: ${loan.id}`);
    await createLender(loan.id, loanTenureYears);
    logger.debug(
      `Lender information created successfully for loanId: ${loan.id}`
    );

    logger.debug(`Creating application status for userId: ${id}`);
    await createApplicationStatus(loan.id, applicationStatus);
    logger.debug(
      `Application status created successfully for loanId: ${loan.id}`
    );

    sendResponse(res, 200, "Lead created successfully");
  } catch (error) {
    next(error);
  }
};

const resolveLeadsCsvPath = (): string => {
  const root = process.cwd();
  const prodPath = path.join(
    root,
    "dist",
    "utils",
    "csvTemplates",
    "leads.csv"
  );
  if (fs.existsSync(prodPath)) return prodPath;

  // Fallback for dev
  return path.join(root, "src", "utils", "csvTemplates", "leads.csv");
};

export const downloadTemplate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filePath = resolveLeadsCsvPath();
    console.log("filePath", filePath);
    // Download as leads_template.csv
    res.download(filePath, "leads_template.csv", (err) => {
      if (err) return next(err);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload & process a CSV file of loan applications.
 * Handles validation, deduplication (within file + DB),
 * and insertion into DB with safe error reporting.
 */
export const uploadCSV = async (
  req: RequestWithPayload<LoginPayload, FileData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const fileData = req.fileData;

    if (!fileData) {
      return sendResponse(res, 400, "Invalid or missing file data");
    }

    const {
      file_data: rows,
      total_records,
      filename,
      mime_type,
      entity_type,
    } = fileData;

    // 1. Store metadata into FileUpload table
    logger.debug(`Entering File type in database`);
    const fileEntity = await addFileType(entity_type);
    logger.debug(`File type added successfully`);

    // Now create file upload
    logger.debug(`Entering file records history`);
    const fileUpload = await addFileRecord(
      filename,
      mime_type,
      rows,
      total_records,
      id,
      fileEntity.id!
    );
    logger.debug(`File records history added successfully`);

    // 2. Validate + Normalize rows
    const { validRows, errors } = validateRows(rows, id);
    if (validRows.length === 0) {
      return sendResponse(res, 400, "No valid rows found in CSV", { errors });
    }

    // 3. Deduplicate inside file
    const { unique: uniqueInFile, duplicates: duplicatesInFile } =
      deduplicateInFile(validRows);

    // 4. Deduplicate against DB
    const { unique: toInsert, duplicates: duplicatesInDb } =
      await deduplicateInDb(uniqueInFile);

    // 5. Handle no new records
    if (toInsert.length === 0) {
      logger.debug(`Updating fileUpload records`);
      await updateFileRecord(fileUpload.id, 0, validRows.length);
      logger.debug(`File upload records updated successfully`);

      return sendResponse(res, 200, "No new records to insert", {
        totalRows: rows.length,
        validRows: validRows.length,
        inserted: 0,
        skippedInvalid: errors.length,
        skippedDuplicatesInFile: duplicatesInFile,
        skippedDuplicatesInDb: duplicatesInDb,
        errors,
      });
    }

    // 6. Insert into DB (safely with skipDuplicates)
    logger.debug(`Creating csv leads in database`);
    const result = await createCSVLeads(toInsert);
    logger.debug(`Leads created successfully in database`);

    // 7. Insert into HubSpot (batch)
    logger.debug(`Creating ${toInsert.length} HubSpot loan applications`);
    await createLoanLeads(toInsert);
    logger.debug(`HubSpot loan applications created`);

    // 8. Update FileUpload stats
    logger.debug(`Updating fileUpload records`);
    await updateFileRecord(fileUpload.id, result.count, errors.length);
    logger.debug(`File upload records updated successfully`);

    return sendResponse(res, 201, "CSV processed successfully", {
      totalRows: rows.length,
      validRows: validRows.length,
      inserted: result.count,
      skippedInvalid: errors.length,
      skippedDuplicatesInFile: duplicatesInFile,
      skippedDuplicatesInDb: duplicatesInDb,
      errors,
    });
  } catch (error) {
    next(error);
  }
};