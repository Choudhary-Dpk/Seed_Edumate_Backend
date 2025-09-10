import { NextFunction,Request,Response } from "express";
import { body, validationResult, param, query } from "express-validator";
import { sendResponse } from "../../utils/api";

export const validateReqParams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: Record<string, any>[] = [];
  errors.array().forEach((err) => {
    if (err.type === "field") {
      extractedErrors.push({ [err.path]: err.msg });
    }
  });

  sendResponse(res, 422, "Invalid or missing parameters", [], extractedErrors);
};

export const createUserValidationRules = () => {
  return [
    body("fullName")
      .not()
      .isEmpty()
      .withMessage("Full Name is required")
      .bail()
      .isString()
      .withMessage("Full Name must be of type String")
      .bail()
      .isLength({ max: 50 })
      .withMessage("Full Name can have max. 50 characters")
      .trim(),
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .bail()
      .isLength({ max: 50 })
      .withMessage("Email must be max 50 characters")
      .bail()
      .isEmail()
      .withMessage("Provide a valid email")
      .toLowerCase()
      .normalizeEmail()
      .trim(),
    body("b2bId")
      .not()
      .isEmpty()
      .withMessage("B2B Partner ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("B2B Partner ID must be a valid integer"),
    body("roleId")
      .not()
      .isEmpty()
      .withMessage("Role ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Role ID must be a valid integer"),
  ];
};

export const passwordValidationRules = () => {
  return [
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .bail()
      .isString()
      .withMessage("Password must be of type String")
      .bail()
      .isLength({ min: 6, max: 20 })
      .withMessage("Password must be between 6 to 20 characters")
      .bail()
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain atleast one lowercase, uppercase, number and special characters"
      ),
    body("emailToken")
      .not()
      .isEmpty()
      .withMessage("Email Token is required")
      .bail()
      .isHexadecimal()
      .withMessage("Provide a valid email token")
      .trim(),
  ];
};

export const loginValidationRules = () => {
  return [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Provide a valid email")
      .normalizeEmail()
      .trim(),
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .bail()
      .isString()
      .withMessage("Password must be of type String")
      .bail()
      .isLength({ min: 6, max: 20 })
      .withMessage("Password must be between 6 to 20 characters")
      .bail()
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain atleast one lowercase, uppercase, number and special characters"
      ),
  ];
};

export const forgotPasswordValidationRules = () => {
  return [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .bail()
      .isLength({ max: 50 })
      .withMessage("Email must be max 50 characters")
      .bail()
      .isEmail()
      .withMessage("Provide a valid email")
      .normalizeEmail()
      .trim(),
  ];
};

export const changePasswordValidationRules = () => {
  return [
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .bail()
      .isString()
      .withMessage("Password must be of type String")
      .bail()
      .isLength({ min: 6, max: 20 })
      .withMessage("Password must be between 6 to 20 characters")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain atleast one lowercase, uppercase, number and special characters"
      ),
    body("newPassword")
      .not()
      .isEmpty()
      .withMessage("New Password is required")
      .bail()
      .isString()
      .withMessage("New Password must be of type String")
      .bail()
      .isLength({ min: 6, max: 20 })
      .withMessage("New Password must be between 6 to 20 characters")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "New Password must contain atleast one lowercase, uppercase, number and special characters"
      ),
  ];
};

// Validation middleware
export const validateEmail = [
  body("to").isEmail().withMessage("Valid email address is required"),
  body("subject")
    .isLength({ min: 1, max: 200 })
    .withMessage("Subject is required and must be less than 200 characters"),
  body("message")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Message must be less than 5000 characters"),
];

export const validateBulkEmail = [
  body("recipients")
    .isArray({ min: 1, max: 100 })
    .withMessage("Recipients must be an array with 1-100 emails"),
  body("recipients.*")
    .isEmail()
    .withMessage("All recipients must be valid email addresses"),
  body("subject")
    .isLength({ min: 1, max: 200 })
    .withMessage("Subject is required and must be less than 200 characters"),
  body("message")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Message is required and must be less than 5000 characters"),
];

export const validatePasswordReset = [
  body("email").isEmail().withMessage("Valid email address is required"),
  body("resetLink").isURL().withMessage("Valid reset link URL is required"),
];

export const createValidationRules = () => [
  body("name")
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must be of type String")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Name can have max. 50 characters")
    .trim(),

  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Email must be max 50 characters")
    .bail()
    .isEmail()
    .withMessage("Provide a valid email")
    .normalizeEmail()
    .trim(),

  body("applicationStatus")
    .trim()
    .notEmpty()
    .bail()
    .withMessage("Application status is required")
    .isString()
    .bail()
    .withMessage("Application status must be a string")
    .isIn([
      "Pre-Approved",
      "Approved",
      "Sanction Letter Issued",
      "Disbursement Pending",
      "Disbursed",
      "Rejected",
      "On Hold",
      "Withdrawn",
      "Cancelled",
    ])
    .withMessage("Invalid application status"),

  body("loanAmountRequested")
    .notEmpty()
    .bail()
    .withMessage("Loan amount requested is required")
    .isFloat({ min: 1 })
    .withMessage("Loan amount requested must be a positive number"),

  body("loanAmountApproved")
    .notEmpty()
    .bail()
    .withMessage("Loan amount approved is required")
    .isFloat({ min: 0 })
    .withMessage("Loan amount approved must be a number >= 0"),

  body("loanTenureYears")
    .notEmpty()
    .bail()
    .withMessage("Loan tenure years is required")
    .isInt({ min: 1 })
    .withMessage("Loan tenure years must be at least 1"),
];

export const editValidationRules = () => [
  param("id")
    .exists()
    .withMessage("id is required")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("id must be a positive integer")
    .toInt(),
  body("name")
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must be of type String")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Name can have max. 50 characters")
    .trim(),

  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Email must be max 50 characters")
    .bail()
    .isEmail()
    .withMessage("Provide a valid email")
    .normalizeEmail()
    .trim(),

  body("applicationStatus")
    .trim()
    .notEmpty()
    .bail()
    .withMessage("Application status is required")
    .isString()
    .bail()
    .withMessage("Application status must be a string")
    .isIn([
      "Pre-Approved",
      "Approved",
      "Sanction Letter Issued",
      "Disbursement Pending",
      "Disbursed",
      "Rejected",
      "On Hold",
      "Withdrawn",
      "Cancelled",
    ])
    .withMessage("Invalid application status"),

  body("loanAmountRequested")
    .notEmpty()
    .bail()
    .withMessage("Loan amount requested is required")
    .isFloat({ min: 1 })
    .withMessage("Loan amount requested must be a positive number"),

  body("loanAmountApproved")
    .notEmpty()
    .bail()
    .withMessage("Loan amount approved is required")
    .isFloat({ min: 0 })
    .withMessage("Loan amount approved must be a number >= 0"),

  body("loanTenureYears")
    .notEmpty()
    .bail()
    .withMessage("Loan tenure years is required")
    .isInt({ min: 1 })
    .withMessage("Loan tenure years must be at least 1"),
];

export const validateId = () => [
  param("id")
    .exists()
    .withMessage("id is required")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

export const leadPaginationValidationRules = () => [
  query("size")
    .not()
    .isEmpty()
    .withMessage("Size is required")
    .bail()
    .isInt({ min: 1, max: 100 })
    .withMessage("Size must be an Integer, between 1 and 100")
    .bail()
    .toInt(),
  query("page")
    .not()
    .isEmpty()
    .withMessage("Page is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Page must be an Integer, greater than 0")
    .bail()
    .toInt(),
  query("search").optional({ values: "falsy" }).toLowerCase().trim(),
  query("sortKey")
    .optional({ values: "falsy" })
    .isIn([
      "name",
      "email",
      "loanTenureYears",
      "loanAmountRequested",
      "loanAmountApproved",
      "applicationStatus",
    ])
    .withMessage(
      "SortKey should be one of name, email, loanTenureYears, loanAmountRequested, loanAmountApproved, applicationStatus"
    )
    .trim(),
  query("sortDir")
    .optional({ values: "falsy" })
    .isIn(["asc", "desc"])
    .withMessage("SortDir should be one of asc, desc")
    .trim(),
];

export const createContactsLeadValidationRules = () => [
  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("phone_number")
    .isMobilePhone("any", { strictMode: false }) // allow numbers with country codes
    .withMessage("Valid phone number is required"),

  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name must not exceed 50 characters"),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name must not exceed 50 characters"),

  body("b2b_partner_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("B2B partner name must not exceed 100 characters"),

  body("current_education_level")
    .optional()
    .isIn(["High School", "Bachelor", "Master", "PhD", "Diploma", "Other"])
    .withMessage("Invalid current education level"),

  body("admission_status")
    .optional()
    .isIn([
      "Not Applied",
      "Applied",
      "Interview Scheduled",
      "Waitlisted",
      "Admitted",
      "Rejected",
    ])
    .withMessage("Invalid admission status"),

  body("target_degree_level")
    .optional()
    .isIn([
      "Bachelor's",
      "Master's",
      "PhD",
      "Diploma",
      "Certificate",
      "Professional Course",
    ])
    .withMessage("Invalid target degree level"),

  body("course_type")
    .optional()
    .isIn(["STEM", "Business", "Others"])
    .withMessage("Invalid course type"),

  body("intake_year")
    .optional()
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
    .withMessage("Intake year must be valid and within next 10 years"),

  body("intake_month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Intake month must be between 1 and 12"),

  body("preferred_study_destination")
    .optional()
    .isIn([
      "US",
      "UK",
      "UAE",
      "Canada",
      "Australia",
      "Germany",
      "France",
      "Singapore",
      "Italy",
      "Japan",
    ])
    .withMessage("Invalid preferred study destination"),

  body("date_of_birth")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid date of birth is required"),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other", "Prefer not to say"])
    .withMessage("Invalid gender"),
];