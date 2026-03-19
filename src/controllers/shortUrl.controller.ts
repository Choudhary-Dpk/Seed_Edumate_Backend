import { NextFunction, Request, Response } from "express";
import * as shortUrlServices from "../services/shortUrl.service";
import { sendResponse } from "../utils/api";
import logger from "../utils/logger";

/**
 * Controller for creating a single short URL
 */
export const createSingleShortUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl || typeof longUrl !== "string") {
      return sendResponse(res, 400, "longUrl is required and must be a string");
    }

    const user = (req as any).user;
    const createdBy = user?.email || user?.fullName || undefined;

    logger.debug(`Creating single short URL for: ${longUrl}`);
    const result = await shortUrlServices.createShortUrl(longUrl, createdBy);
    logger.debug(`Short URL created successfully: ${result.shortUrl}`);

    sendResponse(res, 201, "Short URL created successfully", {
      shortUrl: result.shortUrl,
    });
  } catch (error: any) {
    logger.error(`Error creating short URL: ${error.message}`);
    next(error);
  }
};

/**
 * Controller for creating multiple short URLs
 */
export const createBulkShortUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { longUrl, count } = req.body;

    if (!longUrl || typeof longUrl !== "string") {
      return sendResponse(res, 400, "longUrl is required and must be a string");
    }

    if (!count || typeof count !== "number") {
      return sendResponse(res, 400, "count is required and must be a number");
    }

    const user = (req as any).user;
    const createdBy = user?.email || user?.fullName || undefined;

    logger.debug(`Creating ${count} short URLs for: ${longUrl}`);
    const shortUrls = await shortUrlServices.createBulkShortUrls(longUrl, count, createdBy);
    logger.debug(`${count} short URLs created successfully`);

    sendResponse(res, 201, "Bulk short URLs created successfully", {
      shortUrls,
    });
  } catch (error: any) {
    logger.error(`Error creating bulk short URLs: ${error.message}`);
    next(error);
  }
};

/**
 * Controller for listing short URLs with pagination and search
 */
export const listShortUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, page, size } = req.query;

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const pageSize = size ? parseInt(size as string, 10) : 20;

    // Cap at 100 per page
    const take = Math.min(pageSize, 100);
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (search && typeof search === "string") {
      // Extract code from full short URL (e.g. "https://edmt.co/RVpX30" → "RVpX30")
      let codeSearch = search;
      try {
        const url = new URL(search);
        const pathCode = url.pathname.replace("/", "");
        if (pathCode) {
          codeSearch = pathCode;
        }
      } catch {
        // Not a valid URL, use search as-is
      }

      where.OR = [
        { code: { contains: codeSearch, mode: "insensitive" } },
        { longUrl: { contains: search, mode: "insensitive" } },
      ];
    }

    const [shortUrls, total] = await Promise.all([
      shortUrlServices.listShortUrls(where, skip, take),
      shortUrlServices.countShortUrls(where),
    ]);

    sendResponse(res, 200, "Short URLs fetched successfully", {
      short_urls: shortUrls,
      pagination: {
        page: pageNum,
        size: take,
        total,
        total_pages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    logger.error(`Error listing short URLs: ${error.message}`);
    next(error);
  }
};

/**
 * Controller for redirecting short URL to original URL
 */
export const redirectShortUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      return sendResponse(res, 400, "Short code is required");
    }

    logger.debug(`Redirecting short code: ${code}`);
    const originalUrl = await shortUrlServices.getOriginalUrl(code);

    if (!originalUrl) {
      return sendResponse(res, 404, "Short URL not found");
    }

    logger.debug(`Redirecting to: ${originalUrl}`);
    res.redirect(302, originalUrl);
  } catch (error: any) {
    logger.error(`Error redirecting short URL: ${error.message}`);
    next(error);
  }
};