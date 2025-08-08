import { Router } from "express";
import {
  testConnection,
  sendTestEmail,
  sendBasicEmail,
  sendWelcome,
  sendPasswordReset,
  sendBulkEmails,
  sendEmailWithAttachment,
  sendTemplateEmail,
} from "../controllers/email.controller";
import {
  validateBulkEmail,
  validateEmail,
  validatePasswordReset,
} from "../middlewares/validators/validator";

const router = Router();

// Routes
router.get("/test-connection", testConnection);
router.post("/test", sendTestEmail);
router.post("/send", validateEmail, sendBasicEmail);
router.post("/loan-eligibility-info", sendWelcome);
router.post("/password-reset", validatePasswordReset, sendPasswordReset);
router.post("/bulk", validateBulkEmail, sendBulkEmails);
router.post("/with-attachment", sendEmailWithAttachment);
router.post("/template", sendTemplateEmail);

export { router as emailRouter };
