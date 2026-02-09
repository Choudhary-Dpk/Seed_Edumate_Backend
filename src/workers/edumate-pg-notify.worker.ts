import PQueue from "p-queue";
import prisma from "../config/prisma";
import { getInstance, registerChannel } from "../config/pg-notify-client";
import logger from "../utils/logger";
import {
  createContactsLoanLeads,
  updateContactsLoanLead,
  deleteHubspotByContactsLeadId,
} from "../services/hubspot.service";
import { mapEnumValue } from "../constants/enumMappingDbToHs";
import { getPartnerById } from "../models/helpers/partners.helper";

const MAX_RETRIES = 5;
const DEBOUNCE_DELAY = 5000;
const CONCURRENCY = 10;
const RATE_LIMIT = 100;
const FALLBACK_CHECK_INTERVAL = 30000;

const CHANNEL_NAME = "edumate_sync_channel";

const edumateSyncQueue = new PQueue({
  concurrency: CONCURRENCY,
  interval: 1000,
  intervalCap: RATE_LIMIT,
  timeout: 60000,
});

const ongoingSync = new Set<string>();
const pendingUpdates = new Map<string, NodeJS.Timeout>();

export async function startEdumatePGNotifyWorker() {
  try {
    logger.info("[Edumate PG NOTIFY] Starting worker...");

    const pgClient = await getInstance();
    logger.info("[Edumate PG NOTIFY] Using shared PostgreSQL connection");

    registerChannel(CHANNEL_NAME);

    await pgClient.query(`LISTEN ${CHANNEL_NAME}`);
    logger.info(`[Edumate PG NOTIFY] Listening on ${CHANNEL_NAME}`);

    pgClient.on("notification", handleNotification);

    // startFallbackProcessor();

    logger.info("[Edumate PG NOTIFY] Worker started successfully");
    logger.info(
      `[Edumate PG NOTIFY] Config: concurrency=${CONCURRENCY}, rate=${RATE_LIMIT}/s`
    );
  } catch (error) {
    logger.error("[Edumate PG NOTIFY] Failed to start worker:", error);
    process.exit(1);
  }
}

async function handleNotification(msg: any) {
  // Filter notifications - only process our channel
  if (msg.channel !== CHANNEL_NAME) {
    return;
  }

  try {
    const data = JSON.parse(msg.payload);
    logger.debug("[Edumate PG NOTIFY] Received notification:", {
      table: data.table_name,
      operation: data.operation,
      entity_id: data.entity_id,
      source: data.source,
    });

    if (data.source === "hubspot" && data.operation === "UPDATE") {
      logger.debug("[Edumate PG NOTIFY] Skipping HubSpot-source UPDATE");
      return;
    }

    const contactId = data.contact_id || data.entity_id;
    const syncKey = `edumate:${contactId}:${data.operation}`;

    if (ongoingSync.has(syncKey)) {
      logger.debug(
        `[Edumate PG NOTIFY] Already processing ${syncKey}, skipping`
      );
      return;
    }

    if (data.operation === "UPDATE") {
      if (pendingUpdates.has(syncKey)) {
        clearTimeout(pendingUpdates.get(syncKey)!);
      }

      const timeout = setTimeout(() => {
        pendingUpdates.delete(syncKey);
        queueEdumateSync(contactId, data.operation, data.hs_object_id, syncKey);
      }, DEBOUNCE_DELAY);

      pendingUpdates.set(syncKey, timeout);
      logger.debug(
        `[Edumate PG NOTIFY] Debouncing ${syncKey} for ${DEBOUNCE_DELAY}ms`
      );
    } else {
      await queueEdumateSync(
        contactId,
        data.operation,
        data.hs_object_id,
        syncKey
      );
    }
  } catch (error) {
    logger.error("[Edumate PG NOTIFY] Failed to handle notification:", error);
  }
}

async function queueEdumateSync(
  contactId: number,
  operation: string,
  hsObjectId: string | null,
  syncKey: string
) {
  edumateSyncQueue.add(async () => {
    ongoingSync.add(syncKey);

    let outboxEntry = await findOrCreateOutboxEntry(
      contactId,
      operation,
      hsObjectId
    );

    try {
      outboxEntry = await markAsProcessing(outboxEntry.id);

      const result = await processEdumateSync(contactId, operation, hsObjectId);

      await markAsCompleted(outboxEntry.id, result?.hubspotId || hsObjectId);

      logger.info(`[Edumate PG NOTIFY] Successfully synced ${syncKey}`);
    } catch (error: any) {
      logger.error(`[Edumate PG NOTIFY] Sync failed for ${syncKey}:`, error);

      await markAsFailed(
        outboxEntry.id,
        error.message,
        outboxEntry.attempts + 1
      );
    } finally {
      ongoingSync.delete(syncKey);
    }
  });

  logger.debug(
    `[Edumate PG NOTIFY] Queued ${syncKey} (Queue: ${edumateSyncQueue.size}, Active: ${edumateSyncQueue.pending})`
  );
}

async function processEdumateSync(
  contactId: number,
  operation: string,
  hsObjectId: string | null
): Promise<{ hubspotId?: string } | void> {
  logger.info(
    `[Edumate PG NOTIFY] Processing ${operation} for contact #${contactId}`
  );

  switch (operation) {
    case "INSERT":
      const createResult = await handleEdumateCreate(contactId);
      return { hubspotId: createResult };

    case "UPDATE":
      const updateResult = await handleEdumateUpdate(contactId);
      return { hubspotId: updateResult };

    case "DELETE":
      if (hsObjectId) {
        await handleEdumateDelete(hsObjectId);
      }
      return;

    default:
      logger.warn(`[Edumate PG NOTIFY] Unknown operation: ${operation}`);
      return;
  }
}

async function handleEdumateCreate(contactId: number): Promise<string> {
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

  if (!contact) {
    throw new Error(`Contact ${contactId} not found`);
  }

  if (contact.hs_object_id) {
    logger.info(
      `[Edumate PG NOTIFY] Contact #${contactId} already has HubSpot ID: ${contact.hs_object_id}, updating with db_id`
    );

    const hubspotPayload = await transformToHubSpotFormat(contact);
    console.log("hubspotpayload", hubspotPayload);

    try {
      await updateContactsLoanLead(contact.hs_object_id, hubspotPayload);
      logger.info(
        `[Edumate PG NOTIFY] Updated HubSpot contact ${contact.hs_object_id} with db_id: ${contactId}`
      );
    } catch (error: any) {
      logger.error(
        `[Edumate PG NOTIFY] Failed to update HubSpot with db_id:`,
        error
      );
    }

    return contact.hs_object_id;
  }

  let b2bPartnerHsObjectId: string | null = null;
  if (contact.b2b_partner_id) {
    const b2bPartner = await getPartnerById(contact.b2b_partner_id);
    if (b2bPartner?.hs_object_id) {
      b2bPartnerHsObjectId = b2bPartner.hs_object_id;
      logger.info("[Edumate PG NOTIFY] Found B2B Partner for association", {
        b2bPartnerId: contact.b2b_partner_id,
        hsObjectId: b2bPartnerHsObjectId,
      });
    }
  }

  const hubspotPayload = await transformToHubSpotFormat(contact);
  console.log("hubspotpayload", hubspotPayload);

  const results = await createContactsLoanLeads(
    [hubspotPayload],
    b2bPartnerHsObjectId
  );

  if (!results || results.length === 0) {
    throw new Error("HubSpot create returned empty result");
  }

  await prisma.hSEdumateContacts.update({
    where: { id: contactId },
    data: {
      hs_object_id: results[0].id,
      source: "hubspot",
    },
  });

  logger.info(
    `[Edumate PG NOTIFY] Created contact #${contactId} in HubSpot: ${results[0].id}`
  );

  return results[0].id;
}

async function handleEdumateUpdate(contactId: number): Promise<string> {
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

  if (!contact) {
    throw new Error(`Contact ${contactId} not found`);
  }

  const hubspotId = contact.hs_object_id;

  if (!hubspotId) {
    logger.warn(
      `[Edumate PG NOTIFY] No HubSpot ID for contact ${contactId}, creating new entry`
    );
    const newId = await handleEdumateCreate(contactId);
    return newId;
  }

  const hubspotPayload = await transformToHubSpotFormat(contact);
  console.log("hubspotpayload", hubspotPayload);

  try {
    await updateContactsLoanLead(hubspotId, hubspotPayload);
    logger.info(
      `[Edumate PG NOTIFY] Updated contact #${contactId} in HubSpot: ${hubspotId}`
    );
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.warn(
        `[Edumate PG NOTIFY] HubSpot contact ${hubspotId} not found (404), creating new`
      );
      const newId = await handleEdumateCreate(contactId);
      return newId;
    } else {
      throw error;
    }
  }

  return hubspotId;
}

async function handleEdumateDelete(hsObjectId: string): Promise<void> {
  await deleteHubspotByContactsLeadId(hsObjectId);
  logger.info(
    `[Edumate PG NOTIFY] Deleted contact from HubSpot: ${hsObjectId}`
  );
}

/**
 * Maps loan product database IDs to their corresponding HubSpot object IDs
 * Returns semicolon-separated string format for HubSpot multi-value fields
 * Example: "hubspotId1;hubspotId2;hubspotId3"
 *
 * @param productIds - Array of loan product database IDs
 * @returns Semicolon-separated string of HubSpot object IDs, or null if none found
 */
async function mapLoanProductIdsToHsObjectIds(
  productIds: number[]
): Promise<string | null> {
  if (!productIds || productIds.length === 0) {
    return null;
  }

  try {
    const loanProducts = await prisma.hSLoanProducts.findMany({
      where: {
        id: { in: productIds },
        is_deleted: false,
        hs_object_id: { not: null },
      },
      select: {
        id: true,
        hs_object_id: true,
        product_name: true,
      },
    });

    const hsObjectIds = loanProducts
      .filter((product) => product.hs_object_id)
      .map((product) => product.hs_object_id as string);
    const formattedString =
      hsObjectIds.length > 0 ? hsObjectIds.join("; ") : null;

    logger.debug(
      `[Edumate PG NOTIFY] Mapped ${productIds.length} loan product IDs to ${hsObjectIds.length} HubSpot object IDs`,
      {
        input_db_ids: productIds,
        output_format: formattedString,
        mapped_products: loanProducts.map((p) => ({
          db_id: p.id,
          product_name: p.product_name,
          hs_object_id: p.hs_object_id,
        })),
      }
    );

    // Log any missing mappings
    const foundIds = loanProducts.map((p) => p.id);
    const missingIds = productIds.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn(
        `[Edumate PG NOTIFY] Could not find HubSpot object IDs for loan product IDs: ${missingIds.join(
          ", "
        )}`
      );
    }

    return formattedString;
  } catch (error) {
    logger.error(
      `[Edumate PG NOTIFY] Error mapping loan product IDs to HubSpot object IDs:`,
      error
    );
    return null;
  }
}

async function transformToHubSpotFormat(contact: any): Promise<any> {
  const personalInfo = contact.personal_information || {};
  const academicProfile = contact.academic_profile || {};
  const leadAttribution = contact.lead_attribution || {};
  const financialInfo = contact.financial_Info || {};
  const loanPreference = contact.loan_preference || {};
  const applicationJourney = contact.application_journey || {};

  // Map interested loan product IDs to HubSpot object IDs (semicolon-separated)
  const interestedLoanProductsHsIds = await mapLoanProductIdsToHsObjectIds(
    contact.interested || []
  );

  // Map concent loan product IDs to HubSpot object IDs (if you need this field too)
  const favouriteLoanProductsHsIds = await mapLoanProductIdsToHsObjectIds(
    contact.concent || []
  );

  logger.debug(
    `[Edumate PG NOTIFY] Contact #${contact.id} loan products mapping:`,
    {
      interested_db_ids: contact.interested,
      interested_hs_ids_formatted: interestedLoanProductsHsIds,
      favourite_db_ids: contact.concent,
      favourite_hs_ids_formatted: favouriteLoanProductsHsIds,
    }
  );

  return {
    db_id: contact.id || personalInfo.contact_id,
    b2b_partner_db_id: contact.b2b_partner_id || null,
    email: personalInfo.email || null,
    first_name: personalInfo.first_name || null,
    last_name: personalInfo.last_name || null,
    phone_number: personalInfo.phone_number || null,
    date_of_birth: personalInfo.date_of_birth
      ? new Date(personalInfo.date_of_birth).toISOString().split("T")[0]
      : null,
    gender: mapEnumValue("gender", personalInfo.gender),
    nationality: personalInfo.nationality || null,
    current_address: personalInfo.current_address || null,
    city__current_address_: personalInfo.city_current_address || null,
    state__current_address_: personalInfo.state_current_address || null,
    country__current_address_: personalInfo.country_current_address || null,
    pincode__current_address_: personalInfo.pincode_current_address || null,
    permanent_address: personalInfo.permanent_address || null,
    city__permanent_address_: personalInfo.city_permanent_address || null,
    state__permanent_address_: personalInfo.state_permanent_address || null,
    country__permanent_address_: personalInfo.country_permanent_address || null,
    pincode__permanent_address_: personalInfo.pincode_permanent_address || null,
    current_education_level: mapEnumValue(
      "current_education_level",
      academicProfile.current_education_level
    ),
    current_institution: academicProfile.current_institution || null,
    current_course_major: academicProfile.current_course_major || null,
    current_cgpa_percentage: academicProfile.current_cgpa_percentage || null,
    current_graduation_year: academicProfile.current_graduation_year || null,
    admission_status: mapEnumValue(
      "admission_status",
      academicProfile.admission_status
    ),
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
    lead_source: mapEnumValue("lead_source", leadAttribution.lead_source),
    lead_source_detail: leadAttribution.lead_source_detail || null,
    lead_quality_score: leadAttribution.lead_quality_score || null,
    lead_reference_code: leadAttribution.lead_reference_code || null,
    b2b_partner_id: leadAttribution.b2b_partner_id || null,
    b2b_partner_name: leadAttribution.b2b_partner_name || null,
    partner_commission_applicable:
      leadAttribution.partner_commission_applicable || null,
    referral_person_name: leadAttribution.referral_person_name || null,
    referral_person_contact: leadAttribution.referral_person_contact || null,
    utm_source: leadAttribution.utm_source || null,
    utm_medium: leadAttribution.utm_medium || null,
    utm_campaign: leadAttribution.utm_campaign || null,
    utm_term: leadAttribution.utm_term || null,
    utm_content: leadAttribution.utm_content || null,
    annual_family_income: financialInfo.annual_family_income
      ? parseFloat(financialInfo.annual_family_income)
      : null,
    currency: mapEnumValue("currency", financialInfo.currency),
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
    loan_amount_required: financialInfo.loan_amount_required
      ? parseFloat(financialInfo.loan_amount_required)
      : null,
    scholarship_amount: financialInfo.scholarship_amount
      ? parseFloat(financialInfo.scholarship_amount)
      : null,
    self_funding_amount: financialInfo.self_funding_amount
      ? parseFloat(financialInfo.self_funding_amount)
      : null,
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
    loan_type_preference: mapEnumValue(
      "loan_type_preference",
      loanPreference.loan_type_preference
    ),
    preferred_lenders: loanPreference.preferred_lenders || null,
    repayment_type_preference: mapEnumValue(
      "repayment_type_preference",
      loanPreference.repayment_type_preference
    ),
    // Map interested loan products from DB IDs to HubSpot record IDs (semicolon-separated)
    // Format: "hubspotId1;hubspotId2;hubspotId3"
    interested_loan_products:
      interestedLoanProductsHsIds ||
      (loanPreference.interested_loan_products?.length > 0
        ? loanPreference.interested_loan_products.join(";")
        : null),
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
    course_type: mapEnumValue("course_type", contact.course_type),
    base_currency: contact.base_currency || null,
    study_destination_currency: contact.study_destination_currency || null,
    user_selected_currency: contact.user_selected_currency || null,
    program_of_interest_final: contact.program_of_interest_final || null,
    ...(contact.hs_object_id && {}),
  };
}

async function findOrCreateOutboxEntry(
  contactId: number,
  operation: string,
  hsObjectId: string | null
): Promise<any> {
  const existingEntry = await prisma.syncOutbox.findFirst({
    where: {
      entity_type: "HSEdumateContacts",
      entity_id: contactId,
      operation: operation === "INSERT" ? "INSERT" : operation,
      status: "PENDING",
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (existingEntry) {
    logger.debug(
      `[Edumate PG NOTIFY] Found existing outbox entry for contact #${contactId}`
    );
    return existingEntry;
  }

  logger.warn(
    `[Edumate PG NOTIFY] No outbox entry found for contact #${contactId}, creating new`
  );

  const newEntry = await prisma.syncOutbox.create({
    data: {
      entity_type: "HSEdumateContacts",
      entity_id: contactId,
      operation: operation,
      payload: { hs_object_id: hsObjectId },
      status: "PENDING",
      priority: 5,
      attempts: 0,
    },
  });

  return newEntry;
}

async function markAsProcessing(outboxId: string): Promise<any> {
  const updated = await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: "PROCESSING",
      processing_at: new Date(),
      attempts: { increment: 1 },
    },
  });

  logger.debug(`[Edumate PG NOTIFY] Marked outbox #${outboxId} as PROCESSING`);
  return updated;
}

async function markAsCompleted(
  outboxId: string,
  hubspotId: string | null
): Promise<void> {
  await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: "COMPLETED",
      hubspot_id: hubspotId,
      processed_at: new Date(),
      last_error: null,
    },
  });

  logger.debug(
    `[Edumate PG NOTIFY] Marked outbox #${outboxId} as COMPLETED (HubSpot ID: ${hubspotId})`
  );
}

async function markAsFailed(
  outboxId: string,
  errorMessage: string,
  currentAttempts: number
): Promise<void> {
  const isFinalAttempt = currentAttempts >= MAX_RETRIES;

  await prisma.syncOutbox.update({
    where: { id: outboxId },
    data: {
      status: isFinalAttempt ? "FAILED" : "PENDING",
      last_error: errorMessage,
      ...(isFinalAttempt && { processed_at: new Date() }),
    },
  });

  if (isFinalAttempt) {
    logger.error(
      `[Edumate PG NOTIFY] Marked outbox #${outboxId} as FAILED after ${MAX_RETRIES} attempts`
    );
  } else {
    logger.debug(
      `[Edumate PG NOTIFY] Marked outbox #${outboxId} as PENDING for retry (attempt ${currentAttempts}/${MAX_RETRIES})`
    );
  }
}

function startFallbackProcessor() {
  setInterval(async () => {
    try {
      const pendingItems = await prisma.syncOutbox.findMany({
        where: {
          entity_type: "HSEdumateContacts",
          status: "PENDING",
          attempts: { lt: MAX_RETRIES },
        },
        orderBy: [{ priority: "asc" }, { created_at: "asc" }],
        take: 50,
      });

      if (pendingItems.length === 0) return;

      logger.info(
        `[Edumate PG NOTIFY] Processing ${pendingItems.length} items from fallback queue`
      );

      for (const item of pendingItems) {
        await processRetry(item);
      }
    } catch (error) {
      logger.error("[Edumate PG NOTIFY] Fallback processor error:", error);
    }
  }, FALLBACK_CHECK_INTERVAL);

  logger.info("[Edumate PG NOTIFY] Fallback processor started");
}

async function processRetry(item: any): Promise<void> {
  await prisma.syncOutbox.update({
    where: { id: item.id },
    data: {
      status: "PROCESSING",
      processing_at: new Date(),
      attempts: { increment: 1 },
    },
  });

  try {
    const result = await processEdumateSync(
      item.entity_id,
      item.operation,
      item.payload?.hs_object_id
    );

    await prisma.syncOutbox.update({
      where: { id: item.id },
      data: {
        status: "COMPLETED",
        hubspot_id: result?.hubspotId,
        processed_at: new Date(),
        last_error: null,
      },
    });

    logger.info(
      `[Edumate PG NOTIFY] Retry succeeded for contact #${item.entity_id}`
    );
  } catch (error: any) {
    const newAttempts = item.attempts + 1;
    const isFinalAttempt = newAttempts >= MAX_RETRIES;

    await prisma.syncOutbox.update({
      where: { id: item.id },
      data: {
        status: isFinalAttempt ? "FAILED" : "PENDING",
        last_error: error.message,
        ...(isFinalAttempt && { processed_at: new Date() }),
      },
    });

    if (isFinalAttempt) {
      logger.error(
        `[Edumate PG NOTIFY] Retry exhausted for contact #${item.entity_id} after ${MAX_RETRIES} attempts`
      );
    }
  }
}

process.on("SIGTERM", async () => {
  logger.info(
    "[Edumate PG NOTIFY] SIGTERM received, closing worker gracefully..."
  );
  await edumateSyncQueue.onIdle();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info(
    "[Edumate PG NOTIFY] SIGINT received, closing worker gracefully..."
  );
  await edumateSyncQueue.onIdle();
  process.exit(0);
});
