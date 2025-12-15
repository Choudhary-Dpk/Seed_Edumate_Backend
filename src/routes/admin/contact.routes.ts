import { Router } from "express";
import {
  contactsLeadPaginationValidationRules,
  createContactsLeadValidationRules,
  editContactsLeadValidationRules,
  validateId,
  validateReqParams,
} from "../../middlewares/validators/validator";
import {
  validateContactLeadById,
  validateContactsLeadPayload,
} from "../../middlewares/contacts";
import {
  createContactsLead,
  deleteContactLead,
  downloadContactsTemplate,
  editContactsLead,
  getContactsLeadDetails,
  uploadContactsCSV,
} from "../../controllers/contact.controller";
import { validateAndParseCSVFile } from "../../middlewares/loanApplication.middleware";
import { authenticate } from "../../middlewares";
import { getLeadsViewList } from "../../controllers/loanApplication.controller";
import { AuthMethod } from "../../types/auth";

const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  createContactsLeadValidationRules(),
  validateReqParams,
  validateContactsLeadPayload,
  createContactsLead
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
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
    allowedRoles: ["Admin"],
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
    allowedRoles: ["Admin"],
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
    allowedRoles: ["Admin"],
  }),
  contactsLeadPaginationValidationRules(),
  validateReqParams,
  getLeadsViewList
);
router.post(
  "/upload-csv",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  validateAndParseCSVFile("CSV"),
  uploadContactsCSV
);
router.get("/template", downloadContactsTemplate);

export { router as contactRoutes };
