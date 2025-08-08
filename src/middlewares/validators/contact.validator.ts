import { NextFunction,Response,Request } from "express";
import { createError } from "../errorHandler";
import { sendResponse } from "../../utils/api";

const EDUMATE_CONTACT_REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
  "baseCurrency",
  "studyDestinationCurrency",
  "selectedLoanCurrency",
  "levelOfEducation",
  "studyDestination",
  "courseType",
  "loanPreference",
  "intakeMonth",
  "intakeYear",
  "loanAmount",
  "coApplicant",
  "coApplicantIncomeType",
  "formType",
  "submissionDate",
  "userAgent",
];

export const validateEdumateContact = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactData = req.body;
    const { coApplicantIncomeType } = contactData;

    // Determine required fields dynamically
    const requiredFields = [...EDUMATE_CONTACT_REQUIRED_FIELDS];

    if (coApplicantIncomeType !== "Retired") {
      requiredFields.push("coApplicantAnnualIncome");
    }

    // Validate missing fields
    const missingFields = requiredFields.filter((field) => {
      const value = contactData[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      throw createError(
        `Missing required field(s): ${missingFields.join(", ")}`,
        400
      );
    }

    next();
  } catch (error) {
    sendResponse(res,500,"Error while validating contact fields")
  }
};
