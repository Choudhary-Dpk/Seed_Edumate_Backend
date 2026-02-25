import { Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";

/**
 * Validate Create Lead Payload
 */
export const validateCreateLeadPayload = (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNo,
      dateOfBirth,
      budget,
      gender,
      nationality,
      universityId,
    } = req.body;

    const errors: string[] = [];

    // Required fields validation
    if (!firstName || firstName.trim().length === 0) {
      errors.push("firstName is required");
    } else if (firstName.length > 25) {
      errors.push("firstName must be 25 characters or less");
    }

    if (!lastName || lastName.trim().length === 0) {
      errors.push("lastName is required");
    } else if (lastName.length > 25) {
      errors.push("lastName must be 25 characters or less");
    }

    if (!email || email.trim().length === 0) {
      errors.push("email is required");
    } else if (email.length > 52) {
      errors.push("email must be 52 characters or less");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("email format is invalid");
    }

    if (!contactNo || contactNo.trim().length === 0) {
      errors.push("contactNo is required");
    } else if (!/^\+\d{1,3}-\d+$/.test(contactNo)) {
      errors.push(
        "contactNo must be in format +countrycode-mobilenumber (e.g., +91-9131736288)"
      );
    }

    if (!dateOfBirth || dateOfBirth.trim().length === 0) {
      errors.push("dateOfBirth is required");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      errors.push("dateOfBirth must be in YYYY-MM-DD format");
    }

    if (!budget || budget.trim().length === 0) {
      errors.push("budget is required");
    }

    if (!gender || gender.trim().length === 0) {
      errors.push("gender is required");
    } else if (gender.length > 6) {
      errors.push("gender must be 6 characters or less");
    }

    if (!nationality || nationality.trim().length === 0) {
      errors.push("nationality is required");
    }

    if (!universityId || universityId.trim().length === 0) {
      errors.push("universityId is required");
    } else if (universityId.length !== 24) {
      errors.push("universityId must be 24 characters");
    }

    // Optional message validation
    if (req.body.message && req.body.message.length > 255) {
      errors.push("message must be 255 characters or less");
    }

    if (errors.length > 0) {
      return sendResponse(res, 400, "Validation failed", { errors });
    }

    next();
  } catch (error) {
    console.error("Error in validateCreateLeadPayload:", error);
    sendResponse(res, 500, "Error while validating lead payload");
  }
};

/**
 * Validate Create Booking Payload
 */
export const validateCreateBookingPayload = (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      propertyId,
      price,
      tenancy,
      categoryId,
      roomId,
      personalInfo,
      universityInfo,
      guardianInfo,
    } = req.body;

    const errors: string[] = [];

    // Required top-level fields
    if (!propertyId || propertyId.length !== 24) {
      errors.push("propertyId is required and must be 24 characters");
    }

    if (price === undefined || price === null) {
      errors.push("price is required");
    } else if (typeof price !== "number") {
      errors.push("price must be a number");
    }

    if (!tenancy) {
      errors.push("tenancy is required");
    } else if (tenancy.length > 25) {
      errors.push("tenancy must be 25 characters or less");
    }

    if (!categoryId || categoryId.length !== 24) {
      errors.push("categoryId is required and must be 24 characters");
    }

    if (!roomId || roomId.length !== 24) {
      errors.push("roomId is required and must be 24 characters");
    }

    // Optional message validation
    if (req.body.message && req.body.message.length > 255) {
      errors.push("message must be 255 characters or less");
    }

    // Validate personalInfo
    if (!personalInfo) {
      errors.push("personalInfo is required");
    } else {
      if (!personalInfo.firstName) errors.push("personalInfo.firstName is required");
      if (!personalInfo.lastName) errors.push("personalInfo.lastName is required");
      if (!personalInfo.email) errors.push("personalInfo.email is required");
      if (!personalInfo.mobile) {
        errors.push("personalInfo.mobile is required");
      } else if (!/^\+\d{1,3}-\d+$/.test(personalInfo.mobile)) {
        errors.push("personalInfo.mobile must be in format +countrycode-mobilenumber");
      }
      if (!personalInfo.dob) {
        errors.push("personalInfo.dob is required");
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(personalInfo.dob)) {
        errors.push("personalInfo.dob must be in YYYY-MM-DD format");
      }
      if (!personalInfo.gender) errors.push("personalInfo.gender is required");
      if (!personalInfo.address) errors.push("personalInfo.address is required");
      if (!personalInfo.city) errors.push("personalInfo.city is required");
      if (!personalInfo.state) errors.push("personalInfo.state is required");
      if (!personalInfo.postcode) errors.push("personalInfo.postcode is required");
      if (!personalInfo.country) errors.push("personalInfo.country is required");
      if (!personalInfo.nationality) errors.push("personalInfo.nationality is required");
    }

    // Validate universityInfo
    if (!universityInfo) {
      errors.push("universityInfo is required");
    } else {
      if (!universityInfo.universityId || universityInfo.universityId.length !== 24) {
        errors.push("universityInfo.universityId is required and must be 24 characters");
      }
      if (!universityInfo.courseName) errors.push("universityInfo.courseName is required");
      if (!universityInfo.yearOfStudy) errors.push("universityInfo.yearOfStudy is required");
      if (!universityInfo.startDate) {
        errors.push("universityInfo.startDate is required");
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(universityInfo.startDate)) {
        errors.push("universityInfo.startDate must be in YYYY-MM-DD format");
      }
      if (!universityInfo.endDate) {
        errors.push("universityInfo.endDate is required");
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(universityInfo.endDate)) {
        errors.push("universityInfo.endDate must be in YYYY-MM-DD format");
      }
    }

    // Validate guardianInfo
    if (!guardianInfo) {
      errors.push("guardianInfo is required");
    } else {
      if (!guardianInfo.fullName) errors.push("guardianInfo.fullName is required");
      if (!guardianInfo.email) errors.push("guardianInfo.email is required");
      if (!guardianInfo.mobile) {
        errors.push("guardianInfo.mobile is required");
      } else if (!/^\+\d{1,3}-\d+$/.test(guardianInfo.mobile)) {
        errors.push("guardianInfo.mobile must be in format +countrycode-mobilenumber");
      }
      if (!guardianInfo.relationship) errors.push("guardianInfo.relationship is required");
      if (!guardianInfo.address) errors.push("guardianInfo.address is required");
      if (!guardianInfo.city) errors.push("guardianInfo.city is required");
      if (!guardianInfo.state) errors.push("guardianInfo.state is required");
      if (!guardianInfo.postcode) errors.push("guardianInfo.postcode is required");
      if (!guardianInfo.country) errors.push("guardianInfo.country is required");
      if (!guardianInfo.nationality) errors.push("guardianInfo.nationality is required");
    }

    if (errors.length > 0) {
      return sendResponse(res, 400, "Validation failed", { errors });
    }

    next();
  } catch (error) {
    console.error("Error in validateCreateBookingPayload:", error);
    sendResponse(res, 500, "Error while validating booking payload");
  }
};

/**
 * Validate Property ID parameter
 */
export const validatePropertyId = (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return sendResponse(res, 400, "Property ID is required");
    }

    if (id.length !== 24) {
      return sendResponse(res, 400, "Property ID must be 24 characters");
    }

    next();
  } catch (error) {
    console.error("Error in validatePropertyId:", error);
    sendResponse(res, 500, "Error while validating property ID");
  }
};

/**
 * Validate Lead ID parameter
 */
export const validateLeadId = (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return sendResponse(res, 400, "Lead ID is required");
    }

    next();
  } catch (error) {
    console.error("Error in validateLeadId:", error);
    sendResponse(res, 500, "Error while validating lead ID");
  }
};

/**
 * Validate Order ID parameter
 */
export const validateOrderId = (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return sendResponse(res, 400, "Order ID is required");
    }

    next();
  } catch (error) {
    console.error("Error in validateOrderId:", error);
    sendResponse(res, 500, "Error while validating order ID");
  }
};