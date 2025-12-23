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

    logger.debug(`Creating single short URL for: ${longUrl}`);
    const result = await shortUrlServices.createShortUrl(longUrl);
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

    logger.debug(`Creating ${count} short URLs for: ${longUrl}`);
    const shortUrls = await shortUrlServices.createBulkShortUrls(longUrl, count);
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