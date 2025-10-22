import { NextFunction, Request, Response } from "express";
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
import { convertCurrency, findLoanEligibility } from "../services/loan.service";
import { sendResponse } from "../utils/api";
import { generateRequestIdFromPayload } from "../utils/helper";
import { logEmailHistory } from "../models/helpers/email.helper";
import logger from "../utils/logger";
import { mapAllLoanApplicationFields } from "../mappers/loanApplication/loanApplicationMapping";
import { categorizeLoanApplicationByTable } from "../services/DBServices/loanApplication.service";
import prisma from "../config/prisma";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import {
  createLoanApplication,
  createLoanApplicationAcademicDetails,
  createLoanApplicationAdditionalService,
  createLoanApplicationCommissionRecord,
  createLoanApplicationCommunicationPreferences,
  createLoanApplicationDocumentManagement,
  createLoanApplicationFinancialRequirements,
  createLoanApplicationLenderInformation,
  createLoanApplicationProcessingTimeline,
  createLoanApplicationRejectionDetails,
  createLoanApplicationStatus,
  createLoanApplicationSystemTracking,
  deleteLoanApplication,
  fetchLoanApplicationsList,
  getLoanApplication,
  updateLoanApplication,
  updateLoanApplicationAcademicDetails,
  updateLoanApplicationAdditionalService,
  updateLoanApplicationCommissionRecord,
  updateLoanApplicationCommunicationPreferences,
  updateLoanApplicationDocumentManagement,
  updateLoanApplicationFinancialRequirements,
  updateLoanApplicationLenderInformation,
  updateLoanApplicationProcessingTimeline,
  updateLoanApplicationRejectionDetails,
  updateLoanApplicationStatus,
  updateLoanApplicationSystemTracking,
} from "../models/helpers/loanApplication.helper";

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

export const createLoanApplicationsController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    debugger;
    //  const userId = req.payload!.id;
    const userId = 1;

    console.log("userId", userId);

    logger.debug(`Mapping loan application fields`);
    const mappedFields = await mapAllLoanApplicationFields(req.body);
    console.log("mappedFields", mappedFields);

    logger.debug(`Categorizing loan application data`);
    const categorized = categorizeLoanApplicationByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating loan application for userId: ${userId}`);
      const application = await createLoanApplication(
        tx,
        categorized["mainLoanApplication"],
        userId!
      );
      logger.debug(
        `Loan application created successfully with id: ${application.id}`
      );

      logger.debug(
        `Creating academic details for application: ${application.id}`
      );
      const academicDetails = await createLoanApplicationAcademicDetails(
        tx,
        application.id,
        categorized["academicDetails"]
      );
      logger.debug(
        `Academic details created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating financial requirements for application: ${application.id}`
      );
      const financialRequirements =
        await createLoanApplicationFinancialRequirements(
          tx,
          application.id,
          categorized["financialRequirements"]
        );
      logger.debug(
        `Financial requirements created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating application status for application: ${application.id}`
      );
      const applicationStatus = await createLoanApplicationStatus(
        tx,
        application.id,
        categorized["applicationStatus"]
      );
      logger.debug(
        `Application status created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating lender information for application: ${application.id}`
      );
      const lenderInformation = await createLoanApplicationLenderInformation(
        tx,
        application.id,
        categorized["lenderInformation"]
      );
      logger.debug(
        `Lender information created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating document management for application: ${application.id}`
      );
      const documentManagement = await createLoanApplicationDocumentManagement(
        tx,
        application.id,
        categorized["documentManagement"]
      );
      logger.debug(
        `Document management created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating processing timeline for application: ${application.id}`
      );
      const processingTimeline = await createLoanApplicationProcessingTimeline(
        tx,
        application.id,
        categorized["processingTimeline"]
      );
      logger.debug(
        `Processing timeline created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating rejection details for application: ${application.id}`
      );
      const rejectionDetails = await createLoanApplicationRejectionDetails(
        tx,
        application.id,
        categorized["rejectionDetails"]
      );
      logger.debug(
        `Rejection details created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating communication preferences for application: ${application.id}`
      );
      const communicationPreferences =
        await createLoanApplicationCommunicationPreferences(
          tx,
          application.id,
          categorized["communicationPreferences"]
        );
      logger.debug(
        `Communication preferences created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating system tracking for application: ${application.id}`
      );
      const systemTracking = await createLoanApplicationSystemTracking(
        tx,
        application.id,
        categorized["systemTracking"],
        userId!
      );
      logger.debug(
        `System tracking created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating commission record for application: ${application.id}`
      );
      const commissionRecord = await createLoanApplicationCommissionRecord(
        tx,
        application.id,
        categorized["commissionRecords"]
      );
      logger.debug(
        `Commission record created successfully for application: ${application.id}`
      );

      logger.debug(
        `Creating additional service for application: ${application.id}`
      );
      const additionalService = await createLoanApplicationAdditionalService(
        tx,
        application.id,
        categorized["additionalServices"]
      );
      logger.debug(
        `Additional service created successfully for application: ${application.id}`
      );

      data = {
        application: {
          ...application,
        },
        academicDetails: {
          ...academicDetails,
        },
        financialRequirements: {
          ...financialRequirements,
        },
        applicationStatus: {
          ...applicationStatus,
        },
        lenderInformation: {
          ...lenderInformation,
        },
        documentManagement: {
          ...documentManagement,
        },
        processingTimeline: {
          ...processingTimeline,
        },
        rejectionDetails: {
          ...rejectionDetails,
        },
        communicationPreferences: {
          ...communicationPreferences,
        },
        systemTracking: {
          ...systemTracking,
        },
        commissionRecord: {
          ...commissionRecord,
        },
        additionalService: {
          ...additionalService,
        },
      };

      return application;
    });

    logger.debug(
      `Loan application creation transaction completed successfully`,
      result.id
    );

    sendResponse(res, 201, "Loan application created successfully", data);
  } catch (error) {
    logger.error(`Error creating loan application: ${error}`);
    next(error);
  }
};

export const deleteLoanApplicationController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.payload!.id;
    const applicationId = req.params.id;

    logger.debug(
      `Deleting loan application with id: ${applicationId} by userId: ${userId}`
    );
    await deleteLoanApplication(+applicationId, userId);
    logger.debug(`Loan application deleted successfully`);

    sendResponse(res, 200, "Loan application deleted successfully");
  } catch (error) {
    logger.error(`Error deleting loan application: ${error}`);
    next(error);
  }
};

export const updateLoanApplicationController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.payload!.id;
    const applicationId = parseInt(req.params.id);

    logger.debug(`Mapping loan application fields for update`);
    const mappedFields = await mapAllLoanApplicationFields(req.body);

    logger.debug(`Categorizing loan application data for update`);
    const categorized = categorizeLoanApplicationByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating loan application: ${applicationId}`);
      const application = await updateLoanApplication(
        tx,
        applicationId,
        categorized["mainLoanApplication"]
      );
      logger.debug(
        `Loan application updated successfully with id: ${applicationId}`
      );

      logger.debug(
        `Updating academic details for application: ${applicationId}`
      );
      await updateLoanApplicationAcademicDetails(
        tx,
        applicationId,
        categorized["academicDetails"]
      );

      logger.debug(
        `Updating financial requirements for application: ${applicationId}`
      );
      await updateLoanApplicationFinancialRequirements(
        tx,
        applicationId,
        categorized["financialRequirements"]
      );

      logger.debug(
        `Updating application status for application: ${applicationId}`
      );
      await updateLoanApplicationStatus(
        tx,
        applicationId,
        categorized["applicationStatus"]
      );

      logger.debug(
        `Updating lender information for application: ${applicationId}`
      );
      await updateLoanApplicationLenderInformation(
        tx,
        applicationId,
        categorized["lenderInformation"]
      );

      logger.debug(
        `Updating document management for application: ${applicationId}`
      );
      await updateLoanApplicationDocumentManagement(
        tx,
        applicationId,
        categorized["documentManagement"]
      );

      logger.debug(
        `Updating processing timeline for application: ${applicationId}`
      );
      await updateLoanApplicationProcessingTimeline(
        tx,
        applicationId,
        categorized["processingTimeline"]
      );

      logger.debug(
        `Updating rejection details for application: ${applicationId}`
      );
      await updateLoanApplicationRejectionDetails(
        tx,
        applicationId,
        categorized["rejectionDetails"]
      );

      logger.debug(
        `Updating communication preferences for application: ${applicationId}`
      );
      await updateLoanApplicationCommunicationPreferences(
        tx,
        applicationId,
        categorized["communicationPreferences"]
      );

      logger.debug(
        `Updating system tracking for application: ${applicationId}`
      );
      await updateLoanApplicationSystemTracking(
        tx,
        applicationId,
        categorized["systemTracking"],
        userId
      );

      logger.debug(
        `Updating commission record for application: ${application.id}`
      );
      await updateLoanApplicationCommissionRecord(
        tx,
        application.id,
        categorized["commissionRecords"]
      );
      logger.debug(
        `Commission record updated successfully for application: ${application.id}`
      );

      logger.debug(
        `Updating additional service for application: ${applicationId}`
      );
      await updateLoanApplicationAdditionalService(
        tx,
        application.id,
        categorized["additionalServices"]
      );
      logger.debug(
        `Additional service updated successfully for application: ${applicationId}`
      );

      return application;
    });

    res.status(200).json({
      success: true,
      message: "Loan application updated successfully",
      data: data,
    });
  } catch (error) {
    logger.error(`Error updating loan application: ${error}`);
    next(error);
  }
};

export const getLoanApplicationDetailsController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const applicationId = parseInt(req.params.id);

    logger.debug(`Fetching loan application details for id: ${applicationId}`);
    const applicationDetails = await getLoanApplication(applicationId);
    logger.debug(`Loan application details fetched successfully`);

    sendResponse(
      res,
      200,
      "Loan application details fetched successfully",
      applicationDetails
    );
  } catch (error) {
    logger.error(`Error fetching loan application details: ${error}`);
    next(error);
  }
};

export const getLoanApplicationsListController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.payload!.id;
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;
    const search = (req.query.search as string) || null;
    const filterByUser = req.query.filterByUser === "true";

    const offset = (page - 1) * size;

    logger.debug(
      `Fetching loan applications list with page: ${page}, size: ${size}, sortKey: ${sortKey}, sortDir: ${sortDir}, search: ${search}`
    );
    const { rows, count } = await fetchLoanApplicationsList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      filterByUser ? userId : undefined
    );
    logger.debug(
      `Loan applications list fetched successfully. Count: ${count}`
    );

    sendResponse(res, 200, "Loan applications list fetched successfully", {
      data: rows,
      total: count,
      page,
      size,
    });
  } catch (error) {
    logger.error(`Error fetching loan applications list: ${error}`);
    next(error);
  }
};
