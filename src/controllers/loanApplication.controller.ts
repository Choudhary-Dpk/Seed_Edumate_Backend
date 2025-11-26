import { NextFunction, Response, Request } from "express";
import logger from "../utils/logger";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import { mapAllLoanApplicationFields } from "../mappers/loanApplication/loanApplicationMapping";
import { categorizeLoanApplicationByTable } from "../services/DBServices/loanApplication.service";
import prisma from "../config/prisma";
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
  getLeadViewList,
  getLoanApplication,
  getLoanList,
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

// import {
//   createApplicationStatus,
//   createFinancialRequirements,
//   createLender,
//   createLoan,
//   createSystemTracking,
//   deleteLoan,
//   getHubspotByLeadId,
//   getLeadViewList,
//   getLoanApplicationById,
//   getLoanList,
//   updateApplicationStatus,
//   updateFinancialRequirements,
//   updateLender,
//   updateLoan,
// } from "../models/helpers/loanApplication.helper";
// import {
//   createLoanLeads,
//   deleteHubspotByLeadId,
//   upateLoanLead,
// } from "../services/hubspot.service";
// import { resolveLeadsCsvPath } from "../utils/leads";
// import { getPartnerIdByUserId } from "../models/helpers/partners.helper";

// export const createLoanApplication = async (
//   req: RequestWithPayload<LoginPayload>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const {
//       applicationStatus,
//       loanAmountRequested,
//       loanAmountApproved,
//       loanTenureYears,
//       email,
//       name,
//     } = req.body;
//     const { id } = req.payload!;

//     logger.debug(`Creating hubspot loan application`);
//     const lead = await createLoanLeads([
//       {
//         email,
//         name,
//         applicationStatus,
//         loanAmountRequested,
//         loanAmountApproved,
//         loanTenureYears,
//       },
//     ]);
//     logger.debug(`Hubspot loan application created successfully`);

//     logger.debug(`Fetching partner id from request`);
//     const partnerId = await getPartnerIdByUserId(id);
//     logger.debug(`Partner id fetched successfully`);

//     logger.debug(`Creating loan application for userId: ${id}`);
//     const loan = await createLoan(
//       id,
//       email,
//       name,
//       partnerId!.b2b_id,
//       lead[0]?.id
//     );
//     logger.debug(
//       `Loan application created successfully in hubspot for userId: ${id} with loan ${loan.id}`
//     );

//     logger.debug(`Creating financial requirement for userId: ${id}`);
//     await createFinancialRequirements(
//       loan.id,
//       loanAmountRequested,
//       loanAmountApproved
//     );
//     logger.debug(
//       `Financial requirement created successfully for loanId: ${loan.id}`
//     );

//     logger.debug(`Creating Lender information for loanId: ${loan.id}`);
//     await createLender(loan.id, loanTenureYears);
//     logger.debug(
//       `Lender information created successfully for loanId: ${loan.id}`
//     );

//     logger.debug(`Creating application status for userId: ${id}`);
//     await createApplicationStatus(loan.id, applicationStatus);
//     logger.debug(
//       `Application status created successfully for loanId: ${loan.id}`
//     );

//     logger.debug(`Creating system tracking for useId: ${id}`);
//     await createSystemTracking(loan.id);
//     logger.debug(`System tracked successfully`);

//     sendResponse(res, 200, "Lead created successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// export const downloadTemplate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const filePath = resolveLeadsCsvPath("leads.csv");
//     console.log("filePath", filePath);
//     // Download as leads_template.csv
//     res.download(filePath, "leads_template.csv", (err) => {
//       if (err) return next(err);
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const editLoanApplication = async (
//   req: RequestWithPayload<LoginPayload>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const {
//       applicationStatus,
//       loanAmountRequested,
//       loanAmountApproved,
//       loanTenureYears,
//       email,
//       name,
//     } = req.body;
//     const { id } = req.payload!;
//     const leadId = req.params.id;

//     logger.debug(`Fethcing hubspot details by leadId: ${leadId}`);
//     const lead = await getHubspotByLeadId(+leadId);
//     logger.debug(`Hubspot details fetched successfully`);

//     logger.debug(`Updating hubspot loan application`);
//     await upateLoanLead(Number(lead?.hs_object_id), {
//       email,
//       name,
//       applicationStatus,
//       loanAmountRequested,
//       loanAmountApproved,
//       loanTenureYears,
//     });
//     logger.debug(`Hubspot loan application updated successfully`);

//     logger.debug(`Updating loan application for userId: ${id}`);
//     const loan = await updateLoan(id, +leadId, email, name);
//     logger.debug(
//       `Loan application updated successfully in hubspot for userId: ${id} with loan ${loan.id}`
//     );

//     logger.debug(`Updating financial requirement for userId: ${id}`);
//     await updateFinancialRequirements(
//       loan.id,
//       loanAmountRequested,
//       loanAmountApproved
//     );
//     logger.debug(
//       `Financial requirement updated successfully for loanId: ${loan.id}`
//     );

//     logger.debug(`Updating Lender information for loanId: ${loan.id}`);
//     await updateLender(loan.id, loanTenureYears);
//     logger.debug(
//       `Lender information updated successfully for loanId: ${loan.id}`
//     );

//     logger.debug(`Updating application status for userId: ${id}`);
//     await updateApplicationStatus(loan.id, applicationStatus);
//     logger.debug(
//       `Application status updated successfully for loanId: ${loan.id}`
//     );

//     sendResponse(res, 200, "Lead updated successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteLoanApplication = async (
//   req: RequestWithPayload<LoginPayload>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.payload!;
//     const leadId = req.params.id;

//     logger.debug(`Fethcing hubspot details by leadId: ${leadId}`);
//     const lead = await getHubspotByLeadId(+leadId);
//     logger.debug(`Hubspot details fetched successfully`);

//     logger.debug(
//       `Deleting hubspot loan application for id: ${lead?.hs_object_id}`
//     );
//     await deleteHubspotByLeadId(lead?.hs_object_id!);
//     logger.debug(`Hubspot loan application deleted successfully`);

//     logger.debug(`Deleting loan application for userId: ${id}`);
//     await deleteLoan(+leadId, id);
//     logger.debug(`Loan application deleted successfully`);

//     sendResponse(res, 200, "Lead deleted successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// export const getAdminLoanApplicationsList = async (
//   req: RequestWithPayload<LoginPayload>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.payload!;
//     console.log("req.query", req.query);
//     const size = Number(req.query.size) || 10;
//     const page = Number(req.query.page) || 1;
//     const search = (req.query.search as string) || null;
//     const sortKey = (req.query.sortKey as string) || null;
//     const sortDir = (req.query.sortDir as "asc" | "desc") || null;

//     // Extract filters from query params (filters is already an object)
//     const filtersFromQuery =
//       (req.query.filters as {
//         partner?: string;
//         lender?: string;
//         loanProduct?: string;
//         status?: string;
//       }) || {};

//     const filters = {
//       partner: filtersFromQuery.partner || null,
//       lender: filtersFromQuery.lender || null,
//       loanProduct: filtersFromQuery.loanProduct || null,
//       status: filtersFromQuery.status || null,
//     };

//     console.log("Parsed filters:", filters);

//     const offset = size * (page - 1);

//     // logger.debug(`Fetching partner id from request`);
//     // const partnerId = await getPartnerIdByUserId(id);
//     // logger.debug(`Partner id fetched successfully`);

//     logger.debug(`Fetching leads list with pagination and filters`, filters);
//     const list = await getLoanList(
//       size,
//       offset,
//       sortKey,
//       sortDir,
//       search,
//       filters
//     );
//     logger.debug(`Leads list fetched successfully`);

//     sendResponse(res, 200, "Leads list fetched successfully", {
//       total: list.count,
//       page,
//       size,
//       data: list.rows,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getLoanApplicationDetails = async (
//   req: RequestWithPayload<LoginPayload>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const leadId = req.params.id;

//     logger.debug(`Fetching lead details for id: ${leadId}`);
//     const loanApplicationDetails = await getLoanApplicationById(+leadId);
//     logger.debug(`Lead details fetched successfully`);

//     sendResponse(
//       res,
//       200,
//       "Lead details fetched successfully",
//       loanApplicationDetails
//     );
//   } catch (error) {
//     next(error);
//   }
// };

export const createLoanApplicationsController = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.payload!.id;

    logger.debug(`Mapping loan application fields`);
    const mappedFields = await mapAllLoanApplicationFields(req.body);
    console.log("mappedFields", mappedFields);

    logger.debug(`Categorizing loan application data`);
    const categorized = categorizeLoanApplicationByTable(mappedFields);
    console.log("categorized", categorized);

    let data: any = {};

    const result = await prisma.$transaction(
      async (tx: any) => {
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
        const documentManagement =
          await createLoanApplicationDocumentManagement(
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
        const processingTimeline =
          await createLoanApplicationProcessingTimeline(
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
      },

      {
        timeout: 180000,
      }
    );

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
    // const userId = req.payload!.id;
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
        categorized["systemTracking"]
        // userId
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

export const getLeadsViewList = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { id } = req.payload!;
    console.log("req.query", req.query);

    const size = Number(req.query.size) || 10;
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) || null;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;

    // Extract filters from query params
    const filtersFromQuery =
      (req.query.filters as {
        partner?: string;
        lender?: string;
        loanProduct?: string;
        status?: string;
      }) || {};

    const filters = {
      partner: filtersFromQuery.partner || null,
      lender: filtersFromQuery.lender || null,
      loanProduct: filtersFromQuery.loanProduct || null,
      status: filtersFromQuery.status || null,
    };

    console.log("Parsed filters:", filters);

    const offset = size * (page - 1);

    // logger.debug(`Fetching partner id from request`);
    // const partnerId = await getPartnerIdByUserId(id);
    // logger.debug(`Partner id fetched successfully`);

    logger.debug(
      `Fetching leads view list with pagination and filters`,
      filters
    );
    const list = await getLeadViewList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      filters
    );
    logger.debug(`Leads view list fetched successfully`);

    sendResponse(res, 200, "Leads list fetched successfully", {
      total: list.count,
      page,
      size,
      data: list.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getLoanApplicationsList = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    console.log("req.query", req.query);
    const size = Number(req.query.size) || 10;
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) || null;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;

    // Extract filters from query params (filters is already an object)
    const filtersFromQuery =
      (req.query.filters as {
        partner?: string;
        lender?: string;
        loanProduct?: string;
        status?: string;
        applicationStatus?: string;
      }) || {};

    const filters = {
      partner: filtersFromQuery.partner || null,
      lender: filtersFromQuery.lender || null,
      loanProduct: filtersFromQuery.loanProduct || null,
      status: filtersFromQuery.status || null,
      applicationStatus: filtersFromQuery.applicationStatus || null,
    };

    console.log("Parsed filters:", filters);

    const offset = size * (page - 1);

    // logger.debug(`Fetching partner id from request`);
    // const partnerId = await getPartnerIdByUserId(id);
    // logger.debug(`Partner id fetched successfully`);

    logger.debug(`Fetching leads list with pagination and filters`, filters);
    const list = await getLoanList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      filters
    );
    logger.debug(`Leads list fetched successfully`);

    sendResponse(res, 200, "Leads list fetched successfully", {
      total: list.count,
      page,
      size,
      data: list.rows,
    });
  } catch (error) {
    next(error);
  }
};
