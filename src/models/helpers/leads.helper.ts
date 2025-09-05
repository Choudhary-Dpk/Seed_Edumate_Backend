import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import {
  ApplicationSourceSystemToEnum,
  ApplicationStatusToEnum,
  ApplicationStatusType,
  IntegrationStatusToEnum,
  Row,
} from "../../types/leads.types";
import { HubspotResult } from "../../types";

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
  const financialRequirements = await prisma.loanApplicationFinancialRequirements.create({
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
  const lender = await prisma.loanApplicationLenderInformation.create({
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
  const financialRequirements = await prisma.loanApplicationStatus.create({
    data: {
      loan_application_id: loanId,
      status: ApplicationStatusToEnum[applicationStatus],
      created_at: new Date(),
    },
  });

  return financialRequirements;
};

export const createSystemTracking = async (
  loanId: number,
  hubspotId: string
) => {
  const financialRequirements = await prisma.loanApplicationSystemTracking.create({
    data: {
      loan_application_id: loanId,
      hs_object_id: hubspotId,
      integration_status: IntegrationStatusToEnum["SYNCED"],
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
      is_deleted: true,
    },
    where: {
      student_email: email,
      is_deleted: false,
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
    await tx.loanApplicationFinancialRequirements.createMany({
      data: rows.map((row) => ({
        loan_application_id: appMap.get(`${row.email}|${row.userId}`)!,
        loan_amount_requested: Number(row.loanAmountRequested),
        loan_amount_approved: row.loanAmountApproved
          ? Number(row.loanAmountApproved)
          : null,
      })),
    });

    // 3. Create lender info
    await tx.loanApplicationLenderInformation.createMany({
      data: rows.map((row) => ({
        loan_application_id: appMap.get(`${row.email}|${row.userId}`)!,
        loan_tenure_years: row.loanTenureYears
          ? Number(row.loanTenureYears)
          : null,
      })),
    });

    // 4. Create application status
    await tx.loanApplicationStatus.createMany({
      data: rows.map((row) => ({
        loan_application_id: appMap.get(`${row.email}|${row.userId}`)!,
        status: ApplicationStatusToEnum[row.applicationStatus],
      })),
    });

    await tx.loanApplicationSystemTracking.createMany({
      data: rows.map((row) => ({
        loan_application_id: appMap.get(`${row.email}|${row.userId}`)!,
        application_source_system:
          ApplicationSourceSystemToEnum["MANUAL_ENTRY"],
        integration_status: IntegrationStatusToEnum["PENDING_SYNC"],
        hs_object_id: null,
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

export const addFileType = async (fileName: string) => {
  const fileType = await prisma.fileEntity.upsert({
    where: { type: fileName },
    update: {},
    create: { type: fileName, description: `${fileName} files` },
  });

  return fileType;
};

export const addFileRecord = async (
  filename: string,
  mime_type: string,
  rows: Row,
  total_records: number,
  uploadedBy: number,
  fileId: number
) => {
  const fileUpload = await prisma.fileUpload.create({
    data: {
      filename,
      mime_type,
      file_data: rows,
      total_records,
      uploaded_by_id: uploadedBy,
      entity_type_id: fileId,
    },
    include: { entity_type: true },
  });

  return fileUpload;
};

export const updateFileRecord = async (
  fileId: number,
  processedRecords: number,
  failedRecords: number
) => {
  await prisma.fileUpload.update({
    where: { id: fileId },
    data: {
      processed_records: processedRecords,
      failed_records: failedRecords,
      processed_at: new Date(),
    },
  });
};

export const getLeadById = async (leadId: number) => {
  const lead = await prisma.loanApplication.findFirst({
    select: {
      id: true,
      student_name: true,
      student_email: true,
      is_deleted: true,
    },
    where: {
      id: leadId,
    },
  });

  return lead;
};

export const updateLoan = async (
  userId: number,
  leadId: number,
  email: string,
  name: string
) => {
  const loan = await prisma.loanApplication.update({
    data: {
      user_id: userId,
      student_name: name,
      student_email: email,
      created_by_id: userId,
      updated_at: new Date(),
    },
    where: {
      id: leadId,
    },
    select: {
      id: true,
    },
  });

  return loan;
};

export const updateFinancialRequirements = async (
  loanId: number,
  loanAmountRequested: number,
  loanAmountApproved: string
) => {
  const financialRequirements = await prisma.loanApplicationFinancialRequirements.update({
    data: {
      loan_application_id: loanId,
      loan_amount_requested: loanAmountRequested,
      loan_amount_approved: loanAmountApproved,
      updated_at: new Date(),
    },
    where: {
      loan_application_id: loanId,
    },
  });

  return financialRequirements;
};

export const updateLender = async (
  loanId: number,
  loanTenureYears: number
) => {
  const lender = await prisma.loanApplicationLenderInformation.update({
    data: {
      loan_application_id: loanId,
      loan_tenure_years: loanTenureYears,
      updated_at: new Date(),
    },
    where: {
      loan_application_id: loanId,
    },
  });

  return lender;
};

export const updateApplicationStatus = async (
  loanId: number,
  applicationStatus: ApplicationStatusType
) => {
  const financialRequirements = await prisma.loanApplicationStatus.update({
    data: {
      loan_application_id: loanId,
      status: ApplicationStatusToEnum[applicationStatus],
      updated_at: new Date(),
    },
    where: {
      loan_application_id: loanId,
    },
  });

  return financialRequirements;
};

export const deleteLoan = async (leadId: number, userId: number) => {
  await prisma.loanApplication.update({
    where: { id: leadId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by_id: userId,
      last_modified_by_id: userId,
    },
  });
};

export const getLoanList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null
) => {
  const where: Prisma.LoanApplicationWhereInput = search
    ? {
        OR: [
          { student_name: { contains: search, mode: "insensitive" } },
          { student_email: { contains: search, mode: "insensitive" } },
        ],
        is_deleted: false,
      }
    : { is_deleted: false };

  let orderBy: any = { created_at: "desc" };
  if (sortKey) {
    switch (sortKey) {
      case "name":
        orderBy = { student_name: sortDir || "desc" };
        break;
      case "email":
        orderBy = { student_email: sortDir || "desc" };
        break;
      case "loanTenureYears":
        orderBy = {
          lender_information: { loan_tenure_years: sortDir || "desc" },
        };
        break;
      case "loanAmountRequested":
        orderBy = {
          financial_requirements: { loan_amount_requested: sortDir || "desc" },
        };
        break;
      case "loanAmountApproved":
        orderBy = {
          financial_requirements: { loan_amount_approved: sortDir || "desc" },
        };
        break;
      case "applicationStatus":
        orderBy = { application_status: { status: sortDir || "desc" } };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.loanApplication.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        financial_requirements: true,
        loan_application_status: true,
        lender_information: true,
      },
    }),
    prisma.loanApplication.count({ where }),
  ]);

  return { rows, count };
};

export const getLeads = async (leadId: number) => {
  const leads = await prisma.loanApplication.findFirst({
    where: {
      id: leadId,
    },
    include: {
      financial_requirements: true,
      loan_application_status: true,
      lender_information: true,
    },
  });

  return leads;
};

export const updateSystemTracking = async (hubspotResults: HubspotResult[]) => {
  await prisma.$transaction(async (tx) => {
    for (const hs of hubspotResults) {
      const { student_email, hs_object_id } = hs.properties;

      if (!student_email) continue;

      // 🔹 match loan app by email
      const loanApp = await tx.loanApplication.findFirst({
        where: { student_email },
        select: { id: true },
      });

      if (loanApp) {
        await tx.loanApplicationSystemTracking.upsert({
          where: { loan_application_id: loanApp.id },
          update: {
            hs_object_id: hs_object_id ?? hs.id,
            integration_status: IntegrationStatusToEnum["SYNCED"],
          },
          create: {
            loan_application_id: loanApp.id,
            hs_object_id: hs_object_id ?? hs.id,
            integration_status: IntegrationStatusToEnum["SYNCED"],
          },
        });
      }
    }
  });
};

export const getHubspotByLeadId = async (leadId: number) => {
  return prisma.loanApplication.findUnique({
    where: { id: leadId },
    include: {
      system_tracking: true,
    },
  });
};
