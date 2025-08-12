import { Router } from "express";
import {
  sendLoanEligibilityResult,
  sendPasswordReset,
} from "../controllers/email.controller";
import {
  validatePasswordReset,
} from "../middlewares/validators/validator";

const router = Router();

// Routes
router.post("/loan-eligibility-info", sendLoanEligibilityResult);
router.post("/password-reset", validatePasswordReset, sendPasswordReset);

export { router as emailRouter };
