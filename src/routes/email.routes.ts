import { Router } from "express";
import {
  sendLoanEligibilityResult,
  sendPasswordReset,
} from "../controllers/email.controller";
import {
  validatePasswordReset,
} from "../middlewares/validators/validator";
import { authenticate, AuthMethod, validateApiKey } from "../middlewares";

const router = Router();

// Routes
router.post(
  "/loan-eligibility-info",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  sendLoanEligibilityResult
);
router.post("/password-reset", validatePasswordReset, sendPasswordReset);

export { router as emailRouter };
