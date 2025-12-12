import { Request, Response } from "express";
import {
  calculateRepaymentSchedule,
  calculateRepaymentScheduleWithStrategy,
  calculateStandardEMI,
} from "../services/schedule.service";
import { generatePDF } from "../services/pdf.service";
import { sendRepaymentScheduleEmail } from "../services/email.service";
import {
  RepaymentScheduleResponse,
  RepaymentScheduleRequest,
} from "../types/loan-schedule.types";
import { validateLoanEligibility } from "../middlewares/validators/loan.validator";
import {
  convertCurrency,
  extractInstitutionCosts,
  extractProgramDetails,
  ExtractCostsRequest,
  ExtractProgramRequest,
  findLoanEligibility,
} from "../services/loan.service";
import { sendResponse } from "../utils/api";
import { generateRequestIdFromPayload } from "../utils/helper";

export const checkLoanEligibility = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
        "Thank you for showing interest, our team will reach out to you to understand your needs better"
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

/**
 * Get institution costs (tuition, living expenses, etc.)
 * Calls external AI-powered extraction API
 */
export const getInstitutionCosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload: ExtractCostsRequest = req?.body || {};

    const { institution_name, study_level } = payload;

    // Validation
    if (!institution_name || !study_level) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: institution_name, study_level",
      });
      return;
    }

    // Validate study_level
    const validStudyLevels = [
      "undergraduate",
      "graduate_mba",
      "graduate_masters",
      "phd",
    ];
    if (!validStudyLevels.includes(study_level.toLowerCase())) {
      res.status(400).json({
        success: false,
        message: `Invalid study_level. Must be one of: ${validStudyLevels.join(
          ", "
        )}`,
      });
      return;
    }

    console.log("Extracting institution costs for:", {
      institution_name,
      study_level,
    });

    // Call the external API
    const result = await extractInstitutionCosts({
      institution_name,
      study_level: study_level.toLowerCase(),
    });

    // Return successful result
    sendResponse(res, 200, "Institution costs extracted successfully", result);
  } catch (error) {
    console.error("Error in getInstitutionCosts:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API returned")) {
        res.status(502).json({
          success: false,
          message: "External API error",
          error: error.message,
        });
        return;
      }

      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        res.status(503).json({
          success: false,
          message: "External service unavailable",
          error: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get program details (duration, requirements, curriculum, etc.)
 * Calls external AI-powered extraction API
 */
export const getInstitutionProgram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload: ExtractProgramRequest = req?.body || {};

    const { institution_name, program_name } = payload;

    // Validation
    if (!institution_name || !program_name) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: institution_name, program_name",
      });
      return;
    }

    // Validate minimum length for meaningful queries
    if (institution_name.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: "institution_name must be at least 3 characters",
      });
      return;
    }

    if (program_name.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: "program_name must be at least 3 characters",
      });
      return;
    }

    console.log("Extracting program details for:", {
      institution_name,
      program_name,
    });

    // Call the external API
    const result = await extractProgramDetails({
      institution_name: institution_name.trim(),
      program_name: program_name.trim(),
    });

    // Return successful result
    sendResponse(res, 200, "Program details extracted successfully", result);
  } catch (error) {
    console.error("Error in getInstitutionProgram:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API returned")) {
        res.status(502).json({
          success: false,
          message: "External API error",
          error: error.message,
        });
        return;
      }

      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        res.status(503).json({
          success: false,
          message: "External service unavailable",
          error: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

// In-memory storage for idempotency (use DB in production)
const processedRequests = new Map<string, RepaymentScheduleResponse>();

/**
 * Enhanced generateRepaymentScheduleAndEmail with strategy support and backward compatibility
 */
export const generateRepaymentScheduleAndEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload: RepaymentScheduleRequest = req?.body || {};
    console.log("Received request payload:", JSON.stringify(payload, null, 2));

    // Extract fields with backward compatibility
    const {
      principal,
      annualRate,
      tenureYears,
      name,
      email,
      mobileNumber,
      address,
      emi,
      strategyType,
      strategyConfig,
      fromName = "Edumate",
      subject = "Your Loan Repayment Schedule",
      message = "Please find attached your detailed loan repayment schedule.",
      sendEmail = true,
    } = payload;

    // Validation
    if (!principal || !annualRate || !tenureYears || !name || !email) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: principal, annualRate, tenureYears, name, email",
      });
      return;
    }

    console.log("Processing loan calculation:", {
      principal,
      annualRate,
      tenureYears,
      hasEmi: !!emi,
      strategyType,
      hasStrategyConfig: !!strategyConfig,
    });

    const requestId = generateRequestIdFromPayload(payload);
    const customerDetails = { name, email, mobileNumber, address };

    // Check for idempotency - if request was already processed
    if (processedRequests.has(requestId)) {
      const cachedResponse = processedRequests.get(requestId)!;
      console.log("Returning cached response for requestId:", requestId);
      return sendResponse(
        res,
        200,
        "Repayment schedule already processed",
        cachedResponse
      );
    }

    let calculationResult;

    // Determine calculation method based on input
    if (strategyType && strategyConfig) {
      // NEW: Use strategy-based calculation
      console.log("Using strategy-based calculation:", strategyType);
      calculationResult = calculateRepaymentScheduleWithStrategy(
        principal,
        annualRate,
        tenureYears,
        strategyType,
        strategyConfig
      );
    } else if (emi) {
      // LEGACY: Use provided EMI (backward compatibility)
      console.log("Using legacy EMI-based calculation:", emi);
      calculationResult = calculateRepaymentSchedule(
        principal,
        annualRate,
        tenureYears,
        emi
      );
    } else {
      // STANDARD: Calculate standard EMI and use it
      console.log("Using standard calculation (no EMI provided)");
      const standardEMI = calculateStandardEMI(
        principal,
        annualRate,
        tenureYears
      );
      calculationResult = calculateRepaymentSchedule(
        principal,
        annualRate,
        tenureYears,
        standardEMI
      );
    }

    console.log("Calculation completed:", {
      strategyType,
      originalTenure: tenureYears,
      calculatedTenure: calculationResult.loanDetails.tenureYears,
      monthlyEMI: calculationResult.loanDetails.monthlyEMI,
      totalInterest: calculationResult.loanDetails.totalInterest,
      monthlyScheduleLength: calculationResult.monthlySchedule.length,
    });

    let emailResponse;
    let pdfFileName: string | undefined;

    if (sendEmail && email) {
      try {
        console.log("Generating PDF and sending email...");

        // Generate PDF with strategy information
        const pdfMetadata = {
          fromName,
          requestId,
          customerDetails,
          ...(strategyType && { strategyType, strategyConfig }),
        };

        const { buffer: pdfBuffer, fileName } = await generatePDF(
          calculationResult,
          pdfMetadata
        );

        pdfFileName = fileName;

        // Customize email subject and message for strategies
        const emailSubject = strategyType
          ? `${subject} - ${getStrategyDisplayName(strategyType)}`
          : subject;

        const emailMessage = strategyType
          ? `${message}\n\nThis schedule includes your ${getStrategyDisplayName(
              strategyType
            )} optimization.`
          : message;

        // Send email with PDF attachment
        await sendRepaymentScheduleEmail({
          name,
          email,
          fromName,
          subject: emailSubject,
          message: emailMessage,
          pdfBuffer,
          pdfFileName: fileName,
        });

        emailResponse = {
          to: email,
          subject: emailSubject,
          sentAt: new Date().toISOString(),
        };

        console.log("Email sent successfully to:", email);
      } catch (emailError) {
        console.error("Error in email sending process:", emailError);

        // Return error response for email failure but still provide calculation
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

    console.log("Response prepared successfully for requestId:", requestId);

    // Return successful response
    sendResponse(
      res,
      200,
      `Repayment schedule generated successfully${
        strategyType ? ` with ${getStrategyDisplayName(strategyType)}` : ""
      }`,
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

/**
 * Helper function to get user-friendly strategy names
 */
const getStrategyDisplayName = (strategyType: string): string => {
  switch (strategyType) {
    case "stepup":
      return "Step-up EMI Strategy";
    case "prepayment":
      return "Prepayment Strategy";
    case "secured":
      return "Secured Loan Option";
    default:
      return "Optimization Strategy";
  }
};
