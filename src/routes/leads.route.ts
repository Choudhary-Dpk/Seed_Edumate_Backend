import { Router } from "express";
import { createPartnerLeads, downloadTemplate,  } from "../controllers/leads.controller";
import {  validateToken } from "../middlewares";
import { validateCreateLeads } from "../middlewares/leads.middleware";
import { createLeadValidationRules, validateReqParams } from "../middlewares/validators/validator";

const router = Router();

router.post("/create",validateToken, createLeadValidationRules(),validateReqParams, validateCreateLeads,  createPartnerLeads);
router.get("/download-template",validateToken,downloadTemplate)

export {router as leadsRouter};