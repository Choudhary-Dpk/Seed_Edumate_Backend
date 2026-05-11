import prisma from "../../config/prisma";

/**
 * Append-only event log over `contact_consents`. Two `type` values only:
 *   - 'loan_product' — target is `loan_product_id` (b2b_partner_id is null)
 *   - 'partner'      — target is `b2b_partner_id` (loan_product_id is null)
 *
 * Every consent action (grant or revoke) inserts ONE row. Rows are never
 * updated or deleted. Current state for any (contact, target) is derived
 * from the latest event's `response_value`.
 *
 * App-level enforcement of the (type, target) shape is the choke point
 * because Prisma's DSL can't express the matching DB CHECK constraint —
 * route all writes through the helpers in this file.
 */
export const LOAN_PRODUCT_TYPE = "loan_product";
export const PARTNER_TYPE = "partner";

export interface RecordLoanProductConsentEventParams {
  contactId: number;
  loanProductId: number;
  consent: boolean;
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  createdBy?: string | null;
  tx?: any;
}

export const recordLoanProductConsentEvent = async (
  params: RecordLoanProductConsentEventParams,
): Promise<void> => {
  const client = params.tx ?? prisma;

  await client.contactConsents.create({
    data: {
      contact_id: params.contactId,
      loan_product_id: params.loanProductId,
      b2b_partner_id: null,
      type: LOAN_PRODUCT_TYPE,
      email: params.email ?? null,
      phone: params.phone ?? null,
      response_value: params.consent,
      ip_address: params.ipAddress ?? null,
      created_by: params.createdBy ?? null,
    },
  });
};

export interface RecordPartnerConsentEventParams {
  contactId: number;
  b2bPartnerId: number;
  consent: boolean;
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  createdBy?: string | null;
  tx?: any;
}

export const recordPartnerConsentEvent = async (
  params: RecordPartnerConsentEventParams,
): Promise<void> => {
  const client = params.tx ?? prisma;

  await client.contactConsents.create({
    data: {
      contact_id: params.contactId,
      loan_product_id: null,
      b2b_partner_id: params.b2bPartnerId,
      type: PARTNER_TYPE,
      email: params.email ?? null,
      phone: params.phone ?? null,
      response_value: params.consent,
      ip_address: params.ipAddress ?? null,
      created_by: params.createdBy ?? null,
    },
  });
};

/**
 * Walks `loan_product` events newest-first and keeps the first occurrence
 * per loan_product_id — that row's `response_value` is the current state
 * for that product. Caller-supplied client lets transactional readers see
 * in-flight inserts.
 */
const fetchActiveLoanProducts = async (
  client: any,
  contactId: number,
): Promise<number[]> => {
  const events = await client.contactConsents.findMany({
    where: {
      contact_id: contactId,
      type: LOAN_PRODUCT_TYPE,
      loan_product_id: { not: null },
    },
    select: { loan_product_id: true, response_value: true },
    orderBy: [{ responded_at: "desc" }, { id: "desc" }],
  });

  const seen = new Set<number>();
  const granted: number[] = [];
  for (const e of events) {
    if (e.loan_product_id == null || seen.has(e.loan_product_id)) continue;
    seen.add(e.loan_product_id);
    if (e.response_value === true) granted.push(e.loan_product_id);
  }
  return granted;
};

export const getConcentByContactId = async (
  contactId: number | null | undefined,
): Promise<number[]> => {
  if (!contactId) return [];
  return fetchActiveLoanProducts(prisma, contactId);
};

/**
 * Batched current-state derivation across multiple contacts. Returns a
 * `Map<contactId, grantedProductIds[]>`.
 */
export const getConcentMapForContacts = async (
  contactIds: number[],
): Promise<Map<number, number[]>> => {
  if (!contactIds.length) return new Map();

  const events = await prisma.contactConsents.findMany({
    where: {
      contact_id: { in: contactIds },
      type: LOAN_PRODUCT_TYPE,
      loan_product_id: { not: null },
    },
    select: {
      contact_id: true,
      loan_product_id: true,
      response_value: true,
    },
    orderBy: [{ responded_at: "desc" }, { id: "desc" }],
  });

  const seenByContact = new Map<number, Set<number>>();
  const map = new Map<number, number[]>();
  for (const e of events) {
    if (e.contact_id == null || e.loan_product_id == null) continue;
    let seen = seenByContact.get(e.contact_id);
    if (!seen) {
      seen = new Set<number>();
      seenByContact.set(e.contact_id, seen);
    }
    if (seen.has(e.loan_product_id)) continue;
    seen.add(e.loan_product_id);
    if (e.response_value === true) {
      const list = map.get(e.contact_id) ?? [];
      list.push(e.loan_product_id);
      map.set(e.contact_id, list);
    }
  }
  return map;
};

export interface ReplaceConcentMeta {
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  createdBy?: string | null;
}

/**
 * Diff-based emission of `loan_product` events. Compares the desired set
 * against the current granted set (latest event per product) and emits a
 * grant event for each newly-added product and a revoke event for each
 * newly-removed product. Unchanged products produce no row.
 */
export const replaceConcentForContact = async (
  contactId: number,
  productIds: number[] | null | undefined,
  meta: ReplaceConcentMeta = {},
  tx?: any,
): Promise<void> => {
  const client = tx ?? prisma;

  const desired = new Set(
    Array.isArray(productIds)
      ? productIds.filter(
          (id): id is number => typeof id === "number" && !isNaN(id),
        )
      : [],
  );

  const current = new Set(await fetchActiveLoanProducts(client, contactId));

  const rows: any[] = [];
  for (const id of desired) {
    if (!current.has(id)) {
      rows.push({
        contact_id: contactId,
        loan_product_id: id,
        b2b_partner_id: null,
        type: LOAN_PRODUCT_TYPE,
        email: meta.email ?? null,
        phone: meta.phone ?? null,
        response_value: true,
        ip_address: meta.ipAddress ?? null,
        created_by: meta.createdBy ?? null,
      });
    }
  }
  for (const id of current) {
    if (!desired.has(id)) {
      rows.push({
        contact_id: contactId,
        loan_product_id: id,
        b2b_partner_id: null,
        type: LOAN_PRODUCT_TYPE,
        email: meta.email ?? null,
        phone: meta.phone ?? null,
        response_value: false,
        ip_address: meta.ipAddress ?? null,
        created_by: meta.createdBy ?? null,
      });
    }
  }

  if (rows.length === 0) return;

  await client.contactConsents.createMany({ data: rows });
};
