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