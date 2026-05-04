import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  checkLoanEligibility,
  generateRepaymentScheduleAndEmail,
  getConvertedCurrency,
  getInstitutionCosts,
  getInstitutionCostsV3,
  getInstitutionProgram,
} from "../controllers/loan.controller";
import { AuthMethod } from "../types/auth";
import {
  loanEligibilityValidation,
  validateReqParams,
} from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/check-eligibility",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  loanEligibilityValidation(),
  validateReqParams,
  checkLoanEligibility
);

router.get(
  "/currency-convert",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getConvertedCurrency
);

router.post(
  "/repaymentSchedule-and-email",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  generateRepaymentScheduleAndEmail
);

/**
 * Extract institution costs (tuition, living expenses, etc.)
 * POST /loans/extract-costs
 * Body: { institution_name: string, study_level: string }
 */
router.post(
  "/extract-costs",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getInstitutionCosts
);

/**
 * V3 — Extract institution costs with 3-tier fallback:
 *   Local DB (d_universities + seed_client_programs) → seed PHP API → Anthropic AI
 * POST /loans/extract-costs/v3
 * Body: { institution_name, study_level, faculty }
 * Response includes `source: "db" | "seed_api" | "ai"`
 */
router.post(
  "/extract-costs/v3",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getInstitutionCostsV3
);

/**
 * Extract program details (duration, requirements, curriculum, etc.)
 * POST /api/loan/extract-program
 * Body: { institution_name: string, program_name: string }
 */
router.post(
  "/extract-program",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getInstitutionProgram
);

export { router as loanRoutes };
