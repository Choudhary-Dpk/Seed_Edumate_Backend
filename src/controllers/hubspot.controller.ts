import { NextFunction, Request, Response } from "express";
import * as hubspotService from "../services/hubspot.service";
import { ApiResponse } from "../types";
import { asyncHandler, createError } from "../middlewares/errorHandler";
import logger from "../utils/logger";
import { sendResponse } from "../utils/api";
import { getPartners, getUserRoles } from "../models/helpers/partners.helper";
import { getEdumateContactByEmail } from "../models/helpers/contact.helper";
import {
  createContact,
  updateContact,
} from "../services/DBServices/edumateContacts.service";
import { handleLeadCreation } from "../services/DBServices/loan.services";

// Edumate Contact Controllers
export const getEdumateContacts = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, after } = req.query;

    const result = await hubspotService.getEdumateContacts({
      limit: limit ? parseInt(limit as string) : undefined,
      after: after as string,
    });

    const response: ApiResponse = {
      success: true,
      data: result.contacts,
      meta: {
        total: result.contacts.length,
        hasNext: result.hasMore,
        ...(result.nextCursor && { nextCursor: result.nextCursor }),
      },
    };

    res.json(response);
  }
);

export const getEdumateContactById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const contact = await hubspotService.getEdumateContactById(id);

    if (!contact) {
      throw createError("Edumate contact not found", 404);
    }

    const response: ApiResponse = {
      success: true,
      data: contact,
    };

    res.json(response);
  }
);

export const createEdumateContact = asyncHandler(
  async (req: Request, res: Response) => {
    const contactData = req.body;

    const contact = await hubspotService.createEdumateContact(contactData);

    const response: ApiResponse = {
      success: true,
      data: contact,
      message: "Edumate contact created successfully",
    };

    res.status(201).json(response);
  }
);

export const updateEdumateContact = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const contactData = req.body;

    const contact = await hubspotService.updateEdumateContact(id, contactData);

    const response: ApiResponse = {
      success: true,
      data: contact,
      message: "Edumate contact updated successfully",
    };

    res.json(response);
  }
);

export const upsertEdumateContact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const contactData = req.body;
    const { email, formType } = contactData;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    try {
      logger.info("Upsert contact request", { email, formType });

      const existingContactDb = await getEdumateContactByEmail(email);
      let hubspotResult;
      let dbContact;
      let operationType: "update" | "create" = "create";

      // Case 1: Contact exists in DB with HubSpot ID - UPDATE both
      if (existingContactDb?.hs_object_id) {
        try {
          hubspotResult = await hubspotService.updateEdumateContact(
            existingContactDb.hs_object_id,
            contactData
          );
          operationType = "update";
        } catch (hubspotError) {
          logger.error("HubSpot update failed", {
            contactId: existingContactDb.hs_object_id,
            email,
            error: hubspotError,
          });
          hubspotResult = null;
        }

        dbContact = await updateContact(existingContactDb.id, contactData);

        logger.info("Edumate contact updated", {
          dbContactId: dbContact.id,
          hsContactId: existingContactDb.hs_object_id,
          email,
          hubspotSuccess: !!hubspotResult,
        });
      }
      // Case 2: Contact exists in DB but no HubSpot ID - CREATE in HubSpot, UPDATE DB
      else if (existingContactDb) {
        try {
          hubspotResult = await hubspotService.createEdumateContact(
            contactData
          );

          dbContact = await updateContact(existingContactDb.id, {
            ...contactData,
            hs_object_id: hubspotResult.id,
          });
          operationType = "create";

          logger.info(
            "HubSpot contact created and linked to existing DB contact",
            {
              dbContactId: dbContact.id,
              hsContactId: hubspotResult.id,
              email,
            }
          );
        } catch (hubspotError) {
          logger.error("HubSpot creation failed for existing DB contact", {
            dbContactId: existingContactDb.id,
            email,
            error: hubspotError,
          });

          dbContact = await updateContact(existingContactDb.id, contactData);
          operationType = "update";
          hubspotResult = null;
        }
      }
      // Case 3: Contact doesn't exist - CREATE both
      else {
        hubspotResult = await hubspotService.createEdumateContact(contactData);

        dbContact = await createContact({
          ...contactData,
          hs_object_id: hubspotResult.id,
        });
        operationType = "create";

        logger.info("New Edumate contact created", {
          dbContactId: dbContact.id,
          hsContactId: hubspotResult.id,
          email,
        });
      }

      // Handle form-specific lead creation
      if (dbContact?.id && formType) {
        await handleLeadCreation(dbContact.id, formType, email);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          contact: dbContact,
          hubspot: hubspotResult,
        },
        message: `Edumate contact ${operationType}d successfully`,
        meta: {
          operation: operationType,
        },
      };

      return res.status(operationType === "update" ? 200 : 201).json(response);
    } catch (error) {
      logger.error("Failed to upsert Edumate Contact", {
        email,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return next(error);
    }
  }
);

export const deleteEdumateContact = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await hubspotService.deleteEdumateContact(id);

    const response: ApiResponse = {
      success: true,
      message: "Edumate contact deleted successfully",
    };

    res.json(response);
  }
);

export const batchCreateEdumateContacts = asyncHandler(
  async (req: Request, res: Response) => {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw createError(
        "Contacts array is required and must not be empty",
        400
      );
    }

    const result = await hubspotService.batchCreateEdumateContacts(contacts);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Batch created ${result.success} contacts successfully. ${result.failed} failed.`,
    };

    res.status(201).json(response);
  }
);

export const batchUpdateEdumateContacts = asyncHandler(
  async (req: Request, res: Response) => {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      throw createError("Updates array is required and must not be empty", 400);
    }

    // Validate that each update has id and data
    for (const update of updates) {
      if (!update.id || !update.data) {
        throw createError("Each update must have an id and data property", 400);
      }
    }

    const result = await hubspotService.batchUpdateEdumateContacts(updates);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Batch updated ${result.success} contacts successfully. ${result.failed} failed.`,
    };

    res.json(response);
  }
);

export const searchEdumateContactsByEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query;

    const contacts = await hubspotService.searchEdumateContactsByEmail(
      email as string
    );

    const response: ApiResponse = {
      success: true,
      data: contacts,
      meta: {
        total: contacts.length,
      },
    };

    res.json(response);
  }
);

export const searchEdumateContactsByPhone = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone } = req.query;

    const contacts = await hubspotService.searchEdumateContactsByPhone(
      phone as string
    );

    const response: ApiResponse = {
      success: true,
      data: contacts,
      meta: {
        total: contacts.length,
      },
    };

    res.json(response);
  }
);

export const searchEdumateContactsByAdmissionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.query;

    const contacts =
      await hubspotService.searchEdumateContactsByAdmissionStatus(
        status as string
      );

    const response: ApiResponse = {
      success: true,
      data: contacts,
      meta: {
        total: contacts.length,
      },
    };

    res.json(response);
  }
);

export const searchEdumateContactsByStudyDestination = asyncHandler(
  async (req: Request, res: Response) => {
    const { destination } = req.query;

    const contacts =
      await hubspotService.searchEdumateContactsByStudyDestination(
        destination as string
      );

    const response: ApiResponse = {
      success: true,
      data: contacts,
      meta: {
        total: contacts.length,
      },
    };

    res.json(response);
  }
);

// Advanced search with multiple filters
export const advancedSearchEdumateContacts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      admissionStatus,
      studyDestination,
      educationLevel,
      priorityLevel,
      assignedCounselor,
      leadSource,
    } = req.query;

    // Build filter groups based on provided parameters
    const filters: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }> = [];

    if (admissionStatus) {
      filters.push({
        propertyName: "admission_status",
        operator: "EQ",
        value: admissionStatus as string,
      });
    }

    if (studyDestination) {
      filters.push({
        propertyName: "preferred_study_destination",
        operator: "EQ",
        value: studyDestination as string,
      });
    }

    if (educationLevel) {
      filters.push({
        propertyName: "current_education_level",
        operator: "EQ",
        value: educationLevel as string,
      });
    }

    if (priorityLevel) {
      filters.push({
        propertyName: "priority_level",
        operator: "EQ",
        value: priorityLevel as string,
      });
    }

    if (assignedCounselor) {
      filters.push({
        propertyName: "assigned_counselor",
        operator: "CONTAINS_TOKEN",
        value: assignedCounselor as string,
      });
    }

    if (leadSource) {
      filters.push({
        propertyName: "lead_source",
        operator: "EQ",
        value: leadSource as string,
      });
    }

    if (filters.length === 0) {
      throw createError("At least one search parameter is required", 400);
    }

    const firstFilter = filters[0];
    let contacts;

    switch (firstFilter.propertyName) {
      case "admission_status":
        contacts = await hubspotService.searchEdumateContactsByAdmissionStatus(
          firstFilter.value
        );
        break;
      case "preferred_study_destination":
        contacts = await hubspotService.searchEdumateContactsByStudyDestination(
          firstFilter.value
        );
        break;
      default:
        // For other properties, we'd need to implement generic search
        throw createError(
          "Search by this property is not yet implemented",
          501
        );
    }

    const response: ApiResponse = {
      success: true,
      data: contacts,
      meta: {
        total: contacts.length,
        //   searchCriteria: req.query
      },
    };

    res.json(response);
  }
);

export const getPartnerByEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    try {
      const existingEmail = await hubspotService.fetchPartnerByEmail(email);
      if (existingEmail.length > 0) {
        return sendResponse(res, 400, "Email already exists in Hubspot");
      }

      next();
    } catch (error) {
      logger.error("Failed to get partner email", {
        email,
        error,
      });
      next(error);
    }
  }
);