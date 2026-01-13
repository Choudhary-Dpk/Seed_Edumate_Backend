import { Request, Response, NextFunction } from "express";
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
import logger from "../utils/logger";

export const checkLoanEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = req?.body || {};

    const result = await findLoanEligibility(payload);
    if (!result) {
      return sendResponse(
        res,
        200,
        "Thank you for showing interest, our team will reach out to you to understand your needs better"
      );
    }

    sendResponse(res, 200, "Loan eligibility found", [
      {
        loan_amount: result?.loan_amount,
        loan_amount_currency: result?.loan_amount_currency,
      },
    ]);
  } catch (error) {
    next(error);
  }
};

export const getConvertedCurrency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    return sendResponse(res, 200, "Currency converted successfully", {
      convertedAmount: converted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get institution costs (tuition, living expenses, etc.)
 * Calls external AI-powered extraction API
 */
export const getInstitutionCosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload: ExtractCostsRequest = req?.body || {};

    const { institution_name, study_level } = payload;

    // Validation
    if (!institution_name || !study_level) {
      sendResponse(
        res,
        400,
        "Missing required fields: institution_name, study_level"
      );
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
      sendResponse(
        res,
        400,
        `Invalid study_level. Must be one of: ${validStudyLevels.join(", ")}`
      );
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
    next(error);
  }
};

/**
 * Get program details (duration, requirements, curriculum, etc.)
 * Calls external AI-powered extraction API
 */
export const getInstitutionProgram = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload: ExtractProgramRequest = req?.body || {};

    const { institution_name, program_name } = payload;

    // Validation
    if (!institution_name || !program_name) {
      sendResponse(
        res,
        400,
        "Missing required fields: institution_name, program_name"
      );
      return;
    }

    // Validate minimum length for meaningful queries
    if (institution_name.trim().length < 3) {
      sendResponse(res, 400, "institution_name must be at least 3 characters");
      return;
    }

    if (program_name.trim().length < 3) {
      sendResponse(res, 400, "program_name must be at least 3 characters");
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
    next(error);
  }
};

// In-memory storage for idempotency (use DB in production)
const processedRequests = new Map<string, RepaymentScheduleResponse>();

/**
 * Enhanced generateRepaymentScheduleAndEmail with strategy support and backward compatibility
 */
export const generateRepaymentScheduleAndEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload: RepaymentScheduleRequest = req?.body || {};
    console.log("payload", payload);

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
      sendResponse(
        res,
        400,
        "Missing required fields: principal, annualRate, tenureYears, name, email"
      );
      return;
    }

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

    let calculationResult;

    // Determine calculation method based on input
    if (strategyType && strategyConfig) {
      calculationResult = calculateRepaymentScheduleWithStrategy(
        principal,
        annualRate,
        tenureYears,
        strategyType,
        strategyConfig
      );
    } else if (emi) {
      calculationResult = calculateRepaymentSchedule(
        principal,
        annualRate,
        tenureYears,
        emi
      );
    } else {
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

    let emailResponse;
    let pdfFileName: string | undefined;
    let pdfBase64: string | undefined;
    let pdfBuffer: Buffer | undefined;
    let pdfError: string | undefined;

    // Try PDF generation - don't fail if it errors
    try {
      logger.debug("Generating PDF...");

      const pdfMetadata = {
        fromName,
        requestId,
        customerDetails,
        ...(strategyType && { strategyType, strategyConfig }),
      };

      const pdfResult = await generatePDF(calculationResult, pdfMetadata);

      pdfBuffer = pdfResult.buffer;
      pdfFileName = pdfResult.fileName;
      pdfBase64 = pdfBuffer.toString("base64");

      logger.debug(
        `PDF generated successfully, size: ${pdfBuffer.length} bytes, file: ${pdfFileName}`
      );
    } catch (error) {
      console.error("PDF generation failed, continuing without PDF:", error);
      pdfError =
        error instanceof Error ? error.message : "PDF generation failed";
      //Don't return - continue with email and response
    }

    // Send email (with or without PDF)
    if (sendEmail && email) {
      try {
        logger.debug(`Preparing to send email to: ${email} (${name})`);

        const emailSubject = strategyType
          ? `${subject} - ${getStrategyDisplayName(strategyType)}`
          : subject;

        const emailMessage = strategyType
          ? `${message}\n\nThis schedule includes your ${getStrategyDisplayName(
              strategyType
            )} optimization.`
          : message;

        // Send with PDF if available
        if (pdfBuffer && pdfFileName) {
          await sendRepaymentScheduleEmail({
            name,
            email,
            fromName,
            subject: emailSubject,
            message: emailMessage,
            pdfBuffer,
            pdfFileName,
          });
          logger.debug(
            `Email with PDF sent to: ${email} | PDF: ${pdfFileName} (${pdfBuffer.length} bytes)`
          );
        } else {
          // Send without PDF if generation failed
          await sendRepaymentScheduleEmail({
            name,
            email,
            fromName,
            subject: emailSubject,
            message: `${emailMessage}\n\nNote: PDF generation encountered an issue. Please find your loan calculation details in the response.`,
            pdfBuffer: undefined as any,
            pdfFileName: undefined as any,
          });
          logger.debug(
            `Email without PDF sent to: ${email} | Reason: ${
              pdfError || "PDF not generated"
            }`
          );
        }

        emailResponse = {
          to: email,
          subject: emailSubject,
          sentAt: new Date().toISOString(),
          hasPdfAttachment: !!pdfBuffer,
        };

        logger.debug(
          `Email delivery confirmed: ${email} at ${emailResponse.sentAt}`
        );
      } catch (error) {
        logger.error(
          `Email sending failed for: ${email} - ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        next(error);
      }
    }

    // Prepare response with available data
    const response: RepaymentScheduleResponse = {
      status: sendEmail && emailResponse ? "sent" : "not-sent",
      loanDetails: calculationResult.loanDetails,
      monthlySchedule: calculationResult.monthlySchedule,
      yearlyBreakdown: calculationResult.yearlyBreakdown,
      ...(emailResponse && { email: emailResponse }),
      ...(pdfFileName && { pdfFileName }),
      ...(pdfBase64 && {
        pdf: {
          base64: pdfBase64,
          fileName: pdfFileName,
          mimeType: "application/pdf",
          size: Buffer.from(pdfBase64, "base64").length,
        },
      }),
      // Include warning if PDF failed
      ...(pdfError && {
        warnings: {
          pdfGeneration: pdfError,
          message:
            "PDF generation failed, but calculation completed successfully",
        },
      }),
      requestId,
    };

    // Cache the response for idempotency
    processedRequests.set(requestId, response);

    // Clean up old entries (keep only last 1000 requests in memory)
    if (processedRequests.size > 1000) {
      const firstKey = processedRequests.keys().next().value;
      firstKey && processedRequests.delete(firstKey);
    }

    logger.info(
      `✓ Repayment schedule generated for ${email} | RequestID: ${requestId} | Strategy: ${
        strategyType || "standard"
      } | PDF: ${!!pdfBuffer ? "✓" : "✗"}${pdfError ? ` (${pdfError})` : ""}`
    );

    // Always return success if calculation succeeded
    sendResponse(
      res,
      200,
      `Repayment schedule generated successfully${
        strategyType ? ` with ${getStrategyDisplayName(strategyType)}` : ""
      }${pdfError ? " (PDF generation failed)" : ""}`,
      response
    );
  } catch (error) {
    logger.error(
      `✗ Error in generateRepaymentScheduleAndEmail: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    next(error);
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
