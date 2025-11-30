import { Router } from "express";
import { authenticate, AuthMethod } from "../middlewares";
import {
  contactsLeadPaginationValidationRules,
  createContactsLeadValidationRules,
  editContactsLeadValidationRules,
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";
import {
  validateContactLeadById,
  validateContactsLeadPayload,
} from "../middlewares/contacts";
import {
  createContactsLead,
  deleteContactLead,
  downloadContactsTemplate,
  editContactsLead,
  getContactsLeadDetails,
  getContactsLeadsList,
  uploadContactsCSV,
  upsertContactsLead,
} from "../controllers/contact.controller";
import { validateAndParseCSVFile } from "../middlewares/loanApplication.middleware";
import { getLeadsViewList } from "../controllers/loanApplication.controller";

const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  createContactsLeadValidationRules(),
  validateReqParams,
  validateContactsLeadPayload,
  createContactsLead
);

router.post(
  "/upsert",
  // validateToken(["Admin", "Manager", "User"]),
  // createContactsLeadValidationRules(),
  validateReqParams,
  // validateContactsLeadPayload,
  upsertContactsLead
);

router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
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
    method: AuthMethod.JWT,
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
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  editContactsLeadValidationRules(),
  validateReqParams,
  validateContactLeadById,
  editContactsLead
);
router.get(
  "/list",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  contactsLeadPaginationValidationRules(),
  validateReqParams,
  getLeadsViewList
);
router.post(
  "/upload-csv",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateAndParseCSVFile("CSV"),
  uploadContactsCSV
);
router.get("/template", downloadContactsTemplate);

export { router as contactRoutes };
