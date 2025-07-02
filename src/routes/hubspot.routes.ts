// src/routes/hubspotRoutes.ts
import { Router } from 'express';
import * as hubspotController from '../controllers/hubspot.controller';
import { 
  validateQuery, 
  validateParams,
  validateBody,
  paginationSchema,
  idParamSchema,
  emailQuerySchema,
  phoneQuerySchema,
  admissionStatusQuerySchema,
  studyDestinationQuerySchema,
  createEdumateContactSchema,
  updateEdumateContactSchema,
  advancedSearchSchema
} from '../middlewares/validation';

const router = Router();

// Standard HubSpot object routes
// Contact routes
router.get('/contacts', 
  validateQuery(paginationSchema), 
  hubspotController.getContacts
);

router.get('/contacts/search', 
  validateQuery(emailQuerySchema), 
  hubspotController.searchContactsByEmail
);

router.get('/contacts/:id', 
  validateParams(idParamSchema), 
  hubspotController.getContactById
);

// Company routes
router.get('/companies', 
  validateQuery(paginationSchema), 
  hubspotController.getCompanies
);

router.get('/companies/:id', 
  validateParams(idParamSchema), 
  hubspotController.getCompanyById
);

// Deal routes
router.get('/deals', 
  validateQuery(paginationSchema), 
  hubspotController.getDeals
);

router.get('/deals/:id', 
  validateParams(idParamSchema), 
  hubspotController.getDealById
);

// Edumate Contact Custom Object routes
// Basic CRUD operations
router.get('/edumate-contacts', 
  validateQuery(paginationSchema), 
  hubspotController.getEdumateContacts
);

router.get('/edumate-contacts/:id', 
  validateParams(idParamSchema), 
  hubspotController.getEdumateContactById
);

router.post('/edumate-contacts', 
//   validateBody(createEdumateContactSchema), 
  hubspotController.createEdumateContact
);

router.put('/edumate-contacts/:id', 
  validateParams(idParamSchema),
  validateBody(updateEdumateContactSchema), 
  hubspotController.updateEdumateContact
);

router.post('/edumate-contacts/upsert', 
//   validateBody(createEdumateContactSchema), 
  hubspotController.upsertEdumateContact
);

router.delete('/edumate-contacts/:id', 
  validateParams(idParamSchema), 
  hubspotController.deleteEdumateContact
);

// Batch operations
router.post('/edumate-contacts/batch/create',
  hubspotController.batchCreateEdumateContacts
);

router.put('/edumate-contacts/batch/update',
  hubspotController.batchUpdateEdumateContacts
);

// Search routes for Edumate Contacts
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

router.get('/edumate-contacts/search/advanced', 
  validateQuery(advancedSearchSchema), 
  hubspotController.advancedSearchEdumateContacts
);

export { router as hubspotRoutes };

// src/routes/healthRoutes.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../types';

const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }
  };

  res.json(response);
});

healthRouter.get('/ready', (req: Request, res: Response) => {
  // Add readiness checks here (database connections, external services, etc.)
  const isReady = true; // Replace with actual readiness checks
  
  if (isReady) {
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString()
      }
    };
    res.json(response);
  } else {
    res.status(503).json({
      success: false,
      message: 'Service not ready'
    });
  }
});

export { healthRouter as healthRoutes };