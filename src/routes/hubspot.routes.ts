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

// Standard HubSpot object routes (no swagger comments)
// Contact routes
router.get('/contacts', 
  validateQuery(paginationSchema), 
  hubspotController.getContacts
);

router.get('/contacts/search', 
  validateQuery(emailQuerySchema), 
  hubspotController.searchContactsByEmail
);

router.get('/contacts/search/phone-owner', 
  hubspotController.getContactOwnerByPhone
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

// Edumate Contact Custom Object routes with Swagger documentation
/**
 * @swagger
 * /hubspot/edumate-contacts:
 *   get:
 *     tags: [Edumate Contacts]
 *     summary: Get a paginated list of Edumate Contacts
 *     description: Retrieve all Edumate contacts with pagination support
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved list of Edumate Contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *       400:
 *         description: Bad request - Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/edumate-contacts', 
  // validateQuery(paginationSchema), 
  hubspotController.getEdumateContacts
);

/**
 * @swagger
 * /hubspot/edumate-contacts/{id}:
 *   get:
 *     tags: [Edumate Contacts]
 *     summary: Get an Edumate Contact by ID
 *     description: Retrieve a specific Edumate contact using its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the Edumate Contact
 *         example: "12345678"
 *     responses:
 *       200:
 *         description: Successfully retrieved Edumate Contact
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EdumateContact'
 *       404:
 *         description: Edumate Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/edumate-contacts/:id', 
  validateParams(idParamSchema), 
  hubspotController.getEdumateContactById
);

/**
 * @swagger
 * /hubspot/edumate-contacts:
 *   post:
 *     tags: [Edumate Contacts]
 *     summary: Create a new Edumate Contact
 *     description: Create a new Edumate contact with the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEdumateContact'
 *           example:
 *             email: "john.doe@example.com"
 *             firstName: "John"
 *             lastName: "Doe"
 *             phone: "+1234567890"
 *             admissionStatus: "Applied"
 *             studyDestination: "Canada"
 *     responses:
 *       201:
 *         description: Edumate Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EdumateContact'
 *                 message:
 *                   type: string
 *                   example: "Edumate contact created successfully"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Contact with email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/edumate-contacts', 
  hubspotController.createEdumateContact
);

/**
 * @swagger
 * /hubspot/edumate-contacts/{id}:
 *   put:
 *     tags: [Edumate Contacts]
 *     summary: Update an existing Edumate Contact
 *     description: Update an existing Edumate contact with new information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the Edumate Contact
 *         example: "12345678"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEdumateContact'
 *           example:
 *             firstName: "Jane"
 *             lastName: "Smith"
 *             phone: "+1987654321"
 *             admissionStatus: "Accepted"
 *     responses:
 *       200:
 *         description: Edumate Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EdumateContact'
 *                 message:
 *                   type: string
 *                   example: "Edumate contact updated successfully"
 *       404:
 *         description: Edumate Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/edumate-contacts/:id', 
  validateParams(idParamSchema),
  validateBody(updateEdumateContactSchema), 
  hubspotController.updateEdumateContact
);

/**
 * @swagger
 * /hubspot/edumate-contacts/upsert:
 *   post:
 *     tags: [Edumate Contacts]
 *     summary: Upsert an Edumate Contact
 *     description: Create a new contact or update existing one based on email (upsert operation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEdumateContact'
 *           example:
 *             email: "john.doe@example.com"
 *             firstName: "John"
 *             lastName: "Doe"
 *             phone: "+1234567890"
 *             admissionStatus: "Applied"
 *             studyDestination: "Canada"
 *     responses:
 *       200:
 *         description: Edumate Contact upserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EdumateContact'
 *                 isNew:
 *                   type: boolean
 *                   description: Whether this was a create (true) or update (false) operation
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Edumate contact upserted successfully"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/edumate-contacts/upsert', 
  hubspotController.upsertEdumateContact
);

/**
 * @swagger
 * /hubspot/edumate-contacts/{id}:
 *   delete:
 *     tags: [Edumate Contacts]
 *     summary: Delete an Edumate Contact
 *     description: Permanently delete an Edumate contact from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the Edumate Contact
 *         example: "12345678"
 *     responses:
 *       204:
 *         description: Edumate Contact deleted successfully (no content)
 *       404:
 *         description: Edumate Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/edumate-contacts/:id', 
  validateParams(idParamSchema), 
  hubspotController.deleteEdumateContact
);

// Batch operations
/**
 * @swagger
 * /hubspot/edumate-contacts/batch/create:
 *   post:
 *     tags: [Edumate Contacts]
 *     summary: Batch create Edumate Contacts
 *     description: Create multiple Edumate contacts in a single operation (maximum 100 contacts)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CreateEdumateContact'
 *             minItems: 1
 *             maxItems: 100
 *           example:
 *             - email: "john.doe@example.com"
 *               firstName: "John"
 *               lastName: "Doe"
 *               phone: "+1234567890"
 *               admissionStatus: "Applied"
 *               studyDestination: "Canada"
 *             - email: "jane.smith@example.com"
 *               firstName: "Jane"
 *               lastName: "Smith"
 *               phone: "+1987654321"
 *               admissionStatus: "Inquiry"
 *               studyDestination: "Australia"
 *     responses:
 *       201:
 *         description: Edumate Contacts created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 created:
 *                   type: integer
 *                   description: Number of contacts successfully created
 *                   example: 2
 *                 failed:
 *                   type: integer
 *                   description: Number of contacts that failed to create
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "Batch create completed"
 *       400:
 *         description: Bad request - Invalid input data or too many contacts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/edumate-contacts/batch/create',
  hubspotController.batchCreateEdumateContacts
);

/**
 * @swagger
 * /hubspot/edumate-contacts/batch/update:
 *   put:
 *     tags: [Edumate Contacts]
 *     summary: Batch update Edumate Contacts
 *     description: Update multiple Edumate contacts in a single operation (maximum 100 contacts)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Contact ID to update
 *                   required: [id]
 *                 - $ref: '#/components/schemas/UpdateEdumateContact'
 *             minItems: 1
 *             maxItems: 100
 *           example:
 *             - id: "12345678"
 *               firstName: "John Updated"
 *               admissionStatus: "Accepted"
 *             - id: "87654321"
 *               lastName: "Smith Updated"
 *               studyDestination: "UK"
 *     responses:
 *       200:
 *         description: Edumate Contacts updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 updated:
 *                   type: integer
 *                   description: Number of contacts successfully updated
 *                   example: 2
 *                 failed:
 *                   type: integer
 *                   description: Number of contacts that failed to update
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "Batch update completed"
 *       400:
 *         description: Bad request - Invalid input data or too many contacts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/edumate-contacts/batch/update',
  hubspotController.batchUpdateEdumateContacts
);

// Search routes for Edumate Contacts
/**
 * @swagger
 * /hubspot/edumate-contacts/search/email:
 *   get:
 *     tags: [Edumate Contacts]
 *     summary: Search Edumate Contacts by email
 *     description: Find Edumate contacts that match the specified email address
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address to search for
 *         example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: List of matching Edumate Contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 count:
 *                   type: integer
 *                   description: Number of matching contacts found
 *                   example: 1
 *       400:
 *         description: Bad request - Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/edumate-contacts/search/email', 
  validateQuery(emailQuerySchema), 
  hubspotController.searchEdumateContactsByEmail
);

/**
 * @swagger
 * /hubspot/edumate-contacts/search/phone:
 *   get:
 *     tags: [Edumate Contacts]
 *     summary: Search Edumate Contacts by phone
 *     description: Find Edumate contacts that match the specified phone number
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number to search for
 *         example: "+1234567890"
 *     responses:
 *       200:
 *         description: List of matching Edumate Contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 count:
 *                   type: integer
 *                   description: Number of matching contacts found
 *                   example: 1
 *       400:
 *         description: Bad request - Invalid phone format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/edumate-contacts/search/phone', 
  validateQuery(phoneQuerySchema), 
  hubspotController.searchEdumateContactsByPhone
);

/**
 * @swagger
 * /hubspot/edumate-contacts/search/admission-status:
 *   get:
 *     tags: [Edumate Contacts]
 *     summary: Search Edumate Contacts by admission status
 *     description: Find Edumate contacts that match the specified admission status
 *     parameters:
 *       - in: query
 *         name: admissionStatus
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Inquiry, Applied, Accepted, Rejected, Enrolled, Graduated]
 *         description: Admission status to search for
 *         example: "Applied"
 *     responses:
 *       200:
 *         description: List of matching Edumate Contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 count:
 *                   type: integer
 *                   description: Number of matching contacts found
 *                   example: 15
 *       400:
 *         description: Bad request - Invalid admission status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/edumate-contacts/search/admission-status', 
  validateQuery(admissionStatusQuerySchema), 
  hubspotController.searchEdumateContactsByAdmissionStatus
);

/**
 * @swagger
 * /hubspot/edumate-contacts/search/study-destination:
 *   get:
 *     tags: [Edumate Contacts]
 *     summary: Search Edumate Contacts by study destination
 *     description: Find Edumate contacts that match the specified study destination
 *     parameters:
 *       - in: query
 *         name: studyDestination
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Canada, Australia, UK, USA, Germany, France, New Zealand, Ireland]
 *         description: Study destination country to search for
 *         example: "Canada"
 *     responses:
 *       200:
 *         description: List of matching Edumate Contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 count:
 *                   type: integer
 *                   description: Number of matching contacts found
 *                   example: 25
 *       400:
 *         description: Bad request - Invalid study destination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/edumate-contacts/search/study-destination', 
  validateQuery(studyDestinationQuerySchema), 
  hubspotController.searchEdumateContactsByStudyDestination
);

/**
 * @swagger
 * /hubspot/edumate-contacts/search/advanced:
 *   get:
 *     tags: [Edumate Contacts]
 *     summary: Advanced search for Edumate Contacts
 *     description: Perform advanced search across multiple fields with flexible filtering options
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: First name to search (partial match supported)
 *         example: "John"
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Last name to search (partial match supported)
 *         example: "Doe"
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email to search (partial match supported)
 *         example: "john.doe"
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Phone number to search (partial match supported)
 *         example: "+123"
 *       - in: query
 *         name: admissionStatus
 *         schema:
 *           type: string
 *           enum: [Inquiry, Applied, Accepted, Rejected, Enrolled, Graduated]
 *         description: Admission status to filter by
 *         example: "Applied"
 *       - in: query
 *         name: studyDestination
 *         schema:
 *           type: string
 *           enum: [Canada, Australia, UK, USA, Germany, France, New Zealand, Ireland]
 *         description: Study destination to filter by
 *         example: "Canada"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of matching Edumate Contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EdumateContact'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                 filters:
 *                   type: object
 *                   description: Applied search filters
 *       400:
 *         description: Bad request - Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/edumate-contacts/search/advanced', 
  validateQuery(advancedSearchSchema), 
  hubspotController.advancedSearchEdumateContacts
);

export { router as hubspotRoutes };

// Health routes (without swagger comments)
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