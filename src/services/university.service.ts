import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { slugify } from "./programService";

export async function searchUniversities(
  query: string,
  page: number = 1,
  size: number = 10
) {
  const slug = slugify(query);
  const ilikePattern = `%${query.trim().replace(/[%_]/g, "\\$&")}%`;
  const offset = (page - 1) * size;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(
      `SELECT id, name, slug, country_code, country, default_currency, website, aliases, created_at, updated_at,
         CASE
           WHEN slug = $1 THEN 1
           WHEN aliases @> $2::jsonb THEN 2
           WHEN LOWER(name) = LOWER($3) THEN 3
           WHEN LOWER(name) LIKE LOWER($4) THEN 4
           ELSE 5
         END AS match_rank
       FROM d_universities
       WHERE slug = $1
          OR aliases @> $2::jsonb
          OR LOWER(name) LIKE LOWER($4)
       ORDER BY match_rank, name
       LIMIT $5 OFFSET $6`,
      slug,
      JSON.stringify([slug]),
      query.trim(),
      ilikePattern,
      size,
      offset
    ),
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count
       FROM d_universities
       WHERE slug = $1
          OR aliases @> $2::jsonb
          OR LOWER(name) LIKE LOWER($4)`,
      slug,
      JSON.stringify([slug]),
      query.trim(),
      ilikePattern
    ),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.ceil(total / size);

  return { data: rows, total, page, size, totalPages };
}

export interface UniversityProgramsFilters {
  degreeType?: string | null;
  studentType?: string | null;
  search?: string | null;
}

export type UniversityMatchSource =
  | "partner_university_id"
  | "partner_name_slug"
  | "partner_name_alias"
  | "partner_name_ilike";

export type UniversityNameMatchSource =
  | "name_slug"
  | "name_alias"
  | "name_ilike";

const universitySelect = {
  id: true,
  name: true,
  slug: true,
  country_code: true,
  country: true,
  default_currency: true,
  website: true,
  aliases: true,
} as const;

const partnerSelect = {
  id: true,
  partner_name: true,
  partner_display_name: true,
  partner_type: true,
  country: true,
  website_url: true,
  company_id: true,
  university_id: true,
  hs_object_id: true,
} as const;

const serializeUniversity = (u: any) =>
  u
    ? {
        ...u,
        id: typeof u.id === "bigint" ? u.id.toString() : u.id,
      }
    : null;

const serializeProgram = (p: any) => ({
  ...p,
  id: typeof p.id === "bigint" ? p.id.toString() : p.id,
  fee_amount: p.fee_amount != null ? p.fee_amount.toString() : null,
  fee_amount_min: p.fee_amount_min != null ? p.fee_amount_min.toString() : null,
  fee_amount_max: p.fee_amount_max != null ? p.fee_amount_max.toString() : null,
  fee_total_estimated_cost:
    p.fee_total_estimated_cost != null
      ? p.fee_total_estimated_cost.toString()
      : null,
});

export async function findUniversityByHsCompanyId(hsCompanyId: string) {
  const partner = await prisma.hSB2BPartners.findFirst({
    where: { company_id: hsCompanyId, is_deleted: false },
    select: partnerSelect,
  });

  if (!partner) {
    return { partner: null, university: null, matchSource: null };
  }

  // Strategy 1: partner.university_id is a numeric d_universities.id
  if (partner.university_id && /^\d+$/.test(partner.university_id)) {
    try {
      const byId = await prisma.d_universities.findUnique({
        where: { id: BigInt(partner.university_id) },
        select: universitySelect,
      });
      if (byId) {
        return {
          partner,
          university: byId,
          matchSource: "partner_university_id" as UniversityMatchSource,
        };
      }
    } catch {
      // fall through to name-based strategies
    }
  }

  const candidate = (
    partner.partner_display_name ||
    partner.partner_name ||
    ""
  ).trim();
  if (!candidate) {
    return { partner, university: null, matchSource: null };
  }

  // Strategy 2: name → slug
  const slug = slugify(candidate);
  const bySlug = await prisma.d_universities.findUnique({
    where: { slug },
    select: universitySelect,
  });
  if (bySlug) {
    return {
      partner,
      university: bySlug,
      matchSource: "partner_name_slug" as UniversityMatchSource,
    };
  }

  // Strategy 3: aliases JSON contains slug
  const byAlias = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, name, slug, country_code, country, default_currency, website, aliases
     FROM d_universities
     WHERE aliases @> $1::jsonb
     LIMIT 1`,
    JSON.stringify([slug])
  );
  if (byAlias?.[0]) {
    return {
      partner,
      university: byAlias[0],
      matchSource: "partner_name_alias" as UniversityMatchSource,
    };
  }

  // Strategy 4: ILIKE contains
  const byIlike = await prisma.d_universities.findFirst({
    where: { name: { contains: candidate, mode: "insensitive" } },
    select: universitySelect,
    orderBy: { name: "asc" },
  });
  if (byIlike) {
    return {
      partner,
      university: byIlike,
      matchSource: "partner_name_ilike" as UniversityMatchSource,
    };
  }

  return { partner, university: null, matchSource: null };
}

export type PartnerMatchSource =
  | "partner_name_exact"
  | "partner_display_name_exact"
  | "partner_name_contains"
  | "partner_display_name_contains";

/**
 * Best-effort partner lookup by one or more name candidates. Tries an exact
 * (case-insensitive) match first, then a contains match — which also tolerates
 * stray whitespace stored on the partner row (e.g. "Emory University ").
 */
export async function findPartnerByNames(candidates: string[]) {
  const cleaned = Array.from(
    new Set(
      candidates
        .map((c) => (c || "").trim())
        .filter((c) => c.length >= 2)
    )
  );

  for (const name of cleaned) {
    const exact = await prisma.hSB2BPartners.findFirst({
      where: {
        is_deleted: false,
        OR: [
          { partner_name: { equals: name, mode: "insensitive" } },
          { partner_display_name: { equals: name, mode: "insensitive" } },
        ],
      },
      select: partnerSelect,
    });
    if (exact) {
      const matchedDisplay =
        exact.partner_display_name?.trim().toLowerCase() === name.toLowerCase();
      return {
        partner: exact,
        matchSource: (matchedDisplay
          ? "partner_display_name_exact"
          : "partner_name_exact") as PartnerMatchSource,
      };
    }
  }

  for (const name of cleaned) {
    const partial = await prisma.hSB2BPartners.findFirst({
      where: {
        is_deleted: false,
        OR: [
          { partner_name: { contains: name, mode: "insensitive" } },
          { partner_display_name: { contains: name, mode: "insensitive" } },
        ],
      },
      select: partnerSelect,
      orderBy: { id: "asc" },
    });
    if (partial) {
      const matchedDisplay = (partial.partner_display_name || "")
        .toLowerCase()
        .includes(name.toLowerCase());
      return {
        partner: partial,
        matchSource: (matchedDisplay
          ? "partner_display_name_contains"
          : "partner_name_contains") as PartnerMatchSource,
      };
    }
  }

  return { partner: null, matchSource: null };
}

export async function findUniversityByName(name: string) {
  const candidate = name.trim();
  if (!candidate) {
    return { university: null, matchSource: null };
  }

  const slug = slugify(candidate);

  const bySlug = await prisma.d_universities.findUnique({
    where: { slug },
    select: universitySelect,
  });
  if (bySlug) {
    return {
      university: bySlug,
      matchSource: "name_slug" as UniversityNameMatchSource,
    };
  }

  const byAlias = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, name, slug, country_code, country, default_currency, website, aliases
     FROM d_universities
     WHERE aliases @> $1::jsonb
     LIMIT 1`,
    JSON.stringify([slug])
  );
  if (byAlias?.[0]) {
    return {
      university: byAlias[0],
      matchSource: "name_alias" as UniversityNameMatchSource,
    };
  }

  const byIlike = await prisma.d_universities.findFirst({
    where: { name: { contains: candidate, mode: "insensitive" } },
    select: universitySelect,
    orderBy: { name: "asc" },
  });
  if (byIlike) {
    return {
      university: byIlike,
      matchSource: "name_ilike" as UniversityNameMatchSource,
    };
  }

  return { university: null, matchSource: null };
}

export async function getProgramsForUniversity(
  universityId: bigint,
  page: number = 1,
  size: number = 10,
  filters: UniversityProgramsFilters = {}
) {
  const offset = (page - 1) * size;

  const where: Prisma.d_university_programsWhereInput = {
    university_id: universityId,
    is_active: true,
  };
  if (filters.degreeType) {
    where.degree_type = { equals: filters.degreeType, mode: "insensitive" };
  }
  if (filters.studentType) {
    where.student_type = { equals: filters.studentType, mode: "insensitive" };
  }
  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  const [programs, total] = await Promise.all([
    prisma.d_university_programs.findMany({
      where,
      skip: offset,
      take: size,
      orderBy: [{ degree_type: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        degree_type: true,
        student_type: true,
        academic_year: true,
        category: true,
        area_of_study: true,
        department: true,
        duration: true,
        credits_required: true,
        delivery_mode: true,
        program_url: true,
        fee_amount: true,
        fee_amount_min: true,
        fee_amount_max: true,
        fee_is_range: true,
        fee_currency: true,
        fee_period: true,
        fee_total_estimated_cost: true,
        fee_includes: true,
        fee_type: true,
        fee_confidence: true,
        fee_validated: true,
        fetched_at: true,
      },
    }),
    prisma.d_university_programs.count({ where }),
  ]);

  return {
    data: programs.map(serializeProgram),
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
}

export { serializeUniversity };
