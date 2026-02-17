import crypto from "crypto";
import { Row, ValidationResult } from "../types/leads.types";
import { findLeads } from "../models/helpers/loanApplication.helper";
import { parse } from "csv-parse";
import {
  findContacts,
  findContactsByPartnerId,
} from "../models/helpers/contact.helper";
import { ContactsLead, ContactsValidationResult } from "../types/contact.types";
import moment from "moment";

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
      .trim()
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

    // --- Enum validations ---
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
// HELPER: Build System Invoice HTML Template
// ============================================================================

export function buildSystemInvoiceHTML(data: {
  invoiceNumber: string;
  invoiceDate: string;
  partnerName: string;
  partnerGst: string;
  partnerPan: string;
  partnerAddress: string;
  lineItems: Array<{
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
  }>;
  subtotal: number;
  totalGst: number;
  totalTds: number;
  totalDeductions: number;
  netPayableTotal: number;
  settlementsCount: number;
}): string {
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
              <tr><td style="font-size:12px;color:#7F8C8D;padding:3px 0;">Status</td><td style="text-align:right;"><span style="font-size:11px;font-weight:600;background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:4px;">Pending Approval</span></td></tr>
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