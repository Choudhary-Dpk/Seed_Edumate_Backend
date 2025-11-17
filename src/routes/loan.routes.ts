import { Router } from 'express';
// import {
//   checkLoanEligibility,
//   createLoanApplicationsController,
//   deleteLoanApplicationController,
//   generateRepaymentScheduleAndEmail,
//   getConvertedCurrency,
//   getLoanApplicationDetailsController,
//   getLoanApplicationsListController,
//   updateLoanApplicationController,
// } from "../controllers/loan.controller";
import { validateApiKey } from "../middlewares";
import { checkLoanEligibility, generateRepaymentScheduleAndEmail, getConvertedCurrency } from '../controllers/loan.controller';

const router = Router();

router.post("/check-eligibility", validateApiKey, checkLoanEligibility);
router.get("/currency-convert", validateApiKey, getConvertedCurrency);
router.post(
  "/repaymentSchedule-and-email",
  validateApiKey,
  generateRepaymentScheduleAndEmail
);

export { router as loanRoutes };