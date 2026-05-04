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

export interface ExtractCostsProgram {
  program_name: string;
  total_tuition: number;
  /** HubSpot CRM record ID. NULL for AI/PHP-sourced programs. */
  hs_record_id?: string | null;
  /**
   * Local `seed_client_programs.id` — populated for ALL programs once they're in
   * our catalogue (DB hit) or after auto-ingestion (AI/PHP hit). Use this as the
   * stable identifier on the frontend when `hs_record_id` is null.
   */
  seed_client_program_id?: number | null;
}

export interface ExtractCostsResponse {
  institution_name: string;
  study_level: string;
  faculty: string;
  country: string;
  currency: string;
  programs: ExtractCostsProgram[];
}

export type ExtractCostsSource = "db" | "seed_api" | "ai";

export interface ExtractCostsResponseV3 extends ExtractCostsResponse {
  source: ExtractCostsSource;
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
        hs_record_id: null,
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
        hs_record_id: null,
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
 * Look up institution costs from our local DB (seed_client_programs joined
 * with d_universities). This is the cheapest, fastest source — no network call.
 *
 * Field mapping (V3):
 *   institution_name → seed_client_programs.university_name (case-insensitive
 *                       contains; also tries d_universities.name as a fallback)
 *   study_level      → seed_client_programs.study_level (case-insensitive equals)
 *   faculty          → seed_client_programs.subject_area (case-insensitive
 *                       contains, since the column stores semicolon-separated
 *                       free-form values)
 *
 * Returns null if no rows match — caller should then try the next source.
 */
const fetchFromLocalDb = async (
  data: ExtractCostsRequest
): Promise<ExtractCostsResponse | null> => {
  try {
    const { institution_name, study_level, faculty } = data;
    const trimmedName = institution_name.trim();
    const trimmedLevel = study_level.trim();
    const trimmedFaculty = faculty.trim();

    if (!trimmedName || !trimmedLevel || !trimmedFaculty) {
      return null;
    }

    logger.info("Looking up costs from local DB", {
      institution_name: trimmedName,
      study_level: trimmedLevel,
      faculty: trimmedFaculty,
    });

    const rows = await prisma.seed_Client_Programs.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                university_name: {
                  contains: trimmedName,
                  mode: "insensitive",
                },
              },
              {
                university: {
                  OR: [
                    { name: { contains: trimmedName, mode: "insensitive" } },
                    { slug: { contains: trimmedName.toLowerCase().replace(/\s+/g, "-") } },
                  ],
                },
              },
            ],
          },
          {
            study_level: { equals: trimmedLevel, mode: "insensitive" },
          },
          {
            subject_area: { contains: trimmedFaculty, mode: "insensitive" },
          },
        ],
      },
      include: {
        university: {
          select: {
            name: true,
            country: true,
            country_code: true,
            default_currency: true,
          },
        },
      },
      take: 100,
    });

    if (!rows.length) {
      logger.info("Local DB returned no matching programs", {
        institution_name: trimmedName,
        study_level: trimmedLevel,
        faculty: trimmedFaculty,
      });
      return null;
    }

    const first = rows[0];
    const country =
      first.university?.country || first.university?.country_code || "";
    const currency =
      first.currency_code || first.university?.default_currency || "";

    return {
      institution_name:
        first.university?.name || first.university_name || trimmedName,
      study_level: trimmedLevel,
      faculty: trimmedFaculty,
      country,
      currency,
      programs: rows
        .filter((r) => r.program_name) // skip rows with null program_name
        .map((r) => ({
          program_name: r.program_name ?? "",
          total_tuition: r.tuition_fees != null ? Number(r.tuition_fees) : 0,
          // BigInt → string so JSON.stringify doesn't throw
          hs_record_id:
            r.hs_record_id != null ? r.hs_record_id.toString() : null,
          seed_client_program_id: r.id,
        })),
    };
  } catch (error) {
    logger.error("Error querying local DB for institution costs", {
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};

/**
 * V3: Extract institution costs with a 3-tier fallback chain.
 *   Tier 1: Local DB (d_universities + seed_client_programs)
 *   Tier 2: seedglobaleducation.com PHP API
 *   Tier 3: Anthropic AI extract-costs API
 *
 * Response includes a `source` field so callers can tell where the data
 * came from (useful for telemetry and confidence judgement on the frontend).
 */
export const extractInstitutionCostsV3 = async (
  data: ExtractCostsRequest
): Promise<ExtractCostsResponseV3> => {
  const { institution_name, study_level, faculty } = data;

  // Tier 1: local DB
  logger.info("[v3] Trying local DB", { institution_name, study_level, faculty });
  const dbResult = await fetchFromLocalDb(data);
  if (dbResult && dbResult.programs.length > 0) {
    logger.info("[v3] Local DB hit", {
      institution_name,
      programCount: dbResult.programs.length,
    });
    return { ...dbResult, source: "db" };
  }

  // Tier 2: seed PHP API
  logger.info("[v3] DB miss, trying seed PHP API", {
    institution_name,
    study_level,
    faculty,
  });
  const seedResult = await fetchFromPrimaryApi(data);
  if (seedResult) {
    logger.info("[v3] Seed API hit", { institution_name });
    return { ...seedResult, source: "seed_api" };
  }

  // Tier 3: Anthropic AI extract-costs
  logger.info("[v3] Seed miss, trying AI extract-costs", {
    institution_name,
    study_level,
    faculty,
  });
  const aiResult = await fetchFromFallbackApi(data);
  if (aiResult) {
    logger.info("[v3] AI extract-costs hit", { institution_name });
    return { ...aiResult, source: "ai" };
  }

  logger.error("[v3] All three sources failed", {
    institution_name,
    study_level,
    faculty,
  });
  throw new Error(
    "Unable to extract institution costs from local DB, seed API, or AI fallback"
  );
};

/**
 * Resolve a d_universities row by name. Mirrors the service used by
 * /api/universities/by-name — slug → name contains, case-insensitive.
 * Returns null if no match (caller should skip the university interest insert).
 */
const resolveUniversityIdByName = async (
  institutionName: string
): Promise<bigint | null> => {
  const trimmed = institutionName.trim();
  if (!trimmed) return null;

  const slug = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const bySlug = await prisma.d_universities.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (bySlug) return bySlug.id;

  const byAlias = await prisma.$queryRawUnsafe<{ id: bigint }[]>(
    `SELECT id FROM d_universities WHERE aliases @> $1::jsonb LIMIT 1`,
    JSON.stringify([slug])
  );
  if (byAlias?.[0]) return byAlias[0].id;

  const byIlike = await prisma.d_universities.findFirst({
    where: { name: { contains: trimmed, mode: "insensitive" } },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  return byIlike?.id ?? null;
};

/**
 * Find-or-create a `seed_client_programs` row for an AI/PHP-sourced program.
 * Lets the catalogue grow organically as users search for programs we don't
 * yet have. Subsequent V3 calls for the same (university, study_level,
 * subject_area, program_name) will hit the local DB instead of falling through
 * to AI.
 *
 * Idempotent: returns the existing row id if one already matches.
 *
 * Match key: (university_id OR university_name) + study_level + subject_area
 *            + LOWER(program_name)
 */
const upsertSeedClientProgramFromExternal = async (input: {
  programName: string;
  tuition: number | null;
  currencyCode: string | null;
  universityId: bigint | null;
  universityName: string | null;
  studyLevel: string | null;
  subjectArea: string | null;
  source: "ai" | "seed_api";
}): Promise<number | null> => {
  const programName = input.programName.trim();
  if (!programName) return null;

  try {
    // Try to find an existing row first.
    const existing = await prisma.seed_Client_Programs.findFirst({
      where: {
        program_name: { equals: programName, mode: "insensitive" },
        ...(input.universityId
          ? { university_id: input.universityId }
          : input.universityName
            ? {
                university_name: {
                  equals: input.universityName,
                  mode: "insensitive",
                },
              }
            : {}),
        ...(input.studyLevel
          ? { study_level: { equals: input.studyLevel, mode: "insensitive" } }
          : {}),
        ...(input.subjectArea
          ? { subject_area: { contains: input.subjectArea, mode: "insensitive" } }
          : {}),
      },
      select: { id: true, tuition_fees: true },
    });

    if (existing) {
      // Refresh tuition if we have new data and existing is null.
      if (existing.tuition_fees == null && input.tuition != null) {
        await prisma.seed_Client_Programs.update({
          where: { id: existing.id },
          data: {
            tuition_fees: input.tuition,
            currency_code: input.currencyCode ?? undefined,
          },
        });
      }
      return existing.id;
    }

    // Create new — hs_record_id / hs_company_id stay NULL for AI/PHP rows.
    const created = await prisma.seed_Client_Programs.create({
      data: {
        program_name: programName,
        university_id: input.universityId ?? null,
        university_name: input.universityName ?? null,
        study_level: input.studyLevel ?? null,
        subject_area: input.subjectArea ?? null,
        tuition_fees: input.tuition ?? null,
        currency_code: input.currencyCode ?? null,
        source: input.source,
      },
      select: { id: true },
    });

    logger.info("[v3-interests] auto-ingested new seed_client_programs row", {
      seedProgramId: created.id,
      programName,
      source: input.source,
      universityId: input.universityId?.toString() ?? null,
    });

    return created.id;
  } catch (err) {
    logger.error("[v3-interests] failed to upsert seed_client_programs from external source", {
      programName,
      error: err instanceof Error ? err.message : err,
    });
    return null;
  }
};

export interface RecordContactInterestsInput {
  contactId: number;
  institutionName: string;
  studyLevel?: string | null;
  faculty?: string | null;
  programs: ExtractCostsProgram[];
  b2bPartnerId?: number | null;
  intakeMonth?: string | null;
  intakeYear?: string | null;
  source?: string | null;
  /**
   * If provided, ONLY this program is recorded as the user's interest.
   * Other programs in the `programs` array are ignored. Used when the user
   * has explicitly picked one program from the V3 results.
   *
   * Match priority:
   *   1. `selectedSeedClientProgramId` — direct local id
   *   2. `selectedProgramHsRecordId` — resolves to seed_client_programs row
   *   3. Neither → all programs in the array are recorded (legacy behavior)
   */
  selectedSeedClientProgramId?: number | null;
  selectedProgramHsRecordId?: string | null;
}

export interface RecordContactInterestsResult {
  university_interest_id: number | null;
  university_id: string | null;
  program_interest_ids: number[];
  /**
   * Number of program interest rows inserted WITHOUT a seed_client_program_id
   * FK link (i.e. programs from PHP / AI sources). The rows are still persisted
   * with program_name + tuition snapshot, just not joined to the seed catalogue.
   */
  programs_without_seed_link: number;
}

/**
 * Persist a (contact ↔ university) row and (contact ↔ seed_client_program)
 * rows for each program returned from extract-costs. Idempotent — re-running
 * with the same (contact, university/program) upserts the existing row so we
 * don't accumulate duplicates on repeated form submissions.
 *
 * Programs without an `hs_record_id` (i.e. ones served from the PHP API or AI
 * fallback rather than our seed catalogue) are skipped here, since they have
 * no FK to point at on `seed_client_programs`.
 */
export const recordContactInterestsForCosts = async (
  input: RecordContactInterestsInput
): Promise<RecordContactInterestsResult> => {
  const {
    contactId,
    institutionName,
    studyLevel,
    faculty,
    programs: allPrograms,
    b2bPartnerId,
    intakeMonth,
    intakeYear,
    source = "extract-costs-v3",
    selectedSeedClientProgramId,
    selectedProgramHsRecordId,
  } = input;

  // If the caller indicated a specific user selection, narrow the program list
  // to just that one. Otherwise we record all matching programs (legacy).
  let programs = allPrograms;
  if (selectedSeedClientProgramId != null) {
    programs = allPrograms.filter(
      (p) => p.seed_client_program_id === selectedSeedClientProgramId
    );
    if (programs.length === 0) {
      logger.warn(
        `[v3-interests] selected_seed_client_program_id=${selectedSeedClientProgramId} not found in programs list — falling back to record nothing`
      );
    }
  } else if (selectedProgramHsRecordId) {
    programs = allPrograms.filter(
      (p) =>
        p.hs_record_id != null &&
        String(p.hs_record_id) === String(selectedProgramHsRecordId)
    );
    if (programs.length === 0) {
      logger.warn(
        `[v3-interests] selected_program_hs_record_id=${selectedProgramHsRecordId} not found in programs list — falling back to record nothing`
      );
    }
  }

  const result: RecordContactInterestsResult = {
    university_interest_id: null,
    university_id: null,
    program_interest_ids: [],
    programs_without_seed_link: 0,
  };

  // 1. University interest
  const universityId = await resolveUniversityIdByName(institutionName);
  if (!universityId) {
    logger.info("[v3-interests] no d_universities match — skipping university interest", {
      contactId,
      institutionName,
    });
  } else {
    result.university_id = universityId.toString();
    try {
      const universityInterest = await prisma.hSEdumateContactUniversityInterests.upsert({
        where: {
          contact_id_university_id: {
            contact_id: contactId,
            university_id: universityId,
          },
        },
        create: {
          contact_id: contactId,
          university_id: universityId,
          interest_type: "target",
          target_degree_level: studyLevel ?? null,
          target_course_major: faculty ?? null,
          intake_month: intakeMonth ?? null,
          intake_year: intakeYear ?? null,
          b2b_partner_id: b2bPartnerId ?? null,
          source: source ?? null,
        },
        update: {
          // Only refresh fields that are explicitly provided this round.
          ...(studyLevel ? { target_degree_level: studyLevel } : {}),
          ...(faculty ? { target_course_major: faculty } : {}),
          ...(intakeMonth ? { intake_month: intakeMonth } : {}),
          ...(intakeYear ? { intake_year: intakeYear } : {}),
          ...(b2bPartnerId ? { b2b_partner_id: b2bPartnerId } : {}),
        },
      });
      result.university_interest_id = universityInterest.id;
    } catch (err) {
      logger.error("[v3-interests] failed to upsert university interest", {
        contactId,
        universityId: universityId.toString(),
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  // 2a. Wipe out old program interests for this (contact, university) before
  // inserting the new selection. Ensures that when a student returns and picks
  // different programs at the same university, the previous selection is
  // REPLACED (not appended). University-scoped delete only — interests at
  // other universities are untouched. Matches both FK-linked rows (via
  // program.university_id) and FK-less rows (via program_interest.university_id).
  if (universityId) {
    try {
      const deleted = await prisma.hSEdumateContactProgramInterests.deleteMany({
        where: {
          contact_id: contactId,
          OR: [
            { program: { university_id: universityId } },
            { university_id: universityId },
          ],
        },
      });
      if (deleted.count > 0) {
        logger.info(
          `[v3-interests] cleared ${deleted.count} prior program interest(s) for (contact=${contactId}, university=${universityId.toString()})`
        );
      }
    } catch (err) {
      logger.error("[v3-interests] failed to clear prior program interests", {
        contactId,
        universityId: universityId.toString(),
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  // 2b. Insert program interests. For each program returned by V3:
  //   - If `hs_record_id` is present and matches a seed_client_programs row → use that FK
  //   - Otherwise (AI / PHP source) → auto-ingest the program into seed_client_programs
  //     (so future V3 calls hit the local DB) and use the new row's id as the FK
  //   - Either way, link program_interest with a non-null seed_client_program_id when possible
  for (const program of programs) {
    let seedProgramId: number | null = null;

    // Path A: seed_client_programs match via existing hs_record_id
    if (program.hs_record_id) {
      try {
        const seedProgram = await prisma.seed_Client_Programs.findUnique({
          where: { hs_record_id: BigInt(program.hs_record_id) },
          select: { id: true },
        });
        seedProgramId = seedProgram?.id ?? null;
      } catch {
        seedProgramId = null;
      }
    }

    // Path B: no hs_record_id (AI / PHP source) — auto-ingest into the catalogue
    // so it's findable next time.
    if (!seedProgramId && program.program_name) {
      seedProgramId = await upsertSeedClientProgramFromExternal({
        programName: program.program_name,
        tuition: program.total_tuition ?? null,
        currencyCode: null, // currency snapshot lives on program_interest
        universityId: universityId ?? null,
        universityName: institutionName,
        studyLevel: studyLevel ?? null,
        subjectArea: faculty ?? null,
        source: "ai",
      });
    }

    // Annotate the program object so the V3 response surfaces the canonical id.
    program.seed_client_program_id = seedProgramId;

    try {
      const programInterest = await prisma.hSEdumateContactProgramInterests.create({
        data: {
          contact_id: contactId,
          seed_client_program_id: seedProgramId,
          university_id: universityId ?? null,
          program_name: program.program_name || null,
          interest_type: "target",
          intake_month: intakeMonth ?? null,
          intake_year: intakeYear ?? null,
          expected_tuition: program.total_tuition ? program.total_tuition : null,
          b2b_partner_id: b2bPartnerId ?? null,
          source: source ?? null,
        },
      });
      result.program_interest_ids.push(programInterest.id);
      if (!seedProgramId) {
        result.programs_without_seed_link += 1;
      }
    } catch (err) {
      logger.error("[v3-interests] failed to insert program interest", {
        contactId,
        seedProgramId,
        program_name: program.program_name,
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  logger.info("[v3-interests] interests persisted", {
    contactId,
    universityId: result.university_id,
    universityInterestId: result.university_interest_id,
    programInterestCount: result.program_interest_ids.length,
    programsSkipped: result.programs_without_seed_link,
  });

  return result;
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
