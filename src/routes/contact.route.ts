import { Router } from "express";
import { validateToken } from "../middlewares";
import { createContactsLeadValidationRules,validateReqParams } from "../middlewares/validators/validator";
import { validateContactsLeadPayload } from "../middlewares/contacts";
import { createContactsLead } from "../controllers/contact.controller";

const router = Router();

router.post(
  "/",
  validateToken(["Admin"]),
  createContactsLeadValidationRules(),
  validateReqParams,
  validateContactsLeadPayload,
  createContactsLead
);

export {router as contactRoutes}