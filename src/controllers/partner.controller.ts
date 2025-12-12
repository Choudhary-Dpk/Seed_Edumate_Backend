import { NextFunction, Response, Request } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import logger from "../utils/logger";
import {
  createB2BBusinessCapabilities,
  createB2BCommissionStructure,
  createB2BComplianceDocumentation,
  createB2BContactInfo,
  createB2BFinancialTracking,
  createB2BLeadAttribution,
  createB2BMarketingPromotion,
  createB2BPartner,
  createB2BPartnershipDetails,
  createB2BPerformanceMetrics,
  createB2BRelationshipManagement,
  createB2BSystemTracking,
  deleteB2bPartner,
  fetchB2BPartnersList,
  getB2BPartner,
  getLeadsByDynamicFilters,
  updateB2BBusinessCapabilities,
  updateB2BCommissionStructure,
  updateB2BComplianceDocumentation,
  updateB2BContactInfo,
  updateB2BFinancialTracking,
  updateB2BLeadAttribution,
  updateB2BMarketingPromotion,
  updateB2BPartner,
  updateB2BPartnershipDetails,
  updateB2BPerformanceMetrics,
  updateB2BRelationshipManagement,
  updateB2BSystemTracking,
} from "../models/helpers/partners.helper";
import { mapAllB2BPartnerFields } from "../mappers/b2bPartners/partnerMapping";
import { categorizeB2BByTable } from "../services/DBServices/partner.service";
import { sendResponse } from "../utils/api";
import prisma from "../config/prisma";

export const createB2bPartner = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.partner_name && !req.body.registration_number) {
      return sendResponse(
        res,
        400,
        "Partner name and Registration number is required"
      );
    }

    logger.debug(`Mapping B2B partner fields`);
    const mappedFields = await mapAllB2BPartnerFields(req.body);
    console.log("mappedFields", mappedFields);

    logger.debug(`Categorizing B2B partner data`);
    const categorized = categorizeB2BByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating B2B partner`);
      const partner = await createB2BPartner(tx, categorized["mainPartner"]);
      logger.debug(`Partner created successfully with id: ${partner.id}`);

      logger.debug(`Creating business capabilities for partner: ${partner.id}`);
      const businessCapabilities = await createB2BBusinessCapabilities(
        tx,
        partner.id,
        categorized["businessCapabilities"]
      );
      logger.debug(
        `Business capabilities created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating commission structure for partner: ${partner.id}`);
      const commissionStructure = await createB2BCommissionStructure(
        tx,
        partner.id,
        categorized["commissionStructure"]
      );
      logger.debug(
        `Commission structure created successfully for partner: ${partner.id}`
      );

      logger.debug(
        `Creating compliance documentation for partner: ${partner.id}`
      );
      const complianceDocumentation = await createB2BComplianceDocumentation(
        tx,
        partner.id,
        categorized["complianceDocumentation"]
      );
      logger.debug(
        `Compliance documentation created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating contact info for partner: ${partner.id}`);
      const contactInfo = await createB2BContactInfo(
        tx,
        partner.id,
        categorized["contactInfo"]
      );
      logger.debug(
        `Contact info created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating financial tracking for partner: ${partner.id}`);
      const financialTracking = await createB2BFinancialTracking(
        tx,
        partner.id,
        categorized["financialTracking"]
      );
      logger.debug(
        `Financial tracking created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating lead attribution for partner: ${partner.id}`);
      const leadAttribution = await createB2BLeadAttribution(
        tx,
        partner.id,
        categorized["leadAttribution"]
      );
      logger.debug(
        `Lead attribution created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating marketing promotion for partner: ${partner.id}`);
      const marketingPromotion = await createB2BMarketingPromotion(
        tx,
        partner.id,
        categorized["marketingPromotion"]
      );
      logger.debug(
        `Marketing promotion created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating partnership details for partner: ${partner.id}`);
      const partnershipDetails = await createB2BPartnershipDetails(
        tx,
        partner.id,
        categorized["partnershipDetails"]
      );
      logger.debug(
        `Partnership details created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating performance metrics for partner: ${partner.id}`);
      const performanceMetrics = await createB2BPerformanceMetrics(
        tx,
        partner.id,
        categorized["performanceMetrics"]
      );
      logger.debug(
        `Performance metrics created successfully for partner: ${partner.id}`
      );

      logger.debug(
        `Creating relationship management for partner: ${partner.id}`
      );
      const relationshipManagement = await createB2BRelationshipManagement(
        tx,
        partner.id,
        categorized["relationshipManagement"]
      );
      logger.debug(
        `Relationship management created successfully for partner: ${partner.id}`
      );

      logger.debug(`Creating system tracking for partner: ${partner.id}`);
      const systemTracking = await createB2BSystemTracking(
        tx,
        partner.id,
        categorized["systemTracking"]
      );
      logger.debug(
        `System tracking created successfully for partner: ${partner.id}`
      );

      data = {
        partner: {
          ...partner,
        },
        businessCapabilities: {
          ...businessCapabilities,
        },
        commissionStructure: {
          ...commissionStructure,
        },
        complianceDocumentation: {
          ...complianceDocumentation,
        },
        contactInfo: {
          ...contactInfo,
        },
        financialTracking: {
          ...financialTracking,
        },
        leadAttribution: {
          ...leadAttribution,
        },
        marketingPromotion: {
          ...marketingPromotion,
        },
        partnershipDetails: {
          ...partnershipDetails,
        },
        performanceMetrics: {
          ...performanceMetrics,
        },
        relationshipManagement: {
          ...relationshipManagement,
        },
        systemTracking: {
          ...systemTracking,
        },
      };

      return partner;
    });

    logger.debug(
      `B2B Partner creation transaction completed successfully`,
      result.id
    );

    sendResponse(res, 200, "B2B Partner created successfully", data);
  } catch (error) {
    logger.error(`Error creating B2B partner: ${error}`);
    next(error);
  }
};

export const deletePartner = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const partnerId = req.params.id;

    logger.debug(`Deleting B2B partner with id: ${partnerId}`);
    await deleteB2bPartner(+partnerId);
    logger.debug(`B2B partner deleted successfully`);

    sendResponse(res, 200, "Partner deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getB2bPartnerDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const partnerId = parseInt(req.params.id);

    logger.debug(`Fetching B2B partner details for id: ${partnerId}`);
    const partnerDetails = await getB2BPartner(partnerId);
    logger.debug(`Partner details fetched successfully`);

    sendResponse(
      res,
      200,
      "Partner details fetched successfully",
      partnerDetails
    );
  } catch (error) {
    next(error);
  }
};

export const updateB2bPartner = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const partnerId = parseInt(req.params.id);

    if (!req.body.partner_name && !req.body.registration_number) {
      return sendResponse(
        res,
        400,
        "Partner name and Registration number is required"
      );
    }

    logger.debug(`Mapping B2B partner fields for update`);
    const mappedFields = await mapAllB2BPartnerFields(req.body);

    logger.debug(`Categorizing B2B partner data for update`);
    const categorized = categorizeB2BByTable(mappedFields);

    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating B2B partner: ${partnerId}`);
      const partner = await updateB2BPartner(
        tx,
        partnerId,
        categorized["mainPartner"]
      );
      logger.debug(`Partner updated successfully with id: ${partner.id}`);

      logger.debug(`Updating business capabilities for partner: ${partner.id}`);
      await updateB2BBusinessCapabilities(
        tx,
        partnerId,
        categorized["businessCapabilities"]
      );

      logger.debug(`Updating commission structure for partner: ${partner.id}`);
      await updateB2BCommissionStructure(
        tx,
        partnerId,
        categorized["commissionStructure"]
      );

      logger.debug(
        `Updating compliance documentation for partner: ${partner.id}`
      );
      await updateB2BComplianceDocumentation(
        tx,
        partnerId,
        categorized["complianceDocumentation"]
      );

      logger.debug(`Updating contact info for partner: ${partner.id}`);
      await updateB2BContactInfo(tx, partnerId, categorized["contactInfo"]);

      logger.debug(`Updating financial tracking for partner: ${partner.id}`);
      await updateB2BFinancialTracking(
        tx,
        partnerId,
        categorized["financialTracking"]
      );

      logger.debug(`Updating lead attribution for partner: ${partner.id}`);
      await updateB2BLeadAttribution(
        tx,
        partnerId,
        categorized["leadAttribution"]
      );

      logger.debug(`Updating marketing promotion for partner: ${partner.id}`);
      await updateB2BMarketingPromotion(
        tx,
        partnerId,
        categorized["marketingPromotion"]
      );

      logger.debug(`Updating partnership details for partner: ${partner.id}`);
      await updateB2BPartnershipDetails(
        tx,
        partnerId,
        categorized["partnershipDetails"]
      );

      logger.debug(`Updating performance metrics for partner: ${partner.id}`);
      await updateB2BPerformanceMetrics(
        tx,
        partnerId,
        categorized["performanceMetrics"]
      );

      logger.debug(
        `Updating relationship management for partner: ${partner.id}`
      );
      await updateB2BRelationshipManagement(
        tx,
        partnerId,
        categorized["relationshipManagement"]
      );

      logger.debug(`Updating system tracking for partner: ${partner.id}`);
      await updateB2BSystemTracking(
        tx,
        partnerId,
        categorized["systemTracking"]
      );

      return partner;
    });

    sendResponse(res, 200, "B2B Partner updated successfully");
  } catch (error) {
    logger.error(`Error updating B2B partner: ${error}`);
    next(error);
  }
};

export const getB2bPartnersList = async (
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
      `Fetching B2B partners list with page: ${page}, size: ${size}, sortKey: ${sortKey}, sortDir: ${sortDir}, search: ${search}`
    );
    const { rows, count } = await fetchB2BPartnersList(
      size,
      offset,
      sortKey,
      sortDir,
      search
    );
    logger.debug(`B2B partners list fetched successfully. Count: ${count}`);

    sendResponse(res, 200, "Partners list fetched successfully", {
      data: rows,
      total: count,
      page,
      size,
    });
  } catch (error) {
    logger.error(`Error fetching B2B partners list: ${error}`);
    next(error);
  }
};

export const getLeadsByPartnerFieldsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = req.query;
    console.log("filters", filters);

    const leads = await getLeadsByDynamicFilters(filters);

    sendResponse(res, 200, "Leads fetched successfully", leads);
  } catch (error) {
    logger.error(`Error fetching contacts list: ${error}`);
    next(error);
  }
};
