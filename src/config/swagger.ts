import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const router = express.Router();

const options: swaggerJsDoc.Options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: 'Edumate Integration API',
            description: 'Edumate API management for HubSpot custom objects',
            version: '1.0.0',
            contact: {
                name: 'Edumate API Support',
                email: 'support@edumateglobal.com'
            }
        },
        tags: [
            {
                name: 'Edumate Contacts',
                description: 'Custom Edumate contact object operations - CRUD, search, and batch operations for managing student contacts'
            }
        ],
        servers: [
            {
                url: `https://localhost:3031`,
                description: "Development Server"
            },
            {
                url: `https://api.edumateglobal.com`,
                description: "Production Server"
            }
        ],
        components: {
            // securitySchemes: {
            //     bearerAuth: {
            //         type: 'http',
            //         scheme: 'bearer',
            //         bearerFormat: 'JWT',
            //         description: 'JWT token for authentication'
            //     },
            //     ApiKeyAuth: {
            //         type: "apiKey",
            //         in: "header",
            //         name: "x-api-key",
            //         description: 'API key for authentication'
            //     }
            // },
            schemas: {
                EdumateContact: {
                    type: 'object',
                    description: 'Complete Edumate contact object with all fields',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique identifier for the contact',
                            example: '12345678'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Primary email address of the contact',
                            example: 'john.doe@example.com'
                        },
                        phone: {
                            type: 'string',
                            description: 'Contact phone number with country code',
                            example: '+1234567890'
                        },
                        firstName: {
                            type: 'string',
                            description: 'First name of the contact',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            description: 'Last name of the contact',
                            example: 'Doe'
                        },
                        admissionStatus: {
                            type: 'string',
                            enum: ['Inquiry', 'Applied', 'Accepted', 'Rejected', 'Enrolled', 'Graduated'],
                            description: 'Current admission status in the education process',
                            example: 'Applied'
                        },
                        studyDestination: {
                            type: 'string',
                            enum: ['Canada', 'Australia', 'UK', 'USA', 'Germany', 'France', 'New Zealand', 'Ireland'],
                            description: 'Preferred study destination country',
                            example: 'Canada'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Contact creation timestamp',
                            example: '2024-01-15T10:30:00Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                            example: '2024-01-20T14:45:00Z'
                        },
                        hubspotId: {
                            type: 'string',
                            description: 'HubSpot internal ID for the custom object',
                            example: 'hs_object_id_12345678'
                        }
                    },
                    required: ['email']
                },
                CreateEdumateContact: {
                    type: 'object',
                    description: 'Schema for creating a new Edumate contact',
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Primary email address (required, must be unique)',
                            example: 'john.doe@example.com'
                        },
                        phone: {
                            type: 'string',
                            description: 'Contact phone number with country code',
                            example: '+1234567890'
                        },
                        firstName: {
                            type: 'string',
                            description: 'First name of the contact',
                            example: 'John',
                            maxLength: 100
                        },
                        lastName: {
                            type: 'string',
                            description: 'Last name of the contact',
                            example: 'Doe',
                            maxLength: 100
                        },
                        admissionStatus: {
                            type: 'string',
                            enum: ['Inquiry', 'Applied', 'Accepted', 'Rejected', 'Enrolled', 'Graduated'],
                            description: 'Initial admission status',
                            example: 'Inquiry',
                            default: 'Inquiry'
                        },
                        studyDestination: {
                            type: 'string',
                            enum: ['Canada', 'Australia', 'UK', 'USA', 'Germany', 'France', 'New Zealand', 'Ireland'],
                            description: 'Preferred study destination country',
                            example: 'Canada'
                        }
                    },
                    required: ['email'],
                    additionalProperties: false
                },
                UpdateEdumateContact: {
                    type: 'object',
                    description: 'Schema for updating an existing Edumate contact (all fields optional)',
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Primary email address',
                            example: 'john.doe.updated@example.com'
                        },
                        phone: {
                            type: 'string',
                            description: 'Contact phone number with country code',
                            example: '+1987654321'
                        },
                        firstName: {
                            type: 'string',
                            description: 'First name of the contact',
                            example: 'Jane',
                            maxLength: 100
                        },
                        lastName: {
                            type: 'string',
                            description: 'Last name of the contact',
                            example: 'Smith',
                            maxLength: 100
                        },
                        admissionStatus: {
                            type: 'string',
                            enum: ['Inquiry', 'Applied', 'Accepted', 'Rejected', 'Enrolled', 'Graduated'],
                            description: 'Updated admission status',
                            example: 'Accepted'
                        },
                        studyDestination: {
                            type: 'string',
                            enum: ['Canada', 'Australia', 'UK', 'USA', 'Germany', 'France', 'New Zealand', 'Ireland'],
                            description: 'Updated study destination preference',
                            example: 'Australia'
                        }
                    },
                    additionalProperties: false
                },
                ApiResponse: {
                    type: 'object',
                    description: 'Standard API response wrapper',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Indicates if the request was successful',
                            example: true
                        },
                        data: {
                            description: 'Response data (type varies by endpoint)',
                            oneOf: [
                                { $ref: '#/components/schemas/EdumateContact' },
                                { 
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/EdumateContact' }
                                },
                                { type: 'object' }
                            ]
                        },
                        message: {
                            type: 'string',
                            description: 'Human-readable response message',
                            example: 'Operation completed successfully'
                        },
                        pagination: {
                            type: 'object',
                            description: 'Pagination information for list endpoints',
                            properties: {
                                page: {
                                    type: 'integer',
                                    example: 1
                                },
                                limit: {
                                    type: 'integer',
                                    example: 10
                                },
                                total: {
                                    type: 'integer',
                                    example: 100
                                },
                                totalPages: {
                                    type: 'integer',
                                    example: 10
                                }
                            }
                        }
                    },
                    required: ['success']
                },
                Error: {
                    type: 'object',
                    description: 'Error response schema',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                            description: 'Always false for error responses'
                        },
                        message: {
                            type: 'string',
                            description: 'Human-readable error message',
                            example: 'Validation failed'
                        },
                        error: {
                            type: 'string',
                            description: 'Detailed error information for debugging',
                            example: 'Email field is required'
                        },
                        code: {
                            type: 'string',
                            description: 'Error code for programmatic handling',
                            example: 'VALIDATION_ERROR'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Error occurrence timestamp',
                            example: '2024-01-20T14:45:00Z'
                        }
                    },
                    required: ['success', 'message']
                }
            }
        },
    },
    // Updated file paths to correctly locate route files
    apis: ["./src/routes/hubspot.routes.ts", "./dist/routes/hubspot.routes.js"]
};

const swaggerSpecs = swaggerJsDoc(options);

require("swagger-model-validator")(swaggerSpecs);

// Set up the Swagger UI router with custom configuration
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .scheme-container { margin: 20px 0; }
    `,
    customSiteTitle: "Edumate Integration API - Documentation",
    swaggerOptions: {
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true
    }
}));

export default swaggerSpecs;
export { router as swaggerRouter };