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
  createSystemTracking,
  deleteLoan,
  getHubspotByLeadId,
  getLeads,
  getLoanList,
  updateApplicationStatus,
  updateFileRecord,
  updateFinancialRequirements,
  updateLender,
  updateLoan,
  updateSystemTracking,
} from "../models/helpers/leads.helper";
import { sendResponse } from "../utils/api";
import {
  deduplicateInDb,
  deduplicateInFile,
  validateRows,
} from "../utils/helper";
import {
  createLoanLeads,
  deleteHubspotByLeadId,
  upateLoanLead,
} from "../services/hubspot.service";
import { FileData } from "../types/leads.types";

export const createLead = async (
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
    const lead = await createLoanLeads([
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
    console.log("leadData", lead);

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

    logger.debug(`Creating system tracking for useId: ${id}`);
    await createSystemTracking(loan.id, lead[0]?.id);
    logger.debug(`System tracked successfully`);

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
    const hubspotResults = await createLoanLeads(toInsert);
    console.log("hubspot", hubspotResults);
    logger.debug(`HubSpot loan applications created`);

    // 8. Inserting hubsport Id
    await updateSystemTracking(hubspotResults);

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

export const editLead = async (
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
    const leadId = req.params.id;

    logger.debug(`Fethcing hubspot details by leadId: ${leadId}`);
    const lead = await getHubspotByLeadId(+leadId);
    logger.debug(`Hubspot details fetched successfully`);

    logger.debug(`Updating hubspot loan application`);
    await upateLoanLead(Number(lead?.system_tracking?.hs_object_id), {
      email,
      name,
      applicationStatus,
      loanAmountRequested,
      loanAmountApproved,
      loanTenureYears,
    });
    logger.debug(`Hubspot loan application updated successfully`);

    logger.debug(`Updating loan application for userId: ${id}`);
    const loan = await updateLoan(id, +leadId, email, name);
    logger.debug(
      `Loan application updated successfully in hubspot for userId: ${id} with loan ${loan.id}`
    );

    logger.debug(`Updating financial requirement for userId: ${id}`);
    await updateFinancialRequirements(
      loan.id,
      +leadId,
      loanAmountRequested,
      loanAmountApproved
    );
    logger.debug(
      `Financial requirement updated successfully for loanId: ${loan.id}`
    );

    logger.debug(`Updating Lender information for loanId: ${loan.id}`);
    await updateLender(loan.id, +leadId, loanTenureYears);
    logger.debug(
      `Lender information updated successfully for loanId: ${loan.id}`
    );

    logger.debug(`Updating application status for userId: ${id}`);
    await updateApplicationStatus(loan.id, +leadId, applicationStatus);
    logger.debug(
      `Application status updated successfully for loanId: ${loan.id}`
    );

    sendResponse(res, 200, "Lead updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const leadId = req.params.id;

    logger.debug(`Fethcing hubspot details by leadId: ${leadId}`);
    const lead = await getHubspotByLeadId(+leadId);
    logger.debug(`Hubspot details fetched successfully`);

    logger.debug(
      `Deleting hubspot loan application for id: ${lead?.system_tracking?.hs_object_id}`
    );
    await deleteHubspotByLeadId(lead?.system_tracking?.hs_object_id!);
    logger.debug(`Hubspot loan application deleted successfully`);

    logger.debug(`Deleting loan application for userId: ${id}`);
    await deleteLoan(+leadId, id);
    logger.debug(`Loan application deleted successfully`);

    sendResponse(res, 200, "Lead deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getLeadsList = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const size = Number(req.query.size) || 10;
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) || null;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;

    const offset = size * (page - 1);

    logger.debug(`Fetching leads list with pagination and filters`);
    const list = await getLoanList(size, offset, sortKey, sortDir, search);
    logger.debug(`Leads list fetched successfully`);

    sendResponse(res, 200, "Leads list fetched successfully", {
      total: list.count,
      page,
      size,
      data: list.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const leadId = req.params.id;

    logger.debug(`Fetching lead details for id: ${leadId}`);
    const leadDetails = await getLeads(+leadId);
    logger.debug(`Lead details fetched successfully`);

    sendResponse(res, 200, "Lead details fetched successfully", leadDetails);
  } catch (error) {
    next(error);
  }
};