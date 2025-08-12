// src/routes/hubspotRoutes.ts
import { Router } from 'express';
import * as hubspotController from '../controllers/hubspot.controller';
import { 
  validateQuery, 
  validateParams,
  validateBody,
  idParamSchema,
  emailQuerySchema,
  phoneQuerySchema,
  admissionStatusQuerySchema,
  studyDestinationQuerySchema,
  updateEdumateContactSchema,
} from '../middlewares/validation';
import { validateEdumateContact } from "../middlewares/validators/contact.validator";

const router = Router();

// Edumate routes
router.get(
  "/edumate-contacts",
  // validateQuery(paginationSchema),
  hubspotController.getEdumateContacts
);
router.get(
  "/edumate-contacts/:id",
  validateParams(idParamSchema),
  hubspotController.getEdumateContactById
);
router.post("/edumate-contacts", hubspotController.createEdumateContact);
router.put(
  "/edumate-contacts/:id",
  validateParams(idParamSchema),
  validateBody(updateEdumateContactSchema),
  hubspotController.updateEdumateContact
);
router.post(
  "/edumate-contacts/upsert",
  validateEdumateContact,
  hubspotController.upsertEdumateContact
);
router.delete('/edumate-contacts/:id', 
  validateParams(idParamSchema), 
  hubspotController.deleteEdumateContact
);
router.post('/edumate-contacts/batch/create',
  hubspotController.batchCreateEdumateContacts
);
router.put('/edumate-contacts/batch/update',
  hubspotController.batchUpdateEdumateContacts
);
router.get('/edumate-contacts/search/email', 
  validateQuery(emailQuerySchema), 
  hubspotController.searchEdumateContactsByEmail
);
router.get('/edumate-contacts/search/phone', 
  validateQuery(phoneQuerySchema), 
  hubspotController.searchEdumateContactsByPhone
);
router.get('/edumate-contacts/search/admission-status', 
  validateQuery(admissionStatusQuerySchema), 
  hubspotController.searchEdumateContactsByAdmissionStatus
);
router.get('/edumate-contacts/search/study-destination', 
  validateQuery(studyDestinationQuerySchema), 
  hubspotController.searchEdumateContactsByStudyDestination
);

export { router as hubspotRoutes };