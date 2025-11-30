import { Router } from "express";
import { authenticate, AuthMethod } from "../middlewares";
import {
  checkLoanEligibility,
  generateRepaymentScheduleAndEmail,
  getConvertedCurrency,
  getInstitutionCosts,
  getInstitutionProgram,
} from "../controllers/loan.controller";

const router = Router();

router.post(
  "/check-eligibility",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
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
 * POST /api/loan/extract-costs
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