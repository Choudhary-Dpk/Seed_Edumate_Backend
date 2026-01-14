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
  updateLoanProductEligibilityCriteria,
} from "../models/helpers/loanProduct.helper";
import { LoanProductFilters } from "../types/loanProduct.types";

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

      logger.debug(`Updating eligibility criteria for product: ${productId}`);
      await updateLoanProductEligibilityCriteria(
        tx,
        productId,
        categorized["eligibilityCriteria"]
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

    // Extract filters from query params with type conversion
    const filtersFromQuery = (req.query.filters as any) || {};

    const filters: LoanProductFilters = {
      // Existing filters
      ids: filtersFromQuery.interested
        ? Array.isArray(filtersFromQuery.interested)
          ? filtersFromQuery.interested
            .map((id: any) => parseInt(id))
            .filter((id: number) => !isNaN(id))
          : typeof filtersFromQuery.interested === "string" &&
            filtersFromQuery.interested.startsWith("[")
            ? JSON.parse(filtersFromQuery.interested).filter((id: number) => !isNaN(id))
            : [parseInt(filtersFromQuery.interested)].filter((id: number) => !isNaN(id))
        : null,
      lender_name: filtersFromQuery.lender_name || null,
      product_type: filtersFromQuery.loan_type || null,
      product_category: filtersFromQuery.product_category || null,
      product_status: filtersFromQuery.product_status || null,
      partner_name: filtersFromQuery.partner_name || null,
      supported_countries: filtersFromQuery.supported_countries || null,

      // Financial filters
      interest_rate: filtersFromQuery.interest_rate
        ? parseFloat(filtersFromQuery.interest_rate)
        : null,
      interest_rate_max: filtersFromQuery.interest_rate_max
        ? parseFloat(filtersFromQuery.interest_rate_max)
        : null,
      loan_amount_min: filtersFromQuery.loan_amount_min
        ? parseFloat(filtersFromQuery.loan_amount_min)
        : null,
      loan_amount_max: filtersFromQuery.loan_amount_max
        ? parseFloat(filtersFromQuery.loan_amount_max)
        : null,
      processing_fee_max: filtersFromQuery.processing_fee_max
        ? parseFloat(filtersFromQuery.processing_fee_max)
        : null,

      // Eligibility filters
      study_level: filtersFromQuery.study_level || null,
      target_segment: filtersFromQuery.target_segment || null,
      minimum_age: filtersFromQuery.minimum_age
        ? parseInt(filtersFromQuery.minimum_age)
        : null,
      maximum_age: filtersFromQuery.maximum_age
        ? parseInt(filtersFromQuery.maximum_age)
        : null,
      nationality_restrictions:
        filtersFromQuery.nationality_restrictions || null,

      // Geographic filters
      supported_course_types: filtersFromQuery.supported_course_types || null,
      restricted_countries: filtersFromQuery.restricted_countries || null,
      course_duration_min: filtersFromQuery.course_duration_min
        ? parseInt(filtersFromQuery.course_duration_min)
        : null,
      course_duration_max: filtersFromQuery.course_duration_max
        ? parseInt(filtersFromQuery.course_duration_max)
        : null,

      // Intake period
      intake_month: filtersFromQuery.intake_month || null,
      intake_year: filtersFromQuery.intake_year
        ? parseInt(filtersFromQuery.intake_year)
        : null,

      // Application filters
      school_name: filtersFromQuery.school_name || null,
      program_name: filtersFromQuery.program_name || null,

      // Additional financial
      total_tuition_fee: filtersFromQuery.total_tuition_fee
        ? parseFloat(filtersFromQuery.total_tuition_fee)
        : null,
      cost_of_living: filtersFromQuery.cost_of_living
        ? parseFloat(filtersFromQuery.cost_of_living)
        : null,

      // Collateral filters
      collateral_required: filtersFromQuery.collateral_required || null,
      guarantor_required: filtersFromQuery.guarantor_required || null,

      // Repayment filters
      repayment_period_min: filtersFromQuery.repayment_period_min
        ? parseInt(filtersFromQuery.repayment_period_min)
        : null,
      repayment_period_max: filtersFromQuery.repayment_period_max
        ? parseInt(filtersFromQuery.repayment_period_max)
        : null,
      moratorium_available: filtersFromQuery.moratorium_available
        ? filtersFromQuery.moratorium_available === "true"
        : null,

      // Special features
      tax_benefits_available: filtersFromQuery.tax_benefits_available || null,
      digital_features: filtersFromQuery.digital_features || null,
    };

    const offset = (page - 1) * size;

    const { rows, count } = await fetchLoanProductsList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      filters
    );

    logger.debug(`Loan products list fetched successfully. Count: ${count}`);

    sendResponse(res, 200, "Loan products list fetched successfully", {
      data: rows,
      total: count,
      page,
      size,
      totalPages: Math.ceil(count / size),
    });
  } catch (error) {
    console.error(`Error fetching loan products list: ${error}`);
    next(error);
  }
};
