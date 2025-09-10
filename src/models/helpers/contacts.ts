import prisma from "../../config/prisma";
import { admissionStatusMap, courseTypeMap, currentEducationLevelMap, genderMap, preferredStudyDestinationMap, targetDegreeLevelMap } from "../../types/contact.types";

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


// 3. Create academic profile
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

// 5. Create application journey
export const createEdumateApplicationJourney = async (
  tx: any,
  contactId: number,
  applicationStatus: string
) => {
  const journey = await tx.edumateContactsApplicationJourney.create({
    data: {
      contact_id: contactId,
      current_status_disposition: mapApplicationStatusToDisposition(applicationStatus),
      first_contact_date: new Date(),
      last_contact_date: new Date(),
      created_at: new Date(),
    },
  });

  return journey;
};

// 6. Create lead attribution
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

// 8. Create system tracking
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

// Helper function to map application status
const mapApplicationStatusToDisposition = (status: string) => {
  // Map your existing status values to the new enum values
  const statusMapping: { [key: string]: string } = {
    'PRE_APPROVED': 'ACTIVE',
    'APPROVED': 'COMPLETED', 
    'REJECTED': 'INACTIVE',
    'PENDING': 'ACTIVE',
    'IN_PROGRESS': 'ACTIVE',
    // Add more mappings based on your enum values
  };
  
  return statusMapping[status] || 'ACTIVE';
};

// Updated validation function for EdumateContacts
// export const validateEdumateContactPayload = async (
//   req: RequestWithPayload<LoginPayload>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, first_name } = req.body;

//     if (!first_name) {
//       return sendResponse(res, 400, "First name is required");
//     }

//     if (!email) {
//       return sendResponse(res, 400, "Email is required");
//     }

//     const existingEmail = await hubspotService.fetchLeadByEmail(email);
//     if (existingEmail.total > 0 || existingEmail.results?.length > 0) {
//       return sendResponse(res, 400, "Email already exists in HubSpot");
//     }

//     const existingContact = await getEdumateContactByEmail(email);
//     if (existingContact) {
//       return sendResponse(res, 400, "Contact already exists");
//     }

//     next();
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 500, "Error while validating contact data");
//   }
// };

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

