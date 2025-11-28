import { Router } from "express";
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
import { authenticate, AuthMethod, validateApiKey } from "../middlewares";
import {
  checkLoanEligibility,
  generateRepaymentScheduleAndEmail,
  getConvertedCurrency,
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

export { router as loanRoutes };
