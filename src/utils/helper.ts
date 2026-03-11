import crypto from "crypto";
import { Row, ValidationResult } from "../types/leads.types";
import { findLeads } from "../models/helpers/loanApplication.helper";
import { parse } from "csv-parse";
import { findContactsByPartnerId } from "../models/helpers/contact.helper";
import { ContactsLead, ContactsValidationResult } from "../types/contact.types";
import moment from "moment";

// ============================================================================
// GENERAL HELPER FUNCTIONS
// ============================================================================

// Helper function for consistent 2-decimal rounding
export const roundTo2 = (value: number): number => Number(value.toFixed(2));

export const generateRequestIdFromPayload = (payload: any) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
};

export const deduplicateInFile = (
  rows: Row[],
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
    arr.slice(i * size, i * size + size),
  );
};

export const deduplicateInDb = async (
  rows: Row[],
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
        `${f.student_email}|${loanAmountRequested}|${loanTenureYears}`,
      );
    }
  }

  const unique = rows.filter((v) => !existingKeys.has(key(v)));
  const duplicates = rows.length - unique.length;

  return { unique, duplicates };
};

// ============================================================================
// ROW VALIDATION & NORMALIZATION
// ============================================================================

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
          ", ",
        )}]`,
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

// ============================================================================
// CSV PARSER
// ============================================================================

export const parseCSVWithCsvParse = (buffer: Buffer): Promise<any[]> => {
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

// ============================================================================
// CONTACT VALIDATION
// ============================================================================

const VALID_ADMISSION_STATUS = [
  "Not Applied",
  "Applied",
  "Interview Scheduled",
  "Waitlisted",
  "Admitted",
  "Rejected",
];

const VALID_CURRENT_EDUCATION_LEVEL = [
  "Undergraduate",
  "MBA",
  "Specialised Masters",
  "PhD",
];

const VALID_TARGET_DEGREE_LEVEL = [
  "Undergraduate",
  "MBA",
  "Specialised Masters",
  "PhD",
];

export const validateContactRows = (
  rows: any[],
  userId: number,
): ContactsValidationResult => {
  const validRows: ContactsLead[] = [];
  const errors: { row: number; reason: string }[] = [];

  rows.forEach((r, idx) => {
    const rowNo = idx + 2; // account for header row
    const rowErrors: string[] = [];

    // Extract and normalize
    const firstName = r["First Name"]?.toString().trim();
    const lastName = r["Last Name"]?.toString().trim();
    const email = r["Email"]?.toString().trim().toLowerCase();
    const phoneNumber = r["Phone Number"]?.toString().trim();

    const intakeYear = r["Intake Year"]?.toString().trim();
    const gender = r["Gender"]?.toString().trim();
    const b2bPartnerName = r["B2B Partner Name"]?.toString().trim();
    const courseType = r["Course Type"]?.toString().trim();
    const dateOfBirthRaw = r["Date of Birth"];
    const preferredStudyDestination = r["Preferred Study Destination"]
      ?.toString()
      .trim();
    const targetDegreeLevel = r["Target Degree Level"]?.toString().trim();
    const intakeMonth = r["Intake Month"]?.toString().trim();
    const admissionStatus = r["Admission Status"]?.toString().trim();
    const educationLevel = r["Current Education Level"]?.toString().trim();
    const programOfInterest = r["Program Of Interest"]?.toString().trim();

    // --- Required validations ---
    if (!firstName) rowErrors.push("Missing First Name");
    if (!lastName) rowErrors.push("Missing Last Name");
    if (!email) rowErrors.push("Missing Email");
    if (!phoneNumber) rowErrors.push("Missing Phone Number");

    // --- Enum validations (commented out for flexibility) ---
    // if (admissionStatus && !VALID_ADMISSION_STATUS.includes(admissionStatus)) {
    //   rowErrors.push(
    //     `Invalid Admission Status: "${admissionStatus}". Valid values: ${VALID_ADMISSION_STATUS.join(
    //       ", "
    //     )}`
    //   );
    // }

    // if (
    //   educationLevel &&
    //   !VALID_CURRENT_EDUCATION_LEVEL.includes(educationLevel)
    // ) {
    //   rowErrors.push(
    //     `Invalid Current Education Level: "${educationLevel}". Valid values: ${VALID_CURRENT_EDUCATION_LEVEL.join(
    //       ", "
    //     )}`
    //   );
    // }

    // if (
    //   targetDegreeLevel &&
    //   !VALID_TARGET_DEGREE_LEVEL.includes(targetDegreeLevel)
    // ) {
    //   rowErrors.push(
    //     `Invalid Target Degree Level: "${targetDegreeLevel}". Valid values: ${VALID_TARGET_DEGREE_LEVEL.join(
    //       ", "
    //     )}`
    //   );
    // }

    let dateOfBirth: Date | undefined;
    if (dateOfBirthRaw) {
      let parsed: Date;
      const raw =
        typeof dateOfBirthRaw === "string"
          ? dateOfBirthRaw.trim()
          : dateOfBirthRaw;

      if (
        typeof raw === "number" ||
        (typeof raw === "string" && /^\d+(\.\d+)?$/.test(raw))
      ) {
        // Excel serial number (as number or string like "46212.0001157407")
        const serialNum = typeof raw === "number" ? raw : parseFloat(raw);
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        parsed = new Date(excelEpoch.getTime() + serialNum * 86400000);
      } else {
        parsed = new Date(raw);
      }

      if (isNaN(parsed.getTime())) {
        rowErrors.push("Invalid Date of Birth");
      } else {
        dateOfBirth = new Date(
          Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()),
        );
      }
    }

    // Collect errors or push valid row
    if (rowErrors.length > 0) {
      rowErrors.forEach((reason) => errors.push({ row: rowNo, reason }));
    } else {
      validRows.push({
        educationLevel,
        admissionStatus,
        firstName,
        lastName,
        email,
        phone: phoneNumber,
        intakeYear,
        gender,
        partnerName: b2bPartnerName,
        courseType,
        dateOfBirth,
        studyDestination: preferredStudyDestination,
        targetDegreeLevel,
        intakeMonth,
        programOfInterest,
        userId,
        createdBy: userId.toString(),
      });
    }
  });

  return { validRows, errors };
};

const normalizeEmail = (email: string | undefined | null) =>
  email?.trim().toLowerCase() ?? "";

export const deduplicateContactsInDb = async (
  rows: ContactsLead[],
  partnerId: number,
) => {
  const key = (v: ContactsLead) => `${normalizeEmail(v.email)}`;
  const existingKeys = new Set<string>();

  for (const batch of chunk(rows, 1000)) {
    if (batch.length === 0) continue;

    const found = await findContactsByPartnerId(batch, partnerId);

    for (const f of found) {
      existingKeys.add(`${normalizeEmail(f.email)}`);
    }
  }
  const unique = rows.filter((v) => !existingKeys.has(key(v)));
  const duplicates = rows.length - unique.length;

  return { unique, duplicates };
};

export const deduplicateContactsInFile = (
  rows: ContactsLead[],
): { unique: ContactsLead[]; duplicates: number } => {
  // Use email + phone as unique identifier
  const key = (v: ContactsLead) => `${v.email}|${v.phone}`;

  const seen = new Set<string>();
  const unique: ContactsLead[] = [];
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

export const transformRow = <T extends { contactId: number }>(
  row: T,
  mapping: Record<string, (row: T) => any>,
) => {
  const obj: Record<string, any> = { contact_id: row.contactId };
  for (const [field, fn] of Object.entries(mapping)) {
    obj[field] = fn(row);
  }
  return obj;
};

export const convertTenureInYears = (tenure: number) => {
  const years = Math.floor(tenure);
  const remaining = tenure - years;
  const months = Math.round(remaining * 12);

  return { years, months };
};

// Helper function to chunk array into smaller batches
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================================================
// INVOICE HTML HELPER FUNCTIONS (Shared)
// ============================================================================

// Format currency in Indian format
const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Display value with fallback to dash
const displayValue = (value: any): string => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && value === 0)
  ) {
    return "-";
  }
  return String(value);
};

// Convert number to words (Indian format)
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero Only";
  if (isNaN(num) || num < 0) return "-";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + numToWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        numToWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + numToWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        numToWords(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + numToWords(n % 100000) : "")
      );
    return (
      numToWords(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + numToWords(n % 10000000) : "")
    );
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = "Rupees " + numToWords(rupees);
  if (paise > 0) result += " and " + numToWords(paise) + " Paise";
  result += " Only";
  return result;
};

// ============================================================================
// INVOICE TYPE DEFINITIONS
// ============================================================================

// Basic Invoice Line Item (used by both versions)
export interface InvoiceLineItem {
  sno: number;
  studentName: string;
  lenderName: string;
  loanAmount: number;
  commissionRate: number;
  grossAmount: number;
  gstAmount: number;
  tdsAmount: number;
  netPayable: number;
  refNumber: string;
  university: string;
  course: string;
}

// Simple Invoice Data (for buildSystemInvoiceHTMLSimple)
export interface SimpleInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  partnerName: string;
  partnerGst: string;
  partnerPan: string;
  partnerAddress: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalGst: number;
  totalTds: number;
  totalDeductions: number;
  netPayableTotal: number;
  settlementsCount: number;
}

// Detailed Invoice Data (for buildSystemInvoiceHTMLDetailed)
export interface DetailedInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  // Seller Info
  partnerName: string;
  partnerDisplayName?: string;
  partnerGst: string;
  partnerPan: string;
  partnerAddress: string;
  partnerCity?: string;
  partnerState?: string;
  partnerStateCode?: string;
  partnerPincode?: string;
  partnerCountry?: string;
  partnerCin?: string;
  partnerEmail?: string;
  // Bank Details
  bankAccountHolder?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  bankIfsc?: string;
  // Line Items
  lineItems: InvoiceLineItem[];
  // Commission Calculation
  commissionModel?: string;
  grossCommission?: number;
  // Tax Details
  subtotal: number;
  totalGst: number;
  gstApplicable?: string;
  igstRate?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  totalTds: number;
  tdsApplicable?: string;
  tdsRate?: number;
  totalDeductions: number;
  netPayableTotal: number;
  // Loan Details (first settlement)
  lenderName?: string;
  loanProduct?: string;
  loanAmountDisbursed?: number;
  disbursementDate?: string;
  universityName?: string;
  courseName?: string;
  destinationCountry?: string;
  // Student Details
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  // Payment Details
  paymentMethod?: string;
  paymentReference?: string;
  bankTransactionId?: string;
  // Meta
  settlementsCount: number;
}

// ============================================================================
// VERSION 1: SIMPLE INVOICE HTML TEMPLATE
// Use this for basic/quick invoices with minimal details
// ============================================================================

export function buildSystemInvoiceHTMLSimple(data: SimpleInvoiceData): string {
  const fmt = (num: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  const rows = data.lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:center;">${item.sno}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;">
        <div style="font-weight:600;color:#2C3E50;">${item.studentName}</div>
        <div style="font-size:11px;color:#7F8C8D;margin-top:2px;">${item.refNumber}</div>
        ${item.university ? `<div style="font-size:11px;color:#95A5A6;">${item.university}${item.course ? ` — ${item.course}` : ""}</div>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;">${item.lenderName}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:right;">₹${fmt(item.loanAmount)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:center;">${item.commissionRate}%</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:right;font-weight:600;">₹${fmt(item.grossAmount)}</td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commission Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #2C3E50; background: #fff; }
    @page { margin: 0; }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:30px;">

    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
      <tr>
        <td>
          <h1 style="font-size:28px;font-weight:700;color:#1B4F72;margin:0;">COMMISSION INVOICE</h1>
          <p style="font-size:13px;color:#7F8C8D;margin-top:4px;">Edumate Global Financial Services</p>
        </td>
        <td style="text-align:right;">
          <div style="background:#1B4F72;color:#fff;padding:12px 20px;border-radius:8px;display:inline-block;">
            <div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">Invoice No.</div>
            <div style="font-size:18px;font-weight:700;margin-top:2px;">${data.invoiceNumber}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Invoice Meta & Partner Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="vertical-align:top;">
          <div style="background:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;padding:16px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7F8C8D;margin-bottom:8px;font-weight:600;">Bill To</div>
            <div style="font-size:16px;font-weight:700;color:#1B4F72;margin-bottom:6px;">${data.partnerName}</div>
            ${data.partnerGst ? `<div style="font-size:12px;color:#555;margin-bottom:3px;"><strong>GSTIN:</strong> ${data.partnerGst}</div>` : ""}
            ${data.partnerPan ? `<div style="font-size:12px;color:#555;margin-bottom:3px;"><strong>PAN:</strong> ${data.partnerPan}</div>` : ""}
            ${data.partnerAddress ? `<div style="font-size:12px;color:#7F8C8D;margin-top:6px;">${data.partnerAddress}</div>` : ""}
          </div>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:16px;">
          <div style="background:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;padding:16px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7F8C8D;margin-bottom:8px;font-weight:600;">Invoice Details</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-size:12px;color:#7F8C8D;padding:3px 0;">Date</td><td style="font-size:12px;font-weight:600;color:#2C3E50;text-align:right;">${data.invoiceDate}</td></tr>
              <tr><td style="font-size:12px;color:#7F8C8D;padding:3px 0;">Settlements</td><td style="font-size:12px;font-weight:600;color:#2C3E50;text-align:right;">${data.settlementsCount}</td></tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E8EB;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <thead>
        <tr style="background:#1B4F72;">
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:center;width:40px;">#</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Student / Reference</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Lender</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Loan Disbursed</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Rate</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Gross Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <!-- Summary Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
      <tr>
        <td width="55%"></td>
        <td width="45%">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E8EB;border-radius:8px;overflow:hidden;">
            <tr style="background:#F8F9FA;">
              <td style="padding:10px 16px;font-size:13px;color:#555;">Subtotal (Gross Commission)</td>
              <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#2C3E50;text-align:right;">₹${fmt(data.subtotal)}</td>
            </tr>
            ${
              data.totalGst > 0
                ? `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#555;">GST</td>
              <td style="padding:10px 16px;font-size:13px;color:#27AE60;text-align:right;">+ ₹${fmt(data.totalGst)}</td>
            </tr>
            `
                : ""
            }
            ${
              data.totalTds > 0
                ? `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#555;">TDS Deducted</td>
              <td style="padding:10px 16px;font-size:13px;color:#E74C3C;text-align:right;">− ₹${fmt(data.totalTds)}</td>
            </tr>
            `
                : ""
            }
            ${
              data.totalDeductions > data.totalTds
                ? `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#555;">Other Deductions</td>
              <td style="padding:10px 16px;font-size:13px;color:#E74C3C;text-align:right;">− ₹${fmt(data.totalDeductions - data.totalTds)}</td>
            </tr>
            `
                : ""
            }
            <tr style="background:#1B4F72;">
              <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#fff;">Net Payable</td>
              <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#fff;text-align:right;">₹${fmt(data.netPayableTotal)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <div style="border-top:2px solid #E5E8EB;padding-top:16px;text-align:center;">
      <p style="font-size:11px;color:#95A5A6;">This is a system-generated invoice from Edumate Global Commission System — ${moment().format("YYYY")}</p>
      <p style="font-size:11px;color:#BDC3C7;margin-top:4px;">Invoice generated on ${data.invoiceDate}</p>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// VERSION 2: DETAILED INVOICE HTML TEMPLATE
// Use this for comprehensive invoices with full details (bank, tax breakdown, etc.)
// ============================================================================

export function buildSystemInvoiceHTMLDetailed(
  data: DetailedInvoiceData,
): string {
  const d = displayValue;
  const amountInWords = numberToWords(data.netPayableTotal || 0);

  // Build line items rows
  const lineItemsRows = data.lineItems
    .map(
      (item) => `
    <tr style="background:${item.sno % 2 === 0 ? "#f8fafc" : "#ffffff"};">
      <td style="padding:6px 8px;text-align:center;font-weight:700;color:#94a3b8;font-size:9px;border-bottom:1px solid #f1f5f9;">${String(item.sno).padStart(2, "0")}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;">
        <div style="font-size:10px;font-weight:600;color:#0f172a;">Commission for Education Loan Disbursement</div>
        <div style="font-size:8.5px;color:#64748b;margin-top:1px;">Student: ${d(item.studentName)}&nbsp;&bull;&nbsp;Ref: ${d(item.refNumber)}</div>
        ${item.university ? `<div style="font-size:8px;color:#94a3b8;margin-top:1px;">${item.university}${item.course ? ` &ndash; ${item.course}` : ""}</div>` : ""}
      </td>
      <td style="padding:6px 8px;text-align:right;font-size:10px;font-weight:600;color:#0f172a;border-bottom:1px solid #f1f5f9;">&#8377;${formatCurrency(item.loanAmount)}</td>
      <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f1f5f9;">
        <span style="display:inline-block;background:#f0fdfa;color:#0d9488;border:1px solid #99f6e4;border-radius:20px;padding:1px 7px;font-size:8.5px;font-weight:600;">${item.commissionRate ? item.commissionRate + "%" : "-"}</span>
      </td>
      <td style="padding:6px 8px;text-align:right;font-size:10px;font-weight:600;color:#0d9488;border-bottom:1px solid #f1f5f9;">&#8377;${formatCurrency(item.grossAmount)}</td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
      background: #fff;
      color: #1a202c;
      font-size: 10px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { size: A4; margin: 6mm; }

    /* ── HEADER ── */
    .hdr {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%);
      padding: 13px 20px 10px;
      position: relative;
      overflow: hidden;
    }
    .hdr::before {
      content:''; position:absolute; top:-30px; right:-30px;
      width:130px; height:130px; border-radius:50%;
      background:rgba(255,255,255,0.06);
    }
    .hdr::after {
      content:''; position:absolute; bottom:-40px; left:30%;
      width:180px; height:180px; border-radius:50%;
      background:rgba(255,255,255,0.04);
    }
    .hdr-inner { display:flex; justify-content:space-between; align-items:flex-start; position:relative; z-index:1; }
    .brand-logo { display:flex; align-items:center; gap:8px; margin-bottom:2px; }
    .brand-icon {
      width:28px; height:28px;
      background:rgba(255,255,255,0.2);
      border-radius:7px;
      display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:900; color:#fff;
      border:1.5px solid rgba(255,255,255,0.3);
    }
    .brand-name { font-size:17px; font-weight:800; color:#fff; letter-spacing:2px; }
    .brand-tagline { font-size:8.5px; color:rgba(255,255,255,0.7); padding-left:36px; }
    .inv-title { font-size:22px; font-weight:900; color:rgba(255,255,255,0.95); letter-spacing:4px; line-height:1; text-align:right; }
    .inv-badge {
      display:inline-block; margin-top:4px;
      background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3);
      border-radius:20px; padding:2px 10px;
      font-size:8.5px; color:#fff; font-weight:500; letter-spacing:0.5px;
    }

    /* ── META STRIP ── */
    .meta-strip { background:#f8fafc; border-bottom:1px solid #e2e8f0; display:table; width:100%; }
    .meta-cell { display:table-cell; padding:6px 12px; text-align:center; border-right:1px solid #e2e8f0; }
    .meta-cell:last-child { border-right:none; }
    .meta-lbl { font-size:7px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; font-weight:600; margin-bottom:1px; }
    .meta-val { font-size:10.5px; font-weight:700; color:#0f172a; }
    .meta-val.ac { color:#0d9488; }

    /* ── BODY ── */
    .body { padding:10px 16px; }

    /* ── SECTION LABEL ── */
    .sec-lbl {
      font-size:7.5px; font-weight:700; color:#94a3b8;
      text-transform:uppercase; letter-spacing:1px;
      margin-bottom:5px; display:table; width:100%;
    }
    .sec-lbl span { display:table-cell; white-space:nowrap; padding-right:8px; }
    .sec-lbl::after { content:''; display:table-cell; width:100%; border-bottom:1px solid #e2e8f0; vertical-align:middle; }

    /* ── CARD ── */
    .card { border-radius:6px; border:1px solid #e2e8f0; overflow:hidden; background:#fff; }
    .card-hdr {
      padding:4px 10px; font-size:7.5px; font-weight:700;
      text-transform:uppercase; letter-spacing:0.8px;
      display:flex; align-items:center; gap:5px;
      background:linear-gradient(90deg,#f0fdfa 0%,#f8fffe 100%);
      color:#0d9488; border-bottom:1px solid #ccfbf1;
    }
    .dot { width:5px; height:5px; border-radius:50%; background:#0d9488; flex-shrink:0; }
    .card-body { padding:7px 10px; }

    /* ── TWO COL ── */
    .two-col { display:table; width:100%; margin-bottom:8px; }
    .col-l { display:table-cell; width:50%; vertical-align:top; padding-right:5px; }
    .col-r { display:table-cell; width:50%; vertical-align:top; padding-left:5px; }

    /* ── INFO GRID ── */
    .ig { display:table; width:100%; margin-top:3px; }
    .ig-row { display:table-row; }
    .ig-k { display:table-cell; font-size:8.5px; color:#94a3b8; font-weight:500; padding:1px 5px 1px 0; width:76px; }
    .ig-v { display:table-cell; font-size:8.5px; color:#334155; font-weight:500; padding:1px 0; }
    .ig-v.b { font-weight:700; color:#0f172a; }
    .ig-v.ac { font-weight:700; color:#0d9488; }

    .ent-name { font-size:11px; font-weight:700; color:#0f172a; margin-bottom:3px; }
    .ent-sub { font-size:8.5px; color:#64748b; margin-bottom:1px; }
    .hdivider { border:none; border-top:1px dashed #e2e8f0; margin:4px 0; }

    /* ── TABLE ── */
    .tbl-wrap { border-radius:6px; border:1px solid #e2e8f0; overflow:hidden; margin-bottom:8px; }
    .inv-tbl { width:100%; border-collapse:collapse; }
    .inv-tbl thead tr { background:linear-gradient(90deg,#0d9488 0%,#0f766e 100%); }
    .inv-tbl thead th { padding:6px 8px; font-size:7.5px; font-weight:600; color:rgba(255,255,255,0.9); text-transform:uppercase; letter-spacing:0.5px; }
    .inv-tbl tbody td { padding:6px 8px; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
    .inv-tbl tbody tr:last-child td { border-bottom:none; }

    /* ── SUMMARY ── */
    .sum-wrap { display:table; width:100%; margin-bottom:8px; }
    .sum-l { display:table-cell; width:50%; vertical-align:top; padding-right:5px; }
    .sum-r { display:table-cell; width:50%; vertical-align:top; padding-left:5px; }
    .calc-row { display:flex; justify-content:space-between; padding:3px 0; font-size:9px; color:#475569; border-bottom:1px dashed #f1f5f9; }
    .calc-row:last-child { border-bottom:none; }
    .calc-row.strong { font-weight:700; color:#0f172a; font-size:9.5px; border-bottom:none; padding-top:4px; border-top:1px solid #e2e8f0; margin-top:3px; }
    .calc-row .lbl { font-weight:500; }
    .calc-row .val { font-weight:600; }
    .calc-row.ded .val { color:#dc2626; }
    .tag { display:inline-block; padding:1px 7px; border-radius:20px; font-size:7.5px; font-weight:600; }
    .tg-g { background:#dcfce7; color:#15803d; }
    .tg-b { background:#dbeafe; color:#1d4ed8; }
    .tg-s { background:#f1f5f9; color:#475569; }
    .net-block {
      background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);
      border-radius:5px; padding:7px 10px; margin-top:5px;
      display:flex; justify-content:space-between; align-items:center;
    }
    .net-lbl { font-size:9px; color:rgba(255,255,255,0.8); font-weight:600; letter-spacing:0.5px; }
    .net-amt { font-size:15px; font-weight:800; color:#fff; letter-spacing:-0.5px; }

    /* ── AMOUNT IN WORDS ── */
    .words-block {
      background:linear-gradient(90deg,#fffbeb 0%,#fefce8 100%);
      border:1px solid #fde68a; border-radius:6px;
      padding:7px 12px; margin-bottom:8px;
      display:flex; align-items:center; gap:8px;
    }
    .words-icon {
      width:24px; height:24px; background:#f59e0b; border-radius:6px;
      display:flex; align-items:center; justify-content:center;
      font-size:11px; color:#fff; font-weight:700; flex-shrink:0;
    }
    .words-lbl { font-size:7.5px; color:#92400e; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:1px; }
    .words-txt { font-size:9.5px; font-weight:600; color:#78350f; }

    /* ── BANK GRID ── */
    .bk-grid { display:table; width:100%; }
    .bk-item { display:table-cell; width:25%; font-size:9px; padding-right:6px; }
    .bk-lbl { font-size:7px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:1px; }
    .bk-val { font-size:9.5px; font-weight:700; color:#0f172a; }
    .bk-val.ac { color:#0d9488; }

    /* ── SIGN BLOCK ── */
    .sign-block {
      border:1px dashed #e2e8f0; border-radius:6px;
      padding:6px 10px; text-align:center; background:#fafafa;
    }
    .sign-line { border-top:1px solid #334155; width:100px; margin:16px auto 3px; }

    /* ── FOOTER ── */
    .footer {
      background:linear-gradient(90deg,#f8fafc 0%,#f0fdfa 100%);
      border-top:2px solid #0d9488;
      padding:7px 16px;
      display:table; width:100%;
    }
    .ftr-l { display:table-cell; font-size:7.5px; color:#64748b; line-height:1.6; vertical-align:middle; }
    .ftr-l strong { color:#0d9488; }
    .ftr-r { display:table-cell; text-align:right; vertical-align:middle; }
    .ftr-brand { font-size:12px; font-weight:800; color:#0d9488; letter-spacing:1px; }
    .ftr-thanks { font-size:7.5px; color:#94a3b8; margin-top:1px; }
    .stamp {
      display:inline-block; border:2px solid #0d9488; border-radius:50%;
      width:36px; height:36px; line-height:36px; text-align:center;
      font-size:7px; color:#0d9488; font-weight:700; opacity:0.3;
      letter-spacing:0.3px; margin-top:3px;
    }
  </style>
</head>
<body>

  <!-- ══ HEADER ══ -->
  <div class="hdr">
    <div class="hdr-inner">
      <div>
        <div class="brand-logo">
          <div class="brand-icon">E</div>
          <div class="brand-name">EDUMATE</div>
        </div>
        <div class="brand-tagline">Your Trusted Education Loan Partner</div>
      </div>
      <div>
        <div class="inv-title">INVOICE</div>
        <div style="text-align:right;"><span class="inv-badge">&#10003; GENERATED</span></div>
      </div>
    </div>
  </div>

  <!-- ══ META STRIP ══ -->
  <div class="meta-strip">
    <div class="meta-cell">
      <div class="meta-lbl">Invoice Number</div>
      <div class="meta-val ac">${d(data.invoiceNumber)}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-lbl">Invoice Date</div>
      <div class="meta-val">${d(data.invoiceDate)}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-lbl">Due Date</div>
      <div class="meta-val">${d(data.dueDate)}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-lbl">Settlements</div>
      <div class="meta-val">${data.settlementsCount} Item${data.settlementsCount !== 1 ? "s" : ""}</div>
    </div>
  </div>

  <!-- ══ BODY ══ -->
  <div class="body">

    <!-- Party Details -->
    <div class="sec-lbl"><span>Party Details</span></div>
    <div class="two-col">
      <div class="col-l">
        <div class="card">
          <div class="card-hdr"><span class="dot"></span> From (Partner / Seller)</div>
          <div class="card-body">
            <div class="ent-name">${d(data.partnerName)}</div>
            ${data.partnerDisplayName && data.partnerDisplayName !== data.partnerName ? `<div class="ent-sub">${data.partnerDisplayName}</div>` : ""}
            <div class="ent-sub">${d(data.partnerAddress)}</div>
            <div class="ent-sub">${d(data.partnerCity)}, ${d(data.partnerState)} &ndash; ${d(data.partnerPincode)}</div>
            <div class="ent-sub">State Code: ${d(data.partnerStateCode)} &nbsp;|&nbsp; Country: ${d(data.partnerCountry)}</div>
            <hr class="hdivider">
            <div class="ig">
              <div class="ig-row"><span class="ig-k">GSTIN</span><span class="ig-v b ac">${d(data.partnerGst)}</span></div>
              <div class="ig-row"><span class="ig-k">PAN</span><span class="ig-v b">${d(data.partnerPan)}</span></div>
              <div class="ig-row"><span class="ig-k">CIN</span><span class="ig-v">${d(data.partnerCin)}</span></div>
              <div class="ig-row"><span class="ig-k">Email</span><span class="ig-v">${d(data.partnerEmail)}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-r">
        <div class="card">
          <div class="card-hdr"><span class="dot"></span> Student &amp; Loan Details</div>
          <div class="card-body">
            <div class="ent-name">${d(data.studentName)}</div>
            <div class="ig">
              <div class="ig-row"><span class="ig-k">Email</span><span class="ig-v">${d(data.studentEmail)}</span></div>
              <div class="ig-row"><span class="ig-k">Phone</span><span class="ig-v">${d(data.studentPhone)}</span></div>
            </div>
            <hr class="hdivider">
            <div class="ig">
              <div class="ig-row"><span class="ig-k">Lender</span><span class="ig-v b">${d(data.lenderName)}</span></div>
              <div class="ig-row"><span class="ig-k">Loan Product</span><span class="ig-v">${d(data.loanProduct)}</span></div>
              <div class="ig-row"><span class="ig-k">Disbursed</span><span class="ig-v b ac">&#8377;${formatCurrency(data.loanAmountDisbursed)}</span></div>
              <div class="ig-row"><span class="ig-k">Disb. Date</span><span class="ig-v">${d(data.disbursementDate)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Line Items -->
    <div class="sec-lbl"><span>Line Items</span></div>
    <div class="tbl-wrap">
      <table class="inv-tbl">
        <thead>
          <tr>
            <th style="width:32px;text-align:center;">#</th>
            <th style="text-align:left;">Description</th>
            <th style="width:105px;text-align:right;">Loan Disbursed</th>
            <th style="width:65px;text-align:center;">Rate</th>
            <th style="width:100px;text-align:right;">Gross Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsRows}
        </tbody>
      </table>
    </div>

    <!-- Financial Summary -->
    <div class="sec-lbl"><span>Financial Summary</span></div>
    <div class="sum-wrap">
      <div class="sum-l">
        <div class="card">
          <div class="card-hdr"><span class="dot"></span> Commission Calculation</div>
          <div class="card-body">
            <div class="calc-row">
              <span class="lbl">Commission Model</span>
              <span class="val"><span class="tag tg-b">${d(data.commissionModel)}</span></span>
            </div>
            <div class="calc-row">
              <span class="lbl">Commission Rate</span>
              <span class="val">${data.lineItems[0]?.commissionRate ? data.lineItems[0].commissionRate + "%" : "-"}</span>
            </div>
            <div class="calc-row">
              <span class="lbl">Gross Commission</span>
              <span class="val">&#8377;${formatCurrency(data.grossCommission || data.subtotal)}</span>
            </div>
            <div class="calc-row strong">
              <span class="lbl">Total Gross Amount</span>
              <span class="val">&#8377;${formatCurrency(data.subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="sum-r">
        <div class="card">
          <div class="card-hdr"><span class="dot"></span> Tax &amp; Deductions</div>
          <div class="card-body">
            <div class="calc-row">
              <span class="lbl">Taxable Value</span>
              <span class="val">&#8377;${formatCurrency(data.subtotal)}</span>
            </div>
            <div class="calc-row">
              <span class="lbl">GST Applicable</span>
              <span class="val"><span class="tag tg-g">${d(data.gstApplicable)}</span></span>
            </div>
            <div class="calc-row">
              <span class="lbl">IGST @ ${data.igstRate ? data.igstRate + "%" : "-"}</span>
              <span class="val">&#8377;${formatCurrency(data.totalGst)}</span>
            </div>
            <div class="calc-row">
              <span class="lbl">CGST @ ${data.cgstRate ? data.cgstRate + "%" : "-"}</span>
              <span class="val">&#8377;${formatCurrency(data.cgstAmount)}</span>
            </div>
            <div class="calc-row">
              <span class="lbl">SGST @ ${data.sgstRate ? data.sgstRate + "%" : "-"}</span>
              <span class="val">&#8377;${formatCurrency(data.sgstAmount)}</span>
            </div>
            <div class="calc-row ded">
              <span class="lbl">TDS Applicable</span>
              <span class="val"><span class="tag tg-s">@ ${data.tdsRate ? data.tdsRate + "%" : "-"}</span></span>
            </div>
            <div class="calc-row ded">
              <span class="lbl">TDS Deduction</span>
              <span class="val">&ndash; &#8377;${formatCurrency(data.totalTds)}</span>
            </div>
            <div class="calc-row ded">
              <span class="lbl">Total Deductions</span>
              <span class="val">&ndash; &#8377;${formatCurrency(data.totalDeductions)}</span>
            </div>
            <div class="net-block">
              <span class="net-lbl">NET PAYABLE</span>
              <span class="net-amt">&#8377;${formatCurrency(data.netPayableTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Amount in Words -->
    <div class="words-block">
      <div class="words-icon">&#8377;</div>
      <div>
        <div class="words-lbl">Amount in Words</div>
        <div class="words-txt">${amountInWords}</div>
      </div>
    </div>

    <!-- Bank & Payment Details -->
    <div class="sec-lbl"><span>Bank &amp; Payment Details</span></div>
    <div class="two-col">
      <div class="col-l">
        <div class="card">
          <div class="card-hdr"><span class="dot"></span> Bank Details for Payment</div>
          <div class="card-body">
            <div style="font-size:7.5px;color:#94a3b8;font-weight:600;margin-bottom:1px;">ACCOUNT HOLDER</div>
            <div style="font-size:10px;font-weight:700;color:#0f172a;margin-bottom:7px;">${d(data.bankAccountHolder)}</div>
            <div class="bk-grid">
              <div class="bk-item"><div class="bk-lbl">Bank Name</div><div class="bk-val">${d(data.bankName)}</div></div>
              <div class="bk-item"><div class="bk-lbl">Account No</div><div class="bk-val">${d(data.bankAccountNumber)}</div></div>
              <div class="bk-item"><div class="bk-lbl">IFSC Code</div><div class="bk-val ac">${d(data.bankIfsc)}</div></div>
              <div class="bk-item"><div class="bk-lbl">Branch</div><div class="bk-val">${d(data.bankBranch)}</div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-r" style="vertical-align:top;">
        <div class="card" style="margin-bottom:6px;">
          <div class="card-hdr"><span class="dot"></span> Payment Details</div>
          <div class="card-body">
            <div class="bk-grid">
              <div class="bk-item"><div class="bk-lbl">Method</div><div class="bk-val">${d(data.paymentMethod)}</div></div>
              <div class="bk-item"><div class="bk-lbl">Reference</div><div class="bk-val">${d(data.paymentReference)}</div></div>
              <div class="bk-item"><div class="bk-lbl">Bank TXN ID</div><div class="bk-val">${d(data.bankTransactionId)}</div></div>
              <div class="bk-item"><div class="bk-lbl">Payment Terms</div><div class="bk-val">Net 30 Days</div></div>
            </div>
          </div>
        </div>
        <div class="sign-block">
          <div style="font-size:7.5px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Authorised Signatory</div>
          <div class="sign-line"></div>
          <div style="font-size:8.5px;color:#64748b;font-weight:500;">${d(data.partnerName)}</div>
          <div style="font-size:7.5px;color:#94a3b8;margin-top:1px;">Computer generated invoice</div>
        </div>
      </div>
    </div>

  </div>

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div class="ftr-l">
      <strong>Payment Terms:</strong> Net 30 Days &nbsp;&bull;&nbsp;
      <strong>Late Fee:</strong> 18% p.a. &nbsp;&bull;&nbsp;
      <strong>Jurisdiction:</strong> Mumbai Courts<br>
      This invoice is computer generated and does not require a physical signature.
    </div>
    <div class="ftr-r">
      <div class="ftr-brand">EDUMATE</div>
      <div class="ftr-thanks">Thank you for your business!</div>
      <div class="stamp">PAID</div>
    </div>
  </div>

</body>
</html>`;
}

// ============================================================================
// BACKWARD COMPATIBILITY ALIAS
// Default export uses the detailed version (can change as needed)
// ============================================================================

/**
 * @deprecated Use buildSystemInvoiceHTMLSimple or buildSystemInvoiceHTMLDetailed
 * This alias points to the detailed version for backward compatibility
 */
export const buildSystemInvoiceHTML = buildSystemInvoiceHTMLDetailed;
