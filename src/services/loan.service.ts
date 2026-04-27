import prisma from "../config/prisma";
import logger from "../utils/logger";
import axios from "axios";

export interface LoanEligibilityResult {
  loan_amount: number;
  loan_amount_currency: string;
}

// Types for extract-costs API
export interface ExtractCostsRequest {
  institution_name: string;
  study_level: string;
  faculty: string;
}

export interface ExtractCostsResponse {
  institution_name: string;
  study_level: string;
  faculty: string;
  country: string;
  currency: string;
  programs: Array<{
    program_name: string;
    total_tuition: number;
  }>;
}

// Internal types for external API responses
interface PrimaryApiResponse {
  success: boolean;
  data?: {
    institution_name?: string;
    country?: string;
    currency?: string;
    study_level?: string;
    faculty?: string;
    programs?: Array<{
      program_name?: string;
      tuition_fees?: number;
      minimum_duration?: number;
      maximum_duration?: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

interface FallbackApiResponse {
  data?: {
    institution_name?: string;
    country?: string;
    currency?: string;
    programs?: Array<{
      program_name?: string;
      total_tuition?: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
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

const PRIMARY_COSTS_API_URL =
  process.env.PRIMARY_COSTS_API_URL || "https://seedglobaleducation.com/api";

// Map new study_level values to old format for fallback API
const STUDY_LEVEL_MAP: Record<string, string> = {
  "Undergraduate": "undergraduate",
  "Graduate - Masters": "graduate_masters",
  "Graduate - MBA": "graduate_mba",
  "PhD": "phd",
};

/**
 * Fetch costs from the primary API (seedglobaleducation.com)
 * Returns null on failure to enable fallback
 */
const fetchFromPrimaryApi = async (
  data: ExtractCostsRequest
): Promise<ExtractCostsResponse | null> => {
  try {
    const { institution_name, study_level, faculty } = data;

    logger.info("Calling primary costs API (seedglobaleducation.com)", {
      institution_name,
      study_level,
      faculty,
    });

    const response = await axios.post<PrimaryApiResponse>(
      `${PRIMARY_COSTS_API_URL}/program_details.php`,
      { institution_name, study_level, faculty },
      { timeout: 15000 }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      logger.info("Primary costs API returned success=false", { institution_name });
      return null;
    }

    const apiData = result.data;
    const programs = Array.isArray(apiData.programs) ? apiData.programs : [];

    return {
      institution_name: apiData.institution_name ?? institution_name,
      study_level,
      faculty,
      country: apiData.country ?? "",
      currency: apiData.currency ?? "",
      programs: programs.map((p) => ({
        program_name: p.program_name ?? "",
        total_tuition: Number(p.tuition_fees) || 0,
      })),
    };
  } catch (error) {
    logger.error("Error calling primary costs API", {
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};

/**
 * Fetch costs from the fallback API (existing extract-costs service)
 * Returns null on failure
 */
const fetchFromFallbackApi = async (
  data: ExtractCostsRequest
): Promise<ExtractCostsResponse | null> => {
  try {

    const { institution_name, study_level, faculty } = data;

    const mappedStudyLevel = STUDY_LEVEL_MAP[study_level] || study_level.toLowerCase();

    logger.info("Calling fallback costs API", {
      institution_name,
      study_level: mappedStudyLevel,
    });

    const response = await axios.post<FallbackApiResponse>(
      `${EXTRACT_COSTS_API_URL}/extract-costs/`,
      { institution_name, study_level: study_level, faculty },
      { timeout: 15000 }
    );

    const apiData = response.data?.data || {};

    const programs = Array.isArray(apiData.programs) ? apiData.programs : [];

    return {
      institution_name: apiData.institution_name ?? institution_name,
      study_level,
      faculty,
      country: apiData.country ?? "",
      currency: apiData.currency ?? "",
      programs: programs.map((p) => ({
        program_name: p.program_name ?? "",
        total_tuition: Number(p.total_tuition) || 0,
      })),
    };
  } catch (error) {
    logger.error("Error calling fallback costs API", {
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};

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
 * Extract institution costs using primary API with fallback
 * Step 1: Try seedglobaleducation.com API
 * Step 2: Fallback to existing extract-costs API
 */
export const extractInstitutionCosts = async (
  data: ExtractCostsRequest
): Promise<ExtractCostsResponse> => {
  const { institution_name, study_level, faculty } = data;

  // Step 1: Try primary API
  logger.info("Attempting primary costs API", { institution_name, study_level, faculty });
  const primaryResult = await fetchFromPrimaryApi(data);
  if (primaryResult) {
    logger.info("Primary costs API succeeded", { institution_name });
    return primaryResult;
  }

  // Step 2: Fallback to existing API
  logger.info("Primary API failed, falling back to extract-costs API", { institution_name, study_level, faculty });
  const fallbackResult = await fetchFromFallbackApi(data);
  if (fallbackResult) {
    logger.info("Fallback costs API succeeded", { institution_name });
    return fallbackResult;
  }

  // Both failed
  logger.error("Both costs APIs failed", { institution_name, study_level, faculty });
  throw new Error("Unable to extract institution costs from any available source");
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
