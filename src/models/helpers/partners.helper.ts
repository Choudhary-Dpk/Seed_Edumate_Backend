import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import {
  apiAccessStatusMap,
  portalAccessStatusMap,
} from "../../types/partner.type";
import { dataSourceMap } from "../../types/contact.types";

export const getPartners = async () => {
  const partnersList = await prisma.hSB2BPartners.findMany({
    select: {
      id: true,
      partner_name: true,
    },
  });

  return partnersList;
};

export const getPartnerById = async (partnerId: number) => {
  const partner = await prisma.hSB2BPartners.findFirst({
    select: {
      id: true,
    },
    where: {
      id: partnerId,
    },
  });
  return partner;
};

export const getUserRoles = async () => {
  const rolesList = await prisma.b2BPartnersRoles.findMany({
    select: {
      id: true,
      display_name: true,
    },
  });

  return rolesList;
};

export const getUserRoleById = async (roleId: number) => {
  const role = await prisma.b2BPartnersRoles.findFirst({
    select: {
      id: true,
      role: true,
    },
    where: {
      id: roleId,
    },
  });

  return role;
};

export const getUserRole = async (userId: number) => {
  const userWithRoles = await prisma.b2BPartnersUsers.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!userWithRoles || userWithRoles.roles.length === 0) {
    return null;
  }

  const userRole = userWithRoles.roles[0].role;
  return {
    id: userRole.id,
    role: userRole.role,
  };
};

export const getAdminRole = async (userId: number) => {
  const userWithRoles = await prisma.adminUsers.findUnique({
    where: { id: userId },
    include: {
      admin_user_roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!userWithRoles || userWithRoles.admin_user_roles.length === 0) {
    return null;
  }

  const userRole = userWithRoles.admin_user_roles[0].role;
  return {
    id: userRole.id,
    role: userRole.role,
  };
};

export const getPartnerIdByUserId = async (userId: number) => {
  const partnerId = await prisma.b2BPartnersUsers.findFirst({
    select: {
      b2b_id: true,
    },
    where: {
      id: userId,
    },
  });
  return partnerId;
};

export const getHubspotIdByUserId = async (
  userId: number
): Promise<string | null> => {
  try {
    const user = await prisma.b2BPartnersUsers.findUnique({
      where: {
        id: userId,
      },
      select: {
        b2b_partner: {
          select: {
            hs_object_id: true,
          },
        },
      },
    });

    return user?.b2b_partner?.hs_object_id || null;
  } catch (error) {
    console.error("Error fetching Hubspot ID:", error);
    throw error;
  }
};

export const createB2BPartner = async (
  tx: any,
  mainData: any
  // hubspotId?: number,
  // hsCreatedBy?: number
) => {
  const partner = await tx.hSB2BPartners.create({
    data: {
      ...mainData,
      // hs_object_id: hubspotId?.toString(),
      // hs_created_by_user_id: hsCreatedBy,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return partner;
};

export const createB2BBusinessCapabilities = async (
  tx: any,
  partnerId: number,
  capabilitiesData: any
) => {
  if (!capabilitiesData || Object.keys(capabilitiesData).length === 0) {
    return null;
  }

  const capabilities = await tx.hSB2BPartnersBusinessCapabilities.create({
    data: {
      partner_id: partnerId,
      ...capabilitiesData,
    },
  });

  return capabilities;
};

export const createB2BCommissionStructure = async (
  tx: any,
  partnerId: number,
  commissionData: any
) => {
  if (!commissionData || Object.keys(commissionData).length === 0) {
    return null;
  }

  const commission = await tx.hSB2BPartnersCommissionStructure.create({
    data: {
      partner_id: partnerId,
      ...commissionData,
    },
  });

  return commission;
};

export const createB2BComplianceDocumentation = async (
  tx: any,
  partnerId: number,
  complianceData: any
) => {
  if (!complianceData || Object.keys(complianceData).length === 0) {
    return null;
  }

  const compliance = await tx.hSB2BPartnersComplianceAndDocumentation.create({
    data: {
      partner_id: partnerId,
      ...complianceData,
    },
  });

  return compliance;
};

export const createB2BContactInfo = async (
  tx: any,
  partnerId: number,
  contactData: any
) => {
  if (!contactData || Object.keys(contactData).length === 0) {
    return null;
  }

  const contactInfo = await tx.hSB2BPartnersContactInfo.create({
    data: {
      partner_id: partnerId,
      ...contactData,
    },
  });

  return contactInfo;
};

export const createB2BFinancialTracking = async (
  tx: any,
  partnerId: number,
  financialData: any
) => {
  if (!financialData || Object.keys(financialData).length === 0) {
    return null;
  }

  const financial = await tx.hSB2BPartnersFinancialTracking.create({
    data: {
      partner_id: partnerId,
      ...financialData,
    },
  });

  return financial;
};

export const createB2BLeadAttribution = async (
  tx: any,
  partnerId: number,
  leadAttributionData: any
) => {
  if (!leadAttributionData || Object.keys(leadAttributionData).length === 0) {
    return null;
  }

  const leadAttribution = await tx.hSB2BPartnersLeadAttribution.create({
    data: {
      partner_id: partnerId,
      ...leadAttributionData,
    },
  });

  return leadAttribution;
};

export const createB2BMarketingPromotion = async (
  tx: any,
  partnerId: number,
  marketingData: any
) => {
  if (!marketingData || Object.keys(marketingData).length === 0) {
    return null;
  }

  const marketing = await tx.hSB2BPartnersMarketingAndPromotion.create({
    data: {
      partner_id: partnerId,
      ...marketingData,
    },
  });

  return marketing;
};

export const createB2BPartnershipDetails = async (
  tx: any,
  partnerId: number,
  partnershipData: any
) => {
  if (!partnershipData || Object.keys(partnershipData).length === 0) {
    return null;
  }

  const partnership = await tx.hSB2BPartnersPartnershipDetails.create({
    data: {
      partner_id: partnerId,
      ...partnershipData,
    },
  });

  return partnership;
};

export const createB2BPerformanceMetrics = async (
  tx: any,
  partnerId: number,
  performanceData: any
) => {
  if (!performanceData || Object.keys(performanceData).length === 0) {
    return null;
  }

  const performance = await tx.hSB2BPartnersPerformanceMetrics.create({
    data: {
      partner_id: partnerId,
      ...performanceData,
    },
  });

  return performance;
};

export const createB2BRelationshipManagement = async (
  tx: any,
  partnerId: number,
  relationshipData: any
) => {
  if (!relationshipData || Object.keys(relationshipData).length === 0) {
    return null;
  }

  const relationship = await tx.hSB2BPartnersRelationshipManagement.create({
    data: {
      partner_id: partnerId,
      ...relationshipData,
    },
  });

  return relationship;
};

export const createB2BSystemTracking = async (
  tx: any,
  partnerId: number,
  systemTrackingData: any,
  userId: number
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSB2BPartnersSystemTracking.create({
    data: {
      partner: {
        connect: {
          id: partnerId,
        },
      },
      ...systemTrackingData,
    },
  });

  return systemTracking;
};

export const deleteB2bPartner = async (partnerId: number, userId: number) => {
  await prisma.$transaction(async (tx) => {
    await tx.hSB2BPartners.update({
      where: { id: partnerId },
      data: {
        is_deleted: true,
        updated_at: new Date(),
        deleted_by_id: userId,
      },
    });
  });
};

export const updateB2BPartner = async (
  tx: any,
  partnerId: number,
  mainData: any
) => {
  const partner = await tx.hSB2BPartners.update({
    where: {
      id: partnerId,
    },
    data: {
      ...mainData,
      updated_at: new Date(),
    },
  });

  return partner;
};

export const updateB2BBusinessCapabilities = async (
  tx: any,
  partnerId: number,
  capabilitiesData: any
) => {
  if (!capabilitiesData || Object.keys(capabilitiesData).length === 0) {
    return null;
  }

  const capabilities = await tx.hSB2BPartnersBusinessCapabilities.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...capabilitiesData,
    },
  });

  return capabilities;
};

export const updateB2BCommissionStructure = async (
  tx: any,
  partnerId: number,
  commissionData: any
) => {
  if (!commissionData || Object.keys(commissionData).length === 0) {
    return null;
  }

  const commission = await tx.hSB2BPartnersCommissionStructure.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...commissionData,
    },
  });

  return commission;
};

export const updateB2BComplianceDocumentation = async (
  tx: any,
  partnerId: number,
  complianceData: any
) => {
  if (!complianceData || Object.keys(complianceData).length === 0) {
    return null;
  }

  const compliance = await tx.hSB2BPartnersComplianceAndDocumentation.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...complianceData,
    },
  });

  return compliance;
};

export const updateB2BContactInfo = async (
  tx: any,
  partnerId: number,
  contactData: any
) => {
  if (!contactData || Object.keys(contactData).length === 0) {
    return null;
  }

  const contactInfo = await tx.hSB2BPartnersContactInfo.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...contactData,
    },
  });

  return contactInfo;
};

export const updateB2BFinancialTracking = async (
  tx: any,
  partnerId: number,
  financialData: any
) => {
  if (!financialData || Object.keys(financialData).length === 0) {
    return null;
  }

  const financial = await tx.hSB2BPartnersFinancialTracking.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...financialData,
    },
  });

  return financial;
};

export const updateB2BLeadAttribution = async (
  tx: any,
  partnerId: number,
  leadAttributionData: any
) => {
  if (!leadAttributionData || Object.keys(leadAttributionData).length === 0) {
    return null;
  }

  const leadAttribution = await tx.hSB2BPartnersLeadAttribution.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...leadAttributionData,
    },
  });

  return leadAttribution;
};

export const updateB2BMarketingPromotion = async (
  tx: any,
  partnerId: number,
  marketingData: any
) => {
  if (!marketingData || Object.keys(marketingData).length === 0) {
    return null;
  }

  const marketing = await tx.hSB2BPartnersMarketingAndPromotion.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...marketingData,
    },
  });

  return marketing;
};

export const updateB2BPartnershipDetails = async (
  tx: any,
  partnerId: number,
  partnershipData: any
) => {
  if (!partnershipData || Object.keys(partnershipData).length === 0) {
    return null;
  }

  const partnership = await tx.hSB2BPartnersPartnershipDetails.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...partnershipData,
    },
  });

  return partnership;
};

export const updateB2BPerformanceMetrics = async (
  tx: any,
  partnerId: number,
  performanceData: any
) => {
  if (!performanceData || Object.keys(performanceData).length === 0) {
    return null;
  }

  const performance = await tx.hSB2BPartnersPerformanceMetrics.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...performanceData,
    },
  });

  return performance;
};

export const updateB2BRelationshipManagement = async (
  tx: any,
  partnerId: number,
  relationshipData: any
) => {
  if (!relationshipData || Object.keys(relationshipData).length === 0) {
    return null;
  }

  const relationship = await tx.hSB2BPartnersRelationshipManagement.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...relationshipData,
    },
  });

  return relationship;
};

export const updateB2BSystemTracking = async (
  tx: any,
  partnerId: number,
  systemTrackingData: any,
  userId: number
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSB2BPartnersSystemTracking.update({
    where: {
      partner_id: partnerId,
    },
    data: {
      ...systemTrackingData,
      last_modified_by: userId.toString(),
      last_modified_date: new Date(),
      updated_at: new Date(),
    },
  });

  return systemTracking;
};

export const getB2BPartner = async (partnerId: number) => {
  const partner = await prisma.hSB2BPartners.findUnique({
    where: {
      id: partnerId,
      is_deleted: false,
    },
    include: {
      business_capabilities: true,
      commission_structure: true,
      compliance: true,
      contact_info: true,
      financial_tracking: true,
      lead_attribution: true,
      marketing_promo: true,
      partnership_details: true,
      performance_metrics: true,
      relationship_managemenet: true,
      system_tracking: true,
    },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  return partner;
};

export const fetchB2BPartnersList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null
) => {
  const where: Prisma.HSB2BPartnersWhereInput = {
    is_deleted: false,
    OR: search
      ? [
          { partner_name: { contains: search, mode: "insensitive" } },
          { partner_display_name: { contains: search, mode: "insensitive" } },
          { business_type: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { state: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
          { gst_number: { contains: search, mode: "insensitive" } },
          { pan_number: { contains: search, mode: "insensitive" } },
          {
            contact_info: {
              OR: [
                {
                  primary_contact_email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  primary_contact_person: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  primary_contact_phone: {
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
      case "partner_name":
        orderBy = { partner_name: sortDir || "asc" };
        break;
      case "business_type":
        orderBy = { business_type: sortDir || "asc" };
        break;
      case "city":
        orderBy = { city: sortDir || "asc" };
        break;
      case "partnership_status":
        orderBy = {
          partnership_details: { partnership_status: sortDir || "asc" },
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
    prisma.hSB2BPartners.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        business_capabilities: true,
        commission_structure: {
          select: {
            commission_type: true,
            commission_rate: true,
            payment_frequency: true,
            payment_method: true,
          },
        },
        contact_info: {
          select: {
            primary_contact_person: true,
            primary_contact_email: true,
            primary_contact_phone: true,
            primary_contact_designation: true,
          },
        },
        partnership_details: {
          select: {
            partnership_status: true,
            partnership_start_date: true,
            partnership_end_date: true,
            agreement_type: true,
          },
        },
        performance_metrics: {
          select: {
            total_leads_provided: true,
            qualified_leads_provided: true,
            lead_conversion_rate: true,
            partner_rating: true,
          },
        },
        financial_tracking: {
          select: {
            total_commission_earned: true,
            total_commission_paid: true,
            outstanding_commission: true,
            payment_status: true,
          },
        },
      },
    }),
    prisma.hSB2BPartners.count({ where }),
  ]);

  return { rows, count };
};

export const checkB2BPartnerFields = async (
  gst_number?: string,
  pan_number?: string,
  registration_number?: string,
  partner_name?: string,
  partner_display_name?: string
) => {
  const conditions: any[] = [];
  if (gst_number) conditions.push({ gst_number });
  if (pan_number) conditions.push({ pan_number });
  if (registration_number) conditions.push({ registration_number });
  if (partner_name) conditions.push({ partner_name });
  if (partner_display_name) conditions.push({ partner_display_name });

  if (conditions.length === 0) {
    return null;
  }

  const result = await prisma.hSB2BPartners.findFirst({
    where: {
      OR: conditions,
      is_deleted: false,
    },
    select: {
      id: true,
      gst_number: true,
      pan_number: true,
      registration_number: true,
      partner_name: true,
      partner_display_name: true,
    },
  });

  return result;
};

export const getLeadsByDynamicFilters = async (
  filters: Record<string, any>
) => {
  if (!Object.keys(filters).length) return [];
  const numericFields = [
    "id",
    "b2b_partner_id",
    "hs_created_by_user_id",
    "hs_updated_by_user_id",
  ];

  // Build partner filters
  const partnerWhere: Record<string, any> = { is_deleted: false };
  for (const key in filters) {
    const value = filters[key];
    if (numericFields.includes(key)) {
      partnerWhere[key] = Number(value);
    } else {
      partnerWhere[key] = { equals: value }; // use equals instead of contains inside relation
    }
  }

  const contacts = await prisma.hSEdumateContacts.findMany({
    where: {
      is_deleted: false,
      b2b_partner: {
        is: partnerWhere,
      },
    },
    include: {
      personal_information: true,
      academic_profile: true,
      application_journey: true,
      financial_Info: true,
      lead_attribution: true,
      loan_preference: true,
      system_tracking: true,
      b2b_partner: true,
    },
  });

  return contacts;
};
