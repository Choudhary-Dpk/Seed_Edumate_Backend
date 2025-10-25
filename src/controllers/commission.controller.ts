import { NextFunction, Response } from "express";
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
} from "../models/helpers/commission.helper";

export const createCommissionSettlementController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.payload!.id;

    logger.debug(`Mapping commission settlement fields`);
    const mappedFields = await mapAllCommissionSettlementFields(req.body);
    console.log("mappedFields", mappedFields);

    logger.debug(`Categorizing commission settlement data`);
    const categorized = categorizeCommissionSettlementByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating commission settlement for userId: ${userId}`);
      const settlement = await createCommissionSettlement(
        tx,
        categorized["mainSettlement"]
      );
      logger.debug(
        `Commission settlement created successfully with id: ${settlement.id}`
      );

      logger.debug(
        `Creating settlement status for settlement: ${settlement.id}`
      );
      const settlementStatus = await createCommissionSettlementStatus(
        tx,
        settlement.id,
        categorized["settlementStatus"]
      );

      logger.debug(`Creating system tracking for settlement: ${settlement.id}`);
      const systemTracking = await createCommissionSettlementSystemTracking(
        tx,
        settlement.id,
        categorized["systemTracking"],
        userId
      );

      logger.debug(
        `Creating transaction details for settlement: ${settlement.id}`
      );
      const transactionDetails =
        await createCommissionSettlementTransactionDetails(
          tx,
          settlement.id,
          categorized["transactionDetails"]
        );

      logger.debug(
        `Creating commission calculation for settlement: ${settlement.id}`
      );
      const commissionCalculation = await createCommissionSettlementCalculation(
        tx,
        settlement.id,
        categorized["commissionCalculation"]
      );

      logger.debug(`Creating communication for settlement: ${settlement.id}`);
      const communication = await createCommissionSettlementCommunication(
        tx,
        settlement.id,
        categorized["communication"]
      );

      logger.debug(`Creating loan details for settlement: ${settlement.id}`);
      const loanDetails = await createCommissionSettlementLoanDetails(
        tx,
        settlement.id,
        categorized["loanDetails"]
      );

      logger.debug(
        `Creating payment processing for settlement: ${settlement.id}`
      );
      const paymentProcessing =
        await createCommissionSettlementPaymentProcessing(
          tx,
          settlement.id,
          categorized["paymentProcessing"]
        );

      logger.debug(`Creating tax deductions for settlement: ${settlement.id}`);
      const taxDeductions = await createCommissionSettlementTaxDeductions(
        tx,
        settlement.id,
        categorized["taxDeductions"]
      );

      logger.debug(`Creating documentation for settlement: ${settlement.id}`);
      const documentation = await createCommissionSettlementDocumentation(
        tx,
        settlement.id,
        categorized["documentation"]
      );

      logger.debug(`Creating hold disputes for settlement: ${settlement.id}`);
      const holdDisputes = await createCommissionSettlementHoldDisputes(
        tx,
        settlement.id,
        categorized["holdDisputes"]
      );

      logger.debug(`Creating reconciliation for settlement: ${settlement.id}`);
      const reconciliation = await createCommissionSettlementReconciliation(
        tx,
        settlement.id,
        categorized["reconciliation"]
      );

      logger.debug(
        `Creating performance analytics for settlement: ${settlement.id}`
      );
      const performanceAnalytics =
        await createCommissionSettlementPerformanceAnalytics(
          tx,
          settlement.id,
          categorized["performanceAnalytics"]
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
    });

    logger.debug(
      `Commission settlement creation transaction completed successfully`,
      result.id
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
  next: NextFunction
) => {
  try {
    const userId = req.payload!.id;
    const settlementId = parseInt(req.params.id);

    logger.debug(`Mapping commission settlement fields for update`);
    const mappedFields = await mapAllCommissionSettlementFields(req.body);

    logger.debug(`Categorizing commission settlement data for update`);
    const categorized = categorizeCommissionSettlementByTable(mappedFields);

    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating commission settlement: ${settlementId}`);
      const settlement = await updateCommissionSettlement(
        tx,
        settlementId,
        categorized["mainSettlement"]
      );
      logger.debug(
        `Commission settlement updated successfully with id: ${settlementId}`
      );

      logger.debug(
        `Updating settlement status for settlement: ${settlementId}`
      );
      await updateCommissionSettlementStatus(
        tx,
        settlementId,
        categorized["settlementStatus"]
      );

      logger.debug(`Updating system tracking for settlement: ${settlementId}`);
      await updateCommissionSettlementSystemTracking(
        tx,
        settlementId,
        categorized["systemTracking"],
        userId
      );

      logger.debug(
        `Updating transaction details for settlement: ${settlementId}`
      );
      await updateCommissionSettlementTransactionDetails(
        tx,
        settlementId,
        categorized["transactionDetails"]
      );

      logger.debug(
        `Updating commission calculation for settlement: ${settlementId}`
      );
      await updateCommissionSettlementCalculation(
        tx,
        settlementId,
        categorized["commissionCalculation"]
      );

      logger.debug(`Updating communication for settlement: ${settlementId}`);
      await updateCommissionSettlementCommunication(
        tx,
        settlementId,
        categorized["communication"]
      );

      logger.debug(`Updating loan details for settlement: ${settlementId}`);
      await updateCommissionSettlementLoanDetails(
        tx,
        settlementId,
        categorized["loanDetails"]
      );

      logger.debug(
        `Updating payment processing for settlement: ${settlementId}`
      );
        await updateCommissionSettlementPaymentProcessing(
          tx,
          settlementId,
          categorized["paymentProcessing"]
        );

      logger.debug(`Updating tax deductions for settlement: ${settlementId}`);
      await updateCommissionSettlementTaxDeductions(
        tx,
        settlementId,
        categorized["taxDeductions"]
      );

      logger.debug(`Updating documentation for settlement: ${settlementId}`);
      await updateCommissionSettlementDocumentation(
        tx,
        settlementId,
        categorized["documentation"]
      );

      logger.debug(`Updating hold disputes for settlement: ${settlementId}`);
      await updateCommissionSettlementHoldDisputes(
        tx,
        settlementId,
        categorized["holdDisputes"]
      );

      logger.debug(`Updating reconciliation for settlement: ${settlementId}`);
      await updateCommissionSettlementReconciliation(
        tx,
        settlementId,
        categorized["reconciliation"]
      );

      logger.debug(
        `Updating performance analytics for settlement: ${settlementId}`
      );
      await updateCommissionSettlementPerformanceAnalytics(
        tx,
        settlementId,
        categorized["performanceAnalytics"]
      );

      return settlement;
    });

    logger.debug(
      `Commission settlement update transaction completed successfully`
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const settlementId = parseInt(req.params.id);

    logger.debug(
      `Fetching commission settlement details for id: ${settlementId}`
    );
    const settlementDetails = await getCommissionSettlement(settlementId);
    logger.debug(`Commission settlement details fetched successfully`);

    sendResponse(
      res,
      200,
      "Commission settlement details fetched successfully",
      settlementDetails
    );
  } catch (error) {
    logger.error(`Error fetching commission settlement details: ${error}`);
    next(error);
  }
};

export const getCommissionSettlementsListController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;
    const search = (req.query.search as string) || null;

    const offset = (page - 1) * size;

    logger.debug(
      `Fetching commission settlements list with page: ${page}, size: ${size}, sortKey: ${sortKey}, sortDir: ${sortDir}, search: ${search}`
    );
    const { rows, count } = await fetchCommissionSettlementsList(
      size,
      offset,
      sortKey,
      sortDir,
      search
    );
    logger.debug(
      `Commission settlements list fetched successfully. Count: ${count}`
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
