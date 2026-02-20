import { NextFunction, Response, Request } from "express";
import fs from "fs";
import path from "path";
import moment from "moment";
import puppeteer from "puppeteer";
import prisma from "../config/prisma";
import { mapAllCommissionSettlementFields } from "../mappers/commission/commissionMapper";
import {
  createCommissionSettlement,
  createCommissionSettlementStatus,
  createCommissionSettlementSystemTracking,
  createCommissionSettlementTransactionDetails,
  createCommissionSettlementCalculation,
  createCommissionSettlementCommunication,
  createCommissionSettlementLoanDetails,
  createCommissionSettlementPaymentProcessing,
  createCommissionSettlementTaxDeductions,
  createCommissionSettlementDocumentation,
  createCommissionSettlementHoldDisputes,
  createCommissionSettlementReconciliation,
  createCommissionSettlementPerformanceAnalytics,
} from "../services/commission.service";
import { categorizeCommissionSettlementByTable } from "../services/DBServices/commission.services";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import logger from "../utils/logger";
import {
  updateCommissionSettlement,
  updateCommissionSettlementStatus,
  updateCommissionSettlementSystemTracking,
  updateCommissionSettlementTransactionDetails,
  updateCommissionSettlementCalculation,
  updateCommissionSettlementCommunication,
  updateCommissionSettlementLoanDetails,
  updateCommissionSettlementPaymentProcessing,
  updateCommissionSettlementTaxDeductions,
  updateCommissionSettlementDocumentation,
  updateCommissionSettlementHoldDisputes,
  updateCommissionSettlementReconciliation,
  updateCommissionSettlementPerformanceAnalytics,
  deleteCommissionSettlement,
  getCommissionSettlement,
  fetchCommissionSettlementsList,
  fetchCommissionSettlementsByLead,
} from "../models/helpers/commission.helper";
import { getContactLeadById } from "../models/helpers/contact.helper";
import { BACKEND_URL, FRONTEND_URL } from "../setup/secrets";
import { getPartnerIdByUserId } from "../models/helpers/partners.helper";
import {
  sendCommissionNotification,
  notifyFinanceForInvoice,
} from "../services/EmailNotifications/commission.notification.service";

export const createCommissionSettlementController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body.settlement_reference_number) {
      return sendResponse(res, 400, "Settlement reference number is required");
    }

    logger.debug(`Mapping commission settlement fields`);
    const mappedFields = await mapAllCommissionSettlementFields(req.body);
    console.log("mappedFields", mappedFields);

    logger.debug(`Categorizing commission settlement data`);
    const categorized = categorizeCommissionSettlementByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    const result = await prisma.$transaction(
      async (tx: any) => {
        logger.debug(`Creating commission settlement`);
        const settlement = await createCommissionSettlement(
          tx,
          categorized["mainSettlement"],
        );
        logger.debug(
          `Commission settlement created successfully with id: ${settlement.id}`,
        );

        logger.debug(
          `Creating settlement status for settlement: ${settlement.id}`,
        );
        const settlementStatus = await createCommissionSettlementStatus(
          tx,
          settlement.id,
          {
            ...categorized["settlementStatus"],
            verification_status:
              categorized["settlementStatus"]?.verification_status || "Pending",
          },
        );

        logger.debug(
          `Creating system tracking for settlement: ${settlement.id}`,
        );
        const systemTracking = await createCommissionSettlementSystemTracking(
          tx,
          settlement.id,
          categorized["systemTracking"],
        );

        logger.debug(
          `Creating transaction details for settlement: ${settlement.id}`,
        );
        const transactionDetails =
          await createCommissionSettlementTransactionDetails(
            tx,
            settlement.id,
            categorized["transactionDetails"],
          );

        logger.debug(
          `Creating commission calculation for settlement: ${settlement.id}`,
        );
        const commissionCalculation =
          await createCommissionSettlementCalculation(
            tx,
            settlement.id,
            categorized["commissionCalculation"],
          );

        logger.debug(`Creating communication for settlement: ${settlement.id}`);
        const communication = await createCommissionSettlementCommunication(
          tx,
          settlement.id,
          categorized["communication"],
        );

        logger.debug(`Creating loan details for settlement: ${settlement.id}`);
        const loanDetails = await createCommissionSettlementLoanDetails(
          tx,
          settlement.id,
          categorized["loanDetails"],
        );

        logger.debug(
          `Creating payment processing for settlement: ${settlement.id}`,
        );
        const paymentProcessing =
          await createCommissionSettlementPaymentProcessing(
            tx,
            settlement.id,
            categorized["paymentProcessing"],
          );

        logger.debug(
          `Creating tax deductions for settlement: ${settlement.id}`,
        );
        const taxDeductions = await createCommissionSettlementTaxDeductions(
          tx,
          settlement.id,
          categorized["taxDeductions"],
        );

        logger.debug(`Creating documentation for settlement: ${settlement.id}`);
        const documentation = await createCommissionSettlementDocumentation(
          tx,
          settlement.id,
          {
            ...categorized["documentation"],
            invoice_status:
              categorized["documentation"]?.invoice_status || "Pending",
          },
        );

        logger.debug(`Creating hold disputes for settlement: ${settlement.id}`);
        const holdDisputes = await createCommissionSettlementHoldDisputes(
          tx,
          settlement.id,
          categorized["holdDisputes"],
        );

        logger.debug(
          `Creating reconciliation for settlement: ${settlement.id}`,
        );
        const reconciliation = await createCommissionSettlementReconciliation(
          tx,
          settlement.id,
          categorized["reconciliation"],
        );

        logger.debug(
          `Creating performance analytics for settlement: ${settlement.id}`,
        );
        const performanceAnalytics =
          await createCommissionSettlementPerformanceAnalytics(
            tx,
            settlement.id,
            categorized["performanceAnalytics"],
          );

        data = {
          settlement: { ...settlement },
          settlementStatus: { ...settlementStatus },
          systemTracking: { ...systemTracking },
          transactionDetails: { ...transactionDetails },
          commissionCalculation: { ...commissionCalculation },
          communication: { ...communication },
          loanDetails: { ...loanDetails },
          paymentProcessing: { ...paymentProcessing },
          taxDeductions: { ...taxDeductions },
          documentation: { ...documentation },
          holdDisputes: { ...holdDisputes },
          reconciliation: { ...reconciliation },
          performanceAnalytics: { ...performanceAnalytics },
        };

        return settlement;
      },
      { timeout: 180000 },
    );

    logger.debug(
      `Commission settlement creation transaction completed successfully`,
      result.id,
    );

    sendResponse(res, 201, "Commission settlement created successfully", data);
  } catch (error) {
    logger.error(`Error creating commission settlement: ${error}`);
    next(error);
  }
};

export const updateCommissionSettlementController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);

    if (!req.body.settlement_reference_number) {
      return sendResponse(res, 400, "Settlement reference number is required");
    }

    logger.debug(`Mapping commission settlement fields for update`);
    const mappedFields = await mapAllCommissionSettlementFields(req.body);

    logger.debug(`Categorizing commission settlement data for update`);
    const categorized = categorizeCommissionSettlementByTable(mappedFields);

    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating commission settlement: ${settlementId}`);
      const settlement = await updateCommissionSettlement(
        tx,
        settlementId,
        categorized["mainSettlement"],
      );
      logger.debug(
        `Commission settlement updated successfully with id: ${settlementId}`,
      );

      logger.debug(
        `Updating settlement status for settlement: ${settlementId}`,
      );
      await updateCommissionSettlementStatus(
        tx,
        settlementId,
        categorized["settlementStatus"],
      );

      logger.debug(`Updating system tracking for settlement: ${settlementId}`);
      await updateCommissionSettlementSystemTracking(
        tx,
        settlementId,
        categorized["systemTracking"],
      );

      logger.debug(
        `Updating transaction details for settlement: ${settlementId}`,
      );
      await updateCommissionSettlementTransactionDetails(
        tx,
        settlementId,
        categorized["transactionDetails"],
      );

      logger.debug(
        `Updating commission calculation for settlement: ${settlementId}`,
      );
      await updateCommissionSettlementCalculation(
        tx,
        settlementId,
        categorized["commissionCalculation"],
      );

      logger.debug(`Updating communication for settlement: ${settlementId}`);
      await updateCommissionSettlementCommunication(
        tx,
        settlementId,
        categorized["communication"],
      );

      logger.debug(`Updating loan details for settlement: ${settlementId}`);
      await updateCommissionSettlementLoanDetails(
        tx,
        settlementId,
        categorized["loanDetails"],
      );

      logger.debug(
        `Updating payment processing for settlement: ${settlementId}`,
      );
      await updateCommissionSettlementPaymentProcessing(
        tx,
        settlementId,
        categorized["paymentProcessing"],
      );

      logger.debug(`Updating tax deductions for settlement: ${settlementId}`);
      await updateCommissionSettlementTaxDeductions(
        tx,
        settlementId,
        categorized["taxDeductions"],
      );

      logger.debug(`Updating documentation for settlement: ${settlementId}`);
      await updateCommissionSettlementDocumentation(
        tx,
        settlementId,
        categorized["documentation"],
      );

      logger.debug(`Updating hold disputes for settlement: ${settlementId}`);
      await updateCommissionSettlementHoldDisputes(
        tx,
        settlementId,
        categorized["holdDisputes"],
      );

      logger.debug(`Updating reconciliation for settlement: ${settlementId}`);
      await updateCommissionSettlementReconciliation(
        tx,
        settlementId,
        categorized["reconciliation"],
      );

      logger.debug(
        `Updating performance analytics for settlement: ${settlementId}`,
      );
      await updateCommissionSettlementPerformanceAnalytics(
        tx,
        settlementId,
        categorized["performanceAnalytics"],
      );

      return settlement;
    });

    logger.debug(
      `Commission settlement update transaction completed successfully`,
    );

    sendResponse(res, 200, "Commission settlement updated successfully");
  } catch (error) {
    logger.error(`Error updating commission settlement: ${error}`);
    next(error);
  }
};

export const deleteCommissionSettlementController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);

    logger.debug(`Deleting commission settlement with id: ${settlementId}`);
    await deleteCommissionSettlement(settlementId);
    logger.debug(`Commission settlement deleted successfully`);

    sendResponse(res, 200, "Commission settlement deleted successfully");
  } catch (error) {
    logger.error(`Error deleting commission settlement: ${error}`);
    next(error);
  }
};

export const getCommissionSettlementDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);

    logger.debug(
      `Fetching commission settlement details for id: ${settlementId}`,
    );
    const settlementDetails = await getCommissionSettlement(settlementId);
    logger.debug(`Commission settlement details fetched successfully`);

    sendResponse(
      res,
      200,
      "Commission settlement details fetched successfully",
      settlementDetails,
    );
  } catch (error) {
    logger.error(`Error fetching commission settlement details: ${error}`);
    next(error);
  }
};

export const getCommissionSettlementsListController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;
    const search = (req.query.search as string) || null;
    const id = parseInt(req.payload?.id || req.body?.id);
    const isAdmin = (req as any).portalType === "ADMIN";

    let partnerId = null;
    if (id && !isAdmin) {
      // Only look up partner ID for non-admin users
      const partnerRecord = await getPartnerIdByUserId(id);
      partnerId = partnerRecord?.b2b_id || null;

      if (!partnerId) {
        return sendResponse(
          res,
          400,
          "Partner filter requires authentication with b2b_partner_id",
        );
      }
    }

    const offset = (page - 1) * size;

    const filtersFromQuery =
      (req.query.filters as {
        partner?: number;
        lead?: string;
        invoiceStatus?: string;
        paymentStatus?: string;
        settlementStatus?: string;
        verificationStatus?: string;
        startDate?: string;
        endDate?: string;
      }) || {};

    // For admin: default date range = Jan 1 of current year → today (if not explicitly provided)
    let startDate = filtersFromQuery.startDate || null;
    let endDate = filtersFromQuery.endDate || null;

    if (isAdmin && !startDate && !endDate) {
      const now = new Date();
      startDate = `${now.getFullYear()}-01-01`;
      endDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    }

    const filters = {
      partner: partnerId || filtersFromQuery.partner || null,
      lead: filtersFromQuery.lead || null,
      invoiceStatus: filtersFromQuery.invoiceStatus || null,
      paymentStatus: filtersFromQuery.paymentStatus || null,
      settlementStatus: filtersFromQuery.settlementStatus || null,
      verificationStatus: filtersFromQuery.verificationStatus || null,
      startDate,
      endDate,
    };

    logger.debug(
      `Fetching commission settlements list with page: ${page}, size: ${size}, sortKey: ${sortKey}, sortDir: ${sortDir}, search: ${search}, filters: ${JSON.stringify(filters)}`,
    );
    const { rows, count } = await fetchCommissionSettlementsList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      filters,
    );
    logger.debug(
      `Commission settlements list fetched successfully. Count: ${count}`,
    );

    sendResponse(res, 200, "Commission settlements list fetched successfully", {
      data: rows,
      total: count,
      page,
      size,
    });
  } catch (error) {
    logger.error(`Error fetching commission settlements list: ${error}`);
    next(error);
  }
};

export const getCommissionSettlementsByLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const leadId = parseInt(req.query.leadId as string);
    if (!leadId || isNaN(leadId)) {
      return sendResponse(res, 400, "Invalid leadId provided", null);
    }

    const leadDetails = await getContactLeadById(leadId);
    if (!leadDetails || leadDetails.is_deleted === true) {
      return sendResponse(res, 404, "Lead not found");
    }

    logger.debug(
      `Fetching commission settlements details for leadId: ${leadId}`,
    );
    const response = await fetchCommissionSettlementsByLead(leadId);
    logger.debug(`Commission settlements details fetched successfully`);

    sendResponse(
      res,
      200,
      "Commission settlements details fetched successfully",
      response,
    );
  } catch (error) {
    logger.error(`Error fetching commission settlements list: ${error}`);
    next(error);
  }
};

export const uploadInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status = "pending", date } = req.body;
    const file = req.file;
    // Check if file is uploaded
    if (!file) {
      return sendResponse(res, 400, "Invoice file is required");
    }

    // Get validated settlements from middleware
    const { settlements, settlementIds } = (req as any).validatedSettlements;

    // Race condition guard: re-check settlement status hasn't changed since middleware
    const currentStatuses =
      await prisma.hSCommissionSettlementsSettlementStatus.findMany({
        where: { settlement_id: { in: settlementIds } },
        select: { settlement_id: true, settlement_status: true },
      });
    const alreadySubmitted = currentStatuses.filter(
      (s) => s.settlement_status === "Pending Approval",
    );
    if (alreadySubmitted.length > 0) {
      logger.warn(
        "[Commission] Duplicate invoice upload blocked (race condition)",
        {
          settlementIds,
          alreadySubmitted: alreadySubmitted.map((s) => s.settlement_id),
        },
      );
      return sendResponse(
        res,
        409,
        "Invoice has already been submitted for one or more of these settlements. Please refresh the page.",
      );
    }

    // Get the first settlement to extract data
    const firstSettlement = settlements[0];

    // Calculate total invoice amount from all settlements
    const totalAmount = settlements.reduce((sum: number, settlement: any) => {
      const grossAmount =
        settlement.calculation_details?.total_gross_amount || 0;
      return sum + parseFloat(grossAmount.toString());
    }, 0);

    // Since you're using memory storage, save file to disk
    const uploadDir = path.join(process.cwd(), "uploads", "invoices");

    // Create directory if doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueSuffix = Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const fileName = `invoice-${timestamp}-${uniqueSuffix}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Write buffer to file
    fs.writeFileSync(filePath, file.buffer);

    // Generate file URL
    const fileUrl = `${BACKEND_URL}/uploads/invoices/${fileName}`;
    // Create invoice record - extract data from first settlement
    const invoice = await prisma.invoice.create({
      data: {
        file: fileName,
        url: fileUrl,
        status: status,
        date: date ? new Date(date) : new Date(),
        commission_settlement_ids: settlementIds.join(","),
        contact_id: firstSettlement.lead_reference_id,
        b2b_partner_id: firstSettlement.b2b_partner_id,
        application_id: firstSettlement.application_id,
        lender_id: firstSettlement.lender_id,
        product_id: firstSettlement.product_id,
      },
      include: {
        contact: true,
        partner: true,
        loan_application: true,
        lender: true,
        loan_product: true,
      },
    });

    // Generate invoice number
    const invoiceNumber = req.body.invoice_number || `${invoice.id}`;

    // Update HSCommissionSettlementsDocumentation for each settlement ID
    const documentationUpdates = await Promise.all(
      settlements.map(async (settlement: any) => {
        const settlementAmount = req.body.invoice_amount;

        // Check if documentation record exists for this settlement
        if (settlement.documentaion) {
          // Update existing documentation
          return await prisma.hSCommissionSettlementsDocumentation.update({
            where: { settlement_id: settlement.id },
            data: {
              invoice_number: invoiceNumber,
              invoice_date: req.body.invoice_date
                ? new Date(req.body.invoice_date)
                : invoice.date
                  ? new Date(invoice.date)
                  : null,
              invoice_amount: settlementAmount,
              invoice_status: "Received",
              invoice_url: fileUrl,
              invoice_required: "Yes",
            },
          });
        } else {
          // Create new documentation record
          return await prisma.hSCommissionSettlementsDocumentation.create({
            data: {
              settlement_id: settlement.id,
              invoice_number: invoiceNumber,
              invoice_date: req.body.invoice_date
                ? new Date(req.body.invoice_date)
                : invoice.date
                  ? new Date(invoice.date)
                  : null,
              invoice_amount: settlementAmount,
              invoice_status: status,
              invoice_url: fileUrl,
              invoice_required: "Yes",
            },
          });
        }
      }),
    );

    // ── Phase 3: Update settlement_status to "Pending Approval" for all settlements ──
    await Promise.all(
      settlementIds.map((id: number) =>
        prisma.hSCommissionSettlementsSettlementStatus.updateMany({
          where: { settlement_id: id },
          data: { settlement_status: "Pending Approval" },
        }),
      ),
    );

    // ── Timeline entry for each settlement ──
    await Promise.all(
      settlements.map((settlement: any) =>
        prisma.commissionDisputeLog.create({
          data: {
            settlement_id: settlement.id,
            action: "INVOICE_UPLOADED",
            performed_by_user_id: (req as any).user?.id || null,
            performed_by_name:
              (req as any).user?.fullName ||
              (req as any).user?.email ||
              "Partner",
            performed_by_email: (req as any).user?.email || null,
            performed_by_type: "partner",
            reason: `Invoice ${invoiceNumber} uploaded`,
            settlement_status_before:
              settlement.status_history?.settlement_status || null,
            settlement_status_after: "Pending Approval",
            verification_status_before:
              settlement.status_history?.verification_status || null,
            verification_status_after:
              settlement.status_history?.verification_status || null,
          },
        }),
      ),
    );

    // ── Phase 3: Notify Finance about invoice submission (non-blocking) ──
    notifyFinanceForInvoice(
      settlementIds,
      {
        invoiceNumber,
        invoiceDate: req.body.invoice_date
          ? new Date(req.body.invoice_date)
          : invoice.date
            ? new Date(invoice.date)
            : undefined,
        invoiceAmount: totalAmount,
        invoiceUrl: fileUrl,
      },
      {
        partnerB2BId: firstSettlement.b2b_partner_id || undefined,
        partnerName: firstSettlement.partner_name || undefined,
      },
      {
        userId: (req as any).user?.id,
        name: (req as any).user?.fullName || "Partner",
        type: "partner",
      },
    ).catch((err: any) =>
      logger.warn("[Commission] Invoice notification failed", {
        error: err.message,
      }),
    );

    return sendResponse(
      res,
      200,
      "Invoice uploaded and commission settlements updated successfully",
      {
        invoice: {
          id: invoice.id,
          invoice_number: invoiceNumber,
          file: invoice.file,
          url: invoice.url,
          status: invoice.status,
          date: invoice.date,
          total_amount: totalAmount,
          settlement_ids: settlementIds,
          settlements_count: settlementIds.length,
          contact_id: invoice.contact_id,
          b2b_partner_id: invoice.b2b_partner_id,
          application_id: invoice.application_id,
          lender_id: invoice.lender_id,
        },
        updated_settlements: documentationUpdates.length,
      },
    );
  } catch (error: any) {
    console.error("Error uploading invoice:", error);
  }
};

// ============================================================================
// PHASE 3: Accept Settlement (Partner verifies the entry is correct)
// ============================================================================

export const acceptSettlementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const settlement = (req as any).settlement;

    // Update verification_status to "Verified" (with race condition guard)
    await prisma.$transaction(async (tx) => {
      const currentStatus =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!currentStatus || currentStatus.verification_status !== "Pending") {
        throw new Error("ALREADY_PROCESSED");
      }

      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: {
          verification_status: "Verified",
          verification_date: new Date(),
        },
      });

      // Timeline entry
      await tx.commissionDisputeLog.create({
        data: {
          settlement_id: settlementId,
          action: "PARTNER_ACCEPTED",
          performed_by_user_id: (req as any).user?.id || null,
          performed_by_name:
            (req as any).user?.fullName ||
            (req as any).user?.email ||
            "Partner",
          performed_by_email: (req as any).user?.email || null,
          performed_by_type: "partner",
          reason: null,
          settlement_status_before:
            settlement.status_history?.settlement_status || null,
          settlement_status_after:
            settlement.status_history?.settlement_status || null,
          verification_status_before: "Pending",
          verification_status_after: "Verified",
        },
      });
    });

    logger.info("[Commission] Settlement accepted", {
      settlementId,
      acceptedBy: (req as any).user?.fullName || (req as any).user?.email,
      partnerId: (req as any).user?.partnerId,
    });

    return sendResponse(res, 200, "Settlement accepted successfully", {
      settlementId,
      verification_status: "Verified",
    });
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      logger.warn(
        "[Commission] Duplicate accept request blocked (race condition)",
        {
          settlementId: req.params.id,
        },
      );
      return sendResponse(
        res,
        409,
        "This settlement has already been processed. Please refresh the page.",
      );
    }
    logger.error("[Commission] Accept settlement failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to accept settlement");
  }
};

// ============================================================================
// PHASE 3: Raise Objection (Partner disputes the settlement entry)
// ============================================================================

export const raiseObjectionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const { reason } = req.body;
    const settlement = (req as any).settlement;
    const user = (req as any).user;

    // Validate: reason is required
    if (!reason || !reason.trim()) {
      return sendResponse(res, 400, "Objection reason is required");
    }

    // Capture current statuses for dispute log snapshot
    const settlementStatusBefore =
      settlement.status_history?.settlement_status || null;
    const verificationStatusBefore =
      settlement.status_history?.verification_status || null;

    // Execute all DB changes in a single transaction
    await prisma.$transaction(async (tx) => {
      // 0. Re-check status INSIDE transaction to prevent race condition (double-click / parallel requests)
      const currentStatus =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!currentStatus || currentStatus.verification_status !== "Pending") {
        throw new Error("ALREADY_PROCESSED");
      }

      // 1. Update settlement status → "Disputed" + "Additional Info Required"
      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: {
          settlement_status: "Disputed",
          verification_status: "Additional Info Required",
        },
      });

      // 2. Upsert hold_dispute table (current state — gets overwritten on re-raise)
      await tx.hSCommissionSettlementsHoldAndDisputes.upsert({
        where: { settlement_id: settlementId },
        update: {
          dispute_raised: "Yes",
          dispute_date: new Date(),
          dispute_raised_by: user?.fullName || user?.email || "Partner",
          dispute_description: reason.trim(),
          // Clear previous resolution
          dispute_resolution: null,
          dispute_resolution_date: null,
          dispute_resolved_by: null,
        },
        create: {
          settlement_id: settlementId,
          dispute_raised: "Yes",
          dispute_date: new Date(),
          dispute_raised_by: user?.fullName || user?.email || "Partner",
          dispute_description: reason.trim(),
        },
      });

      // 3. INSERT dispute log (permanent audit trail — never overwritten)
      await tx.commissionDisputeLog.create({
        data: {
          settlement_id: settlementId,
          action: "OBJECTION_RAISED",
          performed_by_user_id: user?.id || null,
          performed_by_name: user?.fullName || null,
          performed_by_email: user?.email || null,
          performed_by_type: "partner",
          reason: reason.trim(),
          resolution: null,
          settlement_status_before: settlementStatusBefore,
          settlement_status_after: "Disputed",
          verification_status_before: verificationStatusBefore,
          verification_status_after: "Additional Info Required",
        },
      });
    });

    // Fire notification (non-blocking — outside transaction)
    const partnerName =
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      user?.partnerName ||
      "Partner";

    sendCommissionNotification("PARTNER_OBJECTION_RAISED", {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      lenderName: settlement.loan_details?.lender_name,
      loanAmountDisbursed: settlement.loan_details?.loan_amount_disbursed
        ? Number(settlement.loan_details.loan_amount_disbursed)
        : null,
      grossCommissionAmount: settlement.calculation_details
        ?.gross_commission_amount
        ? Number(settlement.calculation_details.gross_commission_amount)
        : null,
      settlementMonth: settlement.settlement_month,
      settlementYear: settlement.settlement_year,
      objectionReason: reason.trim(),
      triggeredBy: {
        userId: user?.id,
        name: user?.fullName || user?.email,
        type: "partner",
      },
    }).catch((err: any) =>
      logger.warn("[Commission] Objection notification failed", {
        error: err.message,
        settlementId,
      }),
    );

    logger.info("[Commission] Objection raised", {
      settlementId,
      raisedBy: user?.fullName || user?.email,
      partnerId: user?.partnerId,
    });

    return sendResponse(res, 200, "Objection raised successfully", {
      settlementId,
      settlement_status: "Disputed",
      verification_status: "Additional Info Required",
    });
  } catch (error: any) {
    // Race condition guard: second parallel request gets this
    if (error.message === "ALREADY_PROCESSED") {
      logger.warn(
        "[Commission] Duplicate objection request blocked (race condition)",
        {
          settlementId: req.params.id,
        },
      );
      return sendResponse(
        res,
        409,
        "This settlement has already been processed. Please refresh the page.",
      );
    }
    logger.error("[Commission] Raise objection failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to raise objection");
  }
};

// ============================================================================
// PHASE 3: Resolve Dispute (Admin resolves partner's objection)
// ============================================================================

export const resolveDisputeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const { resolution } = req.body;
    const settlement = (req as any).settlement;
    const user = (req as any).user;

    // Validate: resolution is required
    if (!resolution || !resolution.trim()) {
      return sendResponse(res, 400, "Resolution text is required");
    }

    // Capture current statuses for dispute log snapshot
    const settlementStatusBefore =
      settlement.status_history?.settlement_status || null;
    const verificationStatusBefore =
      settlement.status_history?.verification_status || null;

    // Execute all DB changes in a single transaction
    await prisma.$transaction(async (tx) => {
      // 0. Re-check status INSIDE transaction to prevent race condition
      const currentStatus =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!currentStatus || currentStatus.settlement_status !== "Disputed") {
        throw new Error("ALREADY_PROCESSED");
      }

      // 1. Update settlement status → back to "Calculated" + "Pending" (partner re-reviews)
      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: {
          settlement_status: "Calculated",
          verification_status: "Pending",
        },
      });

      // 2. Update hold_dispute table with resolution info
      await tx.hSCommissionSettlementsHoldAndDisputes.update({
        where: { settlement_id: settlementId },
        data: {
          dispute_resolution: resolution.trim(),
          dispute_resolution_date: new Date(),
          dispute_resolved_by: user?.fullName || user?.email || "Admin",
        },
      });

      // 3. INSERT dispute log (permanent audit trail)
      await tx.commissionDisputeLog.create({
        data: {
          settlement_id: settlementId,
          action: "DISPUTE_RESOLVED",
          performed_by_user_id: user?.id || null,
          performed_by_name: user?.fullName || null,
          performed_by_email: user?.email || null,
          performed_by_type: "admin",
          reason: null,
          resolution: resolution.trim(),
          settlement_status_before: settlementStatusBefore,
          settlement_status_after: "Calculated",
          verification_status_before: verificationStatusBefore,
          verification_status_after: "Pending",
        },
      });
    });

    // Fire notification to partner (non-blocking)
    const partnerName =
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      "Partner";

    sendCommissionNotification("ADMIN_DISPUTE_RESOLVED", {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      disputeResolution: resolution.trim(),
      disputeResolvedBy: user?.fullName || user?.email || "Admin",
      triggeredBy: {
        userId: user?.id,
        name: user?.fullName || user?.email,
        type: "admin",
      },
    }).catch((err: any) =>
      logger.warn("[Commission] Dispute resolved notification failed", {
        error: err.message,
        settlementId,
      }),
    );

    logger.info("[Commission] Dispute resolved", {
      settlementId,
      resolvedBy: user?.fullName || user?.email,
    });

    return sendResponse(res, 200, "Dispute resolved successfully", {
      settlementId,
      settlement_status: "Calculated",
      verification_status: "Pending",
    });
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      logger.warn(
        "[Commission] Duplicate resolve dispute request blocked (race condition)",
        {
          settlementId: req.params.id,
        },
      );
      return sendResponse(
        res,
        409,
        "This dispute has already been resolved. Please refresh the page.",
      );
    }
    logger.error("[Commission] Resolve dispute failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to resolve dispute");
  }
};

// ============================================================================
// PHASE 3: Generate System Invoice (Auto-generate PDF & upload)
// ============================================================================

export const generateInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { commission_settlement_ids } = req.body;
    const user = (req as any).user;

    // Parse IDs
    if (typeof commission_settlement_ids === "string") {
      commission_settlement_ids = JSON.parse(commission_settlement_ids);
    }
    if (
      !Array.isArray(commission_settlement_ids) ||
      commission_settlement_ids.length === 0
    ) {
      return sendResponse(res, 400, "Commission settlement IDs are required");
    }

    const settlementIds: number[] = commission_settlement_ids
      .map((id: any) => parseInt(id))
      .filter((id: number) => !isNaN(id));

    // Fetch settlements with all related data
    const settlements = await prisma.hSCommissionSettlements.findMany({
      where: {
        id: { in: settlementIds },
        is_deleted: false,
        is_active: true,
      },
      include: {
        b2b_partner: {
          select: {
            id: true,
            partner_name: true,
            partner_display_name: true,
            gst_number: true,
            pan_number: true,
            business_address: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
          },
        },
        calculation_details: true,
        tax_deductions: true,
        loan_details: true,
        documentaion: true,
        status_history: true,
      },
    });

    if (settlements.length === 0) {
      return sendResponse(res, 404, "No settlements found");
    }

    // Validate ownership (partner user)
    if (user?.partnerId) {
      const unauthorized = settlements.filter(
        (s) => s.b2b_partner_id !== user.partnerId,
      );
      if (unauthorized.length > 0) {
        return sendResponse(
          res,
          403,
          "You don't have access to some of these settlements",
        );
      }
    }

    // Validate all are verified
    const unverified = settlements.filter(
      (s) => s.status_history?.verification_status !== "Verified",
    );
    if (unverified.length > 0) {
      return sendResponse(
        res,
        400,
        "All settlements must be accepted (verified) before generating invoice",
        {
          unverifiedIds: unverified.map((s) => s.id),
        },
      );
    }

    // Race condition guard
    const alreadySubmitted = settlements.filter(
      (s) => s.status_history?.settlement_status === "Pending Approval",
    );
    if (alreadySubmitted.length > 0) {
      return sendResponse(
        res,
        409,
        "Invoice has already been submitted for some of these settlements. Please refresh.",
      );
    }

    // ── Build Invoice Data ──
    const partner = settlements[0].b2b_partner;
    const partnerName =
      partner?.partner_display_name ||
      partner?.partner_name ||
      settlements[0].partner_name ||
      "Partner";
    const invoiceDate = new Date();
    const invoiceDateStr = moment(invoiceDate).format("YYYY-MM-DD");

    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;
    let totalTds = 0;
    let totalDeductions = 0;

    const lineItems = settlements.map((s, idx) => {
      const calc = s.calculation_details;
      const tax = s.tax_deductions;
      const loan = s.loan_details;

      const grossAmount = calc?.gross_commission_amount
        ? Number(calc.gross_commission_amount)
        : 0;
      const totalGrossAmount = calc?.total_gross_amount
        ? Number(calc.total_gross_amount)
        : grossAmount;
      const gstAmount = tax?.gst_amount ? Number(tax.gst_amount) : 0;
      const tdsAmount = tax?.tds_amount ? Number(tax.tds_amount) : 0;
      const deductions = tax?.total_deductions
        ? Number(tax.total_deductions)
        : 0;
      const netPayable = tax?.net_payable_amount
        ? Number(tax.net_payable_amount)
        : totalGrossAmount - deductions;

      subtotal += totalGrossAmount;
      totalGst += gstAmount;
      totalTds += tdsAmount;
      totalDeductions += deductions;

      return {
        sno: idx + 1,
        studentName: s.student_name || "N/A",
        lenderName: loan?.lender_name || "N/A",
        loanAmount: loan?.loan_amount_disbursed
          ? Number(loan.loan_amount_disbursed)
          : 0,
        commissionRate: calc?.commission_rate_applied
          ? Number(calc.commission_rate_applied)
          : 0,
        grossAmount: totalGrossAmount,
        gstAmount,
        tdsAmount,
        netPayable,
        refNumber: s.settlement_reference_number || `SET-${s.id}`,
        university: loan?.university_name || "",
        course: loan?.course_name || "",
      };
    });

    const netPayableTotal = subtotal + totalGst - totalTds - totalDeductions;

    // ── Create Invoice Record first (to get invoice number) ──
    const invoice = await prisma.invoice.create({
      data: {
        file: "pending",
        url: "pending",
        status: "uploaded",
        date: invoiceDate,
        commission_settlement_ids: settlementIds.join(","),
        contact_id: settlements[0].lead_reference_id,
        b2b_partner_id: settlements[0].b2b_partner_id,
        application_id: settlements[0].application_id,
        lender_id: settlements[0].lender_id,
        product_id: settlements[0].product_id,
      },
    });

    const invoiceNumber = `INV-${moment(invoiceDate).format("YYYY")}-${String(invoice.id).padStart(5, "0")}`;

    // ── Generate PDF ──
    const htmlContent = buildSystemInvoiceHTML({
      invoiceNumber,
      invoiceDate: moment(invoiceDate).format("DD MMM YYYY"),
      partnerName,
      partnerGst: partner?.gst_number || "",
      partnerPan: partner?.pan_number || "",
      partnerAddress: [
        partner?.business_address,
        partner?.city,
        partner?.state,
        partner?.pincode,
        partner?.country,
      ]
        .filter(Boolean)
        .join(", "),
      lineItems,
      subtotal,
      totalGst,
      totalTds,
      totalDeductions,
      netPayableTotal,
      settlementsCount: settlements.length,
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "10mm", right: "10mm" },
    });
    await browser.close();

    // ── Save PDF to disk ──
    const uploadDir = path.join(process.cwd(), "uploads", "invoices");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `invoice-system-${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "")}-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const fileUrl = `${BACKEND_URL}/uploads/invoices/${fileName}`;

    // ── Update Invoice Record ──
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        file: fileName,
        url: fileUrl,
      },
    });

    // ── Update Documentation for each settlement ──
    const totalInvoiceAmount = netPayableTotal;

    await Promise.all(
      settlements.map(async (settlement) => {
        const perSettlementAmount = settlement.tax_deductions
          ?.net_payable_amount
          ? Number(settlement.tax_deductions.net_payable_amount)
          : settlement.calculation_details?.total_gross_amount
            ? Number(settlement.calculation_details.total_gross_amount)
            : 0;

        if (settlement.documentaion) {
          return prisma.hSCommissionSettlementsDocumentation.update({
            where: { settlement_id: settlement.id },
            data: {
              invoice_number: invoiceNumber,
              invoice_date: invoiceDate,
              invoice_amount: perSettlementAmount,
              invoice_status: "Received",
              invoice_url: fileUrl,
              invoice_required: "Yes",
            },
          });
        } else {
          return prisma.hSCommissionSettlementsDocumentation.create({
            data: {
              settlement_id: settlement.id,
              invoice_number: invoiceNumber,
              invoice_date: invoiceDate,
              invoice_amount: perSettlementAmount,
              invoice_status: "Received",
              invoice_url: fileUrl,
              invoice_required: "Yes",
            },
          });
        }
      }),
    );

    // ── Update settlement_status to "Pending Approval" ──
    await Promise.all(
      settlementIds.map((id: number) =>
        prisma.hSCommissionSettlementsSettlementStatus.updateMany({
          where: { settlement_id: id },
          data: { settlement_status: "Pending Approval" },
        }),
      ),
    );

    // ── Notify Finance (non-blocking) ──
    notifyFinanceForInvoice(
      settlementIds,
      {
        invoiceNumber,
        invoiceDate,
        invoiceAmount: totalInvoiceAmount,
        invoiceUrl: fileUrl,
      },
      {
        partnerB2BId: settlements[0].b2b_partner_id || undefined,
        partnerName,
      },
      {
        userId: user?.id,
        name: user?.fullName || "Partner",
        type: "partner",
      },
    ).catch((err: any) =>
      logger.warn("[Commission] System invoice notification failed", {
        error: err.message,
      }),
    );

    logger.info("[Commission] System invoice generated", {
      invoiceNumber,
      settlementIds,
      generatedBy: user?.fullName || user?.email,
    });

    return sendResponse(
      res,
      200,
      "Invoice generated and uploaded successfully",
      {
        invoice: {
          id: invoice.id,
          invoice_number: invoiceNumber,
          file: fileName,
          url: fileUrl,
          date: invoiceDate,
          total_amount: totalInvoiceAmount,
          settlement_ids: settlementIds,
          settlements_count: settlementIds.length,
        },
      },
    );
  } catch (error: any) {
    console.error("Error generating system invoice:", error);
    return sendResponse(res, 500, "Failed to generate invoice");
  }
};

// ============================================================================
// HELPER: Build System Invoice HTML Template
// ============================================================================

// ============================================================================
// PHASE 4: L1 Approve (Finance/Ops reviewer approves)
// ============================================================================

export const l1ApproveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const { notes } = req.body;
    const settlement = (req as any).settlement;
    const user = (req as any).user;

    const statusBefore = settlement.status_history?.settlement_status || null;

    await prisma.$transaction(async (tx) => {
      // Race condition guard
      const current =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!current || current.settlement_status !== "Pending Approval") {
        throw new Error("ALREADY_PROCESSED");
      }

      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: { settlement_status: "L1 Approved" },
      });

      await tx.commissionDisputeLog.create({
        data: {
          settlement_id: settlementId,
          action: "L1_APPROVED",
          performed_by_user_id: user?.id || null,
          performed_by_name: user?.fullName || null,
          performed_by_email: user?.email || null,
          performed_by_type: "admin",
          reason: notes || null,
          settlement_status_before: statusBefore,
          settlement_status_after: "L1 Approved",
          verification_status_before:
            settlement.status_history?.verification_status,
          verification_status_after:
            settlement.status_history?.verification_status,
        },
      });
    });

    await prisma.hSCommissionSettlementsSettlementStatus.update({
      where: { settlement_id: settlementId },
      data: { settlement_status: "L1 Approved" },
    });

    // Notification (non-blocking)
    const partnerName =
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      "Partner";

    sendCommissionNotification("L1_APPROVED", {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      lenderName: settlement.loan_details?.lender_name,
      loanAmountDisbursed: settlement.loan_details?.loan_amount_disbursed
        ? Number(settlement.loan_details.loan_amount_disbursed)
        : null,
      grossCommissionAmount: settlement.calculation_details
        ?.gross_commission_amount
        ? Number(settlement.calculation_details.gross_commission_amount)
        : null,
      approverName: user?.fullName || user?.email || "Reviewer",
      approverNotes: notes || null,
      triggeredBy: {
        userId: user?.id,
        name: user?.fullName || user?.email,
        type: "admin",
      },
    }).catch((err: any) =>
      logger.warn("[Commission] L1 approve notification failed", {
        error: err.message,
      }),
    );

    logger.info("[Commission] L1 Approved", {
      settlementId,
      approvedBy: user?.fullName || user?.email,
    });

    return sendResponse(res, 200, "Settlement approved at L1", {
      settlementId,
      settlement_status: "L1 Approved",
    });
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "This settlement has already been processed. Please refresh.",
      );
    }
    logger.error("[Commission] L1 approve failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to approve at L1");
  }
};

// ============================================================================
// PHASE 4: L1 Reject (Finance/Ops reviewer rejects → back to partner)
// ============================================================================

export const l1RejectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const { reason } = req.body;
    const settlement = (req as any).settlement;
    const user = (req as any).user;

    if (!reason || !reason.trim()) {
      return sendResponse(res, 400, "Rejection reason is required");
    }

    const statusBefore = settlement.status_history?.settlement_status || null;

    await prisma.$transaction(async (tx) => {
      const current =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!current || current.settlement_status !== "Pending Approval") {
        throw new Error("ALREADY_PROCESSED");
      }

      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: { settlement_status: "L1 Rejected" },
      });

      // Clear invoice so partner can re-upload
      await tx.hSCommissionSettlementsDocumentation.updateMany({
        where: { settlement_id: settlementId },
        data: {
          invoice_number: null,
          invoice_date: null,
          invoice_amount: null,
          invoice_status: "Rejected",
          invoice_url: null,
        },
      });

      await tx.commissionDisputeLog.create({
        data: {
          settlement_id: settlementId,
          action: "L1_REJECTED",
          performed_by_user_id: user?.id || null,
          performed_by_name: user?.fullName || null,
          performed_by_email: user?.email || null,
          performed_by_type: "admin",
          reason: reason.trim(),
          settlement_status_before: statusBefore,
          settlement_status_after: "L1 Rejected",
          verification_status_before:
            settlement.status_history?.verification_status,
          verification_status_after:
            settlement.status_history?.verification_status,
        },
      });
    });

    // Notify partner
    const partnerName =
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      "Partner";

    sendCommissionNotification("L1_REJECTED", {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      rejectionReason: reason.trim(),
      rejectedBy: user?.fullName || user?.email || "Reviewer",
      triggeredBy: {
        userId: user?.id,
        name: user?.fullName || user?.email,
        type: "admin",
      },
    }).catch((err: any) =>
      logger.warn("[Commission] L1 reject notification failed", {
        error: err.message,
      }),
    );

    logger.info("[Commission] L1 Rejected", {
      settlementId,
      rejectedBy: user?.fullName,
      reason: reason.trim(),
    });

    return sendResponse(
      res,
      200,
      "Settlement rejected at L1. Partner will be notified to re-upload.",
      {
        settlementId,
        settlement_status: "L1 Rejected",
      },
    );
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "This settlement has already been processed. Please refresh.",
      );
    }
    logger.error("[Commission] L1 reject failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to reject at L1");
  }
};

// ============================================================================
// PHASE 4: L2 Approve (Business Head final approval)
// ============================================================================

export const l2ApproveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const { notes } = req.body;
    const settlement = (req as any).settlement;
    const user = (req as any).user;

    const statusBefore = settlement.status_history?.settlement_status || null;

    await prisma.$transaction(async (tx) => {
      const current =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!current || current.settlement_status !== "L1 Approved") {
        throw new Error("ALREADY_PROCESSED");
      }

      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: { settlement_status: "Approved" },
      });

      await tx.hSCommissionSettlementsDocumentation.update({
        where: { settlement_id: settlementId },
        data: { invoice_status: "Approved" },
      });

      await tx.commissionDisputeLog.create({
        data: {
          settlement_id: settlementId,
          action: "L2_APPROVED",
          performed_by_user_id: user?.id || null,
          performed_by_name: user?.fullName || null,
          performed_by_email: user?.email || null,
          performed_by_type: "admin",
          reason: notes || null,
          settlement_status_before: statusBefore,
          settlement_status_after: "Approved",
          verification_status_before:
            settlement.status_history?.verification_status,
          verification_status_after:
            settlement.status_history?.verification_status,
        },
      });
    });

    // Notify partner — approved & ready for payout
    const partnerName =
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      "Partner";

    sendCommissionNotification("L2_APPROVED", {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      grossCommissionAmount: settlement.calculation_details
        ?.gross_commission_amount
        ? Number(settlement.calculation_details.gross_commission_amount)
        : null,
      approverName: user?.fullName || user?.email || "Approver",
      approverNotes: notes || null,
      triggeredBy: {
        userId: user?.id,
        name: user?.fullName || user?.email,
        type: "admin",
      },
    }).catch((err: any) =>
      logger.warn("[Commission] L2 approve notification failed", {
        error: err.message,
      }),
    );

    logger.info("[Commission] L2 Approved (Final)", {
      settlementId,
      approvedBy: user?.fullName || user?.email,
    });

    return sendResponse(
      res,
      200,
      "Settlement approved (final). Ready for payout.",
      {
        settlementId,
        settlement_status: "Approved",
      },
    );
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "This settlement has already been processed. Please refresh.",
      );
    }
    logger.error("[Commission] L2 approve failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to approve at L2");
  }
};

// ============================================================================
// PHASE 4: L2 Reject (Business Head rejects → to L1 or Partner)
// ============================================================================

export const l2RejectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const { reason, reject_to } = req.body;
    const settlement = (req as any).settlement;
    const user = (req as any).user;

    if (!reason || !reason.trim()) {
      return sendResponse(res, 400, "Rejection reason is required");
    }
    if (!reject_to || !["l1", "partner"].includes(reject_to)) {
      return sendResponse(res, 400, "reject_to must be 'l1' or 'partner'");
    }

    const statusBefore = settlement.status_history?.settlement_status || null;
    const newStatus = reject_to === "l1" ? "Pending Approval" : "L2 Rejected";

    await prisma.$transaction(async (tx) => {
      const current =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!current || current.settlement_status !== "L1 Approved") {
        throw new Error("ALREADY_PROCESSED");
      }

      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: { settlement_status: newStatus },
      });

      // If rejecting back to partner, clear invoice so they can re-upload
      if (reject_to === "partner") {
        await tx.hSCommissionSettlementsDocumentation.updateMany({
          where: { settlement_id: settlementId },
          data: {
            invoice_number: null,
            invoice_date: null,
            invoice_amount: null,
            invoice_status: "Rejected",
            invoice_url: null,
          },
        });
      }

      await tx.commissionDisputeLog.create({
        data: {
          settlement_id: settlementId,
          action:
            reject_to === "l1" ? "L2_REJECTED_TO_L1" : "L2_REJECTED_TO_PARTNER",
          performed_by_user_id: user?.id || null,
          performed_by_name: user?.fullName || null,
          performed_by_email: user?.email || null,
          performed_by_type: "admin",
          reason: reason.trim(),
          settlement_status_before: statusBefore,
          settlement_status_after: newStatus,
          verification_status_before:
            settlement.status_history?.verification_status,
          verification_status_after:
            settlement.status_history?.verification_status,
        },
      });
    });

    // Notification
    const partnerName =
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      "Partner";

    const notificationType =
      reject_to === "l1" ? "L2_REJECTED_TO_L1" : "L2_REJECTED_TO_PARTNER";

    sendCommissionNotification(notificationType as any, {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      rejectionReason: reason.trim(),
      rejectedBy: user?.fullName || user?.email || "Approver",
      rejectTo: reject_to,
      triggeredBy: {
        userId: user?.id,
        name: user?.fullName || user?.email,
        type: "admin",
      },
    }).catch((err: any) =>
      logger.warn("[Commission] L2 reject notification failed", {
        error: err.message,
      }),
    );

    const msg =
      reject_to === "l1"
        ? "Sent back to L1 for re-review."
        : "Rejected. Partner will be notified to re-upload.";

    logger.info("[Commission] L2 Rejected", {
      settlementId,
      rejectTo: reject_to,
      rejectedBy: user?.fullName,
    });

    return sendResponse(res, 200, msg, {
      settlementId,
      settlement_status: newStatus,
      reject_to,
    });
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "This settlement has already been processed. Please refresh.",
      );
    }
    logger.error("[Commission] L2 reject failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to reject at L2");
  }
};

// ============================================================================
// PHASE 4: Get Approval Timeline / Audit Trail
// ============================================================================

export const getApprovalTimelineController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    if (isNaN(settlementId)) {
      return sendResponse(res, 400, "Invalid settlement ID");
    }

    const logs = await prisma.commissionDisputeLog.findMany({
      where: { settlement_id: settlementId },
      orderBy: { created_at: "asc" },
      select: {
        id: true,
        action: true,
        performed_by_name: true,
        performed_by_email: true,
        performed_by_type: true,
        reason: true,
        resolution: true,
        settlement_status_before: true,
        settlement_status_after: true,
        created_at: true,
      },
    });

    // Fetch settlement creation date to show as first timeline entry
    const settlement = await prisma.hSCommissionSettlements.findUnique({
      where: { id: settlementId },
      select: { created_at: true },
    });

    const timeline = [
      // First entry: settlement creation
      ...(settlement?.created_at
        ? [
            {
              id: 0,
              action: "SETTLEMENT_CREATED",
              performed_by_name: "System",
              performed_by_email: null,
              performed_by_type: "system",
              reason: null,
              resolution: null,
              settlement_status_before: null,
              settlement_status_after: "Calculated",
              created_at: settlement.created_at,
            },
          ]
        : []),
      ...logs,
    ];

    return sendResponse(res, 200, "Approval timeline fetched", { timeline });
  } catch (error: any) {
    logger.error("[Commission] Get timeline failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to fetch approval timeline");
  }
};

// ============================================================================
// PHASE 4: Serve Invoice File (production-safe — no CORS / URL issues)
// ============================================================================

export const getInvoiceFileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    if (isNaN(settlementId)) {
      return sendResponse(res, 400, "Invalid settlement ID");
    }

    const doc = await prisma.hSCommissionSettlementsDocumentation.findUnique({
      where: { settlement_id: settlementId },
      select: { invoice_url: true, invoice_number: true },
    });

    if (!doc?.invoice_url) {
      return sendResponse(res, 404, "No invoice found for this settlement");
    }

    // Extract filename from URL (handles both full URLs and relative paths)
    let fileName: string;
    try {
      const parsed = new URL(doc.invoice_url);
      fileName = path.basename(parsed.pathname);
    } catch {
      fileName = path.basename(doc.invoice_url);
    }

    const filePath = path.join(process.cwd(), "uploads", "invoices", fileName);

    if (!fs.existsSync(filePath)) {
      logger.warn("[Commission] Invoice file not found on disk", {
        filePath,
        settlementId,
      });
      return sendResponse(res, 404, "Invoice file not found on server");
    }

    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    const contentType = contentTypes[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${doc.invoice_number || fileName}${ext === ".pdf" ? "" : ext}"`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    logger.error("[Commission] Get invoice file failed", {
      error: error.message,
      settlementId: req.params.id,
    });
    return sendResponse(res, 500, "Failed to serve invoice file");
  }
};

function buildSystemInvoiceHTML(data: {
  invoiceNumber: string;
  invoiceDate: string;
  partnerName: string;
  partnerGst: string;
  partnerPan: string;
  partnerAddress: string;
  lineItems: Array<{
    sno: number;
    studentName: string;
    lenderName: string;
    loanAmount: number;
    commissionRate: number;
    grossAmount: number;
    gstAmount: number;
    tdsAmount: number;
    netPayable: number;
    refNumber: string;
    university: string;
    course: string;
  }>;
  subtotal: number;
  totalGst: number;
  totalTds: number;
  totalDeductions: number;
  netPayableTotal: number;
  settlementsCount: number;
}): string {
  const fmt = (num: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  const rows = data.lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:center;">${item.sno}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;">
        <div style="font-weight:600;color:#2C3E50;">${item.studentName}</div>
        <div style="font-size:11px;color:#7F8C8D;margin-top:2px;">${item.refNumber}</div>
        ${item.university ? `<div style="font-size:11px;color:#95A5A6;">${item.university}${item.course ? ` — ${item.course}` : ""}</div>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;">${item.lenderName}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:right;">₹${fmt(item.loanAmount)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:center;">${item.commissionRate}%</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E8EB;font-size:13px;color:#2C3E50;text-align:right;font-weight:600;">₹${fmt(item.grossAmount)}</td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commission Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #2C3E50; background: #fff; }
    @page { margin: 0; }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:30px;">

    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
      <tr>
        <td>
          <h1 style="font-size:28px;font-weight:700;color:#1B4F72;margin:0;">COMMISSION INVOICE</h1>
          <p style="font-size:13px;color:#7F8C8D;margin-top:4px;">Edumate Global Financial Services</p>
        </td>
        <td style="text-align:right;">
          <div style="background:#1B4F72;color:#fff;padding:12px 20px;border-radius:8px;display:inline-block;">
            <div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">Invoice No.</div>
            <div style="font-size:18px;font-weight:700;margin-top:2px;">${data.invoiceNumber}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Invoice Meta & Partner Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="vertical-align:top;">
          <div style="background:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;padding:16px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7F8C8D;margin-bottom:8px;font-weight:600;">Bill To</div>
            <div style="font-size:16px;font-weight:700;color:#1B4F72;margin-bottom:6px;">${data.partnerName}</div>
            ${data.partnerGst ? `<div style="font-size:12px;color:#555;margin-bottom:3px;"><strong>GSTIN:</strong> ${data.partnerGst}</div>` : ""}
            ${data.partnerPan ? `<div style="font-size:12px;color:#555;margin-bottom:3px;"><strong>PAN:</strong> ${data.partnerPan}</div>` : ""}
            ${data.partnerAddress ? `<div style="font-size:12px;color:#7F8C8D;margin-top:6px;">${data.partnerAddress}</div>` : ""}
          </div>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:16px;">
          <div style="background:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;padding:16px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7F8C8D;margin-bottom:8px;font-weight:600;">Invoice Details</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-size:12px;color:#7F8C8D;padding:3px 0;">Date</td><td style="font-size:12px;font-weight:600;color:#2C3E50;text-align:right;">${data.invoiceDate}</td></tr>
              <tr><td style="font-size:12px;color:#7F8C8D;padding:3px 0;">Settlements</td><td style="font-size:12px;font-weight:600;color:#2C3E50;text-align:right;">${data.settlementsCount}</td></tr>

            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E8EB;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <thead>
        <tr style="background:#1B4F72;">
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:center;width:40px;">#</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Student / Reference</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Lender</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Loan Disbursed</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Rate</th>
          <th style="padding:12px;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Gross Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <!-- Summary Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
      <tr>
        <td width="55%"></td>
        <td width="45%">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E8EB;border-radius:8px;overflow:hidden;">
            <tr style="background:#F8F9FA;">
              <td style="padding:10px 16px;font-size:13px;color:#555;">Subtotal (Gross Commission)</td>
              <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#2C3E50;text-align:right;">₹${fmt(data.subtotal)}</td>
            </tr>
            ${
              data.totalGst > 0
                ? `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#555;">GST</td>
              <td style="padding:10px 16px;font-size:13px;color:#27AE60;text-align:right;">+ ₹${fmt(data.totalGst)}</td>
            </tr>
            `
                : ""
            }
            ${
              data.totalTds > 0
                ? `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#555;">TDS Deducted</td>
              <td style="padding:10px 16px;font-size:13px;color:#E74C3C;text-align:right;">− ₹${fmt(data.totalTds)}</td>
            </tr>
            `
                : ""
            }
            ${
              data.totalDeductions > data.totalTds
                ? `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#555;">Other Deductions</td>
              <td style="padding:10px 16px;font-size:13px;color:#E74C3C;text-align:right;">− ₹${fmt(data.totalDeductions - data.totalTds)}</td>
            </tr>
            `
                : ""
            }
            <tr style="background:#1B4F72;">
              <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#fff;">Net Payable</td>
              <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#fff;text-align:right;">₹${fmt(data.netPayableTotal)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <div style="border-top:2px solid #E5E8EB;padding-top:16px;text-align:center;">
      <p style="font-size:11px;color:#95A5A6;">This is a system-generated invoice from Edumate Global Commission System — ${moment().format("YYYY")}</p>
      <p style="font-size:11px;color:#BDC3C7;margin-top:4px;">Invoice generated on ${data.invoiceDate}</p>
    </div>
  </div>
</body>
</html>`;
}
