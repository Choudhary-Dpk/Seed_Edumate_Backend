import PQueue from "p-queue";
import prisma from "../config/prisma";
import { getInstance, registerChannel } from "../config/pg-notify-client";
import logger from "../utils/logger";
import { mapEnumValue } from "../constants/enumMappingDbToHs";
import {
  createHubspotPartner,
  deleteHubspotPartner,
  updateHubspotPartner,
} from "../services/hubspotClient.service";
import { sendCommissionNotification } from "../services/EmailNotifications/commission.notification.service";

const MAX_RETRIES = 5;
const DEBOUNCE_DELAY = 5000;
const CONCURRENCY = 10;
const RATE_LIMIT = 100;
const FALLBACK_CHECK_INTERVAL = 30000;

const CHANNEL_NAME = "b2b_partner_sync_channel";

const b2bPartnerSyncQueue = new PQueue({
  concurrency: CONCURRENCY,
  interval: 1000,
  intervalCap: RATE_LIMIT,
  timeout: 60000,
});

const ongoingSync = new Set<string>();
const pendingUpdates = new Map<string, NodeJS.Timeout>();

export async function startB2BPartnerPGNotifyWorker() {
  try {
    logger.info("[B2B Partner PG NOTIFY] Starting worker...");

    const pgClient = await getInstance();
    logger.info("[B2B Partner PG NOTIFY] Using shared PostgreSQL connection");

    registerChannel(CHANNEL_NAME);

    await pgClient.query(`LISTEN ${CHANNEL_NAME}`);
    logger.info(`[B2B Partner PG NOTIFY] Listening on ${CHANNEL_NAME}`);

    pgClient.on("notification", handleNotification);

    startFallbackProcessor();

    logger.info("[B2B Partner PG NOTIFY] Worker started successfully");
    logger.info(
      `[B2B Partner PG NOTIFY] Config: concurrency=${CONCURRENCY}, rate=${RATE_LIMIT}/s`,
    );
  } catch (error) {
    logger.error("[B2B Partner PG NOTIFY] Failed to start worker:", error);
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
    logger.debug("[B2B Partner PG NOTIFY] Received notification:", {
      table: data.table_name,
      operation: data.operation,
      entity_id: data.entity_id,
      source: data.source,
    });

    if (data.source === "hubspot" && data.operation === "UPDATE") {
      logger.debug("[B2B Partner PG NOTIFY] Skipping HubSpot-source UPDATE");
      return;
    }

    const partnerId = data.partner_id || data.entity_id;
    const syncKey = `b2b_partner:${partnerId}:${data.operation}`;

    if (ongoingSync.has(syncKey)) {
      logger.debug(
        `[B2B Partner PG NOTIFY] Already processing ${syncKey}, skipping`,
      );
      return;
    }

    if (data.operation === "UPDATE") {
      if (pendingUpdates.has(syncKey)) {
        clearTimeout(pendingUpdates.get(syncKey)!);
      }

      const timeout = setTimeout(() => {
        pendingUpdates.delete(syncKey);
        queueB2BPartnerSync(
          partnerId,
          data.operation,
          data.hs_object_id,
          syncKey,
        );
      }, DEBOUNCE_DELAY);

      pendingUpdates.set(syncKey, timeout);
      logger.debug(
        `[B2B Partner PG NOTIFY] Debouncing ${syncKey} for ${DEBOUNCE_DELAY}ms`,
      );
    } else {
      // ═══════════════════════════════════════════════════════════════
      // PHASE 1: Notify Finance + BDM when a new partner is created
      // Non-blocking: fires and forgets, won't affect HubSpot sync
      // ═══════════════════════════════════════════════════════════════
      if (data.operation === "INSERT") {
        notifyFinanceForNewPartner(partnerId).catch((err) =>
          logger.warn(
            `[B2B Partner PG NOTIFY] Finance notification failed for partner #${partnerId}: ${err.message}`,
          ),
        );
      }

      await queueB2BPartnerSync(
        partnerId,
        data.operation,
        data.hs_object_id,
        syncKey,
      );
    }
  } catch (error) {
    logger.error(
      "[B2B Partner PG NOTIFY] Failed to handle notification:",
      error,
    );
  }
}

async function queueB2BPartnerSync(
  partnerId: number,
  operation: string,
  hsObjectId: string | null,
  syncKey: string,
) {
  b2bPartnerSyncQueue.add(async () => {
    ongoingSync.add(syncKey);

    let outboxEntry = await findOrCreateOutboxEntry(
      partnerId,
      operation,
      hsObjectId,
    );

    try {
      outboxEntry = await markAsProcessing(outboxEntry.id);

      const result = await processB2BPartnerSync(
        partnerId,
        operation,
        hsObjectId,
      );

      await markAsCompleted(outboxEntry.id, result?.hubspotId || hsObjectId);

      logger.info(`[B2B Partner PG NOTIFY] Successfully synced ${syncKey}`);
    } catch (error: any) {
      logger.error(
        `[B2B Partner PG NOTIFY] Sync failed for ${syncKey}:`,
        error,
      );

      await markAsFailed(
        outboxEntry.id,
        error.message,
        outboxEntry.attempts + 1,
      );
    } finally {
      ongoingSync.delete(syncKey);
    }
  });

  logger.debug(
    `[B2B Partner PG NOTIFY] Queued ${syncKey} (Queue: ${b2bPartnerSyncQueue.size}, Active: ${b2bPartnerSyncQueue.pending})`,
  );
}

async function processB2BPartnerSync(
  partnerId: number,
  operation: string,
  hsObjectId: string | null,
): Promise<{ hubspotId?: string } | void> {
  logger.info(
    `[B2B Partner PG NOTIFY] Processing ${operation} for partner #${partnerId}`,
  );

  switch (operation) {
    case "INSERT":
      const createResult = await handleB2BPartnerCreate(partnerId);
      return { hubspotId: createResult };

    case "UPDATE":
      const updateResult = await handleB2BPartnerUpdate(partnerId);
      return { hubspotId: updateResult };

    case "DELETE":
      if (hsObjectId) {
        await handleB2BPartnerDelete(hsObjectId);
      }
      return;

    default:
      logger.warn(`[B2B Partner PG NOTIFY] Unknown operation: ${operation}`);
      return;
  }
}

async function handleB2BPartnerCreate(partnerId: number): Promise<string> {
  const partner = await prisma.hSB2BPartners.findUnique({
    where: { id: partnerId },
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
      relationship_management: true,
      system_tracking: true,
    },
  });

  if (!partner) {
    throw new Error(`B2B Partner ${partnerId} not found`);
  }

  if (partner.hs_object_id) {
    logger.info(
      `[B2B Partner PG NOTIFY] Partner #${partnerId} already has HubSpot ID: ${partner.hs_object_id}, updating with db_id`,
    );

    const hubspotPayload = await transformToHubSpotFormat(partner);
    console.log("hubspotPayload", hubspotPayload);

    try {
      await updateHubspotPartner(partner.hs_object_id, hubspotPayload);
      logger.info(
        `[B2B Partner PG NOTIFY] Updated HubSpot partner ${partner.hs_object_id} with db_id: ${partnerId}`,
      );
    } catch (error: any) {
      logger.error(
        `[B2B Partner PG NOTIFY] Failed to update HubSpot with db_id:`,
        error,
      );
    }

    return partner.hs_object_id;
  }

  const hubspotPayload = await transformToHubSpotFormat(partner);
  console.log("hubspotPayload", hubspotPayload);

  const result = await createHubspotPartner(hubspotPayload);

  if (!result || !result.id) {
    throw new Error("HubSpot create returned empty result");
  }

  await prisma.hSB2BPartners.update({
    where: { id: partnerId },
    data: {
      hs_object_id: result.id,
      source: "hubspot",
    },
  });

  logger.info(
    `[B2B Partner PG NOTIFY] Created partner #${partnerId} in HubSpot: ${result.id}`,
  );

  return result.id;
}

async function handleB2BPartnerUpdate(partnerId: number): Promise<string> {
  const partner = await prisma.hSB2BPartners.findUnique({
    where: { id: partnerId },
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
      relationship_management: true,
      system_tracking: true,
    },
  });

  if (!partner) {
    throw new Error(`B2B Partner ${partnerId} not found`);
  }

  const hubspotId = partner.hs_object_id;

  if (!hubspotId) {
    logger.warn(
      `[B2B Partner PG NOTIFY] No HubSpot ID for partner ${partnerId}, creating new entry`,
    );
    const newId = await handleB2BPartnerCreate(partnerId);
    return newId;
  }

  const hubspotPayload = await transformToHubSpotFormat(partner);
  console.log("hubspotPayload", hubspotPayload);

  try {
    await updateHubspotPartner(hubspotId, hubspotPayload);
    logger.info(
      `[B2B Partner PG NOTIFY] Updated partner #${partnerId} in HubSpot: ${hubspotId}`,
    );
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.warn(
        `[B2B Partner PG NOTIFY] HubSpot partner ${hubspotId} not found (404), creating new`,
      );
      const newId = await handleB2BPartnerCreate(partnerId);
      return newId;
    } else {
      throw error;
    }
  }

  return hubspotId;
}

async function handleB2BPartnerDelete(hsObjectId: string): Promise<void> {
  await deleteHubspotPartner(hsObjectId);
  logger.info(
    `[B2B Partner PG NOTIFY] Deleted partner from HubSpot: ${hsObjectId}`,
  );
}

async function transformToHubSpotFormat(partner: any): Promise<any> {
  const businessCapabilities = partner.business_capabilities || {};
  const commissionStructure = partner.commission_structure || {};
  const compliance = partner.compliance || {};
  const contactInfo = partner.contact_info || {};
  const financialTracking = partner.financial_tracking || {};
  const leadAttribution = partner.lead_attribution || {};
  const marketingPromo = partner.marketing_promo || {};
  const partnershipDetails = partner.partnership_details || {};
  const performanceMetrics = partner.performance_metrics || {};
  const relationshipManagement = partner.relationship_management || {};
  const systemTracking = partner.system_tracking || {};

  return {
    db_id: partner.id,

    // Main Partner Fields
    business_address: partner.business_address || null,
    business_type: mapEnumValue("business_type", partner.business_type),
    city: partner.city || null,
    country: partner.country || null,
    gst_number: partner.gst_number || null,
    incorporation_date: partner.incorporation_date
      ? new Date(partner.incorporation_date).toISOString().split("T")[0]
      : null,
    pan_number: partner.pan_number || null,
    partner_display_name: partner.partner_display_name || null,
    partner_name: partner.partner_name || null,
    partner_type: mapEnumValue("partner_type", partner.partner_type),
    pincode: partner.pincode || null,
    registration_number: partner.registration_number || null,
    state: partner.state || null,
    website_url: partner.website_url || null,
    gst_rate: partner.gst_rate || null,
    is_commission_applicable: partner.is_commission_applicable || null,
    company_id: partner.company_id || null,
    university_id: partner.university_id || null,

    // Business Capabilities
    experience_years: businessCapabilities.experience_years || null,
    student_capacity_monthly:
      businessCapabilities.student_capacity_monthly || null,
    student_capacity_yearly:
      businessCapabilities.student_capacity_yearly || null,
    target_courses: businessCapabilities.target_courses || null,
    target_destinations: businessCapabilities.target_destinations || null,
    target_universities: businessCapabilities.target_universities || null,
    team_size: businessCapabilities.team_size || null,

    // Commission Structure
    bank_account_number: commissionStructure.bank_account_number || null,
    bank_branch: commissionStructure.bank_branch || null,
    bank_name: commissionStructure.bank_name || null,
    beneficiary_name: commissionStructure.beneficiary_name || null,
    bonus_structure: commissionStructure.bonus_structure || null,
    commission_model: mapEnumValue(
      "commission_model",
      commissionStructure.commission_model,
    ),
    commission_rate: commissionStructure.commission_rate || null,
    commission_type: mapEnumValue(
      "commission_type",
      commissionStructure.commission_type,
    ),
    fixed_commission_amount: commissionStructure.fixed_commission_amount
      ? parseFloat(commissionStructure.fixed_commission_amount)
      : null,
    gst_applicable: commissionStructure.gst_applicable || null,
    ifsc_code: commissionStructure.ifsc_code || null,
    invoice_requirements: commissionStructure.invoice_requirements || null,
    payment_frequency: mapEnumValue(
      "payment_frequency",
      commissionStructure.payment_frequency,
    ),
    payment_method: mapEnumValue(
      "payment_method",
      commissionStructure.payment_method,
    ),
    payment_terms: commissionStructure.payment_terms || null,
    tds_applicable: commissionStructure.tds_applicable || null,
    tds_rate: commissionStructure.tds_rate
      ? parseFloat(commissionStructure.tds_rate)
      : null,
    tiered_commission_structure:
      commissionStructure.tiered_commission_structure || null,

    // Compliance & Documentation
    agreement_signed_date: compliance.agreement_signed_date
      ? new Date(compliance.agreement_signed_date).toISOString().split("T")[0]
      : null,
    background_verification_status: mapEnumValue(
      "background_verification_status",
      compliance.background_verification_status,
    ),
    kyc_completion_date: compliance.kyc_completion_date
      ? new Date(compliance.kyc_completion_date).toISOString().split("T")[0]
      : null,
    kyc_status: mapEnumValue("kyc_status", compliance.kyc_status),

    // Contact Information
    accounts_contact_email: contactInfo.accounts_contact_email || null,
    accounts_contact_person: contactInfo.accounts_contact_person || null,
    accounts_contact_phone: contactInfo.accounts_contact_phone || null,
    marketing_contact_email: contactInfo.marketing_contact_email || null,
    marketing_contact_person: contactInfo.marketing_contact_person || null,
    marketing_contact_phone: contactInfo.marketing_contact_phone || null,
    primary_contact_designation:
      contactInfo.primary_contact_designation || null,
    primary_contact_email: contactInfo.primary_contact_email || null,
    primary_contact_person: contactInfo.primary_contact_person || null,
    primary_contact_phone: contactInfo.primary_contact_phone || null,
    secondary_contact_email: contactInfo.secondary_contact_email || null,
    secondary_contact_person: contactInfo.secondary_contact_person || null,
    secondary_contact_phone: contactInfo.secondary_contact_phone || null,

    // Financial Tracking
    average_monthly_commission: financialTracking.average_monthly_commission
      ? parseFloat(financialTracking.average_monthly_commission)
      : null,
    current_month_commission: financialTracking.current_month_commission
      ? parseFloat(financialTracking.current_month_commission)
      : null,
    last_payment_amount: financialTracking.last_payment_amount
      ? parseFloat(financialTracking.last_payment_amount)
      : null,
    last_payment_date: financialTracking.last_payment_date
      ? new Date(financialTracking.last_payment_date)
          .toISOString()
          .split("T")[0]
      : null,
    lifetime_value: financialTracking.lifetime_value || null,
    next_payment_due_date: financialTracking.next_payment_due_date
      ? new Date(financialTracking.next_payment_due_date)
          .toISOString()
          .split("T")[0]
      : null,
    outstanding_commission: financialTracking.outstanding_commission
      ? parseFloat(financialTracking.outstanding_commission)
      : null,
    payment_status: mapEnumValue(
      "payment_status",
      financialTracking.payment_status,
    ),
    total_commission_earned: financialTracking.total_commission_earned
      ? parseFloat(financialTracking.total_commission_earned)
      : null,
    total_commission_paid: financialTracking.total_commission_paid
      ? parseFloat(financialTracking.total_commission_paid)
      : null,
    ytd_commission_earned: financialTracking.ytd_commission_earned
      ? parseFloat(financialTracking.ytd_commission_earned)
      : null,
    ytd_commission_paid: financialTracking.ytd_commission_paid
      ? parseFloat(financialTracking.ytd_commission_paid)
      : null,

    // Lead Attribution
    lead_submission_method: mapEnumValue(
      "lead_submission_method",
      leadAttribution.lead_submission_method,
    ),
    lead_tracking_method: mapEnumValue(
      "lead_tracking_method",
      leadAttribution.lead_tracking_method,
    ),
    tracking_link: leadAttribution.tracking_link || null,
    unique_referral_code: leadAttribution.unique_referral_code || null,
    utm_source_assigned: leadAttribution.utm_source_assigned || null,

    // Marketing & Promotion
    brand_usage_guidelines: marketingPromo.brand_usage_guidelines || null,
    co_marketing_approval: marketingPromo.co_marketing_approval || null,
    content_collaboration: marketingPromo.content_collaboration || null,
    digital_presence_rating: marketingPromo.digital_presence_rating
      ? parseFloat(marketingPromo.digital_presence_rating)
      : null,
    event_participation: marketingPromo.event_participation || null,
    marketing_materials_provided:
      marketingPromo.marketing_materials_provided || null,
    promotional_activities: marketingPromo.promotional_activities || null,
    social_media_followers: marketingPromo.social_media_followers || null,

    // Partnership Details
    agreement_type: mapEnumValue(
      "agreement_type",
      partnershipDetails.agreement_type,
    ),
    partnership_end_date: partnershipDetails.partnership_end_date
      ? new Date(partnershipDetails.partnership_end_date)
          .toISOString()
          .split("T")[0]
      : null,
    partnership_start_date: partnershipDetails.partnership_start_date
      ? new Date(partnershipDetails.partnership_start_date)
          .toISOString()
          .split("T")[0]
      : null,
    partnership_status: mapEnumValue(
      "partnership_status",
      partnershipDetails.partnership_status,
    ),

    // Performance Metrics
    application_conversion_rate: performanceMetrics.application_conversion_rate
      ? parseFloat(performanceMetrics.application_conversion_rate)
      : null,
    applications_approved: performanceMetrics.applications_approved || null,
    approval_conversion_rate: performanceMetrics.approval_conversion_rate
      ? parseFloat(performanceMetrics.approval_conversion_rate)
      : null,
    average_lead_quality_score: performanceMetrics.average_lead_quality_score
      ? parseFloat(performanceMetrics.average_lead_quality_score)
      : null,
    average_loan_amount: performanceMetrics.average_loan_amount
      ? parseFloat(performanceMetrics.average_loan_amount)
      : null,
    best_performing_month: performanceMetrics.best_performing_month || null,
    last_lead_date: performanceMetrics.last_lead_date
      ? new Date(performanceMetrics.last_lead_date).toISOString().split("T")[0]
      : null,
    lead_conversion_rate: performanceMetrics.lead_conversion_rate
      ? parseFloat(performanceMetrics.lead_conversion_rate)
      : null,
    leads_converted_to_applications:
      performanceMetrics.leads_converted_to_applications || null,
    loans_disbursed: performanceMetrics.loans_disbursed || null,
    partner_rating: performanceMetrics.partner_rating
      ? parseFloat(performanceMetrics.partner_rating)
      : null,
    qualified_leads_provided:
      performanceMetrics.qualified_leads_provided || null,
    seasonal_performance_pattern:
      performanceMetrics.seasonal_performance_pattern || null,
    total_leads_provided: performanceMetrics.total_leads_provided || null,
    total_loan_value_generated: performanceMetrics.total_loan_value_generated
      ? parseFloat(performanceMetrics.total_loan_value_generated)
      : null,

    // Relationship Management
    assigned_account_manager:
      relationshipManagement.assigned_account_manager || null,
    communication_frequency: mapEnumValue(
      "communication_frequency",
      relationshipManagement.communication_frequency,
    ),
    escalation_history: relationshipManagement.escalation_history || null,
    feedback_comments: relationshipManagement.feedback_comments || null,
    joint_marketing_activities:
      relationshipManagement.joint_marketing_activities || null,
    last_interaction_date: relationshipManagement.last_interaction_date
      ? new Date(relationshipManagement.last_interaction_date)
          .toISOString()
          .split("T")[0]
      : null,
    relationship_status: mapEnumValue(
      "relationship_status",
      relationshipManagement.relationship_status,
    ),
    satisfaction_score: relationshipManagement.satisfaction_score
      ? parseFloat(relationshipManagement.satisfaction_score)
      : null,
    training_completed: relationshipManagement.training_completed || null,

    // System Tracking
    api_access_provided: systemTracking.api_access_provided || null,
    created_by_user: systemTracking.created_by_user || null,
    created_by: systemTracking.created_by || null,
    created_date: systemTracking.created_date
      ? new Date(systemTracking.created_date).toISOString().split("T")[0]
      : null,
    data_source: mapEnumValue("data_source", systemTracking.data_source),
    integration_status: mapEnumValue(
      "integration_status",
      systemTracking.integration_status,
    ),
    internal_tags: systemTracking.internal_tags || null,
    last_modified_by_user: systemTracking.last_modified_by_user || null,
    last_modified_by: systemTracking.last_modified_by || null,
    last_modified_date: systemTracking.last_modified_date
      ? new Date(systemTracking.last_modified_date).toISOString().split("T")[0]
      : null,
    notes: systemTracking.notes || null,
    partner_record_status: mapEnumValue(
      "partner_record_status",
      systemTracking.partner_record_status,
    ),
    portal_access_provided: systemTracking.portal_access_provided || null,

    ...(partner.hs_object_id && {}),
  };
}

async function findOrCreateOutboxEntry(
  partnerId: number,
  operation: string,
  hsObjectId: string | null,
): Promise<any> {
  const existingEntry = await prisma.syncOutbox.findFirst({
    where: {
      entity_type: "HSB2BPartners",
      entity_id: partnerId,
      operation: operation === "INSERT" ? "INSERT" : operation,
      status: "PENDING",
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (existingEntry) {
    logger.debug(
      `[B2B Partner PG NOTIFY] Found existing outbox entry for partner #${partnerId}`,
    );
    return existingEntry;
  }

  logger.warn(
    `[B2B Partner PG NOTIFY] No outbox entry found for partner #${partnerId}, creating new`,
  );

  const newEntry = await prisma.syncOutbox.create({
    data: {
      entity_type: "HSB2BPartners",
      entity_id: partnerId,
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

  logger.debug(
    `[B2B Partner PG NOTIFY] Marked outbox #${outboxId} as PROCESSING`,
  );
  return updated;
}

async function markAsCompleted(
  outboxId: string,
  hubspotId: string | null,
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
    `[B2B Partner PG NOTIFY] Marked outbox #${outboxId} as COMPLETED (HubSpot ID: ${hubspotId})`,
  );
}

async function markAsFailed(
  outboxId: string,
  errorMessage: string,
  currentAttempts: number,
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
      `[B2B Partner PG NOTIFY] Marked outbox #${outboxId} as FAILED after ${MAX_RETRIES} attempts`,
    );
  } else {
    logger.debug(
      `[B2B Partner PG NOTIFY] Marked outbox #${outboxId} as PENDING for retry (attempt ${currentAttempts}/${MAX_RETRIES})`,
    );
  }
}

function startFallbackProcessor() {
  setInterval(async () => {
    try {
      const pendingItems = await prisma.syncOutbox.findMany({
        where: {
          entity_type: "HSB2BPartners",
          status: "PENDING",
          attempts: { lt: MAX_RETRIES },
        },
        orderBy: [{ priority: "asc" }, { created_at: "asc" }],
        take: 50,
      });

      if (pendingItems.length === 0) return;

      logger.info(
        `[B2B Partner PG NOTIFY] Processing ${pendingItems.length} items from fallback queue`,
      );

      for (const item of pendingItems) {
        await processRetry(item);
      }
    } catch (error) {
      logger.error("[B2B Partner PG NOTIFY] Fallback processor error:", error);
    }
  }, FALLBACK_CHECK_INTERVAL);

  logger.info("[B2B Partner PG NOTIFY] Fallback processor started");
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
    const result = await processB2BPartnerSync(
      item.entity_id,
      item.operation,
      item.payload?.hs_object_id,
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
      `[B2B Partner PG NOTIFY] Retry succeeded for partner #${item.entity_id}`,
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
        `[B2B Partner PG NOTIFY] Retry exhausted for partner #${item.entity_id} after ${MAX_RETRIES} attempts`,
      );
    }
  }
}

// ============================================================================
// PHASE 1: Finance Notification for New Partner
// ============================================================================

async function notifyFinanceForNewPartner(partnerId: number): Promise<void> {
  const partner = await prisma.hSB2BPartners.findUnique({
    where: { id: partnerId },
    include: {
      contact_info: true,
    },
  });

  if (!partner) {
    logger.warn(
      `[B2B Partner PG NOTIFY] Partner #${partnerId} not found for notification`,
    );
    return;
  }

  logger.info(
    `[B2B Partner PG NOTIFY] Sending finance notification for partner #${partnerId}`,
  );

  await sendCommissionNotification("FINANCE_PARTNER_ONBOARDED", {
    partnerId: partner.id,
    partnerB2BId: partner.id,
    partnerName:
      partner.partner_display_name || partner.partner_name || "Unknown Partner",
    partnerType: partner.partner_type,
    businessType: partner.business_type,
    gstNumber: partner.gst_number,
    panNumber: partner.pan_number,
    city: partner.city,
    state: partner.state,
    country: partner.country,
    isCommissionApplicable: partner.is_commission_applicable,
    contactEmail: partner.contact_info?.primary_contact_email || null,
    contactPhone: partner.contact_info?.primary_contact_phone || null,
    onboardedAt: new Date(),
    triggeredBy: { name: "System", type: "system" },
  });

  logger.info(
    `[B2B Partner PG NOTIFY] Finance notification sent for partner #${partnerId}`,
  );
}

process.on("SIGTERM", async () => {
  logger.info(
    "[B2B Partner PG NOTIFY] SIGTERM received, closing worker gracefully...",
  );
  await b2bPartnerSyncQueue.onIdle();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info(
    "[B2B Partner PG NOTIFY] SIGINT received, closing worker gracefully...",
  );
  await b2bPartnerSyncQueue.onIdle();
  process.exit(0);
});
