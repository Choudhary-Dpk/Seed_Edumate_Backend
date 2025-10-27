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
  getContactsLeadsList,
  uploadContactsCSV,
} from "../../controllers/contact.controller";
import { validateAndParseCSVFile } from "../../middlewares/loanApplication.middleware";
import { validateAdminToken } from "../../middlewares";

const router = Router();

router.post(
  "/",
  validateAdminToken(["Admin"]),
  createContactsLeadValidationRules(),
  validateReqParams,
  validateContactsLeadPayload,
  createContactsLead
);
router.delete(
  "/:id",
  validateAdminToken(["Admin"]),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  deleteContactLead
);
router.get(
  "/details/:id",
  validateAdminToken(["Admin"]),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  getContactsLeadDetails
);
router.put(
  "/:id",
  validateAdminToken(["Admin"]),
  editContactsLeadValidationRules(),
  validateReqParams,
  validateContactLeadById,
  editContactsLead
);
router.get(
  "/list",
  validateAdminToken(["Admin"]),
  contactsLeadPaginationValidationRules(),
  validateReqParams,
  getContactsLeadsList
);
router.post(
  "/upload-csv",
  validateAdminToken(["Admin"]),
  validateAndParseCSVFile("CSV"),
  uploadContactsCSV
);
router.get("/template", downloadContactsTemplate);

export { router as contactRoutes };
