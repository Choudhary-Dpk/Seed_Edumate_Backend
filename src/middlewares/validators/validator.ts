import { NextFunction,Request,Response } from "express";
import { body, validationResult } from "express-validator";
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
    body("firstName")
      .not()
      .isEmpty()
      .withMessage("First Name is required")
      .bail()
      .isString()
      .withMessage("First Name must be of type String")
      .bail()
      .isLength({ max: 50 })
      .withMessage("First Name can have max. 50 characters")
      .trim(),
    body("lastName")
      .not()
      .isEmpty()
      .withMessage("Last Name is required")
      .bail()
      .isString()
      .withMessage("Last Name must be of type String")
      .bail()
      .isLength({ max: 50 })
      .withMessage("Last Name can have max. 50 characters")
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
    body("phone")
      .not()
      .isEmpty()
      .withMessage("Phone is required")
      .bail()
      .isString()
      .withMessage("Phone must be of type String")
      .bail()
      .matches(/^\d{10}$/)
      .withMessage("Provide a valid mobile number")
      .trim(),
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
  body('to')
    .isEmail()
    .withMessage('Valid email address is required'),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('message')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Message must be less than 5000 characters'),
];

export const validateBulkEmail = [
  body('recipients')
    .isArray({ min: 1, max: 100 })
    .withMessage('Recipients must be an array with 1-100 emails'),
  body('recipients.*')
    .isEmail()
    .withMessage('All recipients must be valid email addresses'),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('message')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message is required and must be less than 5000 characters'),
];

export const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required'),
  body('resetLink')
    .isURL()
    .withMessage('Valid reset link URL is required'),
];

export const createLeadValidationRules = () => [
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