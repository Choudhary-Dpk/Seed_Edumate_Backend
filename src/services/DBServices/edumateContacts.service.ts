// ==================== HELPER FUNCTIONS ====================

import prisma from "../../config/prisma";
import {
  mapAllFields,
} from "../../mappers/edumateContact/mapping";
import { CategorizedContactData } from "../../types/contact.types";
import logger from "../../utils/logger";

// ==================== STEP 2: CATEGORIZATION FUNCTION ====================

/**
 * Categorizes mapped fields into their respective tables
 */
export const categorizeByTable = (mappedFields: Record<string, any>) => {
  const categorized: CategorizedContactData = {};

  // Main Contact Fields
  const mainContactFields = [
    "email",
    "deleted_by_id",
    "b2b_partner_id",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
    "base_currency",
    "study_destination_currency",
    "user_selected_currency",
    "course_type",
    "co_applicant_1_email",
    "co_applicant_1_mobile_number",
    "is_deleted",
  ];

  // Personal Information Fields
  const personalInfoFields = [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "date_of_birth",
    "gender",
    "nationality",
    "current_address",
    "city_current_address",
    "state_current_address",
    "country_current_address",
    "pincode_current_address",
    "permanent_address",
    "city_permanent_address",
    "state_permanent_address",
    "country_permanent_address",
    "pincode_permanent_address",
  ];

  // Academic Profile Fields
  const academicProfileFields = [
    "admission_status",
    "current_education_level",
    "current_institution",
    "current_course_major",
    "current_cgpa_percentage",
    "current_graduation_year",
    "course_duration_months",
    "cat_score",
    "gre_score",
    "gmat_score",
    "toefl_score",
    "ielts_score",
    "sat_score",
    "duolingo_score",
    "nmat_score",
    "xat_score",
    "other_test_scores",
    "target_degree_level",
    "target_course_major",
    "preferred_study_destination",
    "target_universities",
    "intended_start_term",
    "intended_start_date",
    "intake_month",
    "intake_year",
  ];

  // Application Journey Fields
  const applicationJourneyFields = [
    "assigned_counselor",
    "counselor_notes",
    "current_status_disposition",
    "current_status_disposition_reason",
    "priority_level",
    "first_contact_date",
    "last_contact_date",
    "follow_up_date",
    "next_follow_up_date",
  ];

  // Financial Info Fields
  const financialInfoFields = [
    "annual_family_income",
    "currency",
    "co_applicant_1_name",
    "co_applicant_1_income",
    "co_applicant_1_occupation",
    "co_applicant_1_relationship",
    "co_applicant_2_name",
    "co_applicant_2_income",
    "co_applicant_2_occupation",
    "co_applicant_2_relationship",
    "co_applicant_3_name",
    "co_applicant_3_income",
    "co_applicant_3_occupation",
    "co_applicant_3_relationship",
    "collateral_available",
    "collateral_type",
    "collateral_value",
    "collateral_2_available",
    "collateral_2_type",
    "collateral_2_value",
    "living_expenses",
    "other_expenses",
    "total_course_cost",
    "tuition_fee",
    "loan_amount_required",
    "scholarship_amount",
    "self_funding_amount",
  ];

  // Lead Attribution Fields
  const leadAttributionFields = [
    "lead_source",
    "lead_source_detail",
    "lead_quality_score",
    "lead_reference_code",
    "b2b_partner_name",
    "partner_commission_applicable",
    "referral_person_name",
    "referral_person_contact",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  // Loan Preferences Fields
  const loanPreferencesFields = [
    "loan_type_preference",
    "preferred_lenders",
    "repayment_type_preference",
  ];

  // System Tracking Fields
  const systemTrackingFields = [
    "created_by",
    "created_date",
    "last_modified_by",
    "last_modified_date",
    "data_source",
    "student_record_status",
    "tags",
    "gdpr_consent",
    "marketing_consent",
  ];

  // Categorize main contact
  const mainContact: Record<string, any> = {};
  for (const field of mainContactFields) {
    if (field in mappedFields) {
      mainContact[field] = mappedFields[field];
    }
  }
  if (Object.keys(mainContact).length > 0) {
    categorized.mainContact = mainContact;
  }

  // Categorize personal information
  const personalInfo: Record<string, any> = {};
  for (const field of personalInfoFields) {
    if (field in mappedFields) {
      personalInfo[field] = mappedFields[field];
    }
  }
  if (Object.keys(personalInfo).length > 0) {
    categorized.personalInformation = personalInfo;
  }

  // Categorize academic profile
  const academicProfile: Record<string, any> = {};
  for (const field of academicProfileFields) {
    if (field in mappedFields) {
      academicProfile[field] = mappedFields[field];
    }
  }
  if (Object.keys(academicProfile).length > 0) {
    categorized.academicProfile = academicProfile;
  }

  // Categorize application journey
  const applicationJourney: Record<string, any> = {};
  for (const field of applicationJourneyFields) {
    if (field in mappedFields) {
      applicationJourney[field] = mappedFields[field];
    }
  }
  if (Object.keys(applicationJourney).length > 0) {
    categorized.applicationJourney = applicationJourney;
  }

  // Categorize financial info
  const financialInfo: Record<string, any> = {};
  for (const field of financialInfoFields) {
    if (field in mappedFields) {
      financialInfo[field] = mappedFields[field];
    }
  }
  if (Object.keys(financialInfo).length > 0) {
    categorized.financialInfo = financialInfo;
  }

  // Categorize lead attribution
  const leadAttribution: Record<string, any> = {};
  for (const field of leadAttributionFields) {
    if (field in mappedFields) {
      leadAttribution[field] = mappedFields[field];
    }
  }
  if (Object.keys(leadAttribution).length > 0) {
    categorized.leadAttribution = leadAttribution;
  }

  // Categorize loan preferences
  const loanPreferences: Record<string, any> = {};
  for (const field of loanPreferencesFields) {
    if (field in mappedFields) {
      loanPreferences[field] = mappedFields[field];
    }
  }
  if (Object.keys(loanPreferences).length > 0) {
    categorized.loanPreferences = loanPreferences;
  }

  // Categorize system tracking
  const systemTracking: Record<string, any> = {};
  for (const field of systemTrackingFields) {
    if (field in mappedFields) {
      systemTracking[field] = mappedFields[field];
    }
  }
  if (Object.keys(systemTracking).length > 0) {
    categorized.systemTracking = systemTracking;
  }

  return categorized;
};

/**
 * Filters object to only include specified fields
 */
const filterFields = (data: Record<string, any>, fields: string[]) => {
  const filtered: Record<string, any> = {};

  for (const field of fields) {
    if (field in data && data[field] !== undefined && data[field] !== null) {
      filtered[field] = data[field];
    }
  }

  return Object.keys(filtered).length > 0 ? filtered : null;
};

// ==================== SERVICE FUNCTIONS ====================
/**
 * Create a contact
 */
export const createContact = async (input: Record<string, any>) => {
  try {
    let contactId;
    const mappedFields = await mapAllFields(input);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized.academicProfile);

    const result = await prisma.$transaction(async (tx: any) => {
      const contact = await tx.hSEdumateContacts.create({
        data: categorized.mainContact || ({} as any),
      });

      contactId = contact.id;

      if (categorized.personalInformation) {
        await tx.hSEdumateContactsPersonalInformation.create({
          data: {
            contact_id: contactId,
            ...categorized.personalInformation,
          } as any,
        });
      }

      if (categorized.academicProfile) {
        await tx.hSEdumateContactsAcademicProfiles.create({
          data: {
            contact_id: contactId,
            ...categorized.academicProfile,
            preferred_study_destination:
              categorized.academicProfile.preferred_study_destination,
          } as any,
        });
      }

      if (categorized.applicationJourney) {
        await tx.hSEdumateContactsApplicationJourney.create({
          data: {
            contact_id: contactId,
            ...categorized.applicationJourney,
          } as any,
        });
      }

      if (categorized.financialInfo) {
        await tx.hSEdumateContactsFinancialInfo.create({
          data: {
            contact_id: contactId,
            ...categorized.financialInfo,
          } as any,
        });
      }

      if (categorized.leadAttribution) {
        await tx.hSEdumateContactsLeadAttribution.create({
          data: {
            contact_id: contactId,
            ...categorized.leadAttribution,
          } as any,
        });
      }

      if (categorized.loanPreferences) {
        await tx.hSEdumateContactsLoanPreferences.create({
          data: {
            contact_id: contactId,
            ...categorized.loanPreferences,
          } as any,
        });
      }

      if (categorized.systemTracking) {
        await tx.hSEdumateContactsSystemTracking.create({
          data: {
            contact_id: contactId,
            ...categorized.systemTracking,
          } as any,
        });
      }

      return await tx.hSEdumateContacts.findUnique({
        where: { id: contactId },
        include: {
          personal_information: true,
          academic_profile: true,
          application_journey: true,
          financial_Info: true,
          lead_attribution: true,
          loan_preference: true,
          system_tracking: true,
        },
      });
    });

    logger.info("Contact created successfully", {
      contactId,
      email: input.email,
    });

    return { success: true, data: result, id: contactId };
  } catch (error: any) {
    logger.error("Error creating contact", {
      email: input.email,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
};

/**
 * Update a contact
 */
export const updateContact = async (
  contactId: number,
  input: Record<string, any>
) => {
  try {
    const mappedFields = await mapAllFields(input);
    const categorized = categorizeByTable(mappedFields);

    const result = await prisma.$transaction(async (tx: any) => {
      if (categorized.mainContact) {
        await tx.hSEdumateContacts.update({
          where: { id: contactId },
          data: categorized.mainContact as any,
        });
      }

      if (categorized.personalInformation) {
        await tx.hSEdumateContactsPersonalInformation.upsert({
          where: { contact_id: contactId },
          create: {
            contact_id: contactId,
            ...categorized.personalInformation,
          } as any,
          update: categorized.personalInformation as any,
        });
      }

      if (categorized.academicProfile) {
        await tx.hSEdumateContactsAcademicProfiles.upsert({
          where: { contact_id: contactId },
          create: {
            contact_id: contactId,
            ...categorized.academicProfile,
          } as any,
          update: categorized.academicProfile as any,
        });
      }

      if (categorized.applicationJourney) {
        await tx.hSEdumateContactsApplicationJourney.upsert({
          where: { contact_id: contactId },
          create: {
            contact_id: contactId,
            ...categorized.applicationJourney,
          } as any,
          update: categorized.applicationJourney as any,
        });
      }

      if (categorized.financialInfo) {
        await tx.hSEdumateContactsFinancialInfo.upsert({
          where: { contact_id: contactId },
          create: {
            contact_id: contactId,
            ...categorized.financialInfo,
          } as any,
          update: categorized.financialInfo as any,
        });
      }

      if (categorized.leadAttribution) {
        await tx.hSEdumateContactsLeadAttribution.upsert({
          where: { contact_id: contactId },
          create: {
            contact_id: contactId,
            ...categorized.leadAttribution,
          } as any,
          update: categorized.leadAttribution as any,
        });
      }

      if (categorized.loanPreferences) {
        await tx.hSEdumateContactsLoanPreferences.upsert({
          where: { contact_id: contactId },
          create: {
            contact_id: contactId,
            ...categorized.loanPreferences,
          } as any,
          update: categorized.loanPreferences as any,
        });
      }

      if (categorized.systemTracking) {
        await tx.hSEdumateContactsSystemTracking.upsert({
          where: { contact_id: contactId },
          create: {
            contact_id: contactId,
            ...categorized.systemTracking,
          } as any,
          update: categorized.systemTracking as any,
        });
      }

      return await tx.hSEdumateContacts.findUnique({
        where: { id: contactId },
        include: {
          personal_information: true,
          academic_profile: true,
          application_journey: true,
          financial_Info: true,
          lead_attribution: true,
          loan_preference: true,
          system_tracking: true,
        },
      });
    });

    logger.info("Contact updated successfully", {
      contactId,
      email: input.email,
    });

    return { success: true, data: result, id: contactId };
  } catch (error: any) {
    logger.error("Error updating contact", {
      contactId,
      email: input.email,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
};

/**
 * Soft delete a contact
 */
export const deleteContact = async (contactId: number, deletedById: number) => {
  try {
    const result = await prisma.hSEdumateContacts.update({
      where: { id: contactId },
      data: {
        is_deleted: true,
        deleted_by_id: deletedById,
      },
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error deleting contact:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get contact by ID with all relations
 */
export const getContactById = async (contactId: number) => {
  try {
    const contact = await prisma.hSEdumateContacts.findUnique({
      where: { id: contactId },
      include: {
        personal_information: true,
        academic_profile: true,
        application_journey: true,
        financial_Info: true,
        lead_attribution: true,
        loan_preference: true,
        system_tracking: true,
      },
    });

    return { success: true, data: contact };
  } catch (error: any) {
    console.error("Error fetching contact:", error);
    return { success: false, error: error.message };
  }
};
