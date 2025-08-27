import { Router } from "express";
import {
  createLead,
  downloadTemplate,
  uploadCSV,
  editLead,
  deleteLead,
  getLeadsList,
  getLeadDetails,
} from "../controllers/leads.controller";
import { validateToken } from "../middlewares";
import {
  validateAndParseCSVFile,
  validateLeadPayload,
  validateLeadById,
} from "../middlewares/leads.middleware";
import {
  createValidationRules,
  editValidationRules,
  leadPaginationValidationRules,
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/create",
  validateToken,
  createValidationRules(),
  validateReqParams,
  validateLeadPayload,
  createLead
);
router.put(
  "/edit/:id",
  validateToken,
  editValidationRules(),
  validateReqParams,
  validateLeadById,
  validateLeadPayload,
  editLead
);
router.delete(
  "/delete/:id",
  validateToken,
  validateId(),
  validateReqParams,
  validateLeadById,
  deleteLead
);
router.get(
  "/list",
  leadPaginationValidationRules(),
  validateReqParams,
  getLeadsList
);
router.get(
  "/details/:id",
  validateToken,
  validateId(),
  validateReqParams,
  validateLeadById,
  getLeadDetails
);
router.post(
  "/upload-csv",
  validateToken,
  validateAndParseCSVFile("CSV"),
  uploadCSV
);
router.get("/download-template",validateToken,downloadTemplate)

export {router as leadsRouter};