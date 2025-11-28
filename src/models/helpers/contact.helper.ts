import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import {
  admissionStatusMap,
  ContactsLead,
  courseTypeMap,
  currentEducationLevelMap,
  genderMap,
  preferredStudyDestinationMap,
  targetDegreeLevelMap,
} from "../../types/contact.types";
import { HubspotResult } from "../../types";
import { getPartnerIdByUserId } from "./partners.helper";
import logger from "../../utils/logger";

export const createEdumatePersonalInformation = async (
  tx: any,
  contactId: number,
  personalData: any
) => {
  const personalInfo = await tx.hSEdumateContactsPersonalInformation.create({
    data: {
      contact_id: contactId,
      created_at: new Date(),
      ...personalData,
    },
  });

  return personalInfo;
};

export const createEdumateAcademicProfile = async (
  tx: any,
  contactId: number,
  academicsData: any
) => {
  const academicProfile = await tx.hSEdumateContactsAcademicProfiles.create({
    data: {
      contact_id: contactId,
      created_at: new Date(),
      ...academicsData,
    },
  });

  return academicProfile;
};

export const createEdumateLeadAttribution = async (
  tx: any,
  contactId: number,
  leadData: any
) => {
  const leadAttribution = await tx.hSEdumateContactsLeadAttribution.create({
    data: {
      contact_id: contactId,
      created_at: new Date(),
      ...leadData,
    },
  });

  return leadAttribution;
};

export const createApplicationJourney = async (
  tx: any,
  contactId: number,
  journeyData: any
) => {
  const journeyDetails = await tx.hSEdumateContactsApplicationJourney.create({
    data: {
      contact_id: contactId,
      created_at: new Date(),
      ...journeyData,
    },
  });

  return journeyDetails;
};

export const createFinancialInfo = async (
  tx: any,
  contactId: number,
  journeyData: any
) => {
  const financialInfo = await tx.hSEdumateContactsFinancialInfo.create({
    data: {
      contact_id: contactId,
      created_at: new Date(),
      ...journeyData,
    },
  });

  return financialInfo;
};

export const createLoanPreferences = async (
  tx: any,
  contactId: number,
  loanPreference: any
) => {
  const loanPreferenceData = await tx.hSEdumateContactsLoanPreferences.create({
    data: {
      contact_id: contactId,
      created_at: new Date(),
      ...loanPreference,
    },
  });

  return loanPreferenceData;
};

export const createEdumateSystemTracking = async (
  tx: any,
  contactId: number,
  userId?: number
) => {
  return tx.hSEdumateContactsSystemTracking.create({
    data: {
      contact_id: contactId,
      created_by: userId?.toString(),
      created_date: new Date(),
      created_at: new Date(),
    },
  });
};

// Updated function to get contact by email
export const getEdumateContactByEmail = async (email: string) => {
  const contact = await prisma.hSEdumateContacts.findFirst({
    include: {
      personal_information: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          is_deleted: true,
        },
      },
    },
    where: {
      personal_information: {
        email: email,
        is_deleted: false,
      },
    },
  });

  return contact;
};

export const getEdumateContactByPhone = async (phone: string) => {
  const contact = await prisma.hSEdumateContacts.findFirst({
    include: {
      personal_information: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          is_deleted: true,
        },
      },
    },
    where: {
      personal_information: {
        phone_number: phone,
        is_deleted: false,
      },
    },
  });

  return contact;
};

export const createEdumateContact = async (
  tx: any,
  mainData?: any,
  // hubspotId?: number | null,
  // hsCreatedBy?: number,
  partnerId?: number
) => {
  const contact = await tx.hSEdumateContacts.create({
    data: {
      ...mainData,
      // hs_object_id: hubspotId,
      // hs_created_by_user_id: hsCreatedBy,
      b2b_partner_id: partnerId,
      created_at: new Date(),
    },
  });

  return contact;
};

export const getContactLeadById = async (leadId: number) => {
  const lead = await prisma.hSEdumateContactsPersonalInformation.findFirst({
    select: {
      id: true,
      first_name: true,
      email: true,
      is_deleted: true,
    },
    where: {
      contact_id: leadId,
    },
  });

  return lead;
};

export const getHubspotByContactLeadId = async (leadId: number) => {
  return prisma.hSEdumateContacts.findUnique({
    select: {
      id: true,
      hs_object_id: true,
    },
    where: { id: leadId },
  });
};

export const deleteContactsLoan = async (leadId: number, userId: number) => {
  await prisma.$transaction(async (tx) => {
    await tx.hSEdumateContacts.update({
      where: { id: leadId },
      data: {
        is_deleted: true,
        updated_at: new Date(),
        deleted_by_id: userId,
      },
    });

    await tx.hSEdumateContactsPersonalInformation.updateMany({
      where: { contact_id: leadId, is_deleted: false },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });
  });
};

export const getContactsLead = async (leadId: number) => {
  const contactLeads = await prisma.hSEdumateContacts.findFirst({
    where: {
      id: leadId,
    },
    include: {
      personal_information: true,
      academic_profile: true,
      financial_Info: true,
      lead_attribution: true,
    },
  });

  return contactLeads;
};

export const updateEdumateContact = async (
  tx: any,
  contactId: number,
  mainData?: any
) => {
  const contact = await tx.hSEdumateContacts.update({
    where: { id: contactId },
    data: {
      course_type: mainData.course_type
        ? courseTypeMap[mainData.course_type]
        : null,
      ...mainData,
      updated_at: new Date(),
    },
  });

  return contact;
};

export const updateEdumatePersonalInformation = async (
  tx: any,
  contactId: number,
  personalData?: any
) => {
  const personalInfo = await tx.hSEdumateContactsPersonalInformation.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...personalData,
    },
  });

  return personalInfo;
};

export const updateEdumateAcademicProfile = async (
  tx: any,
  contactId: number,
  academicsData?: any
) => {
  const academicProfile = await tx.hSEdumateContactsAcademicProfiles.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...academicsData,
    },
  });

  return academicProfile;
};

export const updateEdumateLeadAttribution = async (
  tx: any,
  contactId: number,
  leadData?: any
) => {
  // if (!leadData.b2b_partner_name) return null;

  const leadAttribution = await tx.hSEdumateContactsLeadAttribution.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...leadData,
    },
  });

  return leadAttribution;
};

export const updateEdumateContactApplicationJourney = async (
  tx: any,
  contactId: number,
  journeyData?: any
) => {
  const data = await tx.hSEdumateContactsApplicationJourney.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...journeyData,
    },
  });

  return data;
};

export const updateEdumateContactFinancialInfo = async (
  tx: any,
  contactId: number,
  financialInfo?: any
) => {
  const data = await tx.hSEdumateContactsFinancialInfo.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...financialInfo,
    },
  });

  return data;
};

export const updateEdumateContactLoanPreference = async (
  tx: any,
  contactId: number,
  loanPreference?: any
) => {
  const data = await tx.hSEdumateContactsLoanPreferences.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...loanPreference,
    },
  });

  return data;
};

export const updateEdumateContactSystemTracking = async (
  tx: any,
  contactId: number,
  systemTrackingData?: any
) => {
  const data = await tx.hSEdumateContactsSystemTracking.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...systemTrackingData,
    },
  });

  return data;
};

export const fetchContactsLeadList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  partnerId: number,
  filters: {
    partner: string | null;
    status: string | null;
  }
) => {
  const where: Prisma.HSEdumateContactsWhereInput = {
    is_deleted: false,
    // b2b_partner_id: partnerId,
  };

  // Add search filter
  if (search) {
    where.personal_information = {
      OR: [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone_number: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  // Apply partner filter
  if (filters.partner) {
    where.b2b_partner_id = Number(filters.partner);
  }

  // Apply admission status filter
  if (filters.status) {
    where.academic_profile = {
      admission_status: filters.status as any,
    };
  }

  let orderBy: any = { created_at: "desc" };
  if (sortKey) {
    switch (sortKey) {
      case "id":
        orderBy = {
          personal_information: { id: sortDir || "asc" },
        };
        break;
      case "name":
        orderBy = {
          personal_information: { first_name: sortDir || "asc" },
        };
        break;
      case "email":
        orderBy = {
          personal_information: { email: sortDir || "asc" },
        };
        break;
      case "admissionStatus":
        orderBy = {
          academic_profile: { admission_status: sortDir || "asc" },
        };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.hSEdumateContacts.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        personal_information: true,
        academic_profile: true,
        financial_Info: true,
        lead_attribution: true,
        loan_preference: true,
        application_journey: true,
        b2b_partner: {
          select: {
            id: true,
            partner_name: true,
            partner_display_name: true,
          },
        },
      },
    }),
    prisma.hSEdumateContacts.count({ where }),
  ]);

  return { rows, count };
};

export const findContacts = async (batch: any[]) => {
  const contacts = await prisma.hSEdumateContactsPersonalInformation.findMany({
    where: {
      OR: batch.map((v) => ({
        OR: [{ email: v.email }, { phone_number: v.phoneNumber }],
        is_deleted: false,
      })),
    },
    select: {
      email: true,
      phone_number: true,
    },
  });

  return contacts;
};

export async function createCSVContacts(
  contacts: Record<string, Record<string, any>>[],
  userId: number,
  hubspotResults: any[] | null,
  batchId: string | null = null,
  batchPosition: number = 0
) {
  const partnerId = await getPartnerIdByUserId(userId);

  return await prisma.$transaction(
    async (tx) => {
      // ✅ Step 1: Bulk insert main contacts with EMAIL
      await tx.hSEdumateContacts.createMany({
        data: contacts.map((c) => ({
          ...c["mainContact"],
          email: c["personalInformation"]?.email, // ✅ Set email on main table
          b2b_partner_id: partnerId!.b2b_id,
        })),
        skipDuplicates: true,
      });

      // ✅ Step 2: Fetch inserted contacts by EMAIL (super reliable!)
      const emails = contacts
        .map((c) => c["personalInformation"]?.email)
        .filter((email): email is string => !!email && email.trim() !== "");

      if (emails.length === 0) {
        throw new Error("No valid emails found in contacts");
      }

      const insertedContacts = await tx.hSEdumateContacts.findMany({
        where: {
          email: { in: emails },
        },
        select: {
          id: true,
          email: true,
        },
      });

      // ✅ Step 3: Create email-to-ID mapping
      const emailToIdMap = new Map(
        insertedContacts.map((c) => [c.email, c.id])
      );

      logger.debug(`Mapped ${emailToIdMap.size} contacts by email`);

      // ✅ Step 4: Build data arrays with proper contact_id mapping
      const personalInfoData = contacts
        .map((c) => {
          const email = c["personalInformation"]?.email;
          const contactId = email ? emailToIdMap.get(email) : null;
          if (!contactId) return null;
          return {
            contact_id: contactId,
            ...c["personalInformation"],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const academicProfileData = contacts
        .map((c) => {
          const email = c["personalInformation"]?.email;
          const contactId = email ? emailToIdMap.get(email) : null;
          if (!contactId) return null;
          return {
            contact_id: contactId,
            ...c["academicProfile"],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const leadAttributionData = contacts
        .map((c) => {
          const email = c["personalInformation"]?.email;
          const contactId = email ? emailToIdMap.get(email) : null;
          if (!contactId) return null;
          return {
            contact_id: contactId,
            ...c["leadAttribution"],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const financialInfoData = contacts
        .map((c) => {
          const email = c["personalInformation"]?.email;
          const contactId = email ? emailToIdMap.get(email) : null;
          if (!contactId || !c["financialInfo"]) return null;
          return {
            contact_id: contactId,
            ...c["financialInfo"],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const loanPreferenceData = contacts
        .map((c) => {
          const email = c["personalInformation"]?.email;
          const contactId = email ? emailToIdMap.get(email) : null;
          if (!contactId || !c["loanPreference"]) return null;
          return {
            contact_id: contactId,
            ...c["loanPreference"],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const applicationJourneyData = contacts
        .map((c) => {
          const email = c["personalInformation"]?.email;
          const contactId = email ? emailToIdMap.get(email) : null;
          if (!contactId || !c["applicationJourney"]) return null;
          return {
            contact_id: contactId,
            ...c["applicationJourney"],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const systemTrackingData = contacts
        .map((c) => {
          const email = c["personalInformation"]?.email;
          const contactId = email ? emailToIdMap.get(email) : null;
          if (!contactId || !c["systemTracking"]) return null;
          return {
            contact_id: contactId,
            ...c["systemTracking"],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // ✅ Step 5: Bulk insert all normalized tables
      if (personalInfoData.length > 0) {
        await tx.hSEdumateContactsPersonalInformation.createMany({
          data: personalInfoData,
          skipDuplicates: true,
        });
      }

      if (academicProfileData.length > 0) {
        await tx.hSEdumateContactsAcademicProfiles.createMany({
          data: academicProfileData,
          skipDuplicates: true,
        });
      }

      if (leadAttributionData.length > 0) {
        await tx.hSEdumateContactsLeadAttribution.createMany({
          data: leadAttributionData,
          skipDuplicates: true,
        });
      }

      if (financialInfoData.length > 0) {
        await tx.hSEdumateContactsFinancialInfo.createMany({
          data: financialInfoData,
          skipDuplicates: true,
        });
      }

      if (loanPreferenceData.length > 0) {
        await tx.hSEdumateContactsLoanPreferences.createMany({
          data: loanPreferenceData,
          skipDuplicates: true,
        });
      }

      if (applicationJourneyData.length > 0) {
        await tx.hSEdumateContactsApplicationJourney.createMany({
          data: applicationJourneyData,
          skipDuplicates: true,
        });
      }

      if (systemTrackingData.length > 0) {
        await tx.hSEdumateContactsSystemTracking.createMany({
          data: systemTrackingData,
          skipDuplicates: true,
        });
      }

      const insertedContactIds = Array.from(emailToIdMap.values());

      return {
        count: insertedContactIds.length,
        insertedContactIds,
      };
    },
    {
      timeout: 120000,
    }
  );
}

export const updateEdumateContactsHubspotTracking = async (
  hubspotResults: HubspotResult[],
  userId: number
) => {
  await prisma.$transaction(async (tx) => {
    for (const hs of hubspotResults) {
      const { email, hs_object_id, hs_createdate, hs_lastmodifieddate } =
        hs.properties;

      if (!email) continue;

      const contact = await tx.hSEdumateContacts.findFirst({
        where: {
          personal_information: {
            email,
          },
        },
        select: { id: true },
      });

      if (contact) {
        await tx.hSEdumateContacts.update({
          where: { id: contact.id },
          data: {
            hs_object_id: hs_object_id ?? hs.id,
            hs_updated_by_user_id: userId,
            hs_createdate: hs_createdate ? new Date(hs_createdate) : undefined,
            hs_lastmodifieddate: hs_lastmodifieddate
              ? new Date(hs_lastmodifieddate)
              : undefined,
          },
        });
      }
    }
  });
};
