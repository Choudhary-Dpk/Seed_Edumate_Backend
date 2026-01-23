// src/routes/mis-report.routes.ts

import { Router } from "express";
import {
  generateAllReports,
  generatePartnerReport,
  getPartnerReport,
  getAllReportsForMonth,
  getPartnerAllReports,
  getReportStats,
  deleteReport,
} from "../controllers/mis-report.controller";

const router = Router();

/**
 * @route   POST /api/mis-reports/generate
 * @desc    Generate monthly MIS reports for all active partners (previous month)
 * @access  Private/Admin
 */
router.post("/generate", generateAllReports);

/**
 * @route   POST /api/mis-reports/generate/:partnerId/:year/:month
 * @desc    Generate MIS report for a specific partner and month
 * @access  Private/Admin
 */
router.post("/generate/:partnerId/:year/:month", generatePartnerReport);

/**
 * @route   GET /api/mis-reports/stats
 * @desc    Get MIS report statistics and overview
 * @access  Private/Admin
 */
router.get("/stats", getReportStats);

/**
 * @route   GET /api/mis-reports/partner/:partnerId
 * @desc    Get all reports for a specific partner (optionally filter by year)
 * @access  Private
 * @query   year (optional)
 */
router.get("/partner/:partnerId", getPartnerAllReports);

/**
 * @route   GET /api/mis-reports/:partnerId/:year/:month
 * @desc    Get existing MIS report for a specific partner and month
 * @access  Private
 */
router.get("/:partnerId/:year/:month", getPartnerReport);

/**
 * @route   GET /api/mis-reports/:year/:month
 * @desc    Get all MIS reports for a specific month (all partners)
 * @access  Private/Admin
 */
router.get("/:year/:month", getAllReportsForMonth);

/**
 * @route   DELETE /api/mis-reports/:partnerId/:year/:month
 * @desc    Delete a specific MIS report
 * @access  Private/Admin
 */
router.delete("/:partnerId/:year/:month", deleteReport);

export { router as misReportRoutes };
