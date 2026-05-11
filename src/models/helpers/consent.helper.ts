import prisma from "../../config/prisma";

/**
 * Type used for the older "loan product consent" usage that previously
 * lived in `hs_edumate_contacts.concent` (array of loan_product_ids).
 */
export const LOAN_PRODUCT_CONSENT_TYPE = "loan_product_consent";

/**
 * Type used for the partner data sharing consent collected at signup
 * (single boolean — `partner_data_consent` field in the signup payload).
 */
export const PARTNER_DATA_CONSENT_TYPE = "partner_data_consent";

/**
 * Type used for the explicit per-product grant/revoke events sent from the
 * loan products list & detail pages (paired `loan_product_data_consent`
 * boolean + `loan_product_id`). These rows are append-only audit history;
 * they are never deactivated. The cumulative current state continues to
 * live on `LOAN_PRODUCT_CONSENT_TYPE` rows so HubSpot sync is unchanged.
 */
export const LOAN_PRODUCT_DATA_CONSENT_EVENT_TYPE = "loan_product_data_consent";

export interface RecordConsentParams {
  contactId: number;
  type: string;
  responseValue: boolean;
  loanProductId?: number | null;
  b2bPartnerId?: number | null;
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  createdBy?: string | null;
  /**
   * If true, soft-deactivates existing active records of the same `type`
   * for this contact before inserting the new one — useful when the field
   * represents a single "current state" rather than a list.
   */
  deactivatePrevious?: boolean;
  tx?: any;
}

/**
 * Inserts a single consent record. Generic helper used by all boolean / typed
 * consents (e.g. partner_data_consent). For array-based consents like
 * loan-product-consent, prefer `replaceConcentForContact`.
 */
export const recordConsent = async (
  params: RecordConsentParams,
): Promise<void> => {
  const client = params.tx ?? prisma;

  if (params.deactivatePrevious) {
    await client.contactConsents.updateMany({
      where: {
        contact_id: params.contactId,
        type: params.type,
        is_active: true,
      },
      data: { is_active: false },
    });
  }

  await client.contactConsents.create({
    data: {
      contact_id: params.contactId,
      loan_product_id: params.loanProductId ?? null,
      b2b_partner_id: params.b2bPartnerId ?? null,
      type: params.type,
      email: params.email ?? null,
      phone: params.phone ?? null,
      response_value: params.responseValue,
      ip_address: params.ipAddress ?? null,
      created_by: params.createdBy ?? null,
    },
  });
};

/**
 * Returns the active loan product IDs the contact has given consent for.
 * Matches the previous `concent: Int[]` shape so response payloads stay identical.
 */
export const getConcentByContactId = async (
  contactId: number | null | undefined,
): Promise<number[]> => {
  if (!contactId) return [];

  const rows = await prisma.contactConsents.findMany({
    where: {
      contact_id: contactId,
      type: LOAN_PRODUCT_CONSENT_TYPE,
      response_value: true,
      is_active: true,
      loan_product_id: { not: null },
    },
    select: { loan_product_id: true },
    orderBy: { responded_at: "asc" },
  });

  return rows
    .map((r) => r.loan_product_id)
    .filter((id): id is number => typeof id === "number");
};

/**
 * Batch-fetch active loan product consent IDs for many contacts at once.
 * Used when building responses that include several contacts (e.g. bulk fetches).
 */
export const getConcentMapForContacts = async (
  contactIds: number[],
): Promise<Map<number, number[]>> => {
  if (!contactIds.length) return new Map();

  const rows = await prisma.contactConsents.findMany({
    where: {
      contact_id: { in: contactIds },
      type: LOAN_PRODUCT_CONSENT_TYPE,
      response_value: true,
      is_active: true,
      loan_product_id: { not: null },
    },
    select: { contact_id: true, loan_product_id: true },
    orderBy: { responded_at: "asc" },
  });

  const map = new Map<number, number[]>();
  for (const r of rows) {
    if (r.contact_id == null || r.loan_product_id == null) continue;
    const list = map.get(r.contact_id) ?? [];
    list.push(r.loan_product_id);
    map.set(r.contact_id, list);
  }
  return map;
};

export interface ReplaceConcentMeta {
  b2bPartnerId?: number | null;
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  createdBy?: string | null;
}

/**
 * Replaces the consent set for a contact: deactivates existing active rows
 * and inserts fresh rows for the new product IDs. Preserves history via
 * `is_active = false` instead of deleting old rows.
 */
export const replaceConcentForContact = async (
  contactId: number,
  productIds: number[] | null | undefined,
  meta: ReplaceConcentMeta = {},
  tx?: any,
): Promise<void> => {
  const client = tx ?? prisma;
  const ids = Array.isArray(productIds)
    ? productIds.filter((id): id is number => typeof id === "number" && !isNaN(id))
    : [];

  await client.contactConsents.updateMany({
    where: {
      contact_id: contactId,
      type: LOAN_PRODUCT_CONSENT_TYPE,
      is_active: true,
    },
    data: { is_active: false },
  });

  if (ids.length === 0) return;

  await client.contactConsents.createMany({
    data: ids.map((loanProductId) => ({
      contact_id: contactId,
      loan_product_id: loanProductId,
      b2b_partner_id: meta.b2bPartnerId ?? null,
      type: LOAN_PRODUCT_CONSENT_TYPE,
      email: meta.email ?? null,
      phone: meta.phone ?? null,
      response_value: true,
      ip_address: meta.ipAddress ?? null,
      created_by: meta.createdBy ?? null,
    })),
  });
};

export interface RecordLoanProductConsentEventParams {
  contactId: number;
  loanProductId: number;
  consent: boolean;
  b2bPartnerId?: number | null;
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  createdBy?: string | null;
  tx?: any;
}

/**
 * Records an explicit per-product consent grant or revoke event.
 *
 *  1. Always inserts an append-only audit row of type
 *     `LOAN_PRODUCT_DATA_CONSENT_EVENT_TYPE` with the boolean response.
 *  2. Mirrors the current cumulative-state row of type
 *     `LOAN_PRODUCT_CONSENT_TYPE` for the (contact, product) pair so the
 *     existing `getConcentByContactId` / HubSpot `favourite_loan_products`
 *     sync reflects the latest state without any worker changes.
 *
 * Call AFTER `replaceConcentForContact` in flows that also send the
 * cumulative `concent[]` array — the explicit single-product event wins.
 */
export const recordLoanProductConsentEvent = async (
  params: RecordLoanProductConsentEventParams,
): Promise<void> => {
  const client = params.tx ?? prisma;

  await client.contactConsents.create({
    data: {
      contact_id: params.contactId,
      loan_product_id: params.loanProductId,
      b2b_partner_id: params.b2bPartnerId ?? null,
      type: LOAN_PRODUCT_DATA_CONSENT_EVENT_TYPE,
      email: params.email ?? null,
      phone: params.phone ?? null,
      response_value: params.consent,
      ip_address: params.ipAddress ?? null,
      created_by: params.createdBy ?? null,
    },
  });

  if (params.consent) {
    await client.contactConsents.updateMany({
      where: {
        contact_id: params.contactId,
        loan_product_id: params.loanProductId,
        type: LOAN_PRODUCT_CONSENT_TYPE,
        is_active: false,
      },
      data: { is_active: true },
    });

    const existing = await client.contactConsents.findFirst({
      where: {
        contact_id: params.contactId,
        loan_product_id: params.loanProductId,
        type: LOAN_PRODUCT_CONSENT_TYPE,
        is_active: true,
      },
      select: { id: true },
    });

    if (!existing) {
      await client.contactConsents.create({
        data: {
          contact_id: params.contactId,
          loan_product_id: params.loanProductId,
          b2b_partner_id: params.b2bPartnerId ?? null,
          type: LOAN_PRODUCT_CONSENT_TYPE,
          email: params.email ?? null,
          phone: params.phone ?? null,
          response_value: true,
          ip_address: params.ipAddress ?? null,
          created_by: params.createdBy ?? null,
        },
      });
    }
  } else {
    await client.contactConsents.updateMany({
      where: {
        contact_id: params.contactId,
        loan_product_id: params.loanProductId,
        type: LOAN_PRODUCT_CONSENT_TYPE,
        is_active: true,
      },
      data: { is_active: false },
    });
  }
};
