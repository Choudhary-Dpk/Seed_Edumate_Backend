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
  validateToken(["Admin", "Manager", "User"]),
  createValidationRules(),
  validateReqParams,
  validateLeadPayload,
  createLead
);
router.put(
  "/edit/:id",
  validateToken(["Admin", "Manager", "User"]),
  editValidationRules(),
  validateReqParams,
  validateLeadById,
  editLead
);
router.delete(
  "/delete/:id",
  validateToken(["Admin", "Manager", "User"]),
  validateId(),
  validateReqParams,
  validateLeadById,
  deleteLead
);
router.get(
  "/list",
  validateToken(["Admin", "Manager", "User"]),
  leadPaginationValidationRules(),
  validateReqParams,
  getLeadsList
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  validateId(),
  validateReqParams,
  validateLeadById,
  getLeadDetails
);
router.post(
  "/upload-csv",
  validateToken(["Admin", "Manager", "User"]),
  validateAndParseCSVFile("CSV"),
  uploadCSV
);
router.get("/download-template",validateToken,downloadTemplate)

export {router as leadsRouter};