import { NextFunction, Response, Request } from "express";
import fs from "fs";
import path from "path";
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
import { deleteFromS3, uploadToS3 } from "../utils/s3bucket";

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
          categorized["settlementStatus"],
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
          categorized["documentation"],
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

    let partnerId = null;
    if (id) {
      partnerId = (await getPartnerIdByUserId(id))!.b2b_id;

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
        startDate?: string;
        endDate?: string;
      }) || {};

    const filters = {
      partner: partnerId || filtersFromQuery.partner || null,
      lead: filtersFromQuery.lead || null,
      invoiceStatus: filtersFromQuery.invoiceStatus || null,
      paymentStatus: filtersFromQuery.paymentStatus || null,
      startDate: filtersFromQuery.startDate || null,
      endDate: filtersFromQuery.endDate || null,
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

    // Get the first settlement to extract data
    const firstSettlement = settlements[0];

    // Calculate total invoice amount from all settlements
    const totalAmount = settlements.reduce((sum: number, settlement: any) => {
      const grossAmount =
        settlement.calculation_details?.total_gross_amount || 0;
      return sum + parseFloat(grossAmount.toString());
    }, 0);

    // Upload to S3 instead of local disk
    const {
      key,
      url: fileUrl,
      fileName,
    } = await uploadToS3(file.buffer, file.originalname, "invoices");

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        file: fileName, // filename
        url: fileUrl, // Store full S3 URL
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

        if (settlement.documentaion) {
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
              invoice_url: fileUrl, // S3 URL
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
              invoice_url: fileUrl, // S3 URL
              invoice_required: "Yes",
            },
          });
        }
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
    return sendResponse(res, 500, "Error uploading invoice");
  }
};

export const deleteInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { invoice_url } = req.body;

    if (!invoice_url) {
      return sendResponse(res, 400, "Invoice URL is required");
    }

    // Find the invoice by URL (the only link between Invoice table and Documentation table)
    const invoice = await prisma.invoice.findFirst({
      where: { url: invoice_url },
    });

    if (!invoice) {
      return sendResponse(res, 404, "Invoice not found");
    }

    // Step 1: Delete file from S3
    if (invoice.file) {
      try {
        await deleteFromS3(invoice.file); // invoice.file = S3 key like "invoices/invoice-123.pdf"
      } catch (s3Error: any) {
        console.error("Error deleting file from S3:", s3Error);
        // Continue with DB cleanup even if S3 delete fails
      }
    }

    // Step 2: Clear invoice data from ALL documentation records pointing to this invoice URL
    await prisma.hSCommissionSettlementsDocumentation.updateMany({
      where: {
        invoice_url: invoice_url,
      },
      data: {
        invoice_number: null,
        invoice_date: null,
        invoice_amount: null,
        invoice_status: null,
        invoice_url: null,
      },
    });

    // Step 3: Delete the invoice record from database
    await prisma.invoice.delete({
      where: { id: invoice.id },
    });

    return sendResponse(res, 200, "Invoice deleted successfully", {
      deleted_invoice_id: invoice.id,
    });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return sendResponse(res, 500, "Error deleting invoice");
  }
};