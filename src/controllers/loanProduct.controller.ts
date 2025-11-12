import { NextFunction, Response } from "express";
import prisma from "../config/prisma";
import { mapAllLoanProductFields } from "../mappers/loanProducts/loanProductMapping";
import { categorizeLoanProductByTable } from "../services/DBServices/loan.services";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import logger from "../utils/logger";
import {
  createLoanProduct,
  createLoanProductSystemTracking,
  createLoanProductCompetitiveAnalytics,
  createLoanProductEligibilityCriteria,
  createLoanProductCollateralSecurity,
  createLoanProductRepaymentTerms,
  createLoanProductApplicationProcessing,
  createLoanProductGeographicCoverage,
  createLoanProductSpecialFeatures,
  createLoanProductPerformanceMetrics,
  createLoanProductSystemIntegration,
  createLoanProductFinancialTerms,
  updateLoanProduct,
  updateLoanProductSystemTracking,
  updateLoanProductCompetitiveAnalytics,
  updateLoanProductCollateralSecurity,
  updateLoanProductRepaymentTerms,
  updateLoanProductApplicationProcessing,
  updateLoanProductGeographicCoverage,
  updateLoanProductSpecialFeatures,
  updateLoanProductPerformanceMetrics,
  updateLoanProductSystemIntegration,
  updateLoanProductFinancialTerms,
  deleteLoanProduct,
  getLoanProduct,
  fetchLoanProductsList,
} from "../models/helpers/loanProduct.helper";

export const createLoanProductController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.product_display_name) {
      return sendResponse(res, 400, "Product Name is required");
    }

    logger.debug(`Mapping loan product fields`);
    const mappedFields = await mapAllLoanProductFields(req.body);
    console.log("mappedFields", mappedFields);

    logger.debug(`Categorizing loan product data`);
    const categorized = categorizeLoanProductByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating loan product`);
      const product = await createLoanProduct(
        tx,
        categorized["mainLoanProduct"]
      );
      logger.debug(`Loan product created successfully with id: ${product.id}`);

      logger.debug(`Creating system tracking for product: ${product.id}`);
      const systemTracking = await createLoanProductSystemTracking(
        tx,
        product.id,
        categorized["systemTracking"]
      );
      logger.debug(
        `System tracking created successfully for product: ${product.id}`
      );

      logger.debug(`Creating competitive analytics for product: ${product.id}`);
      const competitiveAnalytics = await createLoanProductCompetitiveAnalytics(
        tx,
        product.id,
        categorized["competitiveAnalytics"]
      );
      logger.debug(
        `Competitive analytics created successfully for product: ${product.id}`
      );

      logger.debug(`Creating eligibility criteria for product: ${product.id}`);
      const eligibilityCriteria = await createLoanProductEligibilityCriteria(
        tx,
        product.id,
        categorized["eligibilityCriteria"]
      );
      logger.debug(
        `Eligibility criteria created successfully for product: ${product.id}`
      );

      logger.debug(`Creating collateral security for product: ${product.id}`);
      const collateralSecurity = await createLoanProductCollateralSecurity(
        tx,
        product.id,
        categorized["collateralSecurity"]
      );
      logger.debug(
        `Collateral security created successfully for product: ${product.id}`
      );

      logger.debug(`Creating repayment terms for product: ${product.id}`);
      const repaymentTerms = await createLoanProductRepaymentTerms(
        tx,
        product.id,
        categorized["repaymentTerms"]
      );
      logger.debug(
        `Repayment terms created successfully for product: ${product.id}`
      );

      logger.debug(
        `Creating application processing for product: ${product.id}`
      );
      const applicationProcessing =
        await createLoanProductApplicationProcessing(
          tx,
          product.id,
          categorized["applicationProcessing"]
        );
      logger.debug(
        `Application processing created successfully for product: ${product.id}`
      );

      logger.debug(`Creating geographic coverage for product: ${product.id}`);
      const geographicCoverage = await createLoanProductGeographicCoverage(
        tx,
        product.id,
        categorized["geographicCoverage"]
      );
      logger.debug(
        `Geographic coverage created successfully for product: ${product.id}`
      );

      logger.debug(`Creating special features for product: ${product.id}`);
      const specialFeatures = await createLoanProductSpecialFeatures(
        tx,
        product.id,
        categorized["specialFeatures"]
      );
      logger.debug(
        `Special features created successfully for product: ${product.id}`
      );

      logger.debug(`Creating performance metrics for product: ${product.id}`);
      const performanceMetrics = await createLoanProductPerformanceMetrics(
        tx,
        product.id,
        categorized["performanceMetrics"]
      );
      logger.debug(
        `Performance metrics created successfully for product: ${product.id}`
      );

      logger.debug(`Creating system integration for product: ${product.id}`);
      const systemIntegration = await createLoanProductSystemIntegration(
        tx,
        product.id,
        categorized["systemIntegration"]
      );
      logger.debug(
        `System integration created successfully for product: ${product.id}`
      );

      logger.debug(`Creating financial terms for product: ${product.id}`);
      const financialTerms = await createLoanProductFinancialTerms(
        tx,
        product.id,
        categorized["financialTerms"]
      );
      logger.debug(
        `Financial terms created successfully for product: ${product.id}`
      );

      data = {
        product: { ...product },
        systemTracking: { ...systemTracking },
        competitiveAnalytics: { ...competitiveAnalytics },
        eligibilityCriteria: { ...eligibilityCriteria },
        collateralSecurity: { ...collateralSecurity },
        repaymentTerms: { ...repaymentTerms },
        applicationProcessing: { ...applicationProcessing },
        geographicCoverage: { ...geographicCoverage },
        specialFeatures: { ...specialFeatures },
        performanceMetrics: { ...performanceMetrics },
        systemIntegration: { ...systemIntegration },
        financialTerms: { ...financialTerms },
      };

      return product;
    });

    logger.debug(
      `Loan product creation transaction completed successfully`,
      result.id
    );

    sendResponse(res, 201, "Loan product created successfully", data);
  } catch (error) {
    logger.error(`Error creating loan product: ${error}`);
    next(error);
  }
};

export const updateLoanProductController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = parseInt(req.params.id);

    if (!req.body.product_display_name) {
      return sendResponse(res, 400, "Product Name is required");
    }

    logger.debug(`Mapping loan product fields for update`);
    const mappedFields = await mapAllLoanProductFields(req.body);

    logger.debug(`Categorizing loan product data for update`);
    const categorized = categorizeLoanProductByTable(mappedFields);

    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating loan product: ${productId}`);
      const product = await updateLoanProduct(
        tx,
        productId,
        categorized["mainLoanProduct"]
      );
      logger.debug(`Loan product updated successfully with id: ${productId}`);

      logger.debug(`Updating system tracking for product: ${productId}`);
      await updateLoanProductSystemTracking(
        tx,
        productId,
        categorized["systemTracking"]
      );

      logger.debug(`Updating competitive analytics for product: ${productId}`);
      await updateLoanProductCompetitiveAnalytics(
        tx,
        productId,
        categorized["competitiveAnalytics"]
      );

      logger.debug(`Updating collateral security for product: ${productId}`);
      await updateLoanProductCollateralSecurity(
        tx,
        productId,
        categorized["collateralSecurity"]
      );

      logger.debug(`Updating repayment terms for product: ${productId}`);
      await updateLoanProductRepaymentTerms(
        tx,
        productId,
        categorized["repaymentTerms"]
      );

      logger.debug(`Updating application processing for product: ${productId}`);

      await updateLoanProductApplicationProcessing(
        tx,
        productId,
        categorized["applicationProcessing"]
      );

      logger.debug(`Updating geographic coverage for product: ${productId}`);
      await updateLoanProductGeographicCoverage(
        tx,
        productId,
        categorized["geographicCoverage"]
      );

      logger.debug(`Updating special features for product: ${productId}`);
      await updateLoanProductSpecialFeatures(
        tx,
        productId,
        categorized["specialFeatures"]
      );

      logger.debug(`Updating performance metrics for product: ${productId}`);
      await updateLoanProductPerformanceMetrics(
        tx,
        productId,
        categorized["performanceMetrics"]
      );

      logger.debug(`Updating system integration for product: ${productId}`);
      await updateLoanProductSystemIntegration(
        tx,
        productId,
        categorized["systemIntegration"]
      );

      logger.debug(`Updating financial terms for product: ${productId}`);
      await updateLoanProductFinancialTerms(
        tx,
        productId,
        categorized["financialTerms"]
      );

      return product;
    });

    logger.debug(`Loan product update transaction completed successfully`);

    sendResponse(res, 200, "Loan product updated successfully");
  } catch (error) {
    logger.error(`Error updating loan product: ${error}`);
    next(error);
  }
};

export const deleteLoanProductController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = parseInt(req.params.id);

    logger.debug(`Deleting loan product with id: ${productId}`);
    await deleteLoanProduct(productId);
    logger.debug(`Loan product deleted successfully`);

    sendResponse(res, 200, "Loan product deleted successfully");
  } catch (error) {
    logger.error(`Error deleting loan product: ${error}`);
    next(error);
  }
};

export const getLoanProductDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = parseInt(req.params.id);

    logger.debug(`Fetching loan product details for id: ${productId}`);
    const productDetails = await getLoanProduct(productId);
    logger.debug(`Loan product details fetched successfully`);

    sendResponse(
      res,
      200,
      "Loan product details fetched successfully",
      productDetails
    );
  } catch (error) {
    logger.error(`Error fetching loan product details: ${error}`);
    next(error);
  }
};

export const getLoanProductsListController = async (
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
      `Fetching loan products list with page: ${page}, size: ${size}, sortKey: ${sortKey}, sortDir: ${sortDir}, search: ${search}`
    );
    const { rows, count } = await fetchLoanProductsList(
      size,
      offset,
      sortKey,
      sortDir,
      search
    );
    logger.debug(`Loan products list fetched successfully. Count: ${count}`);

    sendResponse(res, 200, "Loan products list fetched successfully", {
      data: rows,
      total: count,
      page,
      size,
    });
  } catch (error) {
    logger.error(`Error fetching loan products list: ${error}`);
    next(error);
  }
};
