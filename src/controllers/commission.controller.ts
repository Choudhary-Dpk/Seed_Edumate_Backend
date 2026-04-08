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
  getCommissionSummary,
} from "../models/helpers/commission.helper";
import { getContactLeadById } from "../models/helpers/contact.helper";
import { getPartnerIdByUserId } from "../models/helpers/partners.helper";
import {
  sendCommissionNotification,
  notifyFinanceForInvoice,
} from "../services/EmailNotifications/commission.notification.service";
import { BACKEND_URL } from "../setup/secrets";
import {
  buildSystemInvoiceHTML,
  buildSystemInvoiceHTMLDetailed,
} from "../utils/helper";
import { uploadToS3 } from "../utils/s3";

// ============================================================================
// PHASE 4 HELPERS — used by the unified approval controllers below
// ============================================================================

// Parse & validate settlement_ids from request body.
// Accepts a single number, an array, or a JSON string of an array.
const parseSettlementIds = (
  raw: any,
): { ids: number[] } | { error: string } => {
  if (raw == null) return { error: "settlement_ids is required" };
  const arr = Array.isArray(raw) ? raw : [raw];
  if (arr.length === 0) return { error: "settlement_ids must not be empty" };
  const ids = arr.map((v: any) => parseInt(v, 10));
  if (ids.some(isNaN))
    return { error: "All settlement_ids must be valid numbers" };
  return { ids };
};

// Fetch settlements with every relation needed by the approval controllers.
const fetchSettlementsForApproval = (ids: number[]) =>
  prisma.hSCommissionSettlements.findMany({
    where: { id: { in: ids }, is_deleted: false, is_active: true },
    include: {
      status_history: true,
      documentation: true,
      calculation_details: true,
      tax_deductions: true,
      loan_details: true,
      b2b_partner: {
        select: { id: true, partner_name: true, partner_display_name: true },
      },
    },
  });

// Sum net_payable_amount across all settlements in a group.
const sumNetPayable = (settlements: any[]): number =>
  settlements.reduce((acc, s) => {
    const v = parseFloat(s.tax_deductions?.net_payable_amount ?? "0");
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

// ============================================================================
// COMMISSION SUMMARY — period-based dashboard metrics
// ============================================================================

export const getCommissionSummaryController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const period = (req.query.period as string) || "all_time";
    const validPeriods = ["this_month", "last_month", "3_months", "6_months", "all_time"];

    if (!validPeriods.includes(period)) {
      return sendResponse(res, 400, `Invalid period. Must be one of: ${validPeriods.join(", ")}`);
    }

    const isAdmin = (req as any).portalType === "ADMIN";
    let partnerId: number | undefined;

    if (!isAdmin) {
      // For partner portal users, enforce their own partner ID
      const id = parseInt(req.payload?.id || req.body?.id);
      if (id) {
        const partnerRecord = await getPartnerIdByUserId(id);
        partnerId = partnerRecord?.b2b_id || undefined;
        if (!partnerId) {
          return sendResponse(res, 400, "Partner filter requires authentication with b2b_partner_id");
        }
      }
    } else {
      // Admin can optionally filter by partner_id
      partnerId = req.query.partner_id ? Number(req.query.partner_id) : undefined;
      if (req.query.partner_id && isNaN(partnerId!)) {
        return sendResponse(res, 400, "Invalid partner_id");
      }
    }

    const summary = await getCommissionSummary(period, partnerId);

    return sendResponse(res, 200, "Commission summary fetched successfully", summary);
  } catch (error: any) {
    logger.error("[Commission] Summary fetch failed", { error: error.message });
    return sendResponse(res, 500, "Failed to fetch commission summary");
  }
};

// ============================================================================
// CREATE
// ============================================================================

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

// ============================================================================
// UPDATE
// ============================================================================

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

// ============================================================================
// DELETE
// ============================================================================

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

// ============================================================================
// GET DETAILS
// ============================================================================

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

// ============================================================================
// GET LIST (PAGINATION)
// ============================================================================

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

    let startDate = filtersFromQuery.startDate || null;
    let endDate = filtersFromQuery.endDate || null;

    if (isAdmin && !startDate && !endDate) {
      const now = new Date();
      startDate = `${now.getFullYear()}-01-01`;
      endDate = now.toISOString().split("T")[0];
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

// ============================================================================
// GET BY LEAD
// ============================================================================

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

// ============================================================================
// UPLOAD INVOICE (Partner manual upload)
// ============================================================================

export const uploadInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status = "pending", date } = req.body;
    const file = req.file;

    if (!file) {
      return sendResponse(res, 400, "Invoice file is required");
    }

    const { settlements, settlementIds } = (req as any).validatedSettlements;

    // Race condition guard
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

    const firstSettlement = settlements[0];

    const totalAmount = settlements.reduce((sum: number, settlement: any) => {
      const grossAmount =
        settlement.calculation_details?.total_gross_amount || 0;
      return sum + parseFloat(grossAmount.toString());
    }, 0);

    // ═══════════════════════════════════════════════════════════════════════
    // CHANGED: Upload to S3 instead of local disk
    // ═══════════════════════════════════════════════════════════════════════
    const {
      key,
      url: fileUrl,
      fileName,
    } = await uploadToS3(file.buffer, file.originalname, "invoices");

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

    const invoiceNumber = req.body.invoice_number || `${invoice.id}`;

    const documentationUpdates = await Promise.all(
      settlements.map(async (settlement: any) => {
        const settlementAmount = req.body.invoice_amount;

        if (settlement.documentation) {
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

    await Promise.all(
      settlementIds.map((id: number) =>
        prisma.hSCommissionSettlementsSettlementStatus.updateMany({
          where: { settlement_id: id },
          data: { settlement_status: "Pending Approval" },
        }),
      ),
    );

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
// PHASE 3: Accept Settlement
// ============================================================================

export const acceptSettlementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlementId = parseInt(req.params.id);
    const settlement = (req as any).settlement;

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
        { settlementId: req.params.id },
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
// PHASE 3: Raise Objection
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

    if (!reason || !reason.trim()) {
      return sendResponse(res, 400, "Objection reason is required");
    }

    const settlementStatusBefore =
      settlement.status_history?.settlement_status || null;
    const verificationStatusBefore =
      settlement.status_history?.verification_status || null;

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
          settlement_status: "Disputed",
          verification_status: "Additional Info Required",
        },
      });

      await tx.hSCommissionSettlementsHoldAndDisputes.upsert({
        where: { settlement_id: settlementId },
        update: {
          dispute_raised: "Yes",
          dispute_date: new Date(),
          dispute_raised_by: user?.fullName || user?.email || "Partner",
          dispute_description: reason.trim(),
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

    const partnerName =
      settlement.b2b_partner?.partner_display_name ||
      settlement.b2b_partner?.partner_name ||
      settlement.partner_name ||
      user?.partnerName ||
      "Partner";

    // Re-fetch with full relations so loan/commission amounts are available for email
    const fullSettlementForObjection =
      await prisma.hSCommissionSettlements.findUnique({
        where: { id: settlementId },
        include: {
          loan_details: true,
          calculation_details: true,
        },
      });

    sendCommissionNotification("PARTNER_OBJECTION_RAISED", {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      lenderName: fullSettlementForObjection?.loan_details?.lender_name,
      loanAmountDisbursed: fullSettlementForObjection?.loan_details
        ?.loan_amount_disbursed
        ? Number(fullSettlementForObjection.loan_details.loan_amount_disbursed)
        : null,
      grossCommissionAmount: fullSettlementForObjection?.calculation_details
        ?.gross_commission_amount
        ? Number(
            fullSettlementForObjection.calculation_details
              .gross_commission_amount,
          )
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
    if (error.message === "ALREADY_PROCESSED") {
      logger.warn(
        "[Commission] Duplicate objection request blocked (race condition)",
        { settlementId: req.params.id },
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
// PHASE 3: Resolve Dispute
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

    if (!resolution || !resolution.trim()) {
      return sendResponse(res, 400, "Resolution text is required");
    }

    const settlementStatusBefore =
      settlement.status_history?.settlement_status || null;
    const verificationStatusBefore =
      settlement.status_history?.verification_status || null;

    await prisma.$transaction(async (tx) => {
      const currentStatus =
        await tx.hSCommissionSettlementsSettlementStatus.findUnique({
          where: { settlement_id: settlementId },
        });
      if (!currentStatus || currentStatus.settlement_status !== "Disputed") {
        throw new Error("ALREADY_PROCESSED");
      }

      await tx.hSCommissionSettlementsSettlementStatus.update({
        where: { settlement_id: settlementId },
        data: {
          settlement_status: "Calculated",
          verification_status: "Pending",
        },
      });

      await tx.hSCommissionSettlementsHoldAndDisputes.update({
        where: { settlement_id: settlementId },
        data: {
          dispute_resolution: resolution.trim(),
          dispute_resolution_date: new Date(),
          dispute_resolved_by: user?.fullName || user?.email || "Admin",
        },
      });

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

    // Re-fetch with full relations so loan/commission amounts are available for email
    const fullSettlement = await prisma.hSCommissionSettlements.findUnique({
      where: { id: settlementId },
      include: {
        loan_details: true,
        calculation_details: true,
        b2b_partner: {
          select: { id: true, partner_name: true, partner_display_name: true },
        },
      },
    });

    const partnerName =
      fullSettlement?.b2b_partner?.partner_display_name ||
      fullSettlement?.b2b_partner?.partner_name ||
      settlement.partner_name ||
      "Partner";

    sendCommissionNotification("ADMIN_DISPUTE_RESOLVED", {
      settlementId,
      settlementRefNumber: settlement.settlement_reference_number,
      partnerB2BId: settlement.b2b_partner_id || undefined,
      partnerName,
      studentName: settlement.student_name,
      loanAmountDisbursed: fullSettlement?.loan_details?.loan_amount_disbursed
        ? Number(fullSettlement.loan_details.loan_amount_disbursed)
        : undefined,
      grossCommissionAmount: fullSettlement?.calculation_details
        ?.gross_commission_amount
        ? Number(fullSettlement.calculation_details.gross_commission_amount)
        : undefined,
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
        { settlementId: req.params.id },
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
// PHASE 3: Generate System Invoice
// ============================================================================

export const generateInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { commission_settlement_ids } = req.body;
    const user = (req as any).user;

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
        documentation: true,
        status_history: true,
      },
    });

    if (settlements.length === 0) {
      return sendResponse(res, 404, "No settlements found");
    }

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

    const unverified = settlements.filter(
      (s) => s.status_history?.verification_status !== "Verified",
    );
    if (unverified.length > 0) {
      return sendResponse(
        res,
        400,
        "All settlements must be accepted (verified) before generating invoice",
        { unverifiedIds: unverified.map((s) => s.id) },
      );
    }

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

    const partner = settlements[0].b2b_partner;
    const partnerId = settlements[0].b2b_partner_id;
    const partnerName =
      partner?.partner_display_name ||
      partner?.partner_name ||
      settlements[0].partner_name ||
      "Partner";
    const invoiceDate = new Date();

    // Fetch partner contact info for email
    let partnerContactInfo: { primary_contact_email: string | null } | null =
      null;
    if (partnerId) {
      partnerContactInfo = await prisma.hSB2BPartnersContactInfo.findFirst({
        where: { partner_id: partnerId },
        select: { primary_contact_email: true },
      });
    }

    // Fetch bank details from commission structure
    let partnerBankDetails: {
      beneficiary_name: string | null;
      bank_name: string | null;
      bank_account_number: string | null;
      bank_branch: string | null;
      ifsc_code: string | null;
    } | null = null;
    if (partnerId) {
      partnerBankDetails =
        await prisma.hSB2BPartnersCommissionStructure.findFirst({
          where: { partner_id: partnerId },
          select: {
            beneficiary_name: true,
            bank_name: true,
            bank_account_number: true,
            bank_branch: true,
            ifsc_code: true,
          },
        });
    }

    // Fetch student contact info
    const firstSettlement = settlements[0];
    let studentContactInfo: {
      email: string | null;
      phone_number: string | null;
    } | null = null;
    if (firstSettlement.lead_reference_id) {
      studentContactInfo =
        await prisma.hSEdumateContactsPersonalInformation.findFirst({
          where: { contact_id: firstSettlement.lead_reference_id },
          select: { email: true, phone_number: true },
        });
    }

    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;
    let totalTds = 0;
    let totalDeductions = 0;
    let grossCommission = 0;

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

      subtotal += totalGrossAmount;
      totalGst += gstAmount;
      totalTds += tdsAmount;
      totalDeductions += deductions;
      grossCommission += grossAmount;

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
        netPayable: totalGrossAmount + gstAmount - tdsAmount - deductions,
        refNumber: s.settlement_reference_number || `SET-${s.id}`,
        university: loan?.university_name || "",
        course: loan?.course_name || "",
      };
    });

    const netPayableTotal = subtotal + totalGst - totalTds - totalDeductions;

    // Calculate due date
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // Get first settlement's data for details
    const firstCalc = firstSettlement.calculation_details;
    const firstTax = firstSettlement.tax_deductions;
    const firstLoan = firstSettlement.loan_details;

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

    const invoiceNumber = `EDUMATE/${moment(invoiceDate).format("YYYY")}-${moment(invoiceDate).add(1, "year").format("YY")}/${String(invoice.id).padStart(4, "0")}`;

    // Build HTML with cleaned data
    const htmlContent = buildSystemInvoiceHTMLDetailed({
      invoiceNumber,
      invoiceDate: moment(invoiceDate).format("DD MMM YYYY"),
      dueDate: moment(dueDate).format("DD MMM YYYY"),
      // Seller Info
      partnerName: partner?.partner_name || partnerName,
      partnerDisplayName: partner?.partner_display_name || "",
      partnerGst: partner?.gst_number || "",
      partnerPan: partner?.pan_number || "",
      partnerAddress: partner?.business_address || "",
      partnerCity: partner?.city || "",
      partnerState: partner?.state || "",
      partnerStateCode: "",
      partnerPincode: partner?.pincode || "",
      partnerCountry: partner?.country || "",
      partnerCin: "",
      partnerEmail: partnerContactInfo?.primary_contact_email || "",
      // Bank Details
      bankAccountHolder: partnerBankDetails?.beneficiary_name || "",
      bankName: partnerBankDetails?.bank_name || "",
      bankAccountNumber: partnerBankDetails?.bank_account_number || "",
      bankBranch: partnerBankDetails?.bank_branch || "",
      bankIfsc: partnerBankDetails?.ifsc_code || "",
      // Line Items
      lineItems,
      // Commission Calculation
      commissionModel: firstCalc?.commission_model || "",
      grossCommission,
      // Tax Details
      subtotal,
      totalGst,
      gstApplicable: firstTax?.gst_applicable || "",
      igstRate: firstTax?.gst_rate_applied
        ? Number(firstTax.gst_rate_applied)
        : 0,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      totalTds,
      tdsApplicable: firstTax?.tds_applicable || "",
      tdsRate: firstTax?.tds_rate_applied
        ? Number(firstTax.tds_rate_applied)
        : 0,
      totalDeductions,
      netPayableTotal,
      // Loan Details
      lenderName: firstLoan?.lender_name || "",
      loanProduct: firstLoan?.loan_product_name || "",
      loanAmountDisbursed: firstLoan?.loan_amount_disbursed
        ? Number(firstLoan.loan_amount_disbursed)
        : 0,
      disbursementDate: firstLoan?.loan_disbursement_date
        ? moment(firstLoan.loan_disbursement_date).format("DD MMM YYYY")
        : "",
      universityName: firstLoan?.university_name || "",
      courseName: firstLoan?.course_name || "",
      destinationCountry: firstLoan?.student_destination_country || "",
      // Student Details
      studentName: firstSettlement.student_name || "",
      studentEmail: studentContactInfo?.email || "",
      studentPhone: studentContactInfo?.phone_number || "",
      // Payment Details - empty since we removed payment_processing
      paymentMethod: "",
      paymentReference: "",
      bankTransactionId: "",
      // Meta
      settlementsCount: settlements.length,
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // Wait for Google Fonts to load and render
    await page.evaluateHandle("document.fonts.ready");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });
    await browser.close();

    // ═══════════════════════════════════════════════════════════════════════
    // CHANGED: Upload to S3 instead of local disk
    // ═══════════════════════════════════════════════════════════════════════
    const fileName = `invoice-system-${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "")}-${Date.now()}.pdf`;
    const { key, url: fileUrl } = await uploadToS3(
      Buffer.from(pdfBuffer),
      fileName,
      "invoices",
    );

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { file: fileName, url: fileUrl },
    });

    const totalInvoiceAmount = netPayableTotal;

    await Promise.all(
      settlements.map(async (settlement) => {
        const perSettlementAmount = settlement.tax_deductions
          ?.net_payable_amount
          ? Number(settlement.tax_deductions.net_payable_amount)
          : settlement.calculation_details?.total_gross_amount
            ? Number(settlement.calculation_details.total_gross_amount)
            : 0;

        if (settlement.documentation) {
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

    await Promise.all(
      settlementIds.map((id: number) =>
        prisma.hSCommissionSettlementsSettlementStatus.updateMany({
          where: { settlement_id: id },
          data: { settlement_status: "Pending Approval" },
        }),
      ),
    );

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
// PHASE 4: L1 APPROVE
// Accepts: { settlement_ids: number[], notes?: string }
// Works for single tranche [id] or grouped tranches [id1, id2, ...]
// ============================================================================

export const l1ApproveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = parseSettlementIds(req.body.settlement_ids);
    if ("error" in parsed) return sendResponse(res, 400, parsed.error);
    const { ids } = parsed;

    const { notes } = req.body;
    const user = (req as any).user;

    const settlements = await fetchSettlementsForApproval(ids);
    if (settlements.length !== ids.length) {
      const missing = ids.filter((id) => !settlements.find((s) => s.id === id));
      return sendResponse(res, 404, "Some settlements not found", { missing });
    }

    const invalid = settlements.filter(
      (s) =>
        s.status_history?.settlement_status?.toLowerCase() !==
        "pending approval",
    );
    if (invalid.length > 0) {
      return sendResponse(
        res,
        400,
        "All settlements must be in Pending Approval status",
        { invalidIds: invalid.map((s) => s.id) },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Race-condition guard: re-check inside transaction
      const current = await tx.hSCommissionSettlementsSettlementStatus.findMany(
        {
          where: { settlement_id: { in: ids } },
          select: { settlement_id: true, settlement_status: true },
        },
      );
      const stale = current.filter(
        (s) => s.settlement_status !== "Pending Approval",
      );
      if (stale.length > 0) throw new Error("ALREADY_PROCESSED");

      await tx.hSCommissionSettlementsSettlementStatus.updateMany({
        where: { settlement_id: { in: ids } },
        data: { settlement_status: "L1 Approved" },
      });

      await tx.commissionDisputeLog.createMany({
        data: settlements.map((s) => ({
          settlement_id: s.id,
          action: "L1_APPROVED",
          performed_by_user_id: user?.id ?? null,
          performed_by_name: user?.fullName ?? null,
          performed_by_email: user?.email ?? null,
          performed_by_type: "admin",
          reason: notes ?? null,
          settlement_status_before: s.status_history?.settlement_status ?? null,
          settlement_status_after: "L1 Approved",
          verification_status_before:
            s.status_history?.verification_status ?? null,
          verification_status_after:
            s.status_history?.verification_status ?? null,
        })),
      });
    });

    // Notifications — one per settlement (non-blocking)
    for (const s of settlements) {
      const partnerName =
        s.b2b_partner?.partner_display_name ??
        s.b2b_partner?.partner_name ??
        s.partner_name ??
        "Partner";
      sendCommissionNotification("L1_APPROVED", {
        settlementId: s.id,
        settlementRefNumber: s.settlement_reference_number,
        partnerB2BId: s.b2b_partner_id ?? undefined,
        partnerName,
        studentName: s.student_name,
        lenderName: s.loan_details?.lender_name,
        loanAmountDisbursed: s.loan_details?.loan_amount_disbursed
          ? Number(s.loan_details.loan_amount_disbursed)
          : null,
        grossCommissionAmount: s.calculation_details?.gross_commission_amount
          ? Number(s.calculation_details.gross_commission_amount)
          : null,
        approverName: user?.fullName ?? user?.email ?? "Reviewer",
        approverNotes: notes ?? null,
        triggeredBy: {
          userId: user?.id,
          name: user?.fullName ?? user?.email,
          type: "admin",
        },
      }).catch((err: any) =>
        logger.warn("[Commission] L1 approve notification failed", {
          error: err.message,
        }),
      );
    }

    const total = sumNetPayable(settlements);
    const label = ids.length > 1 ? `${ids.length} tranches` : "Settlement";

    logger.info("[Commission] L1 Approved", {
      ids,
      approvedBy: user?.fullName ?? user?.email,
    });

    return sendResponse(res, 200, `${label} approved at L1`, {
      settlement_ids: ids,
      settlement_status: "L1 Approved",
      count: ids.length,
      total_net_payable: total,
    });
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "One or more settlements already processed. Please refresh.",
      );
    }
    logger.error("[Commission] L1 approve failed", { error: error.message });
    return sendResponse(res, 500, "Failed to approve at L1");
  }
};

// ============================================================================
// PHASE 4: L1 REJECT
// Accepts: { settlement_ids: number[], reason: string }
// Clears invoice on all tranches so partner can re-upload.
// ============================================================================

export const l1RejectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = parseSettlementIds(req.body.settlement_ids);
    if ("error" in parsed) return sendResponse(res, 400, parsed.error);
    const { ids } = parsed;

    const { reason } = req.body;
    const user = (req as any).user;

    if (!reason?.trim()) {
      return sendResponse(res, 400, "Rejection reason is required");
    }

    const settlements = await fetchSettlementsForApproval(ids);
    if (settlements.length !== ids.length) {
      const missing = ids.filter((id) => !settlements.find((s) => s.id === id));
      return sendResponse(res, 404, "Some settlements not found", { missing });
    }

    const invalid = settlements.filter(
      (s) =>
        s.status_history?.settlement_status?.toLowerCase() !==
        "pending approval",
    );
    if (invalid.length > 0) {
      return sendResponse(
        res,
        400,
        "All settlements must be in Pending Approval status",
        { invalidIds: invalid.map((s) => s.id) },
      );
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.hSCommissionSettlementsSettlementStatus.findMany(
        {
          where: { settlement_id: { in: ids } },
          select: { settlement_id: true, settlement_status: true },
        },
      );
      const stale = current.filter(
        (s) => s.settlement_status !== "Pending Approval",
      );
      if (stale.length > 0) throw new Error("ALREADY_PROCESSED");

      await tx.hSCommissionSettlementsSettlementStatus.updateMany({
        where: { settlement_id: { in: ids } },
        data: { settlement_status: "L1 Rejected" },
      });

      // Keep invoice data so partner can still see it in Invoices tab
      // Only flag status as Rejected — partner uses Replace button to re-upload
      await tx.hSCommissionSettlementsDocumentation.updateMany({
        where: { settlement_id: { in: ids } },
        data: {
          invoice_status: "Rejected",
          // invoice_url, invoice_number, invoice_date, invoice_amount kept intentionally
          // so the invoice remains visible in partner's Invoices tab for replacement
        },
      });

      await tx.commissionDisputeLog.createMany({
        data: settlements.map((s) => ({
          settlement_id: s.id,
          action: "L1_REJECTED",
          performed_by_user_id: user?.id ?? null,
          performed_by_name: user?.fullName ?? null,
          performed_by_email: user?.email ?? null,
          performed_by_type: "admin",
          reason: reason.trim(),
          settlement_status_before: s.status_history?.settlement_status ?? null,
          settlement_status_after: "L1 Rejected",
          verification_status_before:
            s.status_history?.verification_status ?? null,
          verification_status_after:
            s.status_history?.verification_status ?? null,
        })),
      });
    });

    // Notifications — one per settlement (non-blocking)
    for (const s of settlements) {
      const partnerName =
        s.b2b_partner?.partner_display_name ??
        s.b2b_partner?.partner_name ??
        s.partner_name ??
        "Partner";
      sendCommissionNotification("L1_REJECTED", {
        settlementId: s.id,
        settlementRefNumber: s.settlement_reference_number,
        partnerB2BId: s.b2b_partner_id ?? undefined,
        partnerName,
        studentName: s.student_name,
        loanAmountDisbursed: s.loan_details?.loan_amount_disbursed
          ? Number(s.loan_details.loan_amount_disbursed)
          : undefined,
        grossCommissionAmount: s.calculation_details?.gross_commission_amount
          ? Number(s.calculation_details.gross_commission_amount)
          : undefined,
        rejectionReason: reason.trim(),
        rejectedBy: user?.fullName ?? user?.email ?? "Reviewer",
        triggeredBy: {
          userId: user?.id,
          name: user?.fullName ?? user?.email,
          type: "admin",
        },
      }).catch((err: any) =>
        logger.warn("[Commission] L1 reject notification failed", {
          error: err.message,
        }),
      );
    }

    const total = sumNetPayable(settlements);
    const label = ids.length > 1 ? `${ids.length} tranches` : "Settlement";

    logger.info("[Commission] L1 Rejected", {
      ids,
      rejectedBy: user?.fullName,
      reason: reason.trim(),
    });

    return sendResponse(
      res,
      200,
      `${label} rejected at L1. Partner will be notified to re-upload.`,
      {
        settlement_ids: ids,
        settlement_status: "L1 Rejected",
        count: ids.length,
        total_net_payable: total,
      },
    );
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "One or more settlements already processed. Please refresh.",
      );
    }
    logger.error("[Commission] L1 reject failed", { error: error.message });
    return sendResponse(res, 500, "Failed to reject at L1");
  }
};

// ============================================================================
// PHASE 4: L2 APPROVE
// Accepts: { settlement_ids: number[], notes?: string }
// Also marks invoice_status → "Approved" on all tranches.
// ============================================================================

export const l2ApproveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = parseSettlementIds(req.body.settlement_ids);
    if ("error" in parsed) return sendResponse(res, 400, parsed.error);
    const { ids } = parsed;

    const { notes } = req.body;
    const user = (req as any).user;

    const settlements = await fetchSettlementsForApproval(ids);
    if (settlements.length !== ids.length) {
      const missing = ids.filter((id) => !settlements.find((s) => s.id === id));
      return sendResponse(res, 404, "Some settlements not found", { missing });
    }

    const invalid = settlements.filter(
      (s) =>
        s.status_history?.settlement_status?.toLowerCase() !== "l1 approved",
    );
    if (invalid.length > 0) {
      return sendResponse(
        res,
        400,
        "All settlements must be in L1 Approved status",
        { invalidIds: invalid.map((s) => s.id) },
      );
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.hSCommissionSettlementsSettlementStatus.findMany(
        {
          where: { settlement_id: { in: ids } },
          select: { settlement_id: true, settlement_status: true },
        },
      );
      const stale = current.filter(
        (s) => s.settlement_status !== "L1 Approved",
      );
      if (stale.length > 0) throw new Error("ALREADY_PROCESSED");

      await tx.hSCommissionSettlementsSettlementStatus.updateMany({
        where: { settlement_id: { in: ids } },
        data: { settlement_status: "Approved" },
      });

      // Mark invoice as Approved on all tranches
      await tx.hSCommissionSettlementsDocumentation.updateMany({
        where: { settlement_id: { in: ids } },
        data: { invoice_status: "Approved" },
      });

      await tx.commissionDisputeLog.createMany({
        data: settlements.map((s) => ({
          settlement_id: s.id,
          action: "L2_APPROVED",
          performed_by_user_id: user?.id ?? null,
          performed_by_name: user?.fullName ?? null,
          performed_by_email: user?.email ?? null,
          performed_by_type: "admin",
          reason: notes ?? null,
          settlement_status_before: s.status_history?.settlement_status ?? null,
          settlement_status_after: "Approved",
          verification_status_before:
            s.status_history?.verification_status ?? null,
          verification_status_after:
            s.status_history?.verification_status ?? null,
        })),
      });
    });

    // Notifications — one per settlement (non-blocking)
    for (const s of settlements) {
      const partnerName =
        s.b2b_partner?.partner_display_name ??
        s.b2b_partner?.partner_name ??
        s.partner_name ??
        "Partner";
      sendCommissionNotification("L2_APPROVED", {
        settlementId: s.id,
        settlementRefNumber: s.settlement_reference_number,
        partnerB2BId: s.b2b_partner_id ?? undefined,
        partnerName,
        studentName: s.student_name,
        lenderName: s.loan_details?.lender_name,
        loanAmountDisbursed: s.loan_details?.loan_amount_disbursed
          ? Number(s.loan_details.loan_amount_disbursed)
          : null,
        grossCommissionAmount: s.calculation_details?.gross_commission_amount
          ? Number(s.calculation_details.gross_commission_amount)
          : null,
        approverName: user?.fullName ?? user?.email ?? "Business Head",
        approverNotes: notes ?? null,
        triggeredBy: {
          userId: user?.id,
          name: user?.fullName ?? user?.email,
          type: "admin",
        },
        disbursementDate: s.loan_details?.loan_disbursement_date ?? null,
        loanProductName: s.loan_details?.loan_product_name ?? null,
        universityName: s.loan_details?.university_name ?? null,
        courseName: s.loan_details?.course_name ?? null,
        destinationCountry: s.loan_details?.student_destination_country ?? null,
        settlementMonth: s.settlement_month ?? null,
        settlementYear: s.settlement_year ?? null,
        settlementDate: s.settlement_date ?? null,
        commissionRate: s.calculation_details?.commission_rate_applied
          ? Number(s.calculation_details.commission_rate_applied)
          : null,
      }).catch((err: any) =>
        logger.warn("[Commission] L2 approve notification failed", {
          error: err.message,
        }),
      );
    }

    const total = sumNetPayable(settlements);
    const label = ids.length > 1 ? `${ids.length} tranches` : "Settlement";

    logger.info("[Commission] L2 Approved (Final)", {
      ids,
      approvedBy: user?.fullName ?? user?.email,
    });

    return sendResponse(
      res,
      200,
      `${label} fully approved. Ready for payout.`,
      {
        settlement_ids: ids,
        settlement_status: "Approved",
        count: ids.length,
        total_net_payable: total,
      },
    );
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "One or more settlements already processed. Please refresh.",
      );
    }
    logger.error("[Commission] L2 approve failed", { error: error.message });
    return sendResponse(res, 500, "Failed to approve at L2");
  }
};

// ============================================================================
// PHASE 4: L2 REJECT
// Accepts: { settlement_ids: number[], reason: string, reject_to: "l1" | "partner" }
//   reject_to: "l1"      → status → "Pending Approval" (back to L1 queue), invoice kept
//   reject_to: "partner" → status → "L2 Rejected", invoice cleared (partner re-uploads)
// ============================================================================

export const l2RejectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = parseSettlementIds(req.body.settlement_ids);
    if ("error" in parsed) return sendResponse(res, 400, parsed.error);
    const { ids } = parsed;

    const { reason, reject_to } = req.body;
    const user = (req as any).user;

    if (!reason?.trim()) {
      return sendResponse(res, 400, "Rejection reason is required");
    }
    if (!reject_to || !["l1", "partner"].includes(reject_to)) {
      return sendResponse(res, 400, "reject_to must be 'l1' or 'partner'");
    }

    const settlements = await fetchSettlementsForApproval(ids);
    if (settlements.length !== ids.length) {
      const missing = ids.filter((id) => !settlements.find((s) => s.id === id));
      return sendResponse(res, 404, "Some settlements not found", { missing });
    }

    const validStatuses = ["l1 approved", "pending approval"];
    const invalid = settlements.filter(
      (s) =>
        !validStatuses.includes(
          s.status_history?.settlement_status?.toLowerCase() ?? "",
        ),
    );
    if (invalid.length > 0) {
      return sendResponse(
        res,
        400,
        "All settlements must be in L1 Approved or Pending Approval status",
        { invalidIds: invalid.map((s) => s.id) },
      );
    }

    // reject_to="l1" → send back to L1 queue as "Pending Approval"
    // reject_to="partner" → finalize rejection as "L2 Rejected"
    const newStatus = reject_to === "l1" ? "Pending Approval" : "L2 Rejected";

    await prisma.$transaction(async (tx) => {
      const current = await tx.hSCommissionSettlementsSettlementStatus.findMany(
        {
          where: { settlement_id: { in: ids } },
          select: { settlement_id: true, settlement_status: true },
        },
      );
      const stale = current.filter(
        (s) =>
          !validStatuses.includes(s.settlement_status?.toLowerCase() ?? ""),
      );
      if (stale.length > 0) throw new Error("ALREADY_PROCESSED");

      await tx.hSCommissionSettlementsSettlementStatus.updateMany({
        where: { settlement_id: { in: ids } },
        data: { settlement_status: newStatus },
      });

      // When rejecting back to partner: keep invoice visible in Invoices tab
      // Partner will see it with "Replace Invoice" button — don't wipe the data
      if (reject_to === "partner") {
        await tx.hSCommissionSettlementsDocumentation.updateMany({
          where: { settlement_id: { in: ids } },
          data: {
            invoice_status: "Rejected",
            // invoice_url, invoice_number, invoice_date, invoice_amount kept intentionally
            // so the invoice remains visible in partner's Invoices tab for replacement
          },
        });
      }

      await tx.commissionDisputeLog.createMany({
        data: settlements.map((s) => ({
          settlement_id: s.id,
          action:
            reject_to === "l1" ? "L2_REJECTED_TO_L1" : "L2_REJECTED_TO_PARTNER",
          performed_by_user_id: user?.id ?? null,
          performed_by_name: user?.fullName ?? null,
          performed_by_email: user?.email ?? null,
          performed_by_type: "admin",
          reason: reason.trim(),
          settlement_status_before: s.status_history?.settlement_status ?? null,
          settlement_status_after: newStatus,
          verification_status_before:
            s.status_history?.verification_status ?? null,
          verification_status_after:
            s.status_history?.verification_status ?? null,
        })),
      });
    });

    // Notifications — one per settlement (non-blocking)
    for (const s of settlements) {
      const partnerName =
        s.b2b_partner?.partner_display_name ??
        s.b2b_partner?.partner_name ??
        s.partner_name ??
        "Partner";
      const notificationType =
        reject_to === "l1" ? "L2_REJECTED_TO_L1" : "L2_REJECTED_TO_PARTNER";
      sendCommissionNotification(notificationType as any, {
        settlementId: s.id,
        settlementRefNumber: s.settlement_reference_number,
        partnerB2BId: s.b2b_partner_id ?? undefined,
        partnerName,
        studentName: s.student_name,
        loanAmountDisbursed: s.loan_details?.loan_amount_disbursed
          ? Number(s.loan_details.loan_amount_disbursed)
          : undefined,
        grossCommissionAmount: s.calculation_details?.gross_commission_amount
          ? Number(s.calculation_details.gross_commission_amount)
          : undefined,
        rejectionReason: reason.trim(),
        rejectedBy: user?.fullName ?? user?.email ?? "Business Head",
        rejectTo: reject_to,
        triggeredBy: {
          userId: user?.id,
          name: user?.fullName ?? user?.email,
          type: "admin",
        },
      }).catch((err: any) =>
        logger.warn("[Commission] L2 reject notification failed", {
          error: err.message,
        }),
      );
    }

    const total = sumNetPayable(settlements);
    const label = ids.length > 1 ? `${ids.length} tranches` : "Settlement";
    const msg =
      reject_to === "l1"
        ? `${label} sent back to L1 for re-review.`
        : `${label} rejected. Partner will be notified to re-upload.`;

    logger.info("[Commission] L2 Rejected", {
      ids,
      rejectTo: reject_to,
      rejectedBy: user?.fullName,
    });

    return sendResponse(res, 200, msg, {
      settlement_ids: ids,
      settlement_status: newStatus,
      reject_to,
      count: ids.length,
      total_net_payable: total,
    });
  } catch (error: any) {
    if (error.message === "ALREADY_PROCESSED") {
      return sendResponse(
        res,
        409,
        "One or more settlements already processed. Please refresh.",
      );
    }
    logger.error("[Commission] L2 reject failed", { error: error.message });
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

    const settlement = await prisma.hSCommissionSettlements.findUnique({
      where: { id: settlementId },
      select: { created_at: true },
    });

    const timeline = [
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
// PHASE 4: Serve Invoice File (production-safe)
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
