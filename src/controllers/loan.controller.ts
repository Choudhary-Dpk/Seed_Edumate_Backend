import { Request, Response } from 'express';
import { validateLoanEligibility } from '../middlewares/validators/loan.validator';
import { convertCurrency, findLoanEligibility } from '../services/loan.service';
import { sendResponse } from "../utils/api";

export const checkLoanEligibility = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //     const dummyPayload = {
    //     "country_of_study": "USA",
    //     "level_of_education": "Bachelor",
    //     "course_type": "STEM",
    //     "analytical_exam_name": "SAT",
    //     "language_exam_name": "TOEFL",
    //     "preference": "Secured"
    //   }
    const payload = req?.body || {};
    // Validate the request body
    const validation = validateLoanEligibility(payload);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    // Find loan eligibility
    const result = await findLoanEligibility(payload);

    if (!result) {
      return sendResponse(
        res,
        200,
        "Not Eligible at This Time,Your application has been received, but you don't meet the current eligibility criteria"
      );
    }

    // Return successful result
    res.status(200).json({
      success: true,
      message: "Loan eligibility found",
      data: {
        loan_amount: result.loan_amount,
        loan_amount_currency: result.loan_amount_currency,
      },
    });
  } catch (error) {
    console.error("Error in checkLoanEligibility:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const getConvertedCurrency = async (req: Request, res: Response) => {
  try {
    const amountParam = req.query.amount as string;
    const from = req.query.from as string;
    const to = (req.query.to as string) || "INR";

    if (!amountParam || !from || !to) {
      return res
        .status(400)
        .json({ message: "Missing required query params: amount, from, to" });
    }

    const numericAmount = parseFloat(amountParam);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: "Amount must be a valid number" });
    }

    const converted = await convertCurrency(numericAmount, from, to);
    return res.status(200).json({ convertedAmount: converted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Currency conversion failed" });
  }
};
