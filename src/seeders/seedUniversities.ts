import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

interface CsvRow {
  name: string;
  slug: string;
  country: string;
  currency: string;
  website: string;
  aliases: string;
}

export const seedUniversities = async () => {
  const csvPath = path.resolve(__dirname, "universities_master_v6_jsonb.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(
      `CSV file not found at ${csvPath}. Please place universities_master.csv in src/seeders/`
    );
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const records: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  console.log(`Found ${records.length} universities in CSV`);

  const BATCH_SIZE = 500;
  let totalInserted = 0;
  let totalSkipped = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    const data = batch.map((row) => {
      let aliases: string[] = [];
      try {
        if (row.aliases) {
          aliases = JSON.parse(row.aliases);
        }
      } catch {
        aliases = [];
      }

      return {
        name: row.name?.trim() || "",
        slug: row.slug?.trim() || "",
        country_code: row.country?.trim() || null,
        default_currency: row.currency?.trim() || null,
        website: row.website?.trim() || null,
        aliases: JSON.stringify(aliases),
      };
    });

    // Filter out rows with empty name or slug
    const validData = data.filter((d) => d.name && d.slug);

    try {
      const result = await prisma.d_universities.createMany({
        data: validData,
        skipDuplicates: true,
      });
      totalInserted += result.count;
      totalSkipped += validData.length - result.count;
    } catch (error) {
      console.error(
        `Error inserting batch ${i / BATCH_SIZE + 1}:`,
        error instanceof Error ? error.message : error
      );
    }

    console.log(
      `Processed ${Math.min(i + BATCH_SIZE, records.length)}/${records.length}`
    );
  }

  console.log(
    `Universities seeding complete: ${totalInserted} inserted, ${totalSkipped} skipped (duplicates)`
  );
};

// Run directly if called as a script
if (require.main === module) {
  seedUniversities()
    .catch((e) => {
      console.error("University seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
