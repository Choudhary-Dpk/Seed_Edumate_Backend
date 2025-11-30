import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { getLendersList } from "../models/helpers/lender.helper";
import { getLoanProductsByLender } from "../models/helpers/loanProduct.helper";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import logger from "../utils/logger";
import { mapAllHSLendersFields } from "../mappers/lenders/lendersMapping";
import { categorizeHSLendersByTable } from "../services/DBServices/lender.service";
import prisma from "../config/prisma";
import {
  createHSLender,
  createHSLendersBusinessMetrics,
  createHSLendersContactInfo,
  createHSLendersLoanOfferings,
  createHSLendersOperationalDetails,
  createHSLendersPartnershipsDetails,
  createHSLendersSystemTracking,
  fetchHSLenderById,
  fetchLendersList,
  getLenderById,
  softDeleteHSLender,
  updateHSLender,
  updateHSLendersBusinessMetrics,
  updateHSLendersContactInfo,
  updateHSLendersOperationalDetails,
  updateHSLendersPartnershipsDetails,
  updateHSLendersSystemTracking,
} from "../models/helpers/lenders.helper";

export const getLenderListController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenderList = await getLendersList();
    sendResponse(res, 200, "Lenders fetched successfully", lenderList);
  } catch (error) {
    next(error);
  }
};

export const getLoanProductsByLenderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenderId = Number(req.query.id);
    if (!lenderId) {
      throw Error("Lender Id is required");
    }

    const loanProducts = await getLoanProductsByLender(lenderId);

    sendResponse(res, 200, "Loan Products fetch successfully", loanProducts);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const createLenderController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.lender_name) {
      return sendResponse(res, 400, "Lender Name is required");
    }

    logger.debug(`Mapping HSLender fields`);
    const mappedFields = await mapAllHSLendersFields(req.body);
    console.log("mappedFields", mappedFields);

    logger.debug(`Categorizing HSLender data`);
    const categorized = categorizeHSLendersByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating HSLender`);
      const lender = await createHSLender(tx, categorized["hsLenders"]);
      logger.debug(`HSLender created successfully with id: ${lender.id}`);

      logger.debug(`Creating contact info for lender: ${lender.id}`);
      const contactInfo = await createHSLendersContactInfo(
        tx,
        lender.id,
        categorized["hsLendersContactInfo"]
      );
      logger.debug(
        `Contact info created successfully for lender: ${lender.id}`
      );

      logger.debug(`Creating business metrics for lender: ${lender.id}`);
      const businessMetrics = await createHSLendersBusinessMetrics(
        tx,
        lender.id,
        categorized["hsLendersBusinessMetrics"]
      );
      logger.debug(
        `Business metrics created successfully for lender: ${lender.id}`
      );

      logger.debug(`Creating loan offerings for lender: ${lender.id}`);
      const loanOfferings = await createHSLendersLoanOfferings(
        tx,
        lender.id,
        categorized["hsLendersLoanOfferings"]
      );
      logger.debug(
        `Loan offerings created successfully for lender: ${lender.id}`
      );

      logger.debug(`Creating operational details for lender: ${lender.id}`);
      const operationalDetails = await createHSLendersOperationalDetails(
        tx,
        lender.id,
        categorized["hsLendersOperationalDetails"]
      );
      logger.debug(
        `Operational details created successfully for lender: ${lender.id}`
      );

      logger.debug(`Creating partnership details for lender: ${lender.id}`);
      const partnershipDetails = await createHSLendersPartnershipsDetails(
        tx,
        lender.id,
        categorized["hsLendersPartnershipsDetails"]
      );
      logger.debug(
        `Partnership details created successfully for lender: ${lender.id}`
      );

      logger.debug(`Creating system tracking for lender: ${lender.id}`);
      const systemTracking = await createHSLendersSystemTracking(
        tx,
        lender.id,
        categorized["hsLendersSystemTracking"]
      );
      logger.debug(
        `System tracking created successfully for lender: ${lender.id}`
      );

      data = {
        lender: {
          ...lender,
        },
        contactInfo: {
          ...contactInfo,
        },
        businessMetrics: {
          ...businessMetrics,
        },
        loanOfferings: {
          ...loanOfferings,
        },
        operationalDetails: {
          ...operationalDetails,
        },
        partnershipDetails: {
          ...partnershipDetails,
        },
        systemTracking: {
          ...systemTracking,
        },
      };

      return lender;
    });

    logger.debug(
      `HSLender creation transaction completed successfully`,
      result.id
    );

    sendResponse(res, 201, "Lender created successfully", data);
  } catch (error) {
    logger.error(`Error creating Lender: ${error}`);
    next(error);
  }
};

export const updateLenderController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenderId = parseInt(req.params.id);

    if (!lenderId) {
      return sendResponse(res, 400, "Lender ID is required");
    }

    logger.debug(`Mapping HSLender fields for update`);
    const mappedFields = await mapAllHSLendersFields(req.body);

    logger.debug(`Categorizing HSLender data for update`);
    const categorized = categorizeHSLendersByTable(mappedFields);

    await prisma.$transaction(async (tx: any) => {
      // Check if lender exists
      const existingLender = await tx.hSLenders.findUnique({
        where: { id: lenderId },
      });

      if (!existingLender) {
        throw new Error(`Lender with id ${lenderId} not found`);
      }

      logger.debug(`Updating HSLender: ${lenderId}`);
      const lender = await updateHSLender(
        tx,
        lenderId,
        categorized["hsLenders"]
      );
      logger.debug(`HSLender updated successfully: ${lenderId}`);

      logger.debug(`Updating contact info for lender: ${lenderId}`);
      await updateHSLendersContactInfo(
        tx,
        lenderId,
        categorized["hsLendersContactInfo"]
      );
      logger.debug(`Contact info updated successfully for lender: ${lenderId}`);

      logger.debug(`Updating business metrics for lender: ${lenderId}`);
      await updateHSLendersBusinessMetrics(
        tx,
        lenderId,
        categorized["hsLendersBusinessMetrics"]
      );
      logger.debug(
        `Business metrics updated successfully for lender: ${lenderId}`
      );

      logger.debug(`Updating operational details for lender: ${lenderId}`);
      await updateHSLendersOperationalDetails(
        tx,
        lenderId,
        categorized["hsLendersOperationalDetails"]
      );
      logger.debug(
        `Operational details updated successfully for lender: ${lenderId}`
      );

      logger.debug(`Updating partnership details for lender: ${lenderId}`);
      await updateHSLendersPartnershipsDetails(
        tx,
        lenderId,
        categorized["hsLendersPartnershipsDetails"]
      );
      logger.debug(
        `Partnership details updated successfully for lender: ${lenderId}`
      );

      logger.debug(`Updating system tracking for lender: ${lenderId}`);
      await updateHSLendersSystemTracking(
        tx,
        lenderId,
        categorized["hsLendersSystemTracking"]
      );
      logger.debug(
        `System tracking updated successfully for lender: ${lenderId}`
      );

      return lender;
    });

    logger.debug(`HSLender update transaction completed successfully`);

    sendResponse(res, 200, "Lender updated successfully");
  } catch (error) {
    logger.error(`Error updating Lender: ${error}`);
    next(error);
  }
};

export const deleteLendersController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenderId = parseInt(req.params.id);

    if (!lenderId) {
      return sendResponse(res, 400, "Lender ID is required");
    }

    logger.debug(`Soft deleting HSLender: ${lenderId}`);
    const result = await prisma.$transaction(async (tx: any) => {
      // Check if lender exists
      const existingLender = await getLenderById(lenderId);
      if (!existingLender) {
        throw new Error(`Lender with id ${lenderId} not found`);
      }

      return await softDeleteHSLender(tx, lenderId);
    });

    logger.debug(`HSLender soft deleted successfully: ${lenderId}`);

    sendResponse(res, 200, "Lender deleted successfully");
  } catch (error) {
    logger.error(`Error deleting Lender: ${error}`);
    next(error);
  }
};

export const getLendersListController = async (
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
    console.log("req.query", req.query);

    // Extract filters from query params
    const filtersFromQuery =
      (req.query.filters as {
        lender_name?: string;
        lender_type?: string;
        lender_category?: string;
      }) || {};

    const filters = {
      lender_name: filtersFromQuery.lender_name || null,
      lender_type: filtersFromQuery.lender_type || null,
      lender_category: filtersFromQuery.lender_category || null,
    };
    console.log("filters", filters);

    const offset = (page - 1) * size;

    logger.debug(
      `Fetching lenders list with page: ${page}, size: ${size}, sortKey: ${sortKey}, sortDir: ${sortDir}, search: ${search}, filters:`,
      filters
    );
    const { rows, count } = await fetchLendersList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      filters
    );
    logger.debug(`Lenders list fetched successfully. Count: ${count}`);

    sendResponse(res, 200, "Lenders list fetched successfully", {
      data: rows,
      total: count,
      page,
      size,
    });
  } catch (error) {
    logger.error(`Error fetching lenders list: ${error}`);
    next(error);
  }
};

export const getLenderDetailsController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenderId = parseInt(req.params.id);
    if (!lenderId) {
      return sendResponse(res, 400, "Lender ID is required");
    }

    logger.debug(`Fetching HSLender by id: ${lenderId}`);
    const lender = await prisma.$transaction(async (tx: any) => {
      return await fetchHSLenderById(tx, lenderId);
    });

    if (!lender) {
      return sendResponse(res, 404, `Lender with id ${lenderId} not found`);
    }

    logger.debug(`HSLender fetched successfully: ${lenderId}`);

    sendResponse(res, 200, "HSLender fetched successfully", lender);
  } catch (error) {
    logger.error(`Error fetching HSLender: ${error}`);
    next(error);
  }
};
