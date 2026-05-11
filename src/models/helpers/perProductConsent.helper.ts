import { validateLoanProductIds } from "./student.helper";

export interface PerProductConsentPayload {
  loanProductId: number;
  consent: boolean;
}

export interface PerProductConsentValidationResult {
  present: boolean;
  error?: string;
  payload?: PerProductConsentPayload;
}

/**
 * Validates the paired `loan_product_data_consent` (boolean) + `loan_product_id`
 * (number) fields sent from the loan products list & detail pages. The two
 * fields are always sent together; partial payloads are rejected with 400.
 *
 *   - Neither key present       → { present: false }                (skip)
 *   - Exactly one key present   → { present: true, error: "..." }   (400)
 *   - Wrong types               → { present: true, error: "..." }   (400)
 *   - Unknown / inactive id     → { present: true, error: "..." }   (400)
 *   - All good                  → { present: true, payload: ... }
 */
export const validatePerProductConsent = async (
  body: Record<string, any>,
): Promise<PerProductConsentValidationResult> => {
  const hasConsent = Object.prototype.hasOwnProperty.call(
    body ?? {},
    "loan_product_data_consent",
  );
  const hasProductId = Object.prototype.hasOwnProperty.call(
    body ?? {},
    "loan_product_id",
  );

  if (!hasConsent && !hasProductId) {
    return { present: false };
  }

  if (hasConsent !== hasProductId) {
    return {
      present: true,
      error:
        "loan_product_data_consent and loan_product_id must be sent together",
    };
  }

  const consent = body.loan_product_data_consent;
  const loanProductId = body.loan_product_id;

  if (typeof consent !== "boolean") {
    return {
      present: true,
      error: "loan_product_data_consent must be a boolean",
    };
  }

  if (
    typeof loanProductId !== "number" ||
    !Number.isInteger(loanProductId) ||
    loanProductId <= 0
  ) {
    return {
      present: true,
      error: "loan_product_id must be a positive integer",
    };
  }

  const { invalid } = await validateLoanProductIds([loanProductId]);
  if (invalid.length > 0) {
    return {
      present: true,
      error: `Invalid or inactive loan_product_id: ${loanProductId}`,
    };
  }

  return {
    present: true,
    payload: { loanProductId, consent },
  };
};
