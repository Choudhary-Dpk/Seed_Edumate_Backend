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
  partnerLogo?: string;
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
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <title>Commission Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans', 'Segoe UI', Roboto, Arial, sans-serif; color: #2C3E50; background: #fff; }
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <title>Invoice - ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans', Arial, 'Helvetica Neue', sans-serif;
      background: #fff;
      color: #000;
      font-size: 11px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { size: A4; margin: 12mm; }

    table { border-collapse: collapse; width: 100%; }
    .inv-table { border: 1px solid #555; }
    .inv-table td, .inv-table th { border: 1px solid #ccc; vertical-align: top; }
    .th-gray { background: #e8e8e8; color: #000; font-weight: 700; padding: 7px 10px; border: 1px solid #aaa; }
    .th-gray-sub { background: #f2f2f2; color: #000; font-weight: 700; padding: 6px 10px; border: 1px solid #ccc; }
    .th-dark { background: #444; color: #fff; font-weight: 700; padding: 7px 10px; }
  </style>
</head>
<body>

  <!-- PARTNER LETTERHEAD -->
  <table style="margin-bottom:12px;border:none;border-collapse:collapse;width:100%;">
    <tr>
      <!-- LOGO -->
      <td style="width:70px;vertical-align:middle;padding-right:12px;border:none;">
        ${
          data.partnerLogo
            ? `<img src="${data.partnerLogo}" alt="Logo" style="width:60px;height:60px;object-fit:contain;">`
            : `<div style="width:60px;height:60px;background:#444;border-radius:4px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1;"><span style="font-size:18px;font-weight:900;color:#fff;letter-spacing:1px;display:block;padding-top:16px;">${d(data.partnerName).substring(0, 2).toUpperCase()}</span></div>`
        }
      </td>
      <!-- COMPANY DETAILS -->
      <td style="vertical-align:middle;border:none;">
        <div style="font-size:18px;font-weight:800;color:#000;">${d(data.partnerName)}</div>
        ${data.partnerDisplayName && data.partnerDisplayName !== data.partnerName ? `<div style="font-size:10px;color:#444;margin-top:1px;">${data.partnerDisplayName}</div>` : ""}
        <div style="font-size:10px;color:#333;margin-top:3px;">${d(data.partnerAddress)}${data.partnerCity ? `, ${d(data.partnerCity)}` : ""}${data.partnerState ? `, ${d(data.partnerState)}` : ""}${data.partnerPincode ? ` &ndash; ${d(data.partnerPincode)}` : ""}${data.partnerCountry ? `. ${d(data.partnerCountry)}` : ""}</div>
        <div style="font-size:10px;color:#333;margin-top:2px;"><b>PAN:</b> ${d(data.partnerPan)} &nbsp;&nbsp; <b>GSTIN:</b> ${d(data.partnerGst)}</div>
        ${data.partnerCin ? `<div style="font-size:10px;color:#333;margin-top:1px;"><b>MSME ID:</b> ${d(data.partnerCin)}</div>` : ""}
      </td>
      <!-- TAX INVOICE BADGE -->
      <td style="vertical-align:bottom;text-align:right;border:none;white-space:nowrap;padding-bottom:4px;">
        <div style="font-size:30px;font-weight:900;color:#000;letter-spacing:2px;text-transform:uppercase;">TAX INVOICE</div>
      </td>
    </tr>
  </table>

  <!-- MAIN TAX INVOICE TABLE -->
  <table class="inv-table">

    <!-- ── INVOICE NO / DATE / PLACE OF SUPPLY ── -->
    <tr>
      <td colspan="2" style="padding:5px 10px;width:20%;font-weight:700;border-right:1px solid #ccc;color:#000;">Invoice No</td>
      <td style="padding:5px 10px;width:30%;border-right:2px solid #555;font-weight:700;">${d(data.invoiceNumber)}</td>
      <td colspan="2" style="padding:5px 10px;width:22%;font-weight:700;border-right:1px solid #ccc;">Place Of Supply</td>
      <td style="padding:5px 10px;font-weight:700;">${d(data.partnerState)}${data.partnerStateCode ? ` (${d(data.partnerStateCode)})` : ""}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:5px 10px;font-weight:700;border-right:1px solid #ccc;">Invoice Date</td>
      <td style="padding:5px 10px;border-right:2px solid #555;font-weight:700;">${d(data.invoiceDate)}</td>
      <td colspan="2" style="padding:5px 10px;font-weight:700;border-right:1px solid #ccc;">Terms</td>
      <td style="padding:5px 10px;font-weight:700;">Due On Receipt</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:5px 10px;font-weight:700;border-right:1px solid #ccc;border-bottom:2px solid #555;">Due Date</td>
      <td style="padding:5px 10px;border-right:2px solid #555;border-bottom:2px solid #555;font-weight:700;">${d(data.dueDate ?? data.invoiceDate)}</td>
      <td colspan="3" style="padding:5px 10px;border-bottom:2px solid #555;"></td>
    </tr>

    <!-- ── BILL TO / SHIP TO HEADER ── -->
    <tr>
      <td colspan="3" class="th-gray" style="border-right:2px solid #555;font-size:11px;">Bill To</td>
      <td colspan="3" class="th-gray" style="font-size:11px;">Ship To</td>
    </tr>

    <!-- ── BILL TO + SHIP TO CONTENT ── -->
    <tr>
      <td colspan="3" style="padding:8px 10px;border-right:2px solid #555;vertical-align:top;">
        <div style="font-weight:700;font-size:12px;">Edumate Solutions India Private Limited</div>
        <div style="margin-top:3px;font-size:10px;">Flat No. 11-E, Orchid, Cosmos Lounge,</div>
        <div style="font-size:10px;">Mulla Baug, Manpada, Thane,</div>
        <div style="font-size:10px;">400607 Maharashtra</div>
        <div style="font-size:10px;">India</div>
        <div style="font-size:10px;margin-top:3px;"><b>GSTIN</b> 27AAJCE2013K1ZR</div>
      </td>
      <td colspan="3" style="padding:8px 10px;vertical-align:top;">
        <div style="font-weight:700;font-size:12px;">${d(data.partnerName)}</div>
        <div style="margin-top:3px;font-size:10px;">${d(data.partnerAddress)}${data.partnerCity ? `, ${d(data.partnerCity)}` : ""}</div>
        ${data.partnerPincode || data.partnerState ? `<div style="font-size:10px;">${data.partnerPincode ? d(data.partnerPincode) + " " : ""}${d(data.partnerState)}</div>` : ""}
        ${data.partnerCountry ? `<div style="font-size:10px;">${d(data.partnerCountry)}</div>` : ""}
        ${data.partnerGst ? `<div style="font-size:10px;margin-top:3px;"><b>GSTIN</b> ${d(data.partnerGst)}</div>` : ""}
      </td>
    </tr>

    <!-- ── LINE ITEMS HEADER ── -->
    <tr style="border-top:2px solid #555;">
      <th class="th-gray" style="text-align:center;border-right:1px solid #aaa;width:24px;border-top:2px solid #555;">Sr.<br>No.</th>
      <th class="th-gray" style="text-align:center;border-right:1px solid #aaa;width:70px;border-top:2px solid #555;">HSN/SAC</th>
      <th class="th-gray" colspan="2" style="text-align:left;border-right:1px solid #aaa;border-top:2px solid #555;min-width:220px;">Item &amp; Description</th>
      <th class="th-gray" style="text-align:center;border-right:1px solid #aaa;width:40px;border-top:2px solid #555;">Qty</th>
      <th class="th-gray" style="text-align:right;width:105px;border-top:2px solid #555;">Amount</th>
    </tr>

    <!-- ── LINE ITEMS ── -->
    ${data.lineItems
      .map(
        (item) => `
    <tr>
      <td style="padding:6px 8px;text-align:center;border-right:1px solid #ccc;border-bottom:1px solid #ccc;font-size:11px;font-weight:600;vertical-align:top;">${item.sno}</td>
      <td style="padding:6px 8px;text-align:center;border-right:1px solid #ccc;border-bottom:1px solid #ccc;font-size:11px;vertical-align:top;">998315</td>
      <td colspan="2" style="padding:6px 8px;border-right:1px solid #ccc;border-bottom:1px solid #ccc;font-size:11px;vertical-align:top;">
        <div style="font-weight:600;margin-top:1px;">Commission for Education Loan Disbursement</div>
        <div style="font-size:9.5px;color:#444;margin-top:2px;">Student: ${d(item.studentName)} &bull; Ref: ${d(item.refNumber)}</div>
        ${item.university ? `<div style="font-size:9px;color:#555;margin-top:1px;">${item.university}${item.course ? ` &ndash; ${item.course}` : ""}</div>` : ""}
        <div style="font-size:9.5px;color:#444;margin-top:2px;">Lender: ${d(item.lenderName)} &bull; Loan: &#8377;${formatCurrency(item.loanAmount)} @ ${item.commissionRate ? item.commissionRate + "%" : "-"}</div>
      </td>
      <td style="padding:6px 8px;text-align:center;border-right:1px solid #ccc;border-bottom:1px solid #ccc;font-size:11px;vertical-align:top;">1.00</td>
      <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #ccc;font-size:11px;font-weight:700;vertical-align:top;">&#8377;${formatCurrency(item.grossAmount)}</td>
    </tr>
    `,
      )
      .join("")}

    <!-- ── TOTALS SECTION ── -->
    <!-- Left cell (rowspan=6) spans all tax rows; right cells: Sub Total, CGST, SGST, IGST, TDS, Total -->
    <tr style="border-top:2px solid #555;">
      <td colspan="3" rowspan="6" style="padding:10px;border-right:2px solid #555;border-top:2px solid #555;vertical-align:top;font-size:10px;">
        <div style="font-weight:700;font-size:10.5px;">Total In Words</div>
        <div style="font-style:italic;font-weight:700;font-size:10px;margin-top:4px;">${amountInWords}</div>
        <div style="margin-top:10px;font-size:10px;color:#555;">Notes</div>
        <div style="margin-top:3px;font-size:10px;">Looking forward to your business.</div>
        <div style="margin-top:12px;">
          <div style="font-weight:700;margin-bottom:5px;font-size:11px;">Bank Details</div>
          ${data.bankAccountHolder ? `<div><b>Account Holder:</b> ${d(data.bankAccountHolder)}</div>` : ""}
          ${data.bankName ? `<div><b>Bank:</b> ${d(data.bankName)}</div>` : ""}
          ${data.bankAccountNumber ? `<div><b>Account No:</b> ${d(data.bankAccountNumber)}</div>` : ""}
          ${data.bankIfsc ? `<div><b>IFSC:</b> ${d(data.bankIfsc)}</div>` : ""}
          <div><b>Account Type:</b> Current</div>
        </div>
      </td>
      <td colspan="2" style="padding:5px 10px;border-right:1px solid #ccc;border-top:2px solid #555;">Sub Total</td>
      <td style="padding:5px 10px;text-align:right;border-top:2px solid #555;">&#8377;${formatCurrency(data.subtotal)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:5px 10px;border-right:1px solid #ccc;border-top:1px solid #ccc;">CGST${data.cgstRate ? ` (${data.cgstRate}%)` : ""}</td>
      <td style="padding:5px 10px;text-align:right;border-top:1px solid #ccc;">&#8377;${formatCurrency(data.cgstAmount ?? 0)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:5px 10px;border-right:1px solid #ccc;border-top:1px solid #ccc;">SGST${data.sgstRate ? ` (${data.sgstRate}%)` : ""}</td>
      <td style="padding:5px 10px;text-align:right;border-top:1px solid #ccc;">&#8377;${formatCurrency(data.sgstAmount ?? 0)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:5px 10px;border-right:1px solid #ccc;border-top:1px solid #ccc;">IGST${data.igstRate ? ` (${data.igstRate}%)` : ""}</td>
      <td style="padding:5px 10px;text-align:right;border-top:1px solid #ccc;">&#8377;${formatCurrency(data.totalGst && !data.cgstAmount && !data.sgstAmount ? data.totalGst : 0)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:5px 10px;border-right:1px solid #ccc;border-top:1px solid #ccc;">Less: TDS${data.tdsRate ? ` (${data.tdsRate}%)` : ""}</td>
      <td style="padding:5px 10px;text-align:right;border-top:1px solid #ccc;color:#c0392b;">(-) &#8377;${formatCurrency(data.totalTds ?? 0)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:6px 10px;border-right:1px solid #ccc;border-top:2px solid #555;font-weight:700;font-size:12px;">Total</td>
      <td style="padding:6px 10px;text-align:right;border-top:2px solid #555;font-weight:700;font-size:12px;">&#8377;${formatCurrency(data.netPayableTotal)}</td>
    </tr>

    <!-- ── SIGNATORY ROW ── -->
    <tr style="border-top:2px solid #555;">
      <td colspan="3" style="border-right:2px solid #555;border-top:2px solid #555;"></td>
      <td colspan="3" style="padding:10px;border-top:2px solid #555;vertical-align:top;text-align:center;">
        <div style="font-size:10px;color:#555;margin-bottom:5px;">Invoice Sign</div>
        <div style="height:50px;"></div>
        <div style="font-size:10px;border-top:1px solid #ccc;padding-top:5px;margin-top:5px;">Authorized Signature</div>
      </td>
    </tr>

    <!-- ── DECLARATION ── -->
    <tr>
      <td colspan="6" style="padding:8px 10px;font-size:9.5px;color:#444;border-top:1px solid #ccc;font-style:italic;">
        Declaration: Certified that the particulars given above are true and correct to the best of my knowledge and belief.
      </td>
    </tr>

  </table>

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
