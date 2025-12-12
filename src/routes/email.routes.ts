import { Router } from "express";
import {
  sendLoanEligibilityResult,
  sendPasswordReset,
} from "../controllers/email.controller";
import {
  validatePasswordReset,
} from "../middlewares/validators/validator";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";

const router = Router();

router.post(
  "/loan-eligibility-info",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  sendLoanEligibilityResult
);
router.post("/password-reset", validatePasswordReset, sendPasswordReset);

export { router as emailRouter };
