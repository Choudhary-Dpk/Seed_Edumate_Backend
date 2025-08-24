import crypto from "crypto";
import { Row, ValidationResult } from "../types/leads.types";
import { findLeads } from "../models/helpers/leads.helper";
import { parse } from "csv-parse";

// Helper function for consistent 2-decimal rounding
export const roundTo2 = (value: number): number => Number(value.toFixed(2));

export const generateRequestIdFromPayload = (payload: any) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
};

export const deduplicateInFile = (
  rows: Row[]
): { unique: Row[]; duplicates: number } => {
  const key = (v: Row) =>
    `${v.email}|${v.loanAmountRequested}|${v.loanTenureYears}`;

  const seen = new Set<string>();
  const unique: Row[] = [];
  let duplicates = 0;

  for (const v of rows) {
    const k = key(v);
    if (seen.has(k)) {
      duplicates++;
      continue;
    }
    seen.add(k);
    unique.push(v);
  }

  return { unique, duplicates };
};

// Split into chunks for DB queries
const chunk = <T>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};

export const deduplicateInDb = async (
  rows: Row[]
): Promise<{ unique: Row[]; duplicates: number }> => {
  const key = (v: Row) =>
    `${v.email}|${v.loanAmountRequested}|${v.loanTenureYears}`;
  const existingKeys = new Set<string>();

  for (const batch of chunk(rows, 1000)) {
    if (batch.length === 0) continue;

    const found = await findLeads(batch);

    for (const f of found) {
      const loanAmountRequested = f.financial_requirements
        ?.loan_amount_requested
        ? Number(f.financial_requirements.loan_amount_requested)
        : 0;
      const loanTenureYears = f.lender_information?.loan_tenure_years ?? 0;

      existingKeys.add(
        `${f.student_email}|${loanAmountRequested}|${loanTenureYears}`
      );
    }
  }

  const unique = rows.filter((v) => !existingKeys.has(key(v)));
  const duplicates = rows.length - unique.length;

  return { unique, duplicates };
};

// --- Row validation & normalization ---
export const validateRows = (rows: any[], userId: number): ValidationResult => {
  const validRows: Row[] = [];
  const errors: { row: number; reason: string }[] = [];

  // Allowed statuses
  const allowedStatuses = [
    "Pre-Approved",
    "Approved",
    "Sanction Letter Issued",
    "Disbursement Pending",
    "Disbursed",
    "Rejected",
    "On Hold",
    "Withdrawn",
    "Cancelled",
  ];

  rows.forEach((r, idx) => {
    const rowNo = idx + 2; // +2 = account for header row in Excel
    const rowErrors: string[] = [];

    const name = r["Student Name"]?.toString().trim();
    const email = r["Student Email"]?.toString().trim().toLowerCase();

    // Grab raw values
    const loanAmountRequestedRaw = r["Loan Amount Requested"];
    const loanAmountApprovedRaw = r["Loan Amount Approved"];
    const loanTenureYearsRaw = r["Loan Tenure Years"];
    const applicationStatus = r["Application Status"]?.toString().trim();

    // Convert safely
    const loanAmountRequested = Number(loanAmountRequestedRaw);
    const loanAmountApproved = Number(loanAmountApprovedRaw);
    const loanTenureYears = Number(loanTenureYearsRaw);

    // --- Validation ---
    if (!name) {
      rowErrors.push("Missing Student Name");
    }

    if (!email) {
      rowErrors.push("Missing Student Email");
    }

    if (
      loanAmountRequestedRaw === undefined ||
      loanAmountRequestedRaw === null ||
      loanAmountRequestedRaw.toString().trim() === "" ||
      !Number.isFinite(loanAmountRequested)
    ) {
      rowErrors.push("Invalid/Missing Loan Amount Requested");
    }

    if (
      loanAmountApprovedRaw === undefined ||
      loanAmountApprovedRaw === null ||
      loanAmountApprovedRaw.toString().trim() === "" ||
      !Number.isFinite(loanAmountApproved)
    ) {
      rowErrors.push("Invalid/Missing Loan Amount Approved");
    }

    if (
      loanTenureYearsRaw === undefined ||
      loanTenureYearsRaw === null ||
      loanTenureYearsRaw.toString().trim() === "" ||
      !Number.isInteger(loanTenureYears)
    ) {
      rowErrors.push("Invalid/Missing Loan Tenure Years");
    }

    if (!applicationStatus) {
      rowErrors.push("Missing Application Status");
    } else if (!allowedStatuses.includes(applicationStatus)) {
      rowErrors.push(
        `Invalid Application Status: "${applicationStatus}". Must be one of [${allowedStatuses.join(
          ", "
        )}]`
      );
    }

    // Collect errors or push valid row
    if (rowErrors.length > 0) {
      rowErrors.forEach((reason) => errors.push({ row: rowNo, reason }));
    } else {
      validRows.push({
        name,
        email,
        loanAmountRequested,
        loanAmountApproved,
        loanTenureYears,
        applicationStatus,
        userId,
        createdBy: userId,
      });
    }
  });

  return { validRows, errors };
};

export // CSV Parser using csv-parse
const parseCSVWithCsvParse = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const records: any[] = [];

    // csv-parse options
    const parser = parse({
      columns: true, // Use first line as column names
      skip_empty_lines: true, // Skip empty lines
      trim: true, // Trim spaces from values
      cast: true, // Auto-cast numbers and booleans
      cast_date: false, // Don't auto-cast dates
      relax_quotes: true, // Be lenient with quotes
      skip_records_with_error: false, // Don't skip error records
      bom: true, // Handle BOM in CSV files
    });

    // Handle parsing
    parser.on("readable", function () {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    // Handle errors
    parser.on("error", function (err) {
      reject(err);
    });

    // Handle completion
    parser.on("end", function () {
      resolve(records);
    });

    // Write buffer to parser
    parser.write(buffer);
    parser.end();
  });
};