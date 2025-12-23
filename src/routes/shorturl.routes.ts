import { Router } from "express";
import {
  createSingleShortUrl,
  createBulkShortUrls,
  redirectShortUrl,
} from "../controllers/shortUrl.controller";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";

const router = Router();

/**
 * POST /api/short-url
 * Create a single short URL
 * Requires API Key authentication
 */
router.post(
  "/",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  createSingleShortUrl
);

/**
 * POST /api/short-url/bulk
 * Create multiple short URLs for the same long URL
 * Requires API Key authentication
 */
router.post(
  "/bulk",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  createBulkShortUrls
);

/**
 * GET /:code
 * Redirect short URL to original URL
 * No authentication required (public endpoint)
 * This should be mounted at root level, not under /api/short-url
 */
export const redirectRouter = Router();
router.get("/:code", redirectShortUrl);

export { router as shortUrlRoutes };