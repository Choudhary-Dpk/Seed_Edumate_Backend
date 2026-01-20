import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  contactsLeadPaginationValidationRules,
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";
import {
  validateContactLeadById,
  validateContactsJSONPayload,
  validateContactsLeadPayload,
} from "../middlewares/contacts";
import {
  createContactsLead,
  deleteContactLead,
  downloadContactsTemplate,
  editContactsLead,
  getContactsLeadDetails,
  uploadContactsCSV,
  uploadContactsJSON,
  upsertContactsLead,
} from "../controllers/contact.controller";
import { validateAndParseCSVFile } from "../middlewares/loanApplication.middleware";
import { getLeadsViewList } from "../controllers/loanApplication.controller";
import { AuthMethod } from "../types/auth";

const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  validateContactsLeadPayload,
  createContactsLead
);

router.post("/upsert", upsertContactsLead);

router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  deleteContactLead
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  getContactsLeadDetails
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  validateContactLeadById,
  editContactsLead
);
router.get(
  "/list",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  contactsLeadPaginationValidationRules(),
  validateReqParams,
  getLeadsViewList
);
router.post(
  "/upload-csv",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateAndParseCSVFile("CSV"),
  uploadContactsCSV
);
// Bulk upload contacts via JSON payload
router.post(
  "/bulk-import",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateContactsJSONPayload,
  uploadContactsJSON
);
router.get("/template", downloadContactsTemplate);

export { router as contactRoutes };
