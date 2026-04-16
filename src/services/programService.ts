import prisma from "../config/prisma";
import { PythonFetchResult, Program, FetchWarning } from "../types/program";
import { createTaskLogger } from "../utils/logger";

const log = createTaskLogger("program-service");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTTL(status: string): Date {
  const now = new Date();
  switch (status) {
    case "success":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    case "partial":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    case "not_found":
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    default: // failed, timeout
      return new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour
  }
}

function amountToBigint(val: number | null | undefined): bigint | null {
  if (val == null) return null;
  return BigInt(Math.round(val));
}

function truncate(val: string | null | undefined, max: number): string | null {
  if (val == null) return null;
  return val.length > max ? val.slice(0, max) : val;
}

// ---------------------------------------------------------------------------
// getCachedResult
// ---------------------------------------------------------------------------

export async function getCachedResult(
  university: string,
  degreeType: string,
  studentType: string
): Promise<{ data: PythonFetchResult; fetchedAt: Date } | null> {
  const querySlug = slugify(university);

  // Step 1: Direct match on the request's exact university_name + degree + student_type.
  // This is the fast path — same user, same query, returns cached row.
  let runs: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM f_program_fetch_runs
     WHERE university_name = $1
       AND degree_type = $2
       AND student_type = $3
       AND status IN ('success', 'partial')
       AND completed_at IS NOT NULL
     ORDER BY completed_at DESC
     LIMIT 1`,
    university,
    degreeType,
    studentType
  );

  // Step 2: Alias-based fallback. If the user types the same university with
  // a different name (e.g. "MIT" vs "Massachusetts Institute of Technology"),
  // their query slug will already exist in d_universities.aliases from a
  // previous fetch — so we can reuse that data instead of re-running Python.
  if (!runs.length) {
    runs = await prisma.$queryRawUnsafe(
      `SELECT r.id
         FROM f_program_fetch_runs r
         JOIN d_universities u ON u.id = r.university_id
        WHERE (u.slug = $1 OR u.aliases @> $2::jsonb)
          AND r.degree_type = $3
          AND r.student_type = $4
          AND r.status IN ('success', 'partial')
          AND r.completed_at IS NOT NULL
        ORDER BY r.completed_at DESC
        LIMIT 1`,
      querySlug,
      JSON.stringify([querySlug]),
      degreeType,
      studentType
    );
  }

  if (!runs.length) return null;

  // Pull programs tied to that fetch run (not expired, still active)
  const fetchRunId = runs[0].id;

  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT
       u.name       AS university_name,
       u.country_code,
       u.default_currency,
       p.name       AS program_name,
       p.slug       AS program_slug,
       p.degree_type,
       p.student_type,
       p.academic_year,
       p.category,
       p.area_of_study,
       p.department,
       p.duration,
       p.credits_required,
       p.delivery_mode,
       p.program_url,
       p.fee_amount,
       p.fee_amount_min,
       p.fee_amount_max,
       p.fee_is_range,
       p.fee_currency,
       p.fee_currency_inferred,
       p.fee_period,
       p.fee_per_credit_cost,
       p.fee_total_estimated_cost,
       p.fee_includes,
       p.fee_source_url,
       p.fee_exact_quote,
       p.fee_type,
       p.fee_validated,
       p.fee_match_method,
       p.fee_match_score,
       p.fee_confidence,
       p.fetched_at,
       p.expires_at
     FROM d_university_programs p
     JOIN d_universities u ON u.id = p.university_id
     WHERE p.fetch_run_id = $1
       AND p.is_active = TRUE
       AND p.expires_at > NOW()
     ORDER BY p.name`,
    fetchRunId
  );

  if (!rows.length) return null;

  const first = rows[0];

  const programs: Program[] = rows.map((r) => ({
    program_name: r.program_name,
    category: r.category,
    area_of_study: r.area_of_study,
    department: r.department,
    duration: r.duration,
    credits_required: r.credits_required ? Number(r.credits_required) : null,
    delivery_mode: r.delivery_mode,
    url: r.program_url,
    tuition_fee:
      r.fee_amount != null || r.fee_amount_min != null
        ? {
            amount: r.fee_amount != null ? Number(r.fee_amount) : null,
            currency: r.fee_currency,
            fee_period: r.fee_period,
            is_range: r.fee_is_range ?? false,
            amount_min: r.fee_amount_min != null ? Number(r.fee_amount_min) : null,
            amount_max: r.fee_amount_max != null ? Number(r.fee_amount_max) : null,
            fee_source_url: r.fee_source_url,
            exact_quote: r.fee_exact_quote,
            validated: r.fee_validated ?? false,
            match_method: r.fee_match_method,
            match_score: r.fee_match_score != null ? Number(r.fee_match_score) : null,
            confidence: r.fee_confidence,
            currency_inferred: r.fee_currency_inferred ?? false,
            fee_type: r.fee_type ?? "tuition",
            per_credit_cost: r.fee_per_credit_cost != null ? Number(r.fee_per_credit_cost) : null,
            total_estimated_cost:
              r.fee_total_estimated_cost != null ? Number(r.fee_total_estimated_cost) : null,
            includes: r.fee_includes,
          }
        : null,
  }));

  const data: PythonFetchResult = {
    found: true,
    university: first.university_name,
    degree_type: first.degree_type,
    student_type: first.student_type,
    academic_year: first.academic_year,
    country_code: first.country_code,
    default_currency: first.default_currency,
    confidence: null,
    total_programs: programs.length,
    source_urls: [],
    notes: null,
    programs,
  };

  return { data, fetchedAt: first.fetched_at };
}

// ---------------------------------------------------------------------------
// getResultByFetchRunId — fetch programs tied to a specific fetch run
// ---------------------------------------------------------------------------

export async function getResultByFetchRunId(
  fetchRunId: bigint
): Promise<{ data: PythonFetchResult; fetchedAt: Date } | null> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT
       u.name       AS university_name,
       u.country_code,
       u.default_currency,
       p.name       AS program_name,
       p.slug       AS program_slug,
       p.degree_type,
       p.student_type,
       p.academic_year,
       p.category,
       p.area_of_study,
       p.department,
       p.duration,
       p.credits_required,
       p.delivery_mode,
       p.program_url,
       p.fee_amount,
       p.fee_amount_min,
       p.fee_amount_max,
       p.fee_is_range,
       p.fee_currency,
       p.fee_currency_inferred,
       p.fee_period,
       p.fee_per_credit_cost,
       p.fee_total_estimated_cost,
       p.fee_includes,
       p.fee_source_url,
       p.fee_exact_quote,
       p.fee_type,
       p.fee_validated,
       p.fee_match_method,
       p.fee_match_score,
       p.fee_confidence,
       p.fetched_at,
       p.expires_at
     FROM d_university_programs p
     JOIN d_universities u ON u.id = p.university_id
     WHERE p.fetch_run_id = $1
       AND p.is_active = TRUE
     ORDER BY p.name`,
    fetchRunId
  );

  if (!rows.length) return null;

  const first = rows[0];

  const programs: Program[] = rows.map((r) => ({
    program_name: r.program_name,
    category: r.category,
    area_of_study: r.area_of_study,
    department: r.department,
    duration: r.duration,
    credits_required: r.credits_required ? Number(r.credits_required) : null,
    delivery_mode: r.delivery_mode,
    url: r.program_url,
    tuition_fee:
      r.fee_amount != null || r.fee_amount_min != null
        ? {
            amount: r.fee_amount != null ? Number(r.fee_amount) : null,
            currency: r.fee_currency,
            fee_period: r.fee_period,
            is_range: r.fee_is_range ?? false,
            amount_min: r.fee_amount_min != null ? Number(r.fee_amount_min) : null,
            amount_max: r.fee_amount_max != null ? Number(r.fee_amount_max) : null,
            fee_source_url: r.fee_source_url,
            exact_quote: r.fee_exact_quote,
            validated: r.fee_validated ?? false,
            match_method: r.fee_match_method,
            match_score: r.fee_match_score != null ? Number(r.fee_match_score) : null,
            confidence: r.fee_confidence,
            currency_inferred: r.fee_currency_inferred ?? false,
            fee_type: r.fee_type ?? "tuition",
            per_credit_cost: r.fee_per_credit_cost != null ? Number(r.fee_per_credit_cost) : null,
            total_estimated_cost:
              r.fee_total_estimated_cost != null ? Number(r.fee_total_estimated_cost) : null,
            includes: r.fee_includes,
          }
        : null,
  }));

  const data: PythonFetchResult = {
    found: true,
    university: first.university_name,
    degree_type: first.degree_type,
    student_type: first.student_type,
    academic_year: first.academic_year,
    country_code: first.country_code,
    default_currency: first.default_currency,
    confidence: null,
    total_programs: programs.length,
    source_urls: [],
    notes: null,
    programs,
  };

  return { data, fetchedAt: first.fetched_at };
}

// ---------------------------------------------------------------------------
// Fetch-run logging
// ---------------------------------------------------------------------------

export async function logFetchRun(params: {
  universityName: string;
  degreeType: string;
  studentType: string;
}): Promise<bigint> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `INSERT INTO f_program_fetch_runs (university_name, degree_type, student_type, status, started_at)
     VALUES ($1, $2, $3, 'running', NOW())
     RETURNING id`,
    params.universityName,
    params.degreeType,
    params.studentType
  );
  return rows[0].id;
}

// ---------------------------------------------------------------------------
// Async job helpers
// ---------------------------------------------------------------------------

export async function createQueuedFetchRun(params: {
  universityName: string;
  degreeType: string;
  studentType: string;
}): Promise<{ id: bigint; jobId: string }> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `INSERT INTO f_program_fetch_runs (university_name, degree_type, student_type, status, started_at)
     VALUES ($1, $2, $3, 'queued', NOW())
     RETURNING id, job_id`,
    params.universityName,
    params.degreeType,
    params.studentType
  );
  return { id: rows[0].id, jobId: rows[0].job_id };
}

export async function getJobByJobId(jobId: string): Promise<{
  id: bigint;
  status: string;
  phase: string | null;
  progressPercent: number | null;
  progressMessage: string | null;
  universityName: string | null;
  degreeType: string | null;
  studentType: string | null;
  startedAt: Date | null;
  errorMessage: string | null;
} | null> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, status, phase, progress_percent, progress_message,
            university_name, degree_type, student_type, started_at, error_message
     FROM f_program_fetch_runs
     WHERE job_id = $1::uuid`,
    jobId
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    status: r.status,
    phase: r.phase,
    progressPercent: r.progress_percent,
    progressMessage: r.progress_message,
    universityName: r.university_name,
    degreeType: r.degree_type,
    studentType: r.student_type,
    startedAt: r.started_at,
    errorMessage: r.error_message,
  };
}

export async function updateJobProgress(
  fetchRunId: bigint,
  phase: string,
  progressPercent: number,
  progressMessage: string
): Promise<void> {
  await prisma.$queryRawUnsafe(
    `UPDATE f_program_fetch_runs
     SET phase = $2, progress_percent = $3, progress_message = $4
     WHERE id = $1`,
    fetchRunId,
    phase,
    progressPercent,
    progressMessage
  );
}

export async function markJobRunning(fetchRunId: bigint): Promise<void> {
  await prisma.$queryRawUnsafe(
    `UPDATE f_program_fetch_runs
     SET status = 'running', started_at = NOW()
     WHERE id = $1`,
    fetchRunId
  );
}

export async function markJobTimedOut(jobId: string): Promise<void> {
  await prisma.$queryRawUnsafe(
    `UPDATE f_program_fetch_runs
     SET status = 'timeout', error_message = 'Exceeded 5-minute limit', completed_at = NOW()
     WHERE job_id = $1::uuid`,
    jobId
  );
}

export async function updateFetchRun(
  id: bigint,
  updates: {
    status?: string;
    universityId?: bigint;
    programsFound?: number;
    feesValidated?: number;
    confidence?: string | null;
    sourceUrls?: string[];
    notes?: string | null;
    executionTimeMs?: number;
    costUsd?: number;
    errorMessage?: string | null;
  }
): Promise<void> {
  await prisma.$queryRawUnsafe(
    `UPDATE f_program_fetch_runs SET
       status = COALESCE($2, status),
       university_id = COALESCE($3, university_id),
       programs_found = COALESCE($4, programs_found),
       fees_validated = COALESCE($5, fees_validated),
       confidence = COALESCE($6, confidence),
       source_urls = COALESCE($7::jsonb, source_urls),
       notes = COALESCE($8, notes),
       execution_time_ms = COALESCE($9, execution_time_ms),
       cost_usd = COALESCE($10, cost_usd),
       error_message = COALESCE($11, error_message),
       completed_at = NOW()
     WHERE id = $1`,
    id,
    updates.status ?? null,
    updates.universityId ?? null,
    updates.programsFound ?? null,
    updates.feesValidated ?? null,
    updates.confidence ?? null,
    updates.sourceUrls ? JSON.stringify(updates.sourceUrls) : null,
    updates.notes ?? null,
    updates.executionTimeMs ?? null,
    updates.costUsd ?? null,
    updates.errorMessage ?? null
  );
}

// ---------------------------------------------------------------------------
// saveResult — transactional upsert
// ---------------------------------------------------------------------------

export async function saveResult(
  result: PythonFetchResult,
  fetchRunId: bigint,
  request?: { university: string; degreeType: string; studentType: string }
): Promise<{ programsInserted: number; feesInserted: number; programsSkipped: number; status: string }> {
  // Canonical slug from LLM-resolved name (e.g. "MIT Sloan School of Management" → "mit-sloan-school-of-management")
  const canonicalSlug = slugify(result.university);
  // User's query slug (e.g. "MIT" → "mit") — used as alias for future cache hits
  const querySlug = request ? slugify(request.university) : canonicalSlug;

  // CRITICAL: store programs under REQUEST's degree_type & student_type, not the LLM's.
  // The LLM normalizes "MBA" → "Bachelor"/"Masters"/etc. inconsistently, which would
  // cause cache misses and duplicate program rows. The user's input is the stable key.
  const storedDegreeType = request?.degreeType ?? result.degree_type;
  const storedStudentType = request?.studentType ?? result.student_type;

  let programsInserted = 0;
  let feesInserted = 0;
  let programsSkipped = 0;

  try {
    await prisma.$transaction(async (tx) => {
      // ── Step 1: Find or create university (with alias-based dedup) ──
      // First try to find an existing row that matches by either:
      //   (a) canonical slug (LLM returned the same name we've seen before), OR
      //   (b) any alias (this user query has previously resolved to a row)
      const existing: any[] = await tx.$queryRawUnsafe(
        `SELECT id FROM d_universities
         WHERE slug = $1
            OR aliases @> $2::jsonb
         LIMIT 1`,
        canonicalSlug,
        JSON.stringify([querySlug])
      );

      let universityId: bigint;

      if (existing.length > 0) {
        // Reuse — append both slugs to aliases (DISTINCT) and refresh metadata
        universityId = existing[0].id;
        await tx.$queryRawUnsafe(
          `UPDATE d_universities
             SET name = $1,
                 country_code = COALESCE($2, country_code),
                 default_currency = COALESCE($3, default_currency),
                 aliases = (
                   SELECT jsonb_agg(DISTINCT a)
                   FROM jsonb_array_elements_text(
                     COALESCE(aliases, '[]'::jsonb) || $4::jsonb
                   ) AS a
                 ),
                 updated_at = NOW()
           WHERE id = $5`,
          result.university,
          result.country_code ?? null,
          result.default_currency ?? null,
          JSON.stringify([querySlug, canonicalSlug]),
          universityId
        );
      } else {
        // Insert new — store both slugs as aliases for future lookups
        const uniRows: any[] = await tx.$queryRawUnsafe(
          `INSERT INTO d_universities
             (name, slug, country_code, default_currency, aliases, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
           ON CONFLICT (slug) DO UPDATE SET
             name = EXCLUDED.name,
             country_code = COALESCE(EXCLUDED.country_code, d_universities.country_code),
             default_currency = COALESCE(EXCLUDED.default_currency, d_universities.default_currency),
             aliases = (
               SELECT jsonb_agg(DISTINCT a)
               FROM jsonb_array_elements_text(
                 COALESCE(d_universities.aliases, '[]'::jsonb) || EXCLUDED.aliases
               ) AS a
             ),
             updated_at = NOW()
           RETURNING id`,
          result.university,
          canonicalSlug,
          result.country_code ?? null,
          result.default_currency ?? null,
          JSON.stringify([querySlug, canonicalSlug])
        );
        universityId = uniRows[0].id;
      }

      // Link fetch run to university
      await tx.$queryRawUnsafe(
        `UPDATE f_program_fetch_runs SET university_id = $1 WHERE id = $2`,
        universityId,
        fetchRunId
      );

      // Determine status for TTL
      const hasPrograms = result.programs.length > 0;
      const feesCount = result.programs.filter((p) => p.tuition_fee?.amount != null).length;
      let status: string;
      if (!hasPrograms) {
        status = "not_found";
      } else if (feesCount === result.programs.length) {
        status = "success";
      } else {
        status = "partial";
      }
      const expiresAt = getTTL(status);

      // Upsert each program (use SAVEPOINTs so one bad row doesn't abort the tx)
      for (let i = 0; i < result.programs.length; i++) {
        const prog = result.programs[i];
        const sp = `sp_prog_${i}`;
        try {
          await tx.$executeRawUnsafe(`SAVEPOINT ${sp}`);
          const progSlug = slugify(prog.program_name);
          const fee = prog.tuition_fee;

          await tx.$queryRawUnsafe(
            `INSERT INTO d_university_programs (
               university_id, name, slug, degree_type, student_type,
               academic_year, category, area_of_study, department, duration,
               credits_required, delivery_mode, program_url,
               fee_amount, fee_amount_min, fee_amount_max, fee_is_range,
               fee_currency, fee_currency_inferred, fee_period,
               fee_per_credit_cost, fee_total_estimated_cost, fee_includes,
               fee_source_url, fee_exact_quote, fee_type,
               fee_validated, fee_match_method, fee_match_score, fee_confidence,
               fetch_run_id, fetched_at, expires_at
             ) VALUES (
               $1, $2, $3, $4, $5,
               $6, $7, $8, $9, $10,
               $11, $12, $13,
               $14, $15, $16, $17,
               $18, $19, $20,
               $21, $22, $23,
               $24, $25, $26,
               $27, $28, $29, $30,
               $31, NOW(), $32
             )
             ON CONFLICT (university_id, slug, degree_type, student_type) DO UPDATE SET
               name = EXCLUDED.name,
               category = EXCLUDED.category,
               area_of_study = EXCLUDED.area_of_study,
               department = EXCLUDED.department,
               duration = EXCLUDED.duration,
               credits_required = EXCLUDED.credits_required,
               delivery_mode = EXCLUDED.delivery_mode,
               program_url = EXCLUDED.program_url,
               academic_year = EXCLUDED.academic_year,
               fee_amount = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_amount ELSE EXCLUDED.fee_amount END,
               fee_currency = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_currency ELSE EXCLUDED.fee_currency END,
               fee_period = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_period ELSE EXCLUDED.fee_period END,
               fee_amount_min = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_amount_min ELSE EXCLUDED.fee_amount_min END,
               fee_amount_max = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_amount_max ELSE EXCLUDED.fee_amount_max END,
               fee_is_range = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_is_range ELSE EXCLUDED.fee_is_range END,
               fee_currency_inferred = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_currency_inferred ELSE EXCLUDED.fee_currency_inferred END,
               fee_per_credit_cost = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_per_credit_cost ELSE EXCLUDED.fee_per_credit_cost END,
               fee_total_estimated_cost = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_total_estimated_cost ELSE EXCLUDED.fee_total_estimated_cost END,
               fee_source_url = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_source_url ELSE EXCLUDED.fee_source_url END,
               fee_exact_quote = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_exact_quote ELSE EXCLUDED.fee_exact_quote END,
               fee_validated = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_validated ELSE EXCLUDED.fee_validated END,
               fee_match_method = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_match_method ELSE EXCLUDED.fee_match_method END,
               fee_match_score = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_match_score ELSE EXCLUDED.fee_match_score END,
               fee_confidence = CASE WHEN d_university_programs.manual_override THEN d_university_programs.fee_confidence ELSE EXCLUDED.fee_confidence END,
               fetch_run_id = EXCLUDED.fetch_run_id,
               fetched_at = NOW(),
               expires_at = EXCLUDED.expires_at,
               is_active = TRUE,
               updated_at = NOW()`,
            universityId,
            truncate(prog.program_name, 500),
            truncate(progSlug, 500),
            truncate(storedDegreeType, 100),
            truncate(storedStudentType, 200),
            truncate(result.academic_year, 100),
            truncate(prog.category, 100),
            truncate(prog.area_of_study, 100),
            truncate(prog.department, 500),
            truncate(prog.duration, 100),
            prog.credits_required ?? null,
            truncate(prog.delivery_mode, 200),
            prog.url ?? null,
            amountToBigint(fee?.amount),
            amountToBigint(fee?.amount_min),
            amountToBigint(fee?.amount_max),
            fee?.is_range ?? false,
            truncate(fee?.currency, 3),
            fee?.currency_inferred ?? false,
            truncate(fee?.fee_period, 200),
            amountToBigint(fee?.per_credit_cost),
            amountToBigint(fee?.total_estimated_cost),
            truncate(fee?.includes, 100),
            fee?.fee_source_url  ?? null,
            fee?.exact_quote ?? null,
            truncate(fee?.fee_type, 200) ?? "tuition",
            fee?.validated ?? false,
            truncate(fee?.match_method, 200),
            fee?.match_score ?? null,
            truncate(fee?.confidence, 100),
            fetchRunId,
            expiresAt
          );

          await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${sp}`);
          programsInserted++;
          if (fee?.amount != null) feesInserted++;
        } catch (err: any) {
          await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${sp}`);
          programsSkipped++;
          log.warn("Skipping program due to insert error", {
            program: prog.program_name,
            error: err.message,
          });
        }
      }

      // Determine final status
      let finalStatus: string;
      if (programsInserted === 0) {
        finalStatus = "not_found";
      } else if (feesInserted === programsInserted) {
        finalStatus = "success";
      } else {
        finalStatus = "partial";
      }

      // Update fetch run with counts
      await tx.$queryRawUnsafe(
        `UPDATE f_program_fetch_runs SET
           university_id = $2,
           status = $3,
           programs_found = $4,
           fees_validated = $5,
           confidence = $6,
           source_urls = $7::jsonb,
           notes = $8,
           execution_time_ms = $9,
           cost_usd = $10,
           completed_at = NOW()
         WHERE id = $1`,
        fetchRunId,
        universityId,
        finalStatus,
        programsInserted,
        feesInserted,
        result.confidence ?? null,
        JSON.stringify(result.source_urls ?? []),
        result.notes ?? null,
        result._meta?.time_seconds
          ? Math.round((result._meta.time_seconds as number) * 1000)
          : null,
        (result._meta?.cost as any)?.total_usd ?? null
      );

      return finalStatus;
    }, { timeout: 60000 });

    const status =
      programsInserted === 0
        ? "not_found"
        : feesInserted === programsInserted
          ? "success"
          : "partial";

    return { programsInserted, feesInserted, programsSkipped, status };
  } catch (err: any) {
    log.fail("Transaction failed, marking fetch run as failed", { error: err.message });

    // Mark run as failed outside the rolled-back transaction
    await updateFetchRun(fetchRunId, {
      status: "failed",
      errorMessage: err.message?.slice(0, 500),
    });

    throw err;
  }
}

// ---------------------------------------------------------------------------
// buildWarnings
// ---------------------------------------------------------------------------

export function buildWarnings(result: PythonFetchResult): FetchWarning[] {
  const warnings: FetchWarning[] = [];

  if (result.confidence === "low") {
    warnings.push({ code: "LOW_CONFIDENCE", message: "Data confidence is low — results may be inaccurate" });
  }

  const withoutFees = result.programs
    .filter((p) => p.tuition_fee?.amount == null)
    .map((p) => p.program_name);
  if (withoutFees.length > 0) {
    warnings.push({
      code: "PROGRAMS_WITHOUT_FEES",
      message: `${withoutFees.length} program(s) have no fee data`,
      details: withoutFees,
    });
  }

  const hasInferred = result.programs.some((p) => p.tuition_fee?.currency_inferred);
  if (hasInferred) {
    warnings.push({ code: "USING_INFERRED_CURRENCY", message: "Some fees use an inferred currency — verify accuracy" });
  }

  const withFees = result.programs.filter((p) => p.tuition_fee?.amount != null).length;
  if (result.programs.length > 0 && withFees < result.programs.length / 2) {
    warnings.push({ code: "PARTIAL_DATA", message: "Less than half of programs have fee data" });
  }

  return warnings;
}