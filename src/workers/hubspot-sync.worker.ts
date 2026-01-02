import prisma from "../config/prisma";
import logger from "../utils/logger";
import {
  createContactsLoanLeads,
  updateContactsLoanLead,
  deleteHubspotByContactsLeadId,
} from "../services/hubspot.service";
import { mapEnumValue } from "../constants/enumMappingDbToHs";
import { getPartnerById } from "../models/helpers/partners.helper";

const BATCH_SIZE = 95; // HubSpot batch limit
const POLL_INTERVAL = 60000; // 5 seconds
const MAX_RETRIES = 5;

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down workers gracefully...");
  process.exit(0);
});

/**
 * Main worker function
 */
export async function startHubSpotSyncWorker() {
  logger.info("🚀 HubSpot Sync Worker started");
  // Continuous polling
  while (true) {
    try {
      await processOutboxEntries();

      // Wait before next poll
      await sleep(POLL_INTERVAL);
    } catch (error) {
      logger.error("Worker error:", error);
      await sleep(POLL_INTERVAL * 2); // Wait longer on error
    }
  }
}

/**
 * Process pending outbox entries
 */
async function processOutboxEntries() {
  // Fetch pending entries
  const pendingEntries = await prisma.syncOutbox.findMany({
    where: {
      entity_type: "HSEdumateContacts",
      status: "PENDING",
      attempts: {
        lt: MAX_RETRIES,
      },
    },
    orderBy: [
      { priority: "asc" }, // Higher priority first
      { created_at: "asc" }, // Older first
    ],
    take: BATCH_SIZE,
  });

  if (pendingEntries.length === 0) {
    return; // Nothing to process
  }

  logger.info(`Processing ${pendingEntries.length} pending outbox entries`);

  // Group by batch_id for efficient processing
  const batchGroups = groupByBatchId(pendingEntries);

  for (const [batchId, entries] of Object.entries(batchGroups)) {
    if (batchId === "null") {
      // Single entries (not part of bulk upload)
      for (const entry of entries) {
        await processSingleEntry(entry);
      }
    } else {
      // Batch entries (from CSV upload)
      await processBatchEntries(entries);
    }
  }
}

/**
 * Process single outbox entry
 */
async function processSingleEntry(entry: any) {
  try {
    // Mark as processing
    await prisma.syncOutbox.update({
      where: { id: entry.id },
      data: {
        status: "PROCESSING",
        processing_at: new Date(),
        attempts: { increment: 1 },
      },
    });

    const { entity_type, operation, payload } = entry;

    // Only process main contact table (normalized tables handled separately)
    if (entity_type !== "HSEdumateContacts") {
      await markAsCompleted(entry.id);
      return;
    }

    let hubspotId: string | undefined;

    switch (operation) {
      case "CREATE":
        hubspotId = await handleCreate(payload, entry.entity_id);
        break;
      case "UPDATE":
        hubspotId = await handleUpdate(payload, entry.entity_id);
        break;
      case "DELETE":
        await handleDelete(payload?.hs_object_id);
        break;
    }

    // Mark as completed
    await prisma.syncOutbox.update({
      where: { id: entry.id },
      data: {
        status: "COMPLETED",
        hubspot_id: hubspotId,
        processed_at: new Date(),
        last_error: null,
      },
    });

    // Update contact table with HubSpot ID
    if (
      hubspotId &&
      (operation === "CREATE" ||
        (!entry.hs_object_id && operation === "UPDATE"))
    ) {
      await prisma.hSEdumateContacts.update({
        where: { id: entry.entity_id },
        data: { hs_object_id: hubspotId },
      });
    }

    logger.debug(` Synced: ${operation} ${entity_type}#${entry.entity_id}`);
  } catch (error: any) {
    await handleSyncError(entry.id, error);
  }
}

/**
 * Process batch entries (CSV upload) - with complete data
 */
async function processBatchEntries(entries: any[]) {
  try {
    logger.info(`Processing batch of ${entries.length} entries`);

    // Mark all as processing
    const entryIds = entries.map((e) => e.id);
    await prisma.syncOutbox.updateMany({
      where: { id: { in: entryIds } },
      data: {
        status: "PROCESSING",
        processing_at: new Date(),
        attempts: { increment: 1 },
      },
    });

    //  Fetch complete data for all contacts in batch
    const contactIds = entries.map((e) => e.entity_id);

    const completeContactsData = await prisma.hSEdumateContacts.findMany({
      where: { id: { in: contactIds } },
      include: {
        personal_information: true,
        academic_profile: true,
        lead_attribution: true,
        financial_Info: true,
        loan_preference: true,
        application_journey: true,
        system_tracking: true,
      },
    });

    // Fetch B2B Partner's hs_object_id if b2b_partner_id exists
    let b2bPartnerHsObjectId: string | null = null;

    if (completeContactsData[0].b2b_partner_id) {
      const b2b_partner_id = completeContactsData[0].b2b_partner_id;
      const b2bPartner = await getPartnerById(b2b_partner_id);

      if (b2bPartner?.hs_object_id) {
        b2bPartnerHsObjectId = b2bPartner.hs_object_id;
        logger.info(" Found B2B Partner for association", {
          b2bPartnerId: b2b_partner_id,
          hsObjectId: b2bPartnerHsObjectId,
        });
      } else {
        logger.warn("⚠️ B2B Partner found but no hs_object_id", {
          b2bPartnerId: b2b_partner_id,
        });
      }
    }

    // Transform all to HubSpot format
    const hubspotPayloads = completeContactsData.map((contact: any) =>
      transformToHubSpotFormat(contact)
    );

    // Batch create in HubSpot
    const hubspotResults = await createContactsLoanLeads(
      hubspotPayloads,
      b2bPartnerHsObjectId
    );

    if (!hubspotResults || hubspotResults.length === 0) {
      throw new Error("HubSpot batch create returned empty results");
    }

    // Update outbox entries with results
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const hsResult = hubspotResults[i];

      if (hsResult && hsResult.id) {
        await prisma.syncOutbox.update({
          where: { id: entry.id },
          data: {
            status: "COMPLETED",
            hubspot_id: hsResult.id,
            processed_at: new Date(),
            last_error: null,
          },
        });

        // Update contact with HubSpot ID
        await prisma.hSEdumateContacts.update({
          where: { id: entry.entity_id },
          data: { hs_object_id: hsResult.id },
        });
      } else {
        await markAsFailed(entry.id, "HubSpot returned no ID");
      }
    }

    logger.info(` Batch of ${entries.length} synced successfully`);
  } catch (error: any) {
    logger.error("Batch sync error:", error);

    // Mark all as failed
    const entryIds = entries.map((e) => e.id);
    await prisma.syncOutbox.updateMany({
      where: { id: { in: entryIds } },
      data: {
        status: "FAILED",
        last_error: error.message,
      },
    });
  }
}

/**
 * Handle CREATE operation
 */
async function handleCreate(payload: any, entityId: number): Promise<string> {
  // Fetch complete contact data from all normalized tables
  const completeContactData = await fetchCompleteContactData(entityId);

  if (!completeContactData) {
    throw new Error(`Contact not found: ${entityId}`);
  }

  // Fetch B2B Partner's hs_object_id if b2b_partner_id exists
  let b2bPartnerHsObjectId: string | null = null;

  if (completeContactData.b2b_partner_id) {
    const b2bPartner = await getPartnerById(completeContactData.b2b_partner_id);

    if (b2bPartner?.hs_object_id) {
      b2bPartnerHsObjectId = b2bPartner.hs_object_id;
      logger.info(" Found B2B Partner for association", {
        b2bPartnerId: completeContactData.b2b_partner_id,
        hsObjectId: b2bPartnerHsObjectId,
      });
    } else {
      logger.warn("⚠️ B2B Partner found but no hs_object_id", {
        b2bPartnerId: completeContactData.b2b_partner_id,
      });
    }
  }

  // Transform to HubSpot format with ALL fields
  const hubspotPayload = transformToHubSpotFormat(completeContactData);

  const hubspotResults = await createContactsLoanLeads(
    [hubspotPayload],
    b2bPartnerHsObjectId
  );

  if (!hubspotResults || hubspotResults.length === 0) {
    throw new Error("HubSpot create returned empty result");
  }

  return hubspotResults[0].id;
}

/**
 * Handle UPDATE operation
 * If hs_object_id doesn't exist, create instead of update
 */
async function handleUpdate(
  payload: any,
  entityId: number
): Promise<string | undefined> {
  // Fetch existing HubSpot ID
  const contact = await prisma.hSEdumateContacts.findUnique({
    where: { id: entityId },
    select: { hs_object_id: true },
  });

  // If no HubSpot ID exists, CREATE instead of UPDATE
  if (!contact?.hs_object_id) {
    logger.info(
      `No HubSpot ID found for contact ${entityId}, creating new record instead of updating`
    );
    return await handleCreate(payload, entityId);
  }

  // HubSpot ID exists, proceed with UPDATE
  logger.info(
    `Updating existing HubSpot contact ${contact.hs_object_id} for entity ${entityId}`
  );

  // Fetch complete latest contact data from all tables
  const completeContactData = await fetchCompleteContactData(entityId);

  if (!completeContactData) {
    throw new Error(`Contact not found: ${entityId}`);
  }

  // Transform to HubSpot format with ALL fields
  const hubspotPayload = transformToHubSpotFormat(completeContactData);

  try {
    await updateContactsLoanLead(contact.hs_object_id, hubspotPayload);
    logger.info(`Successfully updated HubSpot contact ${contact.hs_object_id}`);
    return contact.hs_object_id;
  } catch (error: any) {
    // If HubSpot says the contact doesn't exist (404), create it instead
    if (error?.response?.status === 404) {
      logger.warn(
        `HubSpot contact ${contact.hs_object_id} not found (404), creating new record`
      );
      return await handleCreate(payload, entityId);
    }
    throw error;
  }
}

/**
 * Handle DELETE operation
 */
async function handleDelete(hs_object_id: string): Promise<void> {
  if (hs_object_id) {
    await deleteHubspotByContactsLeadId(hs_object_id);
  }
}

/**
 * Handle sync errors
 */
async function handleSyncError(outboxId: string, error: any) {
  const errorMessage =
    error?.response?.data?.message || error?.message || "Unknown error";

  logger.error(`Sync error for outbox#${outboxId}:`, errorMessage);

  // Check if max retries reached
  const entry = await prisma.syncOutbox.findUnique({
    where: { id: outboxId },
    select: { attempts: true },
  });

  if (entry && entry.attempts >= MAX_RETRIES) {
    await markAsFailed(outboxId, errorMessage);
  } else {
    // Mark as pending for retry
    await prisma.syncOutbox.update({
      where: { id: outboxId },
      data: {
        status: "PENDING",
        last_error: errorMessage,
      },
    });
  }
}

/**
 * Mark entry as completed
 */
async function markAsCompleted(outboxId: string) {
  await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: "COMPLETED",
      processed_at: new Date(),
    },
  });
}

/**
 * Mark entry as failed
 */
async function markAsFailed(outboxId: string, error: string) {
  await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: "FAILED",
      last_error: error,
    },
  });
}

/**
 * Group entries by batch_id
 */
function groupByBatchId(entries: any[]): Record<string, any[]> {
  return entries.reduce((groups, entry) => {
    const key = entry.batch_id || "null";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
    return groups;
  }, {} as Record<string, any[]>);
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch complete contact data from all normalized tables
 */
async function fetchCompleteContactData(contactId: number) {
  try {
    const contact = await prisma.hSEdumateContacts.findUnique({
      where: { id: contactId },
      include: {
        personal_information: true,
        academic_profile: true,
        lead_attribution: true,
        financial_Info: true,
        loan_preference: true,
        application_journey: true,
        system_tracking: true,
      },
    });

    return contact;
  } catch (error) {
    logger.error(
      `Failed to fetch complete contact data for ${contactId}:`,
      error
    );
    throw error;
  }
}

/**
 * Transform complete DB data to HubSpot format
 * Merge all normalized tables into single HubSpot object
 */
function transformToHubSpotFormat(contact: any) {
  const personalInfo = contact.personal_information || {};
  const academicProfile = contact.academic_profile || {};
  const leadAttribution = contact.lead_attribution || {};
  const financialInfo = contact.financial_Info || {};
  const loanPreference = contact.loan_preference || {};
  const applicationJourney = contact.application_journey || {};

  return {
    // ========================================
    // PERSONAL INFORMATION
    // ========================================

    // Contact Details
    db_id: contact.id,
    email: personalInfo.email || null,
    first_name: personalInfo.first_name || null,
    last_name: personalInfo.last_name || null,
    phone_number: personalInfo.phone_number || null,

    // Demographics
    date_of_birth: personalInfo.date_of_birth
      ? new Date(personalInfo.date_of_birth).toISOString().split("T")[0]
      : null,
    gender: mapEnumValue("gender", personalInfo.gender),
    nationality: personalInfo.nationality || null,

    // Current Address
    current_address: personalInfo.current_address || null,
    city__current_address_: personalInfo.city_current_address || null,
    state__current_address_: personalInfo.state_current_address || null,
    country__current_address_: personalInfo.country_current_address || null,
    pincode__current_address_: personalInfo.pincode_current_address || null,

    // Permanent Address
    permanent_address: personalInfo.permanent_address || null,
    city__permanent_address_: personalInfo.city_permanent_address || null,
    state__permanent_address_: personalInfo.state_permanent_address || null,
    country__permanent_address_: personalInfo.country_permanent_address || null,
    pincode__permanent_address_: personalInfo.pincode_permanent_address || null,

    // ========================================
    // ACADEMIC PROFILE
    // ========================================

    // Current Education
    current_education_level: mapEnumValue(
      "current_education_level",
      academicProfile.current_education_level
    ),
    current_institution: academicProfile.current_institution || null,
    current_course_major: academicProfile.current_course_major || null,
    current_cgpa_percentage: academicProfile.current_cgpa_percentage || null,
    current_graduation_year: academicProfile.current_graduation_year || null,

    // Admission Status
    admission_status: mapEnumValue(
      "admission_status",
      academicProfile.admission_status
    ),

    // Target Education
    target_degree_level: mapEnumValue(
      "target_degree_level",
      academicProfile.target_degree_level
    ),
    target_course_major: academicProfile.target_course_major || null,
    preferred_study_destination: mapEnumValue(
      "preferred_study_destination",
      academicProfile.preferred_study_destination
    ),
    target_universities: academicProfile.target_universities || null,

    // Intake Details
    intended_start_term: mapEnumValue(
      "intended_start_term",
      academicProfile.intended_start_term
    ),
    intended_start_date: academicProfile.intended_start_date
      ? new Date(academicProfile.intended_start_date)
          .toISOString()
          .split("T")[0]
      : null,
    intake_month: academicProfile.intake_month || null,
    intake_year: academicProfile.intake_year || null,
    course_duration_months: academicProfile.course_duration_months || null,

    // Test Scores
    cat_score: academicProfile.cat_score || null,
    gre_score: academicProfile.gre_score || null,
    gmat_score: academicProfile.gmat_score || null,
    toefl_score: academicProfile.toefl_score || null,
    ielts_score: academicProfile.ielts_score || null,
    sat_score: academicProfile.sat_score || null,
    duolingo_score: academicProfile.duolingo_score || null,
    nmat_score: academicProfile.nmat_score || null,
    xat_score: academicProfile.xat_score || null,
    other_test_scores: academicProfile.other_test_scores || null,

    // ========================================
    // LEAD ATTRIBUTION
    // ========================================

    lead_source: mapEnumValue("lead_source", leadAttribution.lead_source),
    lead_source_detail: leadAttribution.lead_source_detail || null,
    lead_quality_score: leadAttribution.lead_quality_score || null,
    lead_reference_code: leadAttribution.lead_reference_code || null,

    // B2B Partner
    b2b_partner_id: leadAttribution.b2b_partner_id || null,
    b2b_partner_name: leadAttribution.b2b_partner_name || null,
    partner_commission_applicable:
      leadAttribution.partner_commission_applicable || null,

    // Referral
    referral_person_name: leadAttribution.referral_person_name || null,
    referral_person_contact: leadAttribution.referral_person_contact || null,

    // UTM Parameters
    utm_source: leadAttribution.utm_source || null,
    utm_medium: leadAttribution.utm_medium || null,
    utm_campaign: leadAttribution.utm_campaign || null,
    utm_term: leadAttribution.utm_term || null,
    utm_content: leadAttribution.utm_content || null,

    // ========================================
    // FINANCIAL INFORMATION
    // ========================================

    // General Financial
    annual_family_income: financialInfo.annual_family_income
      ? parseFloat(financialInfo.annual_family_income)
      : null,
    currency: mapEnumValue("currency", financialInfo.currency),

    // Education Costs
    total_course_cost: financialInfo.total_course_cost
      ? parseFloat(financialInfo.total_course_cost)
      : null,
    tuition_fee: financialInfo.tuition_fee
      ? parseFloat(financialInfo.tuition_fee)
      : null,
    living_expenses: financialInfo.living_expenses
      ? parseFloat(financialInfo.living_expenses)
      : null,
    other_expenses: financialInfo.other_expenses
      ? parseFloat(financialInfo.other_expenses)
      : null,

    // Funding
    loan_amount_required: financialInfo.loan_amount_required
      ? parseFloat(financialInfo.loan_amount_required)
      : null,
    scholarship_amount: financialInfo.scholarship_amount
      ? parseFloat(financialInfo.scholarship_amount)
      : null,
    self_funding_amount: financialInfo.self_funding_amount
      ? parseFloat(financialInfo.self_funding_amount)
      : null,

    // Collateral
    collateral_available: financialInfo.collateral_available || null,
    collateral_type: mapEnumValue(
      "collateral_type",
      financialInfo.collateral_type
    ),
    collateral_value: financialInfo.collateral_value
      ? parseFloat(financialInfo.collateral_value)
      : null,

    collateral_2_available: financialInfo.collateral_2_available || null,
    collateral_2_type: mapEnumValue(
      "collateral_type",
      financialInfo.collateral_2_type
    ),
    collateral_2_value: financialInfo.collateral_2_value
      ? parseFloat(financialInfo.collateral_2_value)
      : null,

    // Co-applicant 1
    co_applicant_1_name: financialInfo.co_applicant_1_name || null,
    co_applicant_1_email: contact.co_applicant_1_email || null,
    co_applicant_1_mobile_number: contact.co_applicant_1_mobile_number || null,
    co_applicant_1_income: financialInfo.co_applicant_1_income
      ? parseFloat(financialInfo.co_applicant_1_income)
      : null,
    co_applicant_1_occupation: mapEnumValue(
      "co_applicant_occupation",
      financialInfo.co_applicant_1_occupation
    ),
    co_applicant_1_relationship: mapEnumValue(
      "co_applicant_relationship",
      financialInfo.co_applicant_1_relationship
    ),

    // Co-applicant 2
    co_applicant_2_name: financialInfo.co_applicant_2_name || null,
    co_applicant_2_income: financialInfo.co_applicant_2_income
      ? parseFloat(financialInfo.co_applicant_2_income)
      : null,
    co_applicant_2_occupation: mapEnumValue(
      "co_applicant_occupation",
      financialInfo.co_applicant_2_occupation
    ),
    co_applicant_2_relationship: mapEnumValue(
      "co_applicant_relationship",
      financialInfo.co_applicant_2_relationship
    ),

    // Co-applicant 3
    co_applicant_3_name: financialInfo.co_applicant_3_name || null,
    co_applicant_3_income: financialInfo.co_applicant_3_income
      ? parseFloat(financialInfo.co_applicant_3_income)
      : null,
    co_applicant_3_occupation: mapEnumValue(
      "co_applicant_occupation",
      financialInfo.co_applicant_3_occupation
    ),
    co_applicant_3_relationship: mapEnumValue(
      "co_applicant_relationship",
      financialInfo.co_applicant_3_relationship
    ),

    // ========================================
    // LOAN PREFERENCES
    // ========================================

    loan_type_preference: mapEnumValue(
      "loan_type_preference",
      loanPreference.loan_type_preference
    ),
    preferred_lenders: loanPreference.preferred_lenders || null,
    repayment_type_preference: mapEnumValue(
      "repayment_type_preference",
      loanPreference.repayment_type_preference
    ),

    // ========================================
    // APPLICATION JOURNEY
    // ========================================

    assigned_counselor: applicationJourney.assigned_counselor || null,
    counselor_notes: applicationJourney.counselor_notes || null,
    current_status_disposition: mapEnumValue(
      "current_status_disposition",
      applicationJourney.current_status_disposition
    ),
    current_status_disposition_reason:
      applicationJourney.current_status_disposition_reason || null,
    priority_level: mapEnumValue(
      "priority_level",
      applicationJourney.priority_level
    ),

    // Contact Dates
    first_contact_date: applicationJourney.first_contact_date
      ? new Date(applicationJourney.first_contact_date)
          .toISOString()
          .split("T")[0]
      : null,
    last_contact_date: applicationJourney.last_contact_date
      ? new Date(applicationJourney.last_contact_date)
          .toISOString()
          .split("T")[0]
      : null,
    follow_up_date: applicationJourney.follow_up_date
      ? new Date(applicationJourney.follow_up_date).toISOString().split("T")[0]
      : null,
    next_follow_up_date: applicationJourney.next_follow_up_date
      ? new Date(applicationJourney.next_follow_up_date)
          .toISOString()
          .split("T")[0]
      : null,

    // ========================================
    // MAIN CONTACT FIELDS
    // ========================================

    course_type: mapEnumValue("course_type", contact.course_type),
    base_currency: contact.base_currency || null,
    study_destination_currency: contact.study_destination_currency || null,
    user_selected_currency: contact.user_selected_currency || null,

    // ========================================
    // HUBSPOT SYSTEM FIELDS (if updating)
    // ========================================

    // Don't send these on CREATE, only on UPDATE
    ...(contact.hs_object_id &&
      {
        // hs_object_id: contact.hs_object_id,
      }),
  };
}
