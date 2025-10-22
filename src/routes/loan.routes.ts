import { Router } from 'express';
import {
  checkLoanEligibility,
  createLoanApplicationsController,
  deleteLoanApplicationController,
  generateRepaymentScheduleAndEmail,
  getConvertedCurrency,
  getLoanApplicationDetailsController,
  getLoanApplicationsListController,
  updateLoanApplicationController,
} from "../controllers/loan.controller";
import { validateApiKey, validateToken } from "../middlewares";
import { validateLoanFields } from "../middlewares/loanApplication.middleware";

const router = Router();

router.post("/check-eligibility", validateApiKey, checkLoanEligibility);
router.get("/currency-convert", validateApiKey, getConvertedCurrency);
router.post(
  "/repaymentSchedule-and-email",
  validateApiKey,
  generateRepaymentScheduleAndEmail
);
router.post(
  "/",
  // validateToken(["Admin", "Manager", "User"]),
  validateLoanFields,
  createLoanApplicationsController
);
router.put(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  updateLoanApplicationController
);
router.delete(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  deleteLoanApplicationController
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  getLoanApplicationDetailsController
);
router.get(
  "/pagination",
  validateToken(["Admin", "Manager", "User"]),
  getLoanApplicationsListController
);

export { router as loanRoutes };