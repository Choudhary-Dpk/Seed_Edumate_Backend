import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import {
  ApplicationStatusToEnum,
  ApplicationStatusType,
  IntegrationStatusToEnum,
  Row,
} from "../../types/leads.types";
import { HubspotResult } from "../../types";

export const createLoan = async (
  userId: number,
  email: string,
  name: string,
  partnerId: number,
  hubspotId: string
) => {
  const loan = await prisma.hSLoanApplications.create({
    data: {
      user_id: userId,
      student_name: name,
      student_email: email,
      b2b_partner_id: partnerId,
      hs_object_id: hubspotId,
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
  const financialRequirements =
    await prisma.hSLoanApplicationsFinancialRequirements.create({
      data: {
        application_id: loanId,
        loan_amount_requested: loanAmountRequested,
        loan_amount_approved: loanAmountApproved,
        created_at: new Date(),
      },
    });

  return financialRequirements;
};

export const createLender = async (loanId: number, loanTenureYears: number) => {
  const lender = await prisma.hSLoanApplicationsLenderInformation.create({
    data: {
      application_id: loanId,
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
  const financialRequirements = await prisma.hSLoanApplicationsStatus.create({
    data: {
      application_id: loanId,
      application_status: ApplicationStatusToEnum[applicationStatus],
      created_at: new Date(),
    },
  });

  return financialRequirements;
};

export const createSystemTracking = async (loanId: number) => {
  const financialRequirements =
    await prisma.hSLoanApplicationsSystemTracking.create({
      data: {
        application_id: loanId,
        integration_status: IntegrationStatusToEnum["SYNCED"],
        created_at: new Date(),
      },
    });

  return financialRequirements;
};

export const getLeadByEmail = async (email: string) => {
  const lead = await prisma.hSLoanApplications.findFirst({
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

// Find existing leads for deduplication
export const findLeads = async (batch: Row[]) => {
  const leads = await prisma.hSLoanApplications.findMany({
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

export const getLeadById = async (leadId: number) => {
  const lead = await prisma.hSLoanApplications.findFirst({
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
  const loan = await prisma.hSLoanApplications.update({
    data: {
      user_id: userId,
      student_name: name,
      student_email: email,
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
  const financialRequirements =
    await prisma.hSLoanApplicationsFinancialRequirements.update({
      data: {
        application_id: loanId,
        loan_amount_requested: loanAmountRequested,
        loan_amount_approved: loanAmountApproved,
        updated_at: new Date(),
      },
      where: {
        application_id: loanId,
      },
    });

  return financialRequirements;
};

export const updateLender = async (loanId: number, loanTenureYears: number) => {
  const lender = await prisma.hSLoanApplicationsLenderInformation.update({
    data: {
      application_id: loanId,
      loan_tenure_years: loanTenureYears,
      updated_at: new Date(),
    },
    where: {
      application_id: loanId,
    },
  });

  return lender;
};

export const updateApplicationStatus = async (
  loanId: number,
  applicationStatus: ApplicationStatusType
) => {
  const financialRequirements = await prisma.hSLoanApplicationsStatus.update({
    data: {
      application_id: loanId,
      application_status: ApplicationStatusToEnum[applicationStatus],
      updated_at: new Date(),
    },
    where: {
      application_id: loanId,
    },
  });

  return financialRequirements;
};

export const deleteLoan = async (leadId: number, userId: number) => {
  await prisma.hSLoanApplications.update({
    where: { id: leadId },
    data: {
      is_deleted: true,
      deleted_on: new Date(),
      deleted_by_id: userId,
    },
  });
};

export const getLoanList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  filters: {
    partner: string | null;
    lender: string | null;
    loanProduct: string | null;
    status: string | null;
  }
) => {
  const where: any = {
    is_deleted: false,
  };

  // Add search filter
  if (search) {
    where.OR = [
      { student_name: { contains: search, mode: "insensitive" } },
      { student_email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Apply filters
  if (filters.partner) {
    where.b2b_partner_id = Number(filters.partner);
  }

  if (filters.lender) {
    where.lender_information = {
      ...where.lender_information,
      primary_lender_id: filters.lender,
    };
  }

  if (filters.loanProduct) {
    where.lender_information = {
      ...where.lender_information,
      loan_product_id: filters.loanProduct,
    };
  }

  if (filters.status) {
    where.loan_application_status = {
      status: filters.status,
    };
  }

  let orderBy: any = { created_at: "desc" };
  if (sortKey) {
    switch (sortKey) {
      case "id":
        orderBy = { id: sortDir || "desc" };
        break;
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
        orderBy = { loan_application_status: { status: sortDir || "desc" } };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.hSLoanApplications.findMany({
      where: where as Prisma.HSLoanApplicationsWhereInput,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        financial_requirements: true,
        loan_application_status: true,
        lender_information: true,
        user: true,
      },
    }),
    prisma.hSLoanApplications.count({
      where: where as Prisma.HSLoanApplicationsWhereInput,
    }),
  ]);

  return { rows, count };
};

export const getLeadViewList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  filters: {
    partner: string | null;
    lender: string | null;
    loanProduct: string | null;
    status: string | null;
  }
) => {
  const where: any = {};

  // Add search filter
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name: { contains: search, mode: "insensitive" } },
    ];
  }

  // Apply filters
  if (filters.partner) {
    where.b2b_partner_id = Number(filters.partner);
  }

  if (filters.status) {
    where.admission_status = filters.status;
  }

  if (filters.lender) {
    where.primary_lender_name = filters.lender;
  }

  if (filters.loanProduct) {
    where.loan_product_name = filters.loanProduct;
  }

  let orderBy: any = { application_date: "desc" };
  if (sortKey) {
    switch (sortKey) {
      case "id":
        orderBy = { contact_id: sortDir || "desc" };
        break;
      case "name":
        orderBy = { first_name: sortDir || "desc" };
        break;
      case "email":
        orderBy = { email: sortDir || "desc" };
        break;
      case "status":
        orderBy = { status: sortDir || "desc" };
        break;
      case "loanAmountRequested":
        orderBy = { loan_amount_requested: sortDir || "desc" };
        break;
      case "loanAmountApproved":
        orderBy = { loan_amount_approved: sortDir || "desc" };
        break;
      case "commissionAmount":
        orderBy = { commission_amount: sortDir || "desc" };
        break;
      default:
        orderBy = { application_date: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.leadsView.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
    }),
    prisma.leadsView.count({
      where,
    }),
  ]);

  return { rows, count };
};

export const getLoanApplicationById = async (leadId: number) => {
  const leads = await prisma.hSLoanApplications.findFirst({
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
      const loanApp = await tx.hSLoanApplications.findFirst({
        where: { student_email },
        select: { id: true },
      });

      if (loanApp) {
        await tx.hSLoanApplicationsSystemTracking.upsert({
          where: { application_id: loanApp.id },
          update: {
            integration_status: IntegrationStatusToEnum["SYNCED"],
          },
          create: {
            application_id: loanApp.id,
            integration_status: IntegrationStatusToEnum["SYNCED"],
          },
        });
      }
    }
  });
};

export const getHubspotByLeadId = async (leadId: number) => {
  return prisma.hSLoanApplications.findUnique({
    where: { id: leadId },
    select: {
      hs_object_id: true,
    },
  });
};

export const deleteLoanApplication = async (
  applicationId: number,
  userId: number
) => {
  const application = await prisma.hSLoanApplications.update({
    where: {
      id: applicationId,
      is_deleted: false,
    },
    data: {
      is_deleted: true,
      deleted_by_id: userId,
      deleted_on: new Date(),
      updated_at: new Date(),
    },
  });

  if (!application) {
    throw new Error("Loan application not found or already deleted");
  }

  return application;
};

export const createLoanApplication = async (
  tx: any,
  mainData: any,
  userId: number
) => {
  const application = await tx.hSLoanApplications.create({
    data: {
      ...mainData,
      // user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return application;
};

export const createLoanApplicationProcessingTimeline = async (
  tx: any,
  loanApplicationId: number,
  timelineData: any
) => {
  if (!timelineData || Object.keys(timelineData).length === 0) {
    return null;
  }

  const timeline = await tx.hSLoanApplicationsProcessingTimeline.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...timelineData,
    },
  });

  return timeline;
};

export const createLoanApplicationAcademicDetails = async (
  tx: any,
  loanApplicationId: number,
  academicData: any
) => {
  if (!academicData || Object.keys(academicData).length === 0) {
    return null;
  }

  const academic = await tx.hSLoanApplicationsAcademicDetails.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...academicData,
    },
  });

  return academic;
};

export const createLoanApplicationFinancialRequirements = async (
  tx: any,
  loanApplicationId: number,
  financialData: any
) => {
  if (!financialData || Object.keys(financialData).length === 0) {
    return null;
  }

  const financial = await tx.hSLoanApplicationsFinancialRequirements.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...financialData,
    },
  });

  return financial;
};

export const createLoanApplicationStatus = async (
  tx: any,
  loanApplicationId: number,
  statusData: any
) => {
  if (!statusData || Object.keys(statusData).length === 0) {
    return null;
  }

  const status = await tx.hSLoanApplicationsStatus.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...statusData,
    },
  });

  return status;
};

export const createLoanApplicationLenderInformation = async (
  tx: any,
  loanApplicationId: number,
  lenderData: any
) => {
  if (!lenderData || Object.keys(lenderData).length === 0) {
    return null;
  }

  const lender = await tx.hSLoanApplicationsLenderInformation.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...lenderData,
    },
  });

  return lender;
};

export const createLoanApplicationDocumentManagement = async (
  tx: any,
  loanApplicationId: number,
  documentData: any
) => {
  if (!documentData || Object.keys(documentData).length === 0) {
    return null;
  }

  const document = await tx.hSLoanApplicationsDocumentManagement.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...documentData,
    },
  });

  return document;
};

export const createLoanApplicationRejectionDetails = async (
  tx: any,
  loanApplicationId: number,
  rejectionData: any
) => {
  if (!rejectionData || Object.keys(rejectionData).length === 0) {
    return null;
  }

  const rejection = await tx.hSLoanApplicationsRejectionDetails.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...rejectionData,
    },
  });

  return rejection;
};

export const createLoanApplicationCommunicationPreferences = async (
  tx: any,
  loanApplicationId: number,
  commData: any
) => {
  if (!commData || Object.keys(commData).length === 0) {
    return null;
  }

  const comm = await tx.hSLoanApplicationsCommunicationPreferences.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...commData,
    },
  });

  return comm;
};

export const createLoanApplicationSystemTracking = async (
  tx: any,
  loanApplicationId: number,
  systemData: any,
  userId: number
) => {
  if (!systemData || Object.keys(systemData).length === 0) {
    return null;
  }

  const system = await tx.hSLoanApplicationsSystemTracking.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...systemData,
    },
  });

  return system;
};

export const createLoanApplicationCommissionRecord = async (
  tx: any,
  loanApplicationId: number,
  commissionData: any
) => {
  if (!commissionData || Object.keys(commissionData).length === 0) {
    return null;
  }

  const commission = await tx.hSLoanApplicationsCommissionRecords.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...commissionData,
    },
  });

  return commission;
};

export const createLoanApplicationAdditionalService = async (
  tx: any,
  loanApplicationId: number,
  serviceData: any
) => {
  if (!serviceData || Object.keys(serviceData).length === 0) {
    return null;
  }

  const service = await tx.hSLoanApplicationsAdditionalServices.create({
    data: {
      application: {
        connect: { id: loanApplicationId },
      },
      ...serviceData,
    },
  });

  return service;
};

export const updateLoanApplication = async (
  tx: any,
  applicationId: number,
  mainData: any
) => {
  const application = await tx.hSLoanApplications.update({
    where: {
      id: applicationId,
    },
    data: {
      ...mainData,
      updated_at: new Date(),
    },
  });

  return application;
};

export const updateLoanApplicationAcademicDetails = async (
  tx: any,
  applicationId: number,
  academicData: any
) => {
  if (!academicData || Object.keys(academicData).length === 0) {
    return null;
  }

  const academicDetails = await tx.hSLoanApplicationsAcademicDetails.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...academicData,
      updated_at: new Date(),
    },
  });

  return academicDetails;
};

export const updateLoanApplicationFinancialRequirements = async (
  tx: any,
  applicationId: number,
  financialData: any
) => {
  if (!financialData || Object.keys(financialData).length === 0) {
    return null;
  }

  const financialRequirements =
    await tx.hSLoanApplicationsFinancialRequirements.update({
      where: {
        application_id: applicationId,
      },
      data: {
        ...financialData,
        updated_at: new Date(),
      },
    });

  return financialRequirements;
};

export const updateLoanApplicationStatus = async (
  tx: any,
  applicationId: number,
  statusData: any
) => {
  if (!statusData || Object.keys(statusData).length === 0) {
    return null;
  }

  const status = await tx.hSLoanApplicationsStatus.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...statusData,
      updated_at: new Date(),
    },
  });

  return status;
};

export const updateLoanApplicationLenderInformation = async (
  tx: any,
  applicationId: number,
  lenderData: any
) => {
  if (!lenderData || Object.keys(lenderData).length === 0) {
    return null;
  }

  const lenderInfo = await tx.hSLoanApplicationsLenderInformation.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...lenderData,
      updated_at: new Date(),
    },
  });

  return lenderInfo;
};

export const updateLoanApplicationDocumentManagement = async (
  tx: any,
  applicationId: number,
  documentData: any
) => {
  if (!documentData || Object.keys(documentData).length === 0) {
    return null;
  }

  const documents = await tx.hSLoanApplicationsDocumentManagement.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...documentData,
      updated_at: new Date(),
    },
  });

  return documents;
};

export const updateLoanApplicationProcessingTimeline = async (
  tx: any,
  applicationId: number,
  timelineData: any
) => {
  if (!timelineData || Object.keys(timelineData).length === 0) {
    return null;
  }

  const timeline = await tx.hSLoanApplicationsProcessingTimeline.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...timelineData,
      updated_at: new Date(),
    },
  });

  return timeline;
};

export const updateLoanApplicationRejectionDetails = async (
  tx: any,
  applicationId: number,
  rejectionData: any
) => {
  if (!rejectionData || Object.keys(rejectionData).length === 0) {
    return null;
  }

  const rejection = await tx.hSLoanApplicationsRejectionDetails.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...rejectionData,
      updated_at: new Date(),
    },
  });

  return rejection;
};

export const updateLoanApplicationCommunicationPreferences = async (
  tx: any,
  applicationId: number,
  communicationData: any
) => {
  if (!communicationData || Object.keys(communicationData).length === 0) {
    return null;
  }

  const communication =
    await tx.hSLoanApplicationsCommunicationPreferences.update({
      where: {
        application_id: applicationId,
      },
      data: {
        ...communicationData,
        updated_at: new Date(),
      },
    });

  return communication;
};

export const updateLoanApplicationSystemTracking = async (
  tx: any,
  applicationId: number,
  systemTrackingData: any,
  userId: number
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSLoanApplicationsSystemTracking.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...systemTrackingData,
      last_modified_by: userId.toString(),
      updated_at: new Date(),
    },
  });

  return systemTracking;
};

export const updateLoanApplicationCommissionRecord = async (
  tx: any,
  applicationId: number,
  commissionData: any
) => {
  if (!commissionData || Object.keys(commissionData).length === 0) {
    return null;
  }

  const commission = await tx.hSLoanApplicationsCommissionRecords.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...commissionData,
      updated_at: new Date(),
    },
  });

  return commission;
};

export const updateLoanApplicationAdditionalService = async (
  tx: any,
  applicationId: number,
  serviceData: any
) => {
  if (!serviceData || Object.keys(serviceData).length === 0) {
    return null;
  }

  const service = await tx.hSLoanApplicationsAdditionalServices.update({
    where: {
      application_id: applicationId,
    },
    data: {
      ...serviceData,
      updated_at: new Date(),
    },
  });

  return service;
};

export const getLoanApplication = async (applicationId: number) => {
  const application = await prisma.hSLoanApplications.findUnique({
    where: {
      id: applicationId,
      is_deleted: false,
    },
    include: {
      academic_details: true,
      financial_requirements: true,
      loan_application_status: true,
      lender_information: true,
      document_management: true,
      processing_timeline: true,
      rejection_details: true,
      communication_prefs: true,
      system_tracking: true,
      commission_records: true,
      additional_services: true,
    },
  });

  if (!application) {
    throw new Error("Loan application not found");
  }

  return application;
};

export const fetchLoanApplicationsList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  userId?: number
) => {
  const where: Prisma.HSLoanApplicationsWhereInput = {
    is_deleted: false,
    ...(userId && { user_id: userId }),
    OR: search
      ? [
          { student_name: { contains: search, mode: "insensitive" } },
          { student_email: { contains: search, mode: "insensitive" } },
          { student_phone: { contains: search, mode: "insensitive" } },
          { student_id: { contains: search, mode: "insensitive" } },
          { lead_reference_code: { contains: search, mode: "insensitive" } },
          {
            academic_details: {
              OR: [
                { target_course: { contains: search, mode: "insensitive" } },
                {
                  target_university: { contains: search, mode: "insensitive" },
                },
                {
                  target_university_country: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        ]
      : undefined,
  };

  let orderBy: any = { created_at: "desc" };
  if (sortKey) {
    switch (sortKey) {
      case "id":
        orderBy = { id: sortDir || "asc" };
        break;
      case "student_name":
        orderBy = { student_name: sortDir || "asc" };
        break;
      case "student_email":
        orderBy = { student_email: sortDir || "asc" };
        break;
      case "application_date":
        orderBy = { application_date: sortDir || "desc" };
        break;
      case "application_source":
        orderBy = { application_source: sortDir || "asc" };
        break;
      case "status":
        orderBy = {
          loan_application_status: { status: sortDir || "asc" },
        };
        break;
      case "created_at":
        orderBy = { created_at: sortDir || "desc" };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.hSLoanApplications.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        academic_details: true,
        financial_requirements: true,
        loan_application_status: true,
        lender_information: true,
        document_management: true,
        processing_timeline: true,
        rejection_details: true,
        communication_prefs: true,
        system_tracking: true,
        commission_records: true,
        additional_services: true,
      },
    }),
    prisma.hSLoanApplications.count({ where }),
  ]);

  return { rows, count };
};

export const checkLoanApplicationFields = async (
  lead_reference_code?: string,
  student_id?: string,
  student_email?: string
) => {
  const conditions: any[] = [];
  if (lead_reference_code) conditions.push({ lead_reference_code });
  if (student_id) conditions.push({ student_id });
  if (student_email) conditions.push({ student_email });

  if (conditions.length === 0) {
    return null;
  }

  const result = await prisma.hSLoanApplications.findFirst({
    where: {
      is_active: true,
      is_deleted: false,
      OR: conditions,
    },
    select: {
      id: true,
      lead_reference_code: true,
      student_id: true,
      student_email: true,
    },
  });

  return result;
};
