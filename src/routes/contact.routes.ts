import { Router } from "express";
import { validateToken } from "../middlewares";
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

const router = Router();

router.post(
  "/",
  validateToken(["Admin", "Manager", "User"]),
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
  validateToken(["Admin", "Manager", "User"]),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  deleteContactLead
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  getContactsLeadDetails
);
router.put(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  editContactsLeadValidationRules(),
  validateReqParams,
  validateContactLeadById,
  editContactsLead
);
router.get(
  "/list",
  validateToken(["Admin", "Manager", "User"]),
  contactsLeadPaginationValidationRules(),
  validateReqParams,
  getContactsLeadsList
);
router.post(
  "/upload-csv",
  validateToken(["Admin", "Manager", "User"]),
  validateAndParseCSVFile("CSV"),
  uploadContactsCSV
);
router.get("/template", downloadContactsTemplate);

export { router as contactRoutes };
