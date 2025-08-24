import { Router } from "express";
import {
  createLeads,
  downloadTemplate,
  uploadCSV,
} from "../controllers/leads.controller";
import { validateToken } from "../middlewares";
import {
  validateAndParseCSVFile,
  validateCreateLeads,
} from "../middlewares/leads.middleware";
import {
  createLeadValidationRules,
  validateReqParams,
} from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/create",
  validateToken,
  createLeadValidationRules(),
  validateReqParams,
  validateCreateLeads,
  createLeads
);
router.post(
  "/upload-csv",
  validateToken,
  validateAndParseCSVFile("CSV"),
  uploadCSV
);
router.get("/download-template",validateToken,downloadTemplate)

export {router as leadsRouter};