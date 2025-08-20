import prisma from "../../config/prisma"
import { Row, ValidationResult } from "../../types/leads.types";

export const createLead = async (
  id: number,
  applicationStatus: string,
  loanAmountRequested: number,
  loanAmountApproved: number,
  loanTenureYears: number,
  email: string,
  name: string
) => {
  const lead = await prisma.loan_application.create({
    data: {
      name,
      applicationStatus,
      loanAmountRequested,
      loanAmountApproved,
      loanTenureYears,
      email,
      userId: id,
      createdBy: id,
      created_at: new Date(),
    },
  });

  return lead;
};

export const getLeadByEmail = async (email: string) => {
  const lead = await prisma.loan_application.findFirst({
    select: {
      id: true,
      name: true,
      applicationStatus: true,
      loanAmountApproved: true,
      loanAmountRequested: true,
      loanTenureYears: true,
    },
    where: {
      email,
    },
  });

  return lead;
};

export const createCSVLeads = async (toInsert: Row[]) => {
  const leads = await prisma.loan_application.createMany({
    data: toInsert,
    skipDuplicates: true,
  });

  return leads;
};

export const findLeads = async (batch: Row[]) => {
  const leads = prisma.loan_application.findMany({
    where: {
      OR: batch.map((v) => ({
        email: v.email,
        loanAmountRequested: v.loanAmountRequested,
        loanTenureYears: v.loanTenureYears,
      })),
    },
    select: {
      email: true,
      loanAmountRequested: true,
      loanTenureYears: true,
    },
  });

  return leads;
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