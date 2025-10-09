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
import { transformRow } from "../../utils/helper";
import { getPartnerIdByUserId } from "./partners.helper";
import { AnyNsRecord } from "dns";

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

export const createEdumateSystemTracking = async (
  tx: any,
  contactId: number,
  userId: number
) => {
  return tx.hSEdumateContactsSystemTracking.create({
    data: {
      contact_id: contactId,
      created_by: userId,
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
  hubspotId?: number,
  hsCreatedBy?: number,
  partnerId?: number
) => {
  const contact = await tx.hSEdumateContacts.create({
    data: {
      ...mainData,
      hs_object_id: hubspotId,
      hs_created_by_user_id: hsCreatedBy,
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
        deleted_by_id: userId,
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
      leads: true,
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
  if (!leadData.b2b_partner_name) return null;

  const leadAttribution = await tx.hSEdumateContactsLeadAttribution.update({
    where: { contact_id: contactId },
    data: {
      updated_at: new Date(),
      ...leadData,
    },
  });

  return leadAttribution;
};

export const fetchContactsLeadList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  partnerId: number
) => {
  const where: Prisma.HSEdumateContactsWhereInput = {
    is_deleted: false,
    b2b_partner_id: partnerId,
    personal_information: search
      ? {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone_number: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
  };

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
        leads: true,
        loan_preference: true,
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

const tableMappings = {
  hSEdumateContactsPersonalInformation: {
    map: {
      first_name: (row: ContactsLead) => row.firstName,
      last_name: (row: ContactsLead) => row.lastName ?? null,
      email: (row: ContactsLead) => row.email ?? null,
      phone_number: (row: ContactsLead) => row.phone ?? null,
      gender: (row: ContactsLead) =>
        row.gender ? genderMap[row.gender] : null,
      date_of_birth: (row: ContactsLead) => row.dateOfBirth ?? null,
    },
  },
  hSEdumateContactsAcademicProfiles: {
    map: {
      current_education_level: (row: ContactsLead) =>
        row.educationLevel
          ? currentEducationLevelMap[row.educationLevel]
          : null,
      admission_status: (row: ContactsLead) =>
        row.admissionStatus ? admissionStatusMap[row.admissionStatus] : null,
      target_degree_level: (row: ContactsLead) =>
        row.targetDegreeLevel
          ? targetDegreeLevelMap[row.targetDegreeLevel]
          : null,
      preferred_study_destination: (row: ContactsLead) =>
        row.studyDestination
          ? preferredStudyDestinationMap[row.studyDestination]
          : null,
      intake_month: (row: ContactsLead) => row.intakeMonth ?? null,
      intake_year: (row: ContactsLead) => row.intakeYear ?? null,
    },
  },
  hSEdumateContactsLeadAttribution: {
    map: {
      b2b_partner_name: (row: ContactsLead) => row.partnerName ?? null,
    },
  },
  hSEdumateContactsSystemTracking: {
    map: {
      created_by: (row: ContactsLead) => row.userId,
      created_date: () => new Date(),
    },
  },
};

export const createCSVContacts = async (
  rows: ContactsLead[],
  userId: number,
  hubspotResults?: HubspotResult[]
) => {
  const partnerId = await getPartnerIdByUserId(userId);

  return await prisma.$transaction(async (tx) => {
    // 1. Insert into main table
    const createdContacts = await Promise.all(
      rows.map((row, index) => {
        // Get corresponding HubSpot result by email
        const hsResult = hubspotResults?.find(
          (hs) => hs.properties?.email === row.email
        );

        return tx.hSEdumateContacts.create({
          data: {
            course_type: row.courseType ? courseTypeMap[row.courseType] : null,
            // ↓ ADD HUBSPOT DATA HERE
            hs_object_id:
              hsResult?.properties?.hs_object_id ?? hsResult?.id ?? null,
            hs_created_by_user_id: userId,
            hs_updated_by_user_id: userId,
            hs_createdate: hsResult?.properties?.hs_createdate
              ? new Date(hsResult.properties.hs_createdate)
              : undefined,
            hs_lastmodifieddate: hsResult?.properties?.hs_lastmodifieddate
              ? new Date(hsResult.properties.hs_lastmodifieddate)
              : undefined,
            b2b_partner_id: partnerId!.b2b_id,
          },
          select: { id: true },
        });
      })
    );

    // 2. Attach IDs back to rows
    const contactsWithIds = rows.map((row, i) => ({
      ...row,
      contactId: createdContacts[i].id,
    }));

    // 3. Generic child-table inserts
    await Promise.all(
      Object.entries(tableMappings).map(([tableName, { map }]) =>
        (tx[tableName as keyof typeof tx] as any).createMany({
          data: contactsWithIds.map((row) => transformRow(row, map)),
          skipDuplicates: true,
        })
      )
    );

    return {
      count: createdContacts.length,
      records: createdContacts,
    };
  });
};

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
