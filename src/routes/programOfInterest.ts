import { Router } from "express";
import { authenticate } from "../middlewares";
import { validateReqParams } from "../middlewares/validators/validator";
import { validateProgramsPayload } from "../middlewares/programOfInterest.middleware";
import {
  recreateProgramsOfInterest,
  getAllProgramsOfInterest,
  getProgramOfInterestById,
  getProgramsCount,
  truncateProgramsOfInterest,
} from "../controllers/programOfInterest.controller";
import { AuthMethod } from "../types/auth";

const router = Router();

/**
 * POST /api/programs-of-interest/recreate
 * Recreate all records in the f_program_of_interest table
 * 
 * This endpoint will:
 * - Delete all existing records
 * - Insert new records from payload
 * - Return operation statistics
 * 
 * Requires Admin role
 */
router.post(
  "/recreate",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin"], // Only admins can recreate the entire table
  }),
  validateProgramsPayload,
  validateReqParams,
  recreateProgramsOfInterest
);

/**
 * GET /api/programs-of-interest
 * Get paginated list of all programs of interest
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 100)
 */
router.get(
  "/",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  getAllProgramsOfInterest
);

/**
 * GET /api/programs-of-interest/count
 * Get total count of programs
 */
router.get(
  "/count",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  getProgramsCount
);

/**
 * GET /api/programs-of-interest/:hs_program_id
 * Get a single program by hs_program_id
 */
router.get(
  "/:hs_program_id",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  getProgramOfInterestById
);

/**
 * DELETE /api/programs-of-interest/truncate
 * Delete all records (for testing/cleanup)
 * 
 * WARNING: This will delete all records without recreation
 * Requires Admin role
 */
router.delete(
  "/truncate",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin"], // Only admins can truncate
  }),
  validateReqParams,
  truncateProgramsOfInterest
);

export { router as programOfInterestRoutes };