import { Router } from "express";
import {
  sendEmailController,
  sendLoanEligibilityResult,
  sendPasswordReset,
} from "../controllers/email.controller";
import {
  validatePasswordReset,
  validateReqParams,
  validEmailValidator,
} from "../middlewares/validators/validator";
import { authenticate, validateEmail } from "../middlewares";
import { AuthMethod } from "../types/auth";

const router = Router();

router.post(
  "/loan-eligibility-info",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  sendLoanEligibilityResult
);
router.post(
  "/password-reset",
  validatePasswordReset,
  validateReqParams,
  sendPasswordReset
);
router.post(
  "/",
  validEmailValidator(),
  validateReqParams,
  validateEmail,
  sendEmailController
);

export { router as emailRouter };
