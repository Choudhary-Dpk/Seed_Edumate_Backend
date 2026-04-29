import prisma from "../config/prisma";
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
