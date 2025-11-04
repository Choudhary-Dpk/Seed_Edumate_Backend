import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../../config/prisma";

// Main HSLenders helper
export const createHSLender = async (tx: any, mainData: any) => {
  const lender = await tx.hSLenders.create({
    data: {
      ...mainData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return lender;
};

// HSLendersContactInfo helper
export const createHSLendersContactInfo = async (
  tx: any,
  lenderId: number,
  contactData: any
) => {

  const contactInfo = await tx.hSLendersContactInfo.create({
    data: {
      lender: {
        connect: { id: lenderId },
      },
      ...contactData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return contactInfo;
};

// HSLendersBusinessMetrics helper
export const createHSLendersBusinessMetrics = async (
  tx: any,
  lenderId: number,
  metricsData: any
) => {

  const businessMetrics = await tx.hSLendersBusinessMetrics.create({
    data: {
      lender: {
        connect: { id: lenderId },
      },
      ...metricsData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return businessMetrics;
};

// HSLendersLoanOfferings helper
export const createHSLendersLoanOfferings = async (
  tx: any,
  lenderId: number,
  offeringsData: any
) => {
  const loanOfferings = await tx.hSLendersLoanOfferings.create({
    data: {
      ...offeringsData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return loanOfferings;
};

// HSLendersOperationalDetails helper
export const createHSLendersOperationalDetails = async (
  tx: any,
  lenderId: number,
  operationalData: any
) => {

  const operationalDetails = await tx.hSLendersOperationalDetails.create({
    data: {
      lender: {
        connect: { id: lenderId },
      },
      ...operationalData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return operationalDetails;
};

// HSLendersPartnershipsDetails helper
export const createHSLendersPartnershipsDetails = async (
  tx: any,
  lenderId: number,
  partnershipData: any
) => {
  const partnershipDetails = await tx.hSLendersPartnershipsDetails.create({
    data: {
      lender: {
        connect: { id: lenderId },
      },
      ...partnershipData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return partnershipDetails;
};

// HSLendersSystemTracking helper
export const createHSLendersSystemTracking = async (
  tx: any,
  lenderId: number,
  trackingData: any
) => {

  const systemTracking = await tx.hSLendersSystemTracking.create({
    data: {
      lender_system_tracking: {
        connect: { id: lenderId },
      },
      ...trackingData,
      last_modified_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return systemTracking;
};

// Update helpers

export const updateHSLender = async (
  tx: any,
  lenderId: number,
  updateData: any,
) => {
  const lender = await tx.hSLenders.update({
    where: { id: lenderId },
    data: {
      ...updateData,
      updated_at: new Date(),
    },
  });

  return lender;
};

export const updateHSLendersContactInfo = async (
  tx: any,
  lenderId: number,
  contactData: any
) => {
  const existingContact = await tx.hSLendersContactInfo.findUnique({
    where: { lender_id: lenderId },
  });

  if (!existingContact) {
    return await createHSLendersContactInfo(tx, lenderId, contactData);
  }

  const contactInfo = await tx.hSLendersContactInfo.update({
    where: { lender_id: lenderId },
    data: {
      ...contactData,
      updated_at: new Date(),
    },
  });

  return contactInfo;
};

export const updateHSLendersBusinessMetrics = async (
  tx: any,
  lenderId: number,
  metricsData: any
) => {
  const existingMetrics = await tx.hSLendersBusinessMetrics.findUnique({
    where: { lender_id: lenderId },
  });

  if (!existingMetrics) {
    return await createHSLendersBusinessMetrics(tx, lenderId, metricsData);
  }

  const businessMetrics = await tx.hSLendersBusinessMetrics.update({
    where: { lender_id: lenderId },
    data: {
      ...metricsData,
      updated_at: new Date(),
    },
  });

  return businessMetrics;
};

export const updateHSLendersOperationalDetails = async (
  tx: any,
  lenderId: number,
  operationalData: any
) => {
  const existingDetails = await tx.hSLendersOperationalDetails.findUnique({
    where: { lender_id: lenderId },
  });

  if (!existingDetails) {
    return await createHSLendersOperationalDetails(
      tx,
      lenderId,
      operationalData
    );
  }

  const operationalDetails = await tx.hSLendersOperationalDetails.update({
    where: { lender_id: lenderId },
    data: {
      ...operationalData,
      updated_at: new Date(),
    },
  });

  return operationalDetails;
};

export const updateHSLendersPartnershipsDetails = async (
  tx: any,
  lenderId: number,
  partnershipData: any
) => {
  const existingPartnership = await tx.hSLendersPartnershipsDetails.findUnique({
    where: { lender_id: lenderId },
  });

  if (!existingPartnership) {
    return await createHSLendersPartnershipsDetails(
      tx,
      lenderId,
      partnershipData
    );
  }

  const partnershipDetails = await tx.hSLendersPartnershipsDetails.update({
    where: { lender_id: lenderId },
    data: {
      ...partnershipData,
      updated_at: new Date(),
    },
  });

  return partnershipDetails;
};

export const updateHSLendersSystemTracking = async (
  tx: any,
  lenderId: number,
  trackingData: any,
) => {
  const existingTracking = await tx.hSLendersSystemTracking.findUnique({
    where: { lender_id: lenderId },
  });

  if (!existingTracking) {
    return await createHSLendersSystemTracking(tx, lenderId, trackingData);
  }

  const systemTracking = await tx.hSLendersSystemTracking.update({
    where: { lender_id: lenderId },
    data: {
      ...trackingData,
      last_modified_date: new Date(),
      updated_at: new Date(),
    },
  });

  return systemTracking;
};

export const softDeleteHSLender = async (
  tx: any,
  lenderId: number,
) => {
  const lender = await tx.hSLenders.update({
    where: { id: lenderId },
    data: {
      is_active: false,
      is_deleted: true,
      updated_at: new Date(),
    },
  });

  return lender;
};

export const hardDeleteHSLender = async (tx: any, lenderId: number) => {
  // Due to cascade deletes, this will remove all related records
  const lender = await tx.hSLenders.delete({
    where: { id: lenderId },
  });

  return lender;
};

export const fetchHSLenderById = async (tx: any, lenderId: number) => {
  const lender = await tx.hSLenders.findUnique({
    where: { id: lenderId, is_deleted: false },
    include: {
      contact_info: true,
      business_metrics: true,
      loan_products: true,
      operational_details: true,
      partnership: true,
      lender_system_tracking: true,
    },
  });

  return lender;
};

export const fetchHSLenderByExternalId = async (
  tx: any,
  externalId: string
) => {
  const lender = await tx.hSLenders.findUnique({
    where: { external_id: externalId },
    include: {
      contact_info: true,
      business_metrics: true,
      loan_products: true,
      operational_details: true,
      partnership: true,
      lender_system_tracking: true,
    },
  });

  return lender;
};

export const fetchAllHSLenders = async (
  tx: any,
  filters?: any,
  pagination?: { skip?: number; take?: number }
) => {
  const { skip = 0, take = 50 } = pagination || {};

  const lenders = await tx.hSLenders.findMany({
    where: filters,
    skip,
    take,
    include: {
      contact_info: true,
      business_metrics: true,
      operational_details: true,
      partnership: true,
      lender_system_tracking: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return lenders;
};

export const fetchActiveHSLenders = async (
  tx: any,
  pagination?: { skip?: number; take?: number }
) => {
  const { skip = 0, take = 50 } = pagination || {};

  const lenders = await tx.hSLenders.findMany({
    where: {
      is_active: true,
      lender_system_tracking: {
        lender_record_status: "ACTIVE",
      },
    },
    skip,
    take,
    include: {
      contact_info: true,
      business_metrics: true,
      operational_details: true,
      partnership: true,
      lender_system_tracking: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return lenders;
};

export const fetchLendersList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
) => {
  const where: Prisma.HSLendersWhereInput = {
    is_active: true,
    OR: search
      ? [
          { lender_display_name: { contains: search, mode: "insensitive" } },
          { lender_name: { contains: search, mode: "insensitive" } },
          { legal_name: { contains: search, mode: "insensitive" } },
          { short_code: { contains: search, mode: "insensitive" } },
          { external_id: { contains: search, mode: "insensitive" } },
          { website_url: { contains: search, mode: "insensitive" } },
          { hs_object_id: { contains: search, mode: "insensitive" } },
          {
            contact_info: {
              OR: [
                {
                  primary_contact_person: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  primary_contact_email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  relationship_manager_name: {
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
      case "lender_display_name":
        orderBy = { lender_display_name: sortDir || "asc" };
        break;
      case "lender_name":
        orderBy = { lender_name: sortDir || "asc" };
        break;
      case "lender_category":
        orderBy = { lender_category: sortDir || "asc" };
        break;
      case "lender_type":
        orderBy = { lender_type: sortDir || "asc" };
        break;
      case "approval_rate":
        orderBy = {
          business_metrics: { average_approval_rate: sortDir || "desc" },
        };
        break;
      case "processing_days":
        orderBy = {
          business_metrics: { average_processing_days: sortDir || "asc" },
        };
        break;
      case "performance_rating":
        orderBy = {
          lender_system_tracking: { performance_rating: sortDir || "asc" },
        };
        break;
      case "partnership_status":
        orderBy = {
          partnership: { partnership_status: sortDir || "asc" },
        };
        break;
      case "created_at":
        orderBy = { created_at: sortDir || "desc" };
        break;
      case "updated_at":
        orderBy = { updated_at: sortDir || "desc" };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.hSLenders.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        contact_info: true,
        business_metrics: true,
        operational_details: true,
        partnership: true,
        lender_system_tracking: true,
      },
    }),
    prisma.hSLenders.count({ where }),
  ]);

  return { rows, count };
};

export const getLenderById = async (lenderId: number) => {
  return prisma.hSLenders.findUnique({
    where: { id: lenderId },
  });
};
