import prisma from "../config/prisma";
import logger from "../utils/logger";

const BASE_DOMAIN = process.env.BACKEND_URL || "http://localhost:3031";

export interface ShortUrlRecord {
  code: string;
  shortUrl: string;
  longUrl: string;
}

/**
 * Generate a random Base62 short code
 */
const generateShortCode = (length: number = 6): string => {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Validate if a string is a valid URL
 */
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Generate a unique short code with collision handling
 */
const generateUniqueCode = async (
  maxRetries: number = 5
): Promise<string> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateShortCode(6);

    const existing = await prisma.shortUrl.findUnique({
      where: { code },
    });

    if (!existing) {
      return code;
    }

    logger.debug(`Code collision detected: ${code}, retrying...`);
  }

  // If still colliding after retries, use longer code
  const longerCode = generateShortCode(8);
  const existing = await prisma.shortUrl.findUnique({
    where: { code: longerCode },
  });

  if (existing) {
    throw new Error("Failed to generate unique short code");
  }

  return longerCode;
};

/**
 * Build the canonical short URL string for a given code.
 */
const buildShortUrl = (code: string): string => `${BASE_DOMAIN}/${code}`;

/**
 * Produce a variant of `longUrl` where the trailing integer of the utm_source
 * value is offset by `offset`. If utm_source has no trailing digits, the
 * offset is appended. If utm_source is absent, the URL is returned unchanged.
 *
 * Example: utm_source=Edumate100 with offset=2 → utm_source=Edumate102
 */
const incrementUtmSource = (longUrl: string, offset: number): string => {
  if (offset === 0) return longUrl;

  try {
    const url = new URL(longUrl);
    const currentSource = url.searchParams.get("utm_source");
    if (currentSource === null) return longUrl;

    const match = currentSource.match(/^(.*?)(\d+)$/);
    let nextSource: string;
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2], 10);
      nextSource = `${prefix}${num + offset}`;
    } else {
      nextSource = `${currentSource}${offset}`;
    }

    url.searchParams.set("utm_source", nextSource);
    return url.toString();
  } catch {
    return longUrl;
  }
};

/**
 * Create a single short URL
 */
export const createShortUrl = async (
  longUrl: string,
  createdBy?: string
): Promise<ShortUrlRecord> => {
  logger.debug(`Validating long URL: ${longUrl}`);

  if (!isValidUrl(longUrl)) {
    throw new Error("Invalid URL format");
  }

  logger.debug(`Generating unique short code`);
  const code = await generateUniqueCode();
  logger.debug(`Short code generated: ${code}`);

  const shortUrl = buildShortUrl(code);

  logger.debug(`Saving short URL to database`);
  await prisma.shortUrl.create({
    data: {
      code,
      longUrl,
      shortUrl,
      ...(createdBy && { createdBy }),
    },
  });
  logger.debug(`Short URL saved successfully`);

  return { code, shortUrl, longUrl };
};

/**
 * Create multiple short URLs. Each generated row gets a unique long URL where
 * the utm_source trailing number is incremented by the row index, so clicking
 * a given short URL redirects to its own distinct long URL.
 */
export const createBulkShortUrls = async (
  longUrl: string,
  count: number,
  createdBy?: string
): Promise<ShortUrlRecord[]> => {
  logger.debug(`Validating long URL: ${longUrl}`);

  if (!isValidUrl(longUrl)) {
    throw new Error("Invalid URL format");
  }

  if (count < 1 || count > 1000) {
    throw new Error("Count must be between 1 and 1000");
  }

  logger.debug(`Generating ${count} unique short codes`);
  const records: ShortUrlRecord[] = [];

  for (let i = 0; i < count; i++) {
    const code = await generateUniqueCode();
    const itemLongUrl = incrementUtmSource(longUrl, i);
    records.push({
      code,
      shortUrl: buildShortUrl(code),
      longUrl: itemLongUrl,
    });
  }

  logger.debug(`Saving ${count} short URLs to database`);
  await prisma.shortUrl.createMany({
    data: records.map((r) => ({
      code: r.code,
      longUrl: r.longUrl,
      shortUrl: r.shortUrl,
      ...(createdBy && { createdBy }),
    })),
  });
  logger.debug(`Bulk short URLs saved successfully`);

  return records;
};

/**
 * List short URLs with filtering, newest first
 */
export const listShortUrls = async (
  where: any,
  skip: number,
  take: number
) => {
  return prisma.shortUrl.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Count short URLs with filtering
 */
export const countShortUrls = async (where: any) => {
  return prisma.shortUrl.count({ where });
};

/**
 * Get original URL by short code and increment redirect count
 */
export const getOriginalUrl = async (
  code: string
): Promise<string | null> => {
  logger.debug(`Fetching original URL for code: ${code}`);

  const shortUrl = await prisma.shortUrl.findUnique({
    where: { code },
  });

  if (!shortUrl) {
    logger.debug(`Short URL not found for code: ${code}`);
    return null;
  }

  logger.debug(`Incrementing redirect count for code: ${code}`);
  await prisma.shortUrl.update({
    where: { code },
    data: {
      redirectCount: {
        increment: 1,
      },
      lastAccessedAt: new Date(),
    },
  });
  logger.debug(`Redirect count incremented successfully`);

  return shortUrl.longUrl;
};
