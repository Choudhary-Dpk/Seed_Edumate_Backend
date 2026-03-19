import { Router } from "express";
import {
  createSingleShortUrl,
  createBulkShortUrls,
  listShortUrls,
  redirectShortUrl,
} from "../controllers/shortUrl.controller";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";

const router = Router();

/**
 * POST /api/short-url
 * Create a single short URL
 * Requires JWT authentication
 */
router.post(
  "/",
  authenticate({
    method: AuthMethod.JWT,
  }),
  createSingleShortUrl
);

/**
 * POST /api/short-url/bulk
 * Create multiple short URLs for the same long URL
 * Requires JWT authentication
 */
router.post(
  "/bulk",
  authenticate({
    method: AuthMethod.JWT,
  }),
  createBulkShortUrls
);

/**
 * GET /api/short-url/list
 * List all short URLs with pagination and search
 * Requires JWT authentication
 * @query search, page, size
 */
router.get(
  "/list",
  authenticate({
    method: AuthMethod.JWT,
  }),
  listShortUrls
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