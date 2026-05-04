import { Request, Response, NextFunction } from "express";
import {
  calculateRepaymentSchedule,
  calculateRepaymentScheduleWithStrategy,
  calculateStandardEMI,
} from "../services/schedule.service";
import { generatePDF } from "../services/pdf.service";
import {
  RepaymentScheduleResponse,
  RepaymentScheduleRequest,
} from "../types/loan-schedule.types";
import {
  convertCurrency,
  extractInstitutionCosts,
  extractInstitutionCostsV3,
  extractProgramDetails,
  recordContactInterestsForCosts,
  ExtractCostsRequest,
  ExtractProgramRequest,
  findLoanEligibility,
} from "../services/loan.service";
import prisma from "../config/prisma";
import { sendResponse } from "../utils/api";
import { generateRequestIdFromPayload } from "../utils/helper";
import logger from "../utils/logger";
import { generateEMIRepaymentScheduleEmail } from "../utils/email templates/repaymentScheduleDetails";

import { queueEmail } from "../services/email-queue.service";
import {
  EmailType,
  EmailCategory,
  SenderType,
} from "../services/email-log.service";

export const checkLoanEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req?.body || {};

    const result = await findLoanEligibility(payload);
    if (!result) {
      return sendResponse(
        res,
        200,
        "Thank you for showing interest, our team will reach out to you to understand your needs better",
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
  next: NextFunction,
) => {
  try {
    const amountParam = req.query.amount as string;
    const from = req.query.from as string;
    const to = (req.query.to as string) || "INR";

    if (!amountParam || !from || !to) {
      return sendResponse(
        res,
        400,
        "Missing required query params: amount, from, to",
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
  next: NextFunction,
): Promise<void> => {
  try {
    const payload: ExtractCostsRequest = req?.body || {};

    const { institution_name, study_level, faculty } = payload;

    // Validation
    if (!institution_name || !study_level || !faculty) {
      sendResponse(
        res,
        400,
        "Missing required fields: institution_name, study_level, faculty",
      );
      return;
    }

    // Validate study_level
    const validStudyLevels = [
      "Undergraduate",
      "Graduate - Masters",
      "Graduate - MBA",
      "PhD",
    ];
    if (!validStudyLevels.includes(study_level)) {
      sendResponse(
        res,
        400,
        `Invalid study_level. Must be one of: ${validStudyLevels.join(", ")}`,
      );
      return;
    }

    // Validate faculty
    const validFaculties = [
      "Arts & Humanities",
      "Business & Management",
      "Engineering & Technology",
      "Law",
      "Political Science & International Relations",
      "Life Sciences & Medicine",
      "Natural Sciences",
      "Other",
    ];
    if (!validFaculties.includes(faculty)) {
      sendResponse(
        res,
        400,
        `Invalid faculty. Must be one of: ${validFaculties.join(", ")}`,
      );
      return;
    }

    // Call the external APIs (primary with fallback)
    const result = await extractInstitutionCosts({
      institution_name,
      study_level,
      faculty,
    });

    // Return successful result
    sendResponse(res, 200, "Institution costs extracted successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * V3 — Get institution costs with a 3-tier fallback chain:
 *   1. Local DB (d_universities + seed_client_programs)
 *   2. seedglobaleducation.com PHP API
 *   3. Anthropic AI extract-costs API
 *
 * Same request shape as v1. Response includes a `source` field so the
 * frontend can tell which tier served the result.
 */
export const getInstitutionCostsV3 = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = req?.body || {};
    const { institution_name, study_level, faculty } = payload as ExtractCostsRequest;

    if (!institution_name || !study_level || !faculty) {
      sendResponse(
        res,
        400,
        "Missing required fields: institution_name, study_level, faculty"
      );
      return;
    }

    const validStudyLevels = [
      "Undergraduate",
      "Graduate - Masters",
      "Graduate - MBA",
      "PhD",
    ];
    if (!validStudyLevels.includes(study_level)) {
      sendResponse(
        res,
        400,
        `Invalid study_level. Must be one of: ${validStudyLevels.join(", ")}`
      );
      return;
    }

    const validFaculties = [
      "Arts & Humanities",
      "Business & Management",
      "Engineering & Technology",
      "Law",
      "Political Science & International Relations",
      "Life Sciences & Medicine",
      "Natural Sciences",
      "Other",
    ];
    if (!validFaculties.includes(faculty)) {
      sendResponse(
        res,
        400,
        `Invalid faculty. Must be one of: ${validFaculties.join(", ")}`
      );
      return;
    }

    // Step 1: extract costs (existing 3-tier flow).
    const result = await extractInstitutionCostsV3({
      institution_name,
      study_level,
      faculty,
    });

    // Step 2: optional — record this user's interest in (university, programs).
    // The frontend can identify the student by any of: contact_id, phoneNumber,
    // or email. If none provided, we just skip the interest write and return
    // the cost data as before.
    let interestsRecorded: any = null;

    const rawContactId =
      payload?.contact_id ?? payload?.contactId ?? payload?.lead_id ?? null;
    const phoneNumber =
      typeof payload?.phoneNumber === "string"
        ? payload.phoneNumber.trim()
        : typeof payload?.phone_number === "string"
          ? payload.phone_number.trim()
          : null;
    const email =
      typeof payload?.email === "string" ? payload.email.trim() : null;

    logger.info(
      `[v3] interest-resolve start — rawContactId=${rawContactId}, phoneNumber=${phoneNumber}, email=${email}`
    );

    let resolvedContactId: number | null = null;
    if (rawContactId !== null && rawContactId !== undefined) {
      const n = Number(rawContactId);
      if (!isNaN(n) && n > 0) resolvedContactId = n;
    }

    if (!resolvedContactId && phoneNumber) {
      const c = await prisma.hSEdumateContacts.findFirst({
        where: {
          personal_information: { phone_number: phoneNumber, is_deleted: false },
        },
        select: { id: true },
        orderBy: { created_at: "desc" },
      });
      resolvedContactId = c?.id ?? null;
      logger.info(
        `[v3] phone lookup for ${phoneNumber} → contactId=${resolvedContactId}`
      );

      // Fallback — if strict is_deleted=false missed due to NULL columns,
      // try without that filter.
      if (!resolvedContactId) {
        const c2 = await prisma.hSEdumateContacts.findFirst({
          where: { personal_information: { phone_number: phoneNumber } },
          select: { id: true },
          orderBy: { created_at: "desc" },
        });
        resolvedContactId = c2?.id ?? null;
        logger.info(
          `[v3] phone fallback (no is_deleted filter) → contactId=${resolvedContactId}`
        );
      }
    }
    if (!resolvedContactId && email) {
      const c = await prisma.hSEdumateContacts.findFirst({
        where: { personal_information: { email, is_deleted: false } },
        select: { id: true },
        orderBy: { created_at: "desc" },
      });
      resolvedContactId = c?.id ?? null;
      logger.info(
        `[v3] email lookup for ${email} → contactId=${resolvedContactId}`
      );
    }

    logger.info(`[v3] resolvedContactId=${resolvedContactId}`);

    if (resolvedContactId) {
      // Resolve b2b_partner_id from direct value or hs_company_id lookup.
      let resolvedPartnerId: number | null = null;
      const rawPartnerId = payload?.b2b_partner_id ?? payload?.b2bPartnerId ?? null;
      if (rawPartnerId !== null && rawPartnerId !== undefined) {
        const n = Number(rawPartnerId);
        if (!isNaN(n) && n > 0) resolvedPartnerId = n;
      }
      if (!resolvedPartnerId) {
        const rawHs = payload?.hs_company_id ?? payload?.hsCompanyId ?? null;
        const hsCompanyId = rawHs != null ? String(rawHs).trim() : "";
        if (hsCompanyId) {
          const partner = await prisma.hSB2BPartners.findFirst({
            where: { company_id: hsCompanyId, is_deleted: false },
            select: { id: true },
          });
          if (partner) resolvedPartnerId = partner.id;
        }
      }

      const intakeMonth =
        typeof payload?.intake_month === "string"
          ? payload.intake_month.trim()
          : typeof payload?.intakeMonth === "string"
            ? payload.intakeMonth.trim()
            : null;
      const intakeYear =
        typeof payload?.intake_year === "string"
          ? payload.intake_year.trim()
          : typeof payload?.intakeYear === "string"
            ? payload.intakeYear.trim()
            : null;

      // Optional — if frontend indicates the user has explicitly picked one
      // program from the V3 results, record interest for only that program.
      const selectedSeedId =
        payload?.selected_seed_client_program_id ??
        payload?.selectedSeedClientProgramId ??
        null;
      let selectedSeedClientProgramId: number | null = null;
      if (selectedSeedId !== null && selectedSeedId !== undefined) {
        const n = Number(selectedSeedId);
        if (!isNaN(n) && n > 0) selectedSeedClientProgramId = n;
      }
      const selectedProgramHsRecordId =
        typeof payload?.selected_program_hs_record_id === "string"
          ? payload.selected_program_hs_record_id.trim()
          : typeof payload?.selectedProgramHsRecordId === "string"
            ? payload.selectedProgramHsRecordId.trim()
            : null;

      try {
        interestsRecorded = await recordContactInterestsForCosts({
          contactId: resolvedContactId,
          institutionName: institution_name,
          studyLevel: study_level,
          faculty,
          programs: result.programs,
          b2bPartnerId: resolvedPartnerId,
          intakeMonth,
          intakeYear,
          source: "extract-costs-v3",
          selectedSeedClientProgramId,
          selectedProgramHsRecordId,
        });
      } catch (err) {
        // Don't fail the cost response if interest persistence fails.
        logger.error(`[v3] interests upsert failed for contact ${resolvedContactId}: ${err}`);
      }
    }

    sendResponse(res, 200, "Institution costs extracted successfully", {
      ...result,
      interests_recorded: interestsRecorded,
    });
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
  next: NextFunction,
): Promise<void> => {
  try {
    const payload: ExtractProgramRequest = req?.body || {};

    const { institution_name, program_name } = payload;

    // Validation
    if (!institution_name || !program_name) {
      sendResponse(
        res,
        400,
        "Missing required fields: institution_name, program_name",
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
 *  UPDATED: Enhanced generateRepaymentScheduleAndEmail
 *
 * Changes:
 * - No longer uses deprecated email.service.ts
 * - Uses unified queueEmail() system
 * - Proper email type (REPAYMENT_SCHEDULE)
 * - Better error handling
 */
export const generateRepaymentScheduleAndEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload: RepaymentScheduleRequest = req?.body || {};
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
        "Missing required fields: principal, annualRate, tenureYears, name, email",
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
        cachedResponse,
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
        strategyConfig,
      );
    } else if (emi) {
      calculationResult = calculateRepaymentSchedule(
        principal,
        annualRate,
        tenureYears,
        emi,
      );
    } else {
      const standardEMI = calculateStandardEMI(
        principal,
        annualRate,
        tenureYears,
      );
      calculationResult = calculateRepaymentSchedule(
        principal,
        annualRate,
        tenureYears,
        standardEMI,
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
        `PDF generated successfully, size: ${pdfBuffer.length} bytes, file: ${pdfFileName}`,
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
              strategyType,
            )} optimization.`
          : message;

        // Generate HTML email template
        const htmlMessage = generateEMIRepaymentScheduleEmail(name);

        // Prepare attachments if PDF is available
        const attachments =
          pdfBuffer && pdfFileName
            ? [
                {
                  filename: pdfFileName,
                  content: pdfBuffer.toString("base64"),
                  contentType: "application/pdf",
                },
              ]
            : [];

        //  NEW: Use unified email queue system
        await queueEmail({
          to: email,
          subject: emailSubject,
          html: htmlMessage,
          text: emailMessage,
          attachments: attachments.length > 0 ? attachments : undefined,
          email_type: EmailType.REPAYMENT_SCHEDULE,
          category: EmailCategory.LOAN,
          sent_by_type: SenderType.SYSTEM,
          metadata: {
            fromName,
            requestId,
            principal,
            annualRate,
            tenureYears,
            strategyType: strategyType || null,
            hasPdfAttachment: !!pdfBuffer,
            customerName: name,
          },
        });

        logger.debug(
          `Email queued successfully: ${email} | PDF: ${pdfFileName || "none"} ${
            pdfBuffer ? `(${pdfBuffer.length} bytes)` : ""
          }`,
        );

        emailResponse = {
          to: email,
          subject: emailSubject,
          sentAt: new Date().toISOString(),
          hasPdfAttachment: !!pdfBuffer,
        };

        logger.debug(
          `Email queued for delivery: ${email} at ${emailResponse.sentAt}`,
        );
      } catch (error) {
        logger.error(
          `Email queueing failed for: ${email} - ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        // Don't fail the entire request if email fails
        // Just log the error and continue
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
      } | PDF: ${!!pdfBuffer ? "✓" : "✗"}${pdfError ? ` (${pdfError})` : ""}`,
    );

    // Always return success if calculation succeeded
    sendResponse(
      res,
      200,
      `Repayment schedule generated successfully${
        strategyType ? ` with ${getStrategyDisplayName(strategyType)}` : ""
      }${pdfError ? " (PDF generation failed)" : ""}`,
      response,
    );
  } catch (error) {
    logger.error(
      `✗ Error in generateRepaymentScheduleAndEmail: ${
        error instanceof Error ? error.message : String(error)
      }`,
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
