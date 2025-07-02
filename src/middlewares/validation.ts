// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createValidationError } from './errorHandler';

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createValidationError(`Query validation error: ${errorMessage}`, 'query', req.query);
    }
    
    req.query = value;
    next();
  };
};

/**
 * Validate request path parameters
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, { 
      abortEarly: false 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createValidationError(`Path parameters validation error: ${errorMessage}`, 'params', req.params);
    }
    
    req.params = value;
    next();
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createValidationError(`Body validation error: ${errorMessage}`, 'body', req.body);
    }
    
    req.body = value;
    next();
  };
};

// Basic validation schemas
export const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  after: Joi.string().optional()
});

export const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'ID is required',
    'any.required': 'ID parameter is required'
  })
});

export const emailQuerySchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email parameter is required'
  })
});

export const phoneQuerySchema = Joi.object({
  phone: Joi.string().required().min(10).max(20).messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number must be at most 20 characters'
  })
});

// Admission status validation
export const admissionStatusQuerySchema = Joi.object({
  status: Joi.string().valid(
    'Not Applied', 'Applied', 'Interview Scheduled', 
    'Waitlisted', 'Admitted', 'Rejected'
  ).required().messages({
    'any.only': 'Status must be one of: Not Applied, Applied, Interview Scheduled, Waitlisted, Admitted, Rejected',
    'any.required': 'Status parameter is required'
  })
});

// Study destination validation
export const studyDestinationQuerySchema = Joi.object({
  destination: Joi.string().valid(
    'US', 'UK', 'Canada', 'Australia', 'Germany', 
    'France', 'Singapore', 'Italy', 'UAE', 'Other'
  ).required().messages({
    'any.only': 'Destination must be one of: US, UK, Canada, Australia, Germany, France, Singapore, Italy, UAE, Other',
    'any.required': 'Destination parameter is required'
  })
});

// Edumate Contact validation schemas
export const createEdumateContactSchema = Joi.object({
  // Personal Information (required)
  firstName: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 1 character',
    'string.max': 'First name must be at most 100 characters'
  }),
  lastName: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 1 character',
    'string.max': 'Last name must be at most 100 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  phoneNumber: Joi.string().min(10).max(20).optional().messages({
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number must be at most 20 characters'
  }),
  dateOfBirth: Joi.date().optional().max('now').messages({
    'date.max': 'Date of birth cannot be in the future'
  }),
  gender: Joi.string().valid('Male', 'Female', 'Other', 'Prefer not to say').optional(),
  nationality: Joi.string().max(100).optional(),

  // Address Information
  currentAddress: Joi.object({
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    country: Joi.string().max(100).optional(),
    pincode: Joi.string().max(20).optional()
  }).optional(),

  permanentAddress: Joi.object({
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    country: Joi.string().max(100).optional(),
    pincode: Joi.string().max(20).optional()
  }).optional(),

  // Academic Information
  currentEducation: Joi.object({
    level: Joi.string().valid('High School', "Bachelor's", "Master's", 'PhD', 'Other').optional(),
    institution: Joi.string().max(200).optional(),
    major: Joi.string().max(200).optional(),
    cgpaPercentage: Joi.number().min(0).max(100).optional().messages({
      'number.min': 'CGPA percentage must be at least 0',
      'number.max': 'CGPA percentage must be at most 100'
    }),
    graduationYear: Joi.number().integer().min(1990).max(2030).optional().messages({
      'number.min': 'Graduation year must be at least 1990',
      'number.max': 'Graduation year must be at most 2030'
    })
  }).optional(),

  targetEducation: Joi.object({
    degreeLevel: Joi.string().valid("Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate', 'Professional Course').optional(),
    courseMajor: Joi.string().max(200).optional(),
    universities: Joi.string().max(1000).optional(),
    studyDestination: Joi.string().valid('US', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Italy', 'UAE', 'Other').optional(),
    intendedStartDate: Joi.date().optional().min('now').messages({
      'date.min': 'Intended start date cannot be in the past'
    }),
    intendedStartTerm: Joi.string().max(50).optional(),
    courseDurationMonths: Joi.number().integer().min(1).max(120).optional().messages({
      'number.min': 'Course duration must be at least 1 month',
      'number.max': 'Course duration must be at most 120 months'
    })
  }).optional(),

  testScores: Joi.object({
    gmat: Joi.number().integer().min(200).max(800).optional().messages({
      'number.min': 'GMAT score must be at least 200',
      'number.max': 'GMAT score must be at most 800'
    }),
    gre: Joi.number().integer().min(130).max(340).optional().messages({
      'number.min': 'GRE score must be at least 130',
      'number.max': 'GRE score must be at most 340'
    }),
    toefl: Joi.number().integer().min(0).max(120).optional().messages({
      'number.min': 'TOEFL score must be at least 0',
      'number.max': 'TOEFL score must be at most 120'
    }),
    ielts: Joi.number().min(0).max(9).optional().messages({
      'number.min': 'IELTS score must be at least 0',
      'number.max': 'IELTS score must be at most 9'
    }),
    other: Joi.string().max(500).optional()
  }).optional(),

  // Application Journey
  admissionStatus: Joi.string().valid('Not Applied', 'Applied', 'Interview Scheduled', 'Waitlisted', 'Admitted', 'Rejected').optional(),
  
  applicationJourney: Joi.object({
    assignedCounselor: Joi.string().max(200).optional(),
    counselorNotes: Joi.string().max(2000).optional(),
    currentStatusDisposition: Joi.string().valid('Not Interested', 'Wrong Number', 'Call not Answered', 'Follow Up', 'Int for Next Year', 'Partial Documents Received').optional(),
    currentStatusDispositionReason: Joi.string().max(500).optional(),
    priorityLevel: Joi.string().valid('High', 'Medium', 'Low').optional(),
    firstContactDate: Joi.date().optional().max('now'),
    lastContactDate: Joi.date().optional().max('now'),
    nextFollowUpDate: Joi.date().optional(),
    followUpDate: Joi.date().optional()
  }).optional(),

  // Financial Information
  financialProfile: Joi.object({
    annualFamilyIncome: Joi.number().min(0).optional(),
    totalCourseCost: Joi.number().min(0).optional(),
    tuitionFee: Joi.number().min(0).optional(),
    livingExpenses: Joi.number().min(0).optional(),
    otherExpenses: Joi.number().min(0).optional(),
    loanAmountRequired: Joi.number().min(0).optional(),
    selfFundingAmount: Joi.number().min(0).optional(),
    scholarshipAmount: Joi.number().min(0).optional(),
    currency: Joi.string().max(10).optional()
  }).optional(),

  coApplicants: Joi.array().items(
    Joi.object({
      name: Joi.string().max(200).optional(),
      relationship: Joi.string().max(100).optional(),
      occupation: Joi.string().max(200).optional(),
      income: Joi.number().min(0).optional()
    })
  ).max(3).optional(),

  collateral: Joi.array().items(
    Joi.object({
      available: Joi.string().max(50).optional(),
      type: Joi.string().max(200).optional(),
      value: Joi.number().min(0).optional()
    })
  ).max(2).optional(),

  // Loan Preferences
  loanPreferences: Joi.object({
    loanTypePreference: Joi.string().valid('Secured', 'Unsecured', 'Education Loan', 'Personal Loan').optional(),
    preferredLenders: Joi.string().max(500).optional(),
    repaymentTypePreference: Joi.string().valid('EMI', 'Bullet Payment', 'Interest Only').optional()
  }).optional(),

  // Lead Attribution
  leadAttribution: Joi.object({
    leadSource: Joi.string().valid('Organic Search', 'Social Media', 'B2B Partner', 'Referral', 'Advertisement', 'Website', 'Walk-in', 'Other').optional(),
    leadSourceDetail: Joi.string().max(500).optional(),
    leadQualityScore: Joi.number().min(0).max(100).optional(),
    leadReferenceCode: Joi.string().max(100).optional(),
    b2bPartnerName: Joi.string().max(200).optional(),
    b2bPartnerId: Joi.string().max(100).optional(),
    partnerCommissionApplicable: Joi.string().max(50).optional(),
    referralPersonName: Joi.string().max(200).optional(),
    referralPersonContact: Joi.string().max(200).optional(),
    utmSource: Joi.string().max(200).optional(),
    utmMedium: Joi.string().max(200).optional(),
    utmCampaign: Joi.string().max(200).optional(),
    utmTerm: Joi.string().max(200).optional(),
    utmContent: Joi.string().max(200).optional()
  }).optional(),

  // System Information
  dataSource: Joi.string().max(100).optional(),
  gdprConsent: Joi.string().max(50).optional(),
  marketingConsent: Joi.string().max(50).optional(),
  studentRecordStatus: Joi.string().max(100).optional(),
  tags: Joi.string().max(1000).optional(),

  // Custom properties
  customProperties: Joi.object().optional()
});

// Update schema - all fields optional except for validation rules
export const updateEdumateContactSchema = createEdumateContactSchema.fork(
  ['firstName', 'lastName'], 
  (schema) => schema.optional()
);

// Advanced search schema
export const advancedSearchSchema = Joi.object({
  admissionStatus: Joi.string().valid('Not Applied', 'Applied', 'Interview Scheduled', 'Waitlisted', 'Admitted', 'Rejected').optional(),
  studyDestination: Joi.string().valid('US', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Italy', 'UAE', 'Other').optional(),
  educationLevel: Joi.string().valid('High School', "Bachelor's", "Master's", 'PhD', 'Other').optional(),
  priorityLevel: Joi.string().valid('High', 'Medium', 'Low').optional(),
  assignedCounselor: Joi.string().optional(),
  leadSource: Joi.string().valid('Organic Search', 'Social Media', 'B2B Partner', 'Referral', 'Advertisement', 'Website', 'Walk-in', 'Other').optional(),
  limit: Joi.number().integer().min(1).max(100).default(50).optional(),
  after: Joi.string().optional()
}).min(1).messages({
  'object.min': 'At least one search parameter is required'
});