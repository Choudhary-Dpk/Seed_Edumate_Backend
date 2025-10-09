import { NextFunction, Response, Request } from "express";
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
    const { coApplicantIncomeType, formType, hasCoApplicant } = contactData;

    let requiredFields: string[] = [];

    if (formType === "loan_eligibility_checker") {
      requiredFields = [...EDUMATE_CONTACT_REQUIRED_FIELDS];
      if(hasCoApplicant){
        if (coApplicantIncomeType !== "Retired") {
          requiredFields.push("coApplicantAnnualIncome");
        }
      }
    } else if (formType === "loan_emi_calculator") {
      requiredFields = [
          "firstName",
          "lastName",
          "email",
          "phoneNumber",
      ];
    }

    // Validate missing fields
    const missingFields = requiredFields.filter((field) => {
      const value = contactData[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      throw createError(
        `Missing required field(s): ${missingFields.join(", ")}`,
        400,
        { missingFields }
      );
    }

    next();
  } catch (error: any) {
    const statusCode = error?.statusCode || 500;
    const message =
      error?.message || "Error while validating contact fields";
    const metadata = error?.metadata || [];

    sendResponse(res, statusCode, message, [], [metadata]);
  }
};
