import prisma from "../config/prisma";
import logger from "../utils/logger";

export interface LoanEligibilityResult {
  loan_amount: number;
  loan_amount_currency: string;
}

// Types for extract-costs API
export interface ExtractCostsRequest {
  institution_name: string;
  study_level: string;
}

export interface ExtractCostsResponse {
  institution_name?: string;
  study_level?: string;
  tuition_fee?: number | string;
  living_expenses?: number | string;
  currency?: string;
  [key: string]: any; // Allow for additional fields from the API
}

// Types for extract-program API
export interface ExtractProgramRequest {
  institution_name: string;
  program_name: string;
}

export interface ExtractProgramResponse {
  institution_name?: string;
  program_name?: string;
  duration?: string;
  degree_type?: string;
  requirements?: string[];
  curriculum?: string[];
  [key: string]: any; // Allow for additional fields from the API
}

const EXTRACT_COSTS_API_URL =
  process.env.EXTRACT_COSTS_API_URL || "http://43.205.69.172:8086";

export const findLoanEligibility = async (
  data: any
): Promise<LoanEligibilityResult | null> => {
  try {
    const {
      country_of_study,
      level_of_education,
      course_type,
      analytical_exam_name,
      language_exam_name,
      preference,
    } = data;

    const loanRecord = await prisma.loanEligibilityMatrix.findFirst({
      where: {
        country_of_study,
        level_of_education,
        course_type,
        analytical_exam_name,
        language_exam_name,
        preference,
        loan_amount: { not: null },
        loan_amount_currency: { not: null },
      },
      select: {
        loan_amount: true,
        loan_amount_currency: true,
      },
    });

    if (
      !loanRecord ||
      !loanRecord.loan_amount ||
      !loanRecord.loan_amount_currency
    ) {
      return null;
    }

    return {
      loan_amount: Number(loanRecord.loan_amount),
      loan_amount_currency: loanRecord.loan_amount_currency,
    };
  } catch (error) {
    console.error("Error finding loan eligibility:", error);
    throw new Error("Failed to check loan eligibility");
  }
};

export const convertCurrency = async (
  amount: number,
  from: string,
  to: string
): Promise<number | null> => {
  try {
    const result = await prisma.$queryRawUnsafe<{ loan_amount_usd: number }[]>(
      `SELECT $1 * exchange_rate as loan_amount_usd
          FROM currency_conversion
          WHERE from_currency = $2
            AND to_currency = $3
            AND is_active = true
          LIMIT 1
        `,
      amount,
      from,
      to
    );
    return result[0]?.loan_amount_usd ?? 0;
  } catch (error) {
    logger.error("Error in currency change", {
      amount,
      from,
      to,
      error,
    });
    return null;
  }
};

/**
 * Extract institution costs from external API
 * Calls the AI-powered cost extraction service
 */
export const extractInstitutionCosts = async (
  data: ExtractCostsRequest
): Promise<ExtractCostsResponse> => {
  try {
    const { institution_name, study_level } = data;

    logger.info("Calling extract-costs API", {
      institution_name,
      study_level,
    });

    const response = await fetch(`${EXTRACT_COSTS_API_URL}/extract-costs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        institution_name,
        study_level,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Extract costs API error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Extract costs API returned ${response.status}: ${response.statusText}`
      );
    }

    // response.json() is typed as unknown under strict settings, assert to our expected type
    const result = (await response.json()) as ExtractCostsResponse;

    logger.info("Extract costs API response received", {
      institution_name,
      study_level,
      hasResult: !!result,
    });

    return result?.data || {};
  } catch (error) {
    logger.error("Error extracting institution costs", {
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
};

/**
 * Extract program details from external API
 * Calls the AI-powered program extraction service
 */
export const extractProgramDetails = async (
  data: ExtractProgramRequest
): Promise<ExtractProgramResponse> => {
  try {
    const { institution_name, program_name } = data;

    logger.info("Calling extract-program API", {
      institution_name,
      program_name,
    });

    const response = await fetch(`${EXTRACT_COSTS_API_URL}/extract-program/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        institution_name,
        program_name,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Extract program API error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Extract program API returned ${response.status}: ${response.statusText}`
      );
    }

    const result = (await response.json()) as ExtractProgramResponse;

    logger.info("Extract program API response received", {
      institution_name,
      program_name,
      hasResult: !!result,
    });

    return result?.data || {};
  } catch (error) {
    logger.error("Error extracting program details", {
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
};
