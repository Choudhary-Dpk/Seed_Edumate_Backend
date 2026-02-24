import { NextFunction, Request, Response } from "express";
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

export const validatePasswordReset = [
  body("email").isEmail().withMessage("Valid email address is required"),
  body("resetLink").isURL().withMessage("Valid reset link URL is required"),
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

export const contactsLeadPaginationValidationRules = () => [
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
    .isIn(["name", "email", "id"])
    .withMessage("SortKey should be one of name, email, id")
    .trim(),
  query("sortDir")
    .optional({ values: "falsy" })
    .isIn(["asc", "desc"])
    .withMessage("SortDir should be one of asc, desc")
    .trim(),
];

export const createUserValidator = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email").isEmail().withMessage("Email must be valid"),
];

export const validEmailValidator = () => [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const loanEligibilityValidation = () => [
  body("country_of_study")
    .notEmpty()
    .withMessage("Country of study is required")
    .isString()
    .withMessage("Country of study must be a string")
    .isLength({ max: 100 })
    .withMessage("Country of study must not exceed 100 characters"),

  body("level_of_education")
    .notEmpty()
    .withMessage("Level of education is required")
    .isString()
    .withMessage("Level of education must be a string")
    .isLength({ max: 50 })
    .withMessage("Level of education must not exceed 50 characters"),

  body("course_type")
    .notEmpty()
    .withMessage("Course type is required")
    .isString()
    .withMessage("Course type must be a string")
    .isLength({ max: 100 })
    .withMessage("Course type must not exceed 100 characters"),

  body("analytical_exam_name")
    .optional({ values: "null" })
    .isString()
    .withMessage("Analytical exam name must be a string")
    .isLength({ max: 50 })
    .withMessage("Analytical exam name must not exceed 50 characters"),

  body("language_exam_name")
    .optional({ values: "null" })
    .isString()
    .withMessage("Language exam name must be a string")
    .isLength({ max: 50 })
    .withMessage("Language exam name must not exceed 50 characters"),

  body("preference")
    .notEmpty()
    .withMessage("Preference is required")
    .isString()
    .withMessage("Preference must be a string")
    .isLength({ max: 20 })
    .withMessage("Preference must not exceed 20 characters"),
];
