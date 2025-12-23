import { Router } from "express";
import {
  shortenSingleUrl,
  shortenBulkUrls,
  getAllShortUrls,
  deleteShortUrl,
  redirectShortUrl,
} from "../controllers/shortUrl.controller";

const router = Router();

// POST /api/short-url - Shorten single URL
router.post("/", shortenSingleUrl);

// POST /api/short-url/bulk - Shorten bulk URLs
router.post("/bulk", shortenBulkUrls);

// GET /api/short-url - Get all short URLs with pagination
router.get("/", getAllShortUrls);

// DELETE /api/short-url/:id - Delete a short URL
router.delete("/:id", deleteShortUrl);

// GET /s/:shortCode - Redirect to full URL (this should be mounted at root level)
export const redirectRouter = Router();
redirectRouter.get("/:shortCode", redirectShortUrl);

export { router as shorturlRoutes };
