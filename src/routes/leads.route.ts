import { Router } from "express";
import {
  createLeads,
  downloadTemplate,
  uploadCSV,
} from "../controllers/leads.controller";
import { validateToken } from "../middlewares";
import {
  validateCreateLeads,
  validateCSVFile,
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
router.post("/upload-csv", validateToken, validateCSVFile, uploadCSV);
router.get("/download-template",validateToken,downloadTemplate)

export {router as leadsRouter};