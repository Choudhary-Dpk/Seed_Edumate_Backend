import { Router } from "express";
import { validateToken } from "../middlewares";
import { contactsLeadPaginationValidationRules, createContactsLeadValidationRules,editContactsLeadValidationRules,validateId,validateReqParams } from "../middlewares/validators/validator";
import { validateContactLeadById, validateContactsLeadPayload } from "../middlewares/contacts";
import { createContactsLead, deleteContactLead, downloadContactsTemplate, editContactsLead, getContactsLeadDetails, getContactsLeadsList, uploadContactsCSV } from "../controllers/contact.controller";
import { validateAndParseCSVFile } from "../middlewares/leads.middleware";

const router = Router();

router.post(
  "/",
  validateToken,
  createContactsLeadValidationRules(),
  validateReqParams,
  validateContactsLeadPayload,
  createContactsLead
);
router.delete(
  "/:id",
  validateToken,
  validateId(),
  validateReqParams,
  validateContactLeadById,
  deleteContactLead
);
router.get(
  "/details/:id",
  validateToken,
  validateId(),
  validateReqParams,
  validateContactLeadById,
  getContactsLeadDetails
);
router.put(
  "/:id",
  validateToken,
  editContactsLeadValidationRules(),
  validateReqParams,
  validateContactLeadById,
  editContactsLead
);
router.get(
  "/list",
  contactsLeadPaginationValidationRules(),
  validateReqParams,
  getContactsLeadsList
);
router.post(
  "/upload-csv",
  validateToken,
  validateAndParseCSVFile("CSV"),
  uploadContactsCSV
);
router.get("/template",downloadContactsTemplate)

export {router as contactRoutes}