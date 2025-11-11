import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createValidationError } from "./errorHandler";

/**
 * Validate request query parameters
 */
export const validateQuery = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.query);
      req.query = result as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw createValidationError(
          `Query validation error: ${errorMessage}`,
          "query",
          req.query
        );
      }
      throw error;
    }
  };
};

/**
 * Validate request path parameters
 */
export const validateParams = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.params);
      req.params = result as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw createValidationError(
          `Path parameters validation error: ${errorMessage}`,
          "params",
          req.params
        );
      }
      throw error;
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw createValidationError(
          `Body validation error: ${errorMessage}`,
          "body",
          req.body
        );
      }
      throw error;
    }
  };
};

// Basic validation schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  after: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const emailQuerySchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export const phoneQuerySchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be at most 20 characters"),
});

// Admission status validation
const admissionStatusValues = [
  "Not Applied",
  "Applied",
  "Interview Scheduled",
  "Waitlisted",
  "Admitted",
  "Rejected",
] as const;

export const admissionStatusQuerySchema = z.object({
  status: z.enum(admissionStatusValues, {
    message:
      "Status must be one of: Not Applied, Applied, Interview Scheduled, Waitlisted, Admitted, Rejected",
  }),
});

// Study destination validation
const studyDestinationValues = [
  "US",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "Italy",
  "UAE",
  "Other",
] as const;

export const studyDestinationQuerySchema = z.object({
  destination: z.enum(studyDestinationValues, {
    message:
      "Destination must be one of: US, UK, Canada, Australia, Germany, France, Singapore, Italy, UAE, Other",
  }),
});

// Address schema (reusable)
const addressSchema = z
  .object({
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    pincode: z.string().max(20).optional(),
  })
  .optional();

// Test scores schema
const testScoresSchema = z
  .object({
    gmat: z
      .number()
      .int()
      .min(200, "GMAT score must be at least 200")
      .max(800, "GMAT score must be at most 800")
      .optional(),
    gre: z
      .number()
      .int()
      .min(130, "GRE score must be at least 130")
      .max(340, "GRE score must be at most 340")
      .optional(),
    toefl: z
      .number()
      .int()
      .min(0, "TOEFL score must be at least 0")
      .max(120, "TOEFL score must be at most 120")
      .optional(),
    ielts: z
      .number()
      .min(0, "IELTS score must be at least 0")
      .max(9, "IELTS score must be at most 9")
      .optional(),
    other: z.string().max(500).optional(),
  })
  .optional();

// Education level enum
const educationLevelValues = [
  "High School",
  "Bachelor's",
  "Master's",
  "PhD",
  "Other",
] as const;

// Current education schema
const currentEducationSchema = z
  .object({
    level: z.enum(educationLevelValues).optional(),
    institution: z.string().max(200).optional(),
    major: z.string().max(200).optional(),
    cgpaPercentage: z
      .number()
      .min(0, "CGPA percentage must be at least 0")
      .max(100, "CGPA percentage must be at most 100")
      .optional(),
    graduationYear: z
      .number()
      .int()
      .min(1990, "Graduation year must be at least 1990")
      .max(2030, "Graduation year must be at most 2030")
      .optional(),
  })
  .optional();

// Degree level enum
const degreeLevelValues = [
  "Bachelor's",
  "Master's",
  "PhD",
  "Diploma",
  "Certificate",
  "Professional Course",
] as const;

// Target education schema
const targetEducationSchema = z
  .object({
    degreeLevel: z.enum(degreeLevelValues).optional(),
    courseMajor: z.string().max(200).optional(),
    universities: z.string().max(1000).optional(),
    studyDestination: z.enum(studyDestinationValues).optional(),
    intendedStartDate: z
      .date()
      .min(new Date(), "Intended start date cannot be in the past")
      .optional(),
    intendedStartTerm: z.string().max(50).optional(),
    courseDurationMonths: z
      .number()
      .int()
      .min(1, "Course duration must be at least 1 month")
      .max(120, "Course duration must be at most 120 months")
      .optional(),
  })
  .optional();

// Status disposition enum
const statusDispositionValues = [
  "Not Interested",
  "Wrong Number",
  "Call not Answered",
  "Follow Up",
  "Int for Next Year",
  "Partial Documents Received",
] as const;

// Priority level enum
const priorityLevelValues = ["High", "Medium", "Low"] as const;

// Application journey schema
const applicationJourneySchema = z
  .object({
    assignedCounselor: z.string().max(200).optional(),
    counselorNotes: z.string().max(2000).optional(),
    currentStatusDisposition: z.enum(statusDispositionValues).optional(),
    currentStatusDispositionReason: z.string().max(500).optional(),
    priorityLevel: z.enum(priorityLevelValues).optional(),
    firstContactDate: z.date().max(new Date()).optional(),
    lastContactDate: z.date().max(new Date()).optional(),
    nextFollowUpDate: z.date().optional(),
    followUpDate: z.date().optional(),
  })
  .optional();

// Financial profile schema
const financialProfileSchema = z
  .object({
    annualFamilyIncome: z.number().min(0).optional(),
    totalCourseCost: z.number().min(0).optional(),
    tuitionFee: z.number().min(0).optional(),
    livingExpenses: z.number().min(0).optional(),
    otherExpenses: z.number().min(0).optional(),
    loanAmountRequired: z.number().min(0).optional(),
    selfFundingAmount: z.number().min(0).optional(),
    scholarshipAmount: z.number().min(0).optional(),
    currency: z.string().max(10).optional(),
  })
  .optional();

// Co-applicants schema
const coApplicantsSchema = z
  .array(
    z.object({
      name: z.string().max(200).optional(),
      relationship: z.string().max(100).optional(),
      occupation: z.string().max(200).optional(),
      income: z.number().min(0).optional(),
    })
  )
  .max(3)
  .optional();

// Collateral schema
const collateralSchema = z
  .array(
    z.object({
      available: z.string().max(50).optional(),
      type: z.string().max(200).optional(),
      value: z.number().min(0).optional(),
    })
  )
  .max(2)
  .optional();

// Loan type enum
const loanTypeValues = [
  "Secured",
  "Unsecured",
  "Education Loan",
  "Personal Loan",
] as const;
const repaymentTypeValues = ["EMI", "Bullet Payment", "Interest Only"] as const;

// Loan preferences schema
const loanPreferencesSchema = z
  .object({
    loanTypePreference: z.enum(loanTypeValues).optional(),
    preferredLenders: z.string().max(500).optional(),
    repaymentTypePreference: z.enum(repaymentTypeValues).optional(),
  })
  .optional();

// Lead source enum
const leadSourceValues = [
  "Organic Search",
  "Social Media",
  "B2B Partner",
  "Referral",
  "Advertisement",
  "Website",
  "Walk-in",
  "Other",
] as const;

// Lead attribution schema
const leadAttributionSchema = z
  .object({
    leadSource: z.enum(leadSourceValues).optional(),
    leadSourceDetail: z.string().max(500).optional(),
    leadQualityScore: z.number().min(0).max(100).optional(),
    leadReferenceCode: z.string().max(100).optional(),
    b2bPartnerName: z.string().max(200).optional(),
    b2bPartnerId: z.string().max(100).optional(),
    partnerCommissionApplicable: z.string().max(50).optional(),
    referralPersonName: z.string().max(200).optional(),
    referralPersonContact: z.string().max(200).optional(),
    utmSource: z.string().max(200).optional(),
    utmMedium: z.string().max(200).optional(),
    utmCampaign: z.string().max(200).optional(),
    utmTerm: z.string().max(200).optional(),
    utmContent: z.string().max(200).optional(),
  })
  .optional();

// Gender enum
const genderValues = ["Male", "Female", "Other", "Prefer not to say"] as const;

// Edumate Contact validation schemas
export const createEdumateContactSchema = z.object({
  // Personal Information (required)
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  email: z.string().email("Please provide a valid email address").optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be at most 20 characters")
    .optional(),
  dateOfBirth: z
    .date()
    .max(new Date(), "Date of birth cannot be in the future")
    .optional(),
  gender: z.enum(genderValues).optional(),
  nationality: z.string().max(100).optional(),

  // Address Information
  currentAddress: addressSchema,
  permanentAddress: addressSchema,

  // Academic Information
  currentEducation: currentEducationSchema,
  targetEducation: targetEducationSchema,
  testScores: testScoresSchema,

  // Application Journey
  admissionStatus: z.enum(admissionStatusValues).optional(),
  applicationJourney: applicationJourneySchema,

  // Financial Information
  financialProfile: financialProfileSchema,
  coApplicants: coApplicantsSchema,
  collateral: collateralSchema,

  // Loan Preferences
  loanPreferences: loanPreferencesSchema,

  // Lead Attribution
  leadAttribution: leadAttributionSchema,

  // System Information
  dataSource: z.string().max(100).optional(),
  gdprConsent: z.string().max(50).optional(),
  marketingConsent: z.string().max(50).optional(),
  studentRecordStatus: z.string().max(100).optional(),
  tags: z.string().max(1000).optional(),

  // Custom properties
  customProperties: z.record(z.string(), z.any()).optional(),
});

// Update schema - all fields optional except for validation rules
export const updateEdumateContactSchema = createEdumateContactSchema.partial();

// Advanced search schema
export const advancedSearchSchema = z
  .object({
    admissionStatus: z.enum(admissionStatusValues).optional(),
    studyDestination: z.enum(studyDestinationValues).optional(),
    educationLevel: z.enum(educationLevelValues).optional(),
    priorityLevel: z.enum(priorityLevelValues).optional(),
    assignedCounselor: z.string().optional(),
    leadSource: z.enum(leadSourceValues).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    after: z.string().optional(),
  })
  .refine(
    (data) => {
      // Remove undefined values and check if any keys remain
      const definedKeys = Object.entries(data).filter(
        ([, value]) => value !== undefined
      );
      return definedKeys.length > 0;
    },
    { message: "At least one search parameter is required" }
  );

// Type exports for TypeScript
export type CreateEdumateContactInput = z.infer<
  typeof createEdumateContactSchema
>;
export type UpdateEdumateContactInput = z.infer<
  typeof updateEdumateContactSchema
>;
export type AdvancedSearchInput = z.infer<typeof advancedSearchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// Additional utility types
export type AdmissionStatus = (typeof admissionStatusValues)[number];
export type StudyDestination = (typeof studyDestinationValues)[number];
export type EducationLevel = (typeof educationLevelValues)[number];
export type PriorityLevel = (typeof priorityLevelValues)[number];
export type LeadSource = (typeof leadSourceValues)[number];
export type Gender = (typeof genderValues)[number];
