import prisma from "../../config/prisma"
import {
  ApplicationStatusToEnum,
  ApplicationStatusType,
  Row,
  ValidationResult,
} from "../../types/leads.types";

export const createLoan = async (
  userId: number,
  email: string,
  name: string
) => {
  const loan = await prisma.loanApplication.create({
    data: {
      user_id: userId,
      student_name: name,
      student_email: email,
      created_by_id: userId,
      created_at: new Date(),
    },
  });

  return loan;
};

export const createFinancialRequirements = async (
  loanId: number,
  loanAmountRequested: number,
  loanAmountApproved: string
) => {
  const financialRequirements = await prisma.financialRequirements.create({
    data: {
      loan_application_id: loanId,
      loan_amount_requested: loanAmountRequested,
      loan_amount_approved: loanAmountApproved,
      created_at: new Date(),
    },
  });

  return financialRequirements;
};

export const createLender = async (loanId: number, loanTenureYears: number) => {
  const lender = await prisma.lenderInformation.create({
    data: {
      loan_application_id: loanId,
      loan_tenure_years: loanTenureYears,
      created_at: new Date(),
    },
  });

  return lender;
};

export const createApplicationStatus = async (
  loanId: number,
  applicationStatus: ApplicationStatusType
) => {
  const financialRequirements = await prisma.applicationStatus.create({
    data: {
      loan_application_id: loanId,
      status: ApplicationStatusToEnum[applicationStatus],
      created_at: new Date(),
    },
  });

  return financialRequirements;
};

export const getLeadByEmail = async (email: string) => {
  const lead = await prisma.loanApplication.findFirst({
    select: {
      id: true,
      student_name: true,
      student_email: true,
    },
    where: {
      student_email: email,
    },
  });

  return lead;
};

export const createCSVLeads = async (rows: Row[]) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create loan applications
    const loanApplications = await tx.loanApplication.createMany({
      data: rows.map((row) => ({
        student_name: row.name,
        student_email: row.email,
        user_id: row.userId,
        created_by_id: row.createdBy,
      })),
      skipDuplicates: true,
    });

    // ⚠️ `createMany` Prisma me return inserted records nahi deta (sirf count).
    // To get IDs, hame dobara fetch karna padega based on unique fields (email + userId)
    const insertedApps = await tx.loanApplication.findMany({
      where: {
        student_email: { in: rows.map((r) => r.email) },
        user_id: { in: rows.map((r) => r.userId) },
      },
    });

    // Make a quick lookup by (email+userId) => id
    const appMap = new Map<string, number>();
    for (const app of insertedApps) {
      appMap.set(`${app.student_email}|${app.user_id}`, app.id);
    }

    // 2. Create financial requirements
    await tx.financialRequirements.createMany({
      data: rows.map((row) => ({
        loan_application_id: appMap.get(`${row.email}|${row.userId}`)!,
        loan_amount_requested: Number(row.loanAmountRequested),
        loan_amount_approved: row.loanAmountApproved
          ? Number(row.loanAmountApproved)
          : null,
      })),
    });

    // 3. Create lender info
    await tx.lenderInformation.createMany({
      data: rows.map((row) => ({
        loan_application_id: appMap.get(`${row.email}|${row.userId}`)!,
        loan_tenure_years: row.loanTenureYears
          ? Number(row.loanTenureYears)
          : null,
      })),
    });

    // 4. Create application status
    await tx.applicationStatus.createMany({
      data: rows.map((row) => ({
        loan_application_id: appMap.get(`${row.email}|${row.userId}`)!,
        status: ApplicationStatusToEnum[row.applicationStatus],
      })),
    });

    return loanApplications;
  });
};

// Find existing leads for deduplication
export const findLeads = async (batch: Row[]) => {
  const leads = await prisma.loanApplication.findMany({
    where: {
      OR: batch.map((v) => ({
        student_email: v.email,
      })),
    },
    select: {
      student_email: true,
      financial_requirements: {
        select: {
          loan_amount_requested: true,
          loan_amount_approved: true,
        },
      },
      lender_information: {
        select: {
          loan_tenure_years: true,
        },
      },
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