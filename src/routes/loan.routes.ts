import { Router } from 'express';
import {
  checkLoanEligibility,
  generateRepaymentScheduleAndEmail,
  getConvertedCurrency,
} from "../controllers/loan.controller";
import { validateApiKey } from "../middlewares";

const router = Router();

router.post("/check-eligibility", validateApiKey, checkLoanEligibility);
router.get("/currency-convert", validateApiKey, getConvertedCurrency);
router.post(
  "/repaymentSchedule-and-email",
  validateApiKey,
  generateRepaymentScheduleAndEmail
);

export { router as loanRoutes };