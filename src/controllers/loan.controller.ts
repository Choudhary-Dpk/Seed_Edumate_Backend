import { Request, Response } from 'express';
import { calculateRepaymentSchedule } from '../services/schedule.service';
import { generatePDF } from '../services/pdf.service';
import { sendRepaymentScheduleEmail } from "../services/email.service";
import { RepaymentScheduleResponse } from '../types/loan-schedule.types';
import { validateLoanEligibility } from '../middlewares/validators/loan.validator';
import { convertCurrency, findLoanEligibility } from '../services/loan.service';
import { sendResponse } from "../utils/api";
import { generateRequestIdFromPayload } from '../utils/helper';
import { logEmailHistory } from "../models/helpers/email.helper";

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
        errors: validation?.error?.issues.map((err) => ({
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
    sendResponse(res, 200, "Loan eligibility found", [
      {
        loan_amount: result?.loan_amount,
        loan_amount_currency: result?.loan_amount_currency,
      },
    ]);
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
      return sendResponse(
        res,
        400,
        "Missing required query params: amount, from, to"
      );
    }

    const numericAmount = parseFloat(amountParam);
    if (isNaN(numericAmount)) {
      return sendResponse(res, 400, "Amount must be a valid number");
    }

    const converted = await convertCurrency(numericAmount, from, to);
    return res.status(200).json({ convertedAmount: converted });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Currency conversion failed");
  }
};

// Update to existing loan.controller.ts - add this export

// In-memory storage for idempotency (use DB in production)
const processedRequests = new Map<string, RepaymentScheduleResponse>();

export const generateRepaymentScheduleAndEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = req?.body || {};

    // Validate the request body
    // const validation = validateRepaymentSchedule(payload);

    // if (!validation.success) {
    //   res.status(400).json({
    //     success: false,
    //     message: "Validation failed",
    //     errors: validation?.error?.issues.map((err: any) => ({
    //       field: err.path.join("."),
    //       message: err.message,
    //     })),
    //   });
    //   return;
    // }

    const {
      principal,
      annualRate,
      tenureYears,
      emi,
      name,
      email,
      mobileNumber,
      address,
      fromName = "Edumate",
      subject = "Your Loan Repayment Schedule",
      message = "Please find attached your detailed loan repayment schedule.",
      sendEmail = true,
    } = payload!;

    const requestId = generateRequestIdFromPayload(payload);
    const customerDetails = { name, email, mobileNumber, address };

    // Check for idempotency - if request was already processed
    if (processedRequests.has(requestId)) {
      const cachedResponse = processedRequests.get(requestId)!;
      return sendResponse(
        res,
        200,
        "Repayment schedule already processed",
        cachedResponse
      );
    }

    // Calculate the repayment schedule
    const calculationResult = calculateRepaymentSchedule(
      principal,
      annualRate,
      tenureYears,
      emi
    );

    let emailResponse;
    let pdfFileName: string | undefined;

    if (sendEmail && email) {
      try {
        // Generate PDF
        const { buffer: pdfBuffer, fileName } = await generatePDF(
          calculationResult,
          {
            fromName,
            requestId,
            customerDetails,
          }
        );

        pdfFileName = fileName;

        // Send email with PDF attachment
        await sendRepaymentScheduleEmail({
          name,
          email,
          fromName,
          subject,
          message,
          pdfBuffer,
          pdfFileName: fileName,
        });

        emailResponse = {
          to: email,
          subject,
          sentAt: new Date().toISOString(),
        };
      } catch (emailError) {
        console.error("Error sending email:", emailError);

        // Return error response for email failure
        res.status(500).json({
          success: false,
          message: "Failed to send email",
          error:
            emailError instanceof Error
              ? emailError.message
              : "Email sending failed",
          calculation: calculationResult, // Still provide calculation results
        });
        return;
      }
    }

    // Prepare response
    const response: RepaymentScheduleResponse = {
      status: sendEmail && emailResponse ? "sent" : "not-sent",
      loanDetails: calculationResult.loanDetails,
      monthlySchedule: calculationResult.monthlySchedule,
      yearlyBreakdown: calculationResult.yearlyBreakdown,
      ...(emailResponse && { email: emailResponse }),
      ...(pdfFileName && { pdfFileName }),
      requestId,
    };

    // Cache the response for idempotency
    processedRequests.set(requestId, response);

    // Clean up old entries (keep only last 1000 requests in memory)
    if (processedRequests.size > 1000) {
      const firstKey = processedRequests.keys().next().value;
      firstKey && processedRequests.delete(firstKey);
    }

    // Return successful response
    sendResponse(
      res,
      200,
      "Repayment schedule generated successfully",
      response
    );
  } catch (error) {
    console.error("Error in generateRepaymentScheduleAndEmail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};