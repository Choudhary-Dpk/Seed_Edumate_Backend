import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { admissionStatusMap, ContactsLead, courseTypeMap, currentEducationLevelMap, genderMap, preferredStudyDestinationMap, targetDegreeLevelMap } from "../../types/contact.types";
import { HubspotResult } from "../../types";

export const createEdumatePersonalInformation = async (
  tx: any,
  contactId: number,
  data: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: string;
  }
) => {
  const personalInfo = await tx.edumateContactsPersonalInformation.create({
    data: {
      contact_id: contactId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: data.phone_number,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      gender: data.gender ? genderMap[data.gender] : null,
      created_at: new Date(),
    },
  });

  return personalInfo;
};

export const createEdumateAcademicProfile = async (
  tx: any,
  contactId: number,
  data: {
    admission_status?: string;
    current_education_level?: string;
    target_degree_level?: string;
    preferred_study_destination?: string;
    intake_year?: string;
    intake_month?: string;
  }
) => {
  const academicProfile = await tx.edumateContactsAcademicProfile.create({
    data: {
      contact_id: contactId,
      admission_status: data?.admission_status 
    ? admissionStatusMap[data.admission_status] 
    : null,

  current_education_level: data?.current_education_level? currentEducationLevelMap[data?.current_education_level]:null, // if you also have a map, handle the same way

  target_degree_level: data?.target_degree_level 
    ? targetDegreeLevelMap[data.target_degree_level] 
    : null,

  preferred_study_destination: data?.preferred_study_destination
    ? preferredStudyDestinationMap[data.preferred_study_destination] 
    : null,
      intake_year: data.intake_year,
      intake_month: data.intake_month,
      created_at: new Date(),
    },
  });

  return academicProfile;
};

export const createEdumateLeadAttribution = async (
  tx: any,
  contactId: number,
  partnerName: string
) => {
  const leadAttribution = await tx.edumateContactsLeadAttribution.create({
    data: {
      contact_id: contactId,
      b2b_partner_name: partnerName,
      created_at: new Date(),
    },
  });

  return leadAttribution;
};

export const createEdumateSystemTracking = async (
  tx: any,
  contactId: number,
  userId: number
) => {
  return tx.edumateContactsSystemTracking.create({
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
  const contact = await prisma.edumateContact.findFirst({
    include: {
      personal_information: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          is_deleted: true,
        }
      }
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
  const contact = await prisma.edumateContact.findFirst({
    include: {
      personal_information: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          is_deleted: true,
        }
      }
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
  courseType?: string,
  hubspotId?: number,
  hsCreatedBy?: number
) => {
  const contact = await tx.edumateContact.create({
    data: {
      course_type: courseType ? courseTypeMap[courseType]:null,
      hs_object_id: hubspotId,
      hs_created_by_user_id: hsCreatedBy,
      created_at: new Date(),
    },
  });

  return contact;
};

export const getContactLeadById = async (leadId: number) => {
  const lead = await prisma.edumateContactsPersonalInformation.findFirst({
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
  return prisma.edumateContact.findUnique({
    select:{
      id:true,
      hs_object_id:true
    },
    where: { id: leadId },
  });
};

export const deleteContactsLoan = async (leadId: number, userId: number) => {
  await prisma.$transaction(async (tx) => {
    await tx.edumateContact.update({
      where: { id: leadId },
      data: {
        is_deleted: true,
        updated_at: new Date(),
        deleted_by_id: userId,
      },
    });

    await tx.edumateContactsPersonalInformation.updateMany({
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
  const contactLeads = await prisma.edumateContact.findFirst({
    where: {
      id: leadId,
    },
    include: {
      personal_information: true,
      academic_profile: true,
      financial_Info: true,
      leads:true
    },
  });

  return contactLeads;
};

export const updateEdumateContact = async (
  tx: any,
  contactId: number,
  courseType?: string
) => {
  const contact = await tx.edumateContact.update({
    where: { id: contactId },
    data: {
      course_type: courseType ? courseTypeMap[courseType] : null,
      updated_at: new Date(),
    },
  });

  return contact;
};

export const updateEdumatePersonalInformation = async (
  tx: any,
  contactId: number,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: string;
  }
) => {
  const personalInfo = await tx.edumateContactsPersonalInformation.update({
    where: { contact_id: contactId },
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: data.phone_number,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      gender: data.gender ? genderMap[data.gender] : null,
      updated_at: new Date(),
    },
  });

  return personalInfo;
};

export const updateEdumateAcademicProfile = async (
  tx: any,
  contactId: number,
  data: {
    admission_status?: string;
    current_education_level?: string;
    target_degree_level?: string;
    preferred_study_destination?: string;
    intake_year?: string;
    intake_month?: string;
  }
) => {
  const academicProfile = await tx.edumateContactsAcademicProfile.update({
    where: { contact_id: contactId },
    data: {
      admission_status: data?.admission_status
        ? admissionStatusMap[data.admission_status]
        : null,

      current_education_level: data?.current_education_level
        ? currentEducationLevelMap[data.current_education_level]
        : null,

      target_degree_level: data?.target_degree_level
        ? targetDegreeLevelMap[data.target_degree_level]
        : null,

      preferred_study_destination: data?.preferred_study_destination
        ? preferredStudyDestinationMap[data.preferred_study_destination]
        : null,

      intake_year: data.intake_year,
      intake_month: data.intake_month,
      updated_at: new Date(),
    },
  });

  return academicProfile;
};

export const updateEdumateLeadAttribution = async (
  tx: any,
  contactId: number,
  partnerName?: string
) => {
  if (!partnerName) return null;

  const leadAttribution = await tx.edumateContactsLeadAttribution.update({
    where: { contact_id: contactId },
    data: {
      b2b_partner_name: partnerName,
      updated_at: new Date(),
    },
  });

  return leadAttribution;
};

export const fetchContactsLeadList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null
) => {
  const where: Prisma.EdumateContactWhereInput = {
    is_deleted: false,
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
    prisma.edumateContact.findMany({
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
      },
    }),
    prisma.edumateContact.count({ where }),
  ]);

  return { rows, count };
};

export const findContacts = async (batch: any[]) => {
  const contacts = await prisma.edumateContactsPersonalInformation.findMany({
    where: {
      OR: batch.map((v) => ({
        OR: [
          { email: v.email },
          { phone_number: v.phoneNumber },
        ],
      })),
    },
    select: {
      email: true,
      phone_number: true,
    },
  });

  return contacts;
};

export const createCSVContacts = async (rows: ContactsLead[]) => {
  debugger;
  return await prisma.$transaction(async (tx) => {
    // 1. Insert into main table (contacts)
    const createdContacts = await Promise.all(
      rows.map((row) =>
        tx.edumateContact.create({
          data: {
            course_type: row.courseType ? courseTypeMap[row.courseType] : null,
            hs_object_id: null,
          },
        })
      )
    );

    // Now we have a list of parent contacts with their IDs
    // Match them back to the rows in order (1-to-1)
    const contactsWithIds = rows.map((row, index) => ({
      ...row,
      contactId: createdContacts[index].id,
    }));

    // 2. Insert into child tables
    await tx.edumateContactsPersonalInformation.createMany({
      data: contactsWithIds.map((row) => ({
        contact_id: row.contactId,
        first_name: row.firstName,
        last_name: row.lastName || null,
        email: row.email || null,
        phone_number: row.phone || null,
      })),
      skipDuplicates: true,
    });

const academicProfilesData = contactsWithIds.map((row) => ({
  contact_id: row.contactId,
  current_education_level: row.educationLevel
    ? currentEducationLevelMap[row.educationLevel]
    : null,
  admission_status: row.admissionStatus
    ? admissionStatusMap[row.admissionStatus]
    : null,
  target_degree_level: row.targetDegreeLevel
    ? targetDegreeLevelMap[row.targetDegreeLevel]
    : null,
  preferred_study_destination: row.studyDestination
    ? preferredStudyDestinationMap[row.studyDestination]
    : null,
  intake_month: row.intakeMonth || null,
  intake_year: row.intakeYear || null,
}));

console.log("academicProfilesData =>", academicProfilesData);

await tx.edumateContactsAcademicProfile.createMany({
  data: academicProfilesData,
  skipDuplicates: true,
});


    await tx.edumateContactsLeadAttribution.createMany({
      data: contactsWithIds.map((row) => ({
        contact_id: row.contactId,
        b2b_partner_name: row.partnerName || null,
      })),
      skipDuplicates: true,
    });

    await tx.edumateContactsSystemTracking.createMany({
      data: contactsWithIds.map((row) => ({
        created_by: row.userId,
        contact_id: row.contactId,
        created_date: new Date(),
      })),
      skipDuplicates: true,
    });

    return {
      count: createdContacts.length,
      records: createdContacts,
    };
  });
};


export const updateContactsSystemTracking = async (hubspotResults: HubspotResult[]) => {
  await prisma.$transaction(async (tx) => {
    for (const hs of hubspotResults) {
      const { email, hs_object_id, hs_createdate, hs_lastmodifieddate } = hs.properties;

      if (!email) continue;

      const contact = await tx.edumateContact.findFirst({
        where: {
          personal_information: {
            email,
          },
        },
        select: { id: true },
      });

      if (contact) {
        await tx.edumateContact.update({
          where: { id: contact.id },
          data: {
            hs_object_id: hs_object_id ?? hs.id,
            hs_createdate: hs_createdate ? new Date(hs_createdate) : undefined,
            hs_lastmodifieddate: hs_lastmodifieddate ? new Date(hs_lastmodifieddate) : undefined,
          },
        });
      }
    }
  });
};
