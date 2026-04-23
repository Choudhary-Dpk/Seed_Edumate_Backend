import prisma from "../config/prisma";
import { slugify } from "./programService";

export async function searchUniversities(query: string) {
  const slug = slugify(query);
  const ilikePattern = `%${query.trim().replace(/[%_]/g, "\\$&")}%`;

  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, name, slug, country_code, default_currency, website, aliases, created_at, updated_at,
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
     LIMIT 10`,
    slug,
    JSON.stringify([slug]),
    query.trim(),
    ilikePattern
  );

  return rows;
}
