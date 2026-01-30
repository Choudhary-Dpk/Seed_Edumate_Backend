// src/routes/dashboard-email.routes.ts

import { Router } from "express";
import {
  sendDashboardEmail,
  sendBulkDashboardEmails,
  getEmailHistory,
} from "../controllers/dashboard-email.controller";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";

const router = Router();

// All routes require authentication with API key
router.use(
  authenticate({
    method: AuthMethod.API_KEY,
  })
);

/**
 * POST /admin/dashboard/email-report
 * Send dashboard report to single partner
 */
router.post("/email-report", sendDashboardEmail);

/**
 * POST /admin/dashboard/email-bulk
 * Send dashboard reports to multiple partners
 */
router.post("/email-bulk", sendBulkDashboardEmails);

/**
 * GET /admin/dashboard/email-history
 * Get email history with filters
 */
router.get("/email-history", getEmailHistory);

export { router as dashboardEmailRouter };