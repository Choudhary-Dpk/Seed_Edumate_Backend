import { Request, Response } from "express";
import { nanoid } from "nanoid";
import prisma from "../config/prisma";
import { sendResponse } from "../utils/api";

/**
 * Generate a unique short code for URL
 */
export function generateShortCode(length: number = 7): string {
  return nanoid(length);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Build full short URL with domain
 */
export function buildShortUrl(shortCode: string, baseUrl?: string): string {
  const domain = baseUrl || process.env.APP_URL || "http://localhost:3000";
  return `${domain}/s/${shortCode}`;
}

/**
 * Extract UTM parameters from URL
 */
export function extractUtmSource(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("utm_source");
  } catch {
    return null;
  }
}

interface BulkUrlInput {
  url: string;
  custom_short_code?: string;
}

/**
 * Shorten a single URL
 */
export const shortenSingleUrl = async (req: Request, res: Response) => {
  try {
    const { url, custom_short_code } = req.body;

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return sendResponse(res, 400, "Invalid URL provided");
    }

    // Check if URL already exists
    const existingUrl = await prisma.shortUrl.findFirst({
      where: { full_url: url },
    });

    if (existingUrl) {
      return sendResponse(res, 200, "URL already shortened", {
        id: existingUrl.id,
        short_url: existingUrl.short_url,
        full_url: existingUrl.full_url,
        clicks: existingUrl.clicks,
        utm_source: existingUrl.utm_source,
        created_at: existingUrl.created_at,
      });
    }

    // Generate short code
    let shortCode = custom_short_code || generateShortCode();

    // If custom code provided, check if it's available
    if (custom_short_code) {
      const existingShortCode = await prisma.shortUrl.findFirst({
        where: { short_url: { contains: custom_short_code } },
      });

      if (existingShortCode) {
        return sendResponse(res, 409, "Custom short code already in use");
      }
    }

    // Extract UTM source
    const utmSource = extractUtmSource(url);

    // Build short URL
    const shortUrl = buildShortUrl(shortCode);

    // Create short URL in database
    const newShortUrl = await prisma.shortUrl.create({
      data: {
        short_url: shortUrl,
        full_url: url,
        utm_source: utmSource,
        clicks: 0,
      },
    });

    return sendResponse(res, 201, "URL shortened successfully", {
      id: newShortUrl.id,
      short_url: newShortUrl.short_url,
      full_url: newShortUrl.full_url,
      clicks: newShortUrl.clicks,
      utm_source: newShortUrl.utm_source,
      created_at: newShortUrl.created_at,
    });
  } catch (error: any) {
    console.error("Error shortening URL:", error);
    return sendResponse(
      res,
      500,
      "Failed to shorten URL",
      [],
      [{ error: error.message }]
    );
  }
};

/**
 * Shorten multiple URLs in bulk
 */
export const shortenBulkUrls = async (req: Request, res: Response) => {
  try {
    const { urls } = req.body as { urls: BulkUrlInput[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return sendResponse(res, 400, "No URLs provided");
    }

    if (urls.length > 100) {
      return sendResponse(
        res,
        400,
        "Maximum 100 URLs allowed per bulk request"
      );
    }

    const results = {
      success: [] as any[],
      failed: [] as any[],
      skipped: [] as any[],
    };

    // Process each URL
    for (const item of urls) {
      try {
        const { url, custom_short_code } = item;

        // Validate URL
        if (!url || !isValidUrl(url)) {
          results.failed.push({
            url,
            reason: "Invalid URL format",
          });
          continue;
        }

        // Check if URL already exists
        const existingUrl = await prisma.shortUrl.findFirst({
          where: { full_url: url },
        });

        if (existingUrl) {
          results.skipped.push({
            url,
            short_url: existingUrl.short_url,
            reason: "URL already shortened",
          });
          continue;
        }

        // Generate short code
        let shortCode = custom_short_code || generateShortCode();

        // If custom code provided, check if it's available
        if (custom_short_code) {
          const existingShortCode = await prisma.shortUrl.findFirst({
            where: { short_url: { contains: custom_short_code } },
          });

          if (existingShortCode) {
            results.failed.push({
              url,
              reason: "Custom short code already in use",
            });
            continue;
          }
        }

        // Extract UTM source
        const utmSource = extractUtmSource(url);

        // Build short URL
        const shortUrl = buildShortUrl(shortCode);

        // Create short URL in database
        const newShortUrl = await prisma.shortUrl.create({
          data: {
            short_url: shortUrl,
            full_url: url,
            utm_source: utmSource,
            clicks: 0,
          },
        });

        results.success.push({
          id: newShortUrl.id,
          short_url: newShortUrl.short_url,
          full_url: newShortUrl.full_url,
          clicks: newShortUrl.clicks,
          utm_source: newShortUrl.utm_source,
          created_at: newShortUrl.created_at,
        });
      } catch (error: any) {
        results.failed.push({
          url: item.url,
          reason: error.message || "Unknown error",
        });
      }
    }

    return sendResponse(res, 200, `Processed ${urls.length} URLs`, {
      summary: {
        total: urls.length,
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
      results: results,
    });
  } catch (error: any) {
    console.error("Error in bulk URL shortening:", error);
    return sendResponse(
      res,
      500,
      "Failed to process bulk URLs",
      [],
      [{ error: error.message }]
    );
  }
};

/**
 * Get all short URLs with pagination
 */
export const getAllShortUrls = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { short_url: { contains: search } },
            { full_url: { contains: search } },
            { utm_source: { contains: search } },
          ],
        }
      : {};

    const [urls, total] = await Promise.all([
      prisma.shortUrl.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.shortUrl.count({ where }),
    ]);

    return sendResponse(res, 200, "URLs fetched successfully", {
      urls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching URLs:", error);
    return sendResponse(
      res,
      500,
      "Failed to fetch URLs",
      [],
      [{ error: error.message }]
    );
  }
};

/**
 * Redirect short URL and track clicks
 */
export const redirectShortUrl = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.redirect("/");
    }

    // Find the short URL
    const shortUrl = await prisma.shortUrl.findFirst({
      where: {
        short_url: {
          contains: shortCode,
        },
      },
    });

    if (!shortUrl) {
      return res.redirect("/");
    }

    // Increment click count
    await prisma.shortUrl.update({
      where: { id: shortUrl.id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    // Redirect to full URL
    return res.redirect(shortUrl.full_url);
  } catch (error: any) {
    console.error("Error redirecting short URL:", error);
    return res.redirect("/");
  }
};

/**
 * Delete a short URL
 */
export const deleteShortUrl = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.shortUrl.delete({
      where: { id },
    });

    return sendResponse(res, 200, "Short URL deleted successfully");
  } catch (error: any) {
    console.error("Error deleting short URL:", error);
    return sendResponse(
      res,
      500,
      "Failed to delete short URL",
      [],
      [{ error: error.message }]
    );
  }
};
