import { Router } from "express";
import { validateToken } from "../middlewares";
import { contactsLeadPaginationValidationRules, createContactsLeadValidationRules,editContactsLeadValidationRules,validateId,validateReqParams } from "../middlewares/validators/validator";
import { validateContactLeadById, validateContactsLeadPayload } from "../middlewares/contacts";
import { createContactsLead, deleteContactLead, editContactsLead, getContactsLeadDetails, getContactsLeadsList } from "../controllers/contact.controller";
import { downloadTemplate } from "../controllers/leads.controller";

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
// router.post(
  //   "/upload-csv",
  //   validateToken,
  //   validateAndParseCSVFile("CSV"),
  //   uploadCSV
  // );
router.get("/template",validateToken,downloadTemplate)

export {router as contactRoutes}