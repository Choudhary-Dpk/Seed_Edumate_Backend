import prisma from "../config/prisma";
import logger from "../utils/logger";

const BASE_DOMAIN = process.env.BACKEND_URL || "http://localhost:3031";

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
 * Create a single short URL
 */
export const createShortUrl = async (
  longUrl: string,
  createdBy?: string
): Promise<{ shortUrl: string; code: string }> => {
  logger.debug(`Validating long URL: ${longUrl}`);

  if (!isValidUrl(longUrl)) {
    throw new Error("Invalid URL format");
  }

  logger.debug(`Generating unique short code`);
  const code = await generateUniqueCode();
  logger.debug(`Short code generated: ${code}`);

  logger.debug(`Saving short URL to database`);
  await prisma.shortUrl.create({
    data: {
      code,
      longUrl,
      ...(createdBy && { createdBy }),
    },
  });
  logger.debug(`Short URL saved successfully`);

  const shortUrl = `${BASE_DOMAIN}/${code}`;
  return { shortUrl, code };
};

/**
 * Create multiple short URLs for the same long URL
 */
export const createBulkShortUrls = async (
  longUrl: string,
  count: number,
  createdBy?: string
): Promise<string[]> => {
  logger.debug(`Validating long URL: ${longUrl}`);

  if (!isValidUrl(longUrl)) {
    throw new Error("Invalid URL format");
  }

  if (count < 1 || count > 1000) {
    throw new Error("Count must be between 1 and 1000");
  }

  logger.debug(`Generating ${count} unique short codes`);
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = await generateUniqueCode();
    codes.push(code);
  }

  logger.debug(`Saving ${count} short URLs to database`);
  await prisma.shortUrl.createMany({
    data: codes.map((code) => ({
      code,
      longUrl,
      ...(createdBy && { createdBy }),
    })),
  });
  logger.debug(`Bulk short URLs saved successfully`);

  const shortUrls = codes.map((code) => `${BASE_DOMAIN}/${code}`);
  return shortUrls;
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