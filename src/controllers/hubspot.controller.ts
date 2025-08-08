// src/controllers/hubspotController.ts
import { NextFunction, Request, Response } from "express";
import * as hubspotService from "../services/hubspot.service";
import { ApiResponse } from "../types";
import { asyncHandler, createError } from "../middlewares/errorHandler";
import logger from "../utils/logger";

// Standard HubSpot Objects Controllers

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const { limit, after } = req.query;

  const result = await hubspotService.getContacts({
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
});

export const getContactById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const contact = await hubspotService.getContactById(id);

    if (!contact) {
      throw createError("Contact not found", 404);
    }

    const response: ApiResponse = {
      success: true,
      data: contact,
    };

    res.json(response);
  }
);

export const searchContactsByEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query;

    const contacts = await hubspotService.searchContactsByEmail(
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

export const getContactOwnerByPhone = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone } = req.query;

    if (!phone) {
      throw createError("Phone number is required", 400);
    }

    const ownerInfo = await hubspotService.getContactOwnerByPhone(
      phone as string
    );

    if (!ownerInfo) {
      throw createError("Contact not found or no owner assigned", 404);
    }

    const response: ApiResponse = {
      success: true,
      data: ownerInfo,
      meta: {
        operation: `Searched by phone number - ${phone}`,
      },
    };

    res.json(response);
  }
);

export const getCompanies = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, after } = req.query;

    const result = await hubspotService.getCompanies({
      limit: limit ? parseInt(limit as string) : undefined,
      after: after as string,
    });

    const response: ApiResponse = {
      success: true,
      data: result.companies,
      meta: {
        total: result.companies.length,
        hasNext: result.hasMore,
        ...(result.nextCursor && { nextCursor: result.nextCursor }),
      },
    };

    res.json(response);
  }
);

export const getCompanyById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const company = await hubspotService.getCompanyById(id);

    if (!company) {
      throw createError("Company not found", 404);
    }

    const response: ApiResponse = {
      success: true,
      data: company,
    };

    res.json(response);
  }
);

export const getDeals = asyncHandler(async (req: Request, res: Response) => {
  const { limit, after } = req.query;

  const result = await hubspotService.getDeals({
    limit: limit ? parseInt(limit as string) : undefined,
    after: after as string,
  });

  const response: ApiResponse = {
    success: true,
    data: result.deals,
    meta: {
      total: result.deals.length,
      hasNext: result.hasMore,
      ...(result.nextCursor && { nextCursor: result.nextCursor }),
    },
  };

  res.json(response);
});

export const getDealById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deal = await hubspotService.getDealById(id);

  if (!deal) {
    throw createError("Deal not found", 404);
  }

  const response: ApiResponse = {
    success: true,
    data: deal,
  };

  res.json(response);
});

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
    const { email } = contactData;

    try {
      throw Error("trying some new things...");
      const existingContacts =
        await hubspotService.searchEdumateContactsByEmail(email);

      let result;
      let operationType: "update" | "create";

      if (existingContacts.length > 0) {
        const existingContact = existingContacts[0];
        result = await hubspotService.updateEdumateContact(
          existingContact.id,
          contactData
        );
        operationType = "update";
        logger.info("Edumate contact updated successfully", {
          contactId: existingContact.id,
          email,
        });
      } else {
        result = await hubspotService.createEdumateContact(contactData);
        operationType = "create";
        logger.info("Edumate contact created successfully", {
          contactId: result.id,
          email,
        });
      }

      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Edumate contact ${operationType}d successfully`,
        meta: { operation: operationType },
      };

      res.status(operationType === "update" ? 200 : 201).json(response);
    } catch (error) {
      logger.error("Failed to upsert Edumate Contact", {
        email,
        error,
      });
      next(error);
    }
  }
);

export const deleteEdumateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await hubspotService.deleteEdumateContact(id);

  const response: ApiResponse = {
    success: true,
    message: 'Edumate contact deleted successfully'
  };

  res.json(response);
});

export const batchCreateEdumateContacts = asyncHandler(async (req: Request, res: Response) => {
  const { contacts } = req.body;
  
  if (!Array.isArray(contacts) || contacts.length === 0) {
    throw createError('Contacts array is required and must not be empty', 400);
  }

  const result = await hubspotService.batchCreateEdumateContacts(contacts);

  const response: ApiResponse = {
    success: true,
    data: result,
    message: `Batch created ${result.success} contacts successfully. ${result.failed} failed.`
  };

  res.status(201).json(response);
});

export const batchUpdateEdumateContacts = asyncHandler(async (req: Request, res: Response) => {
  const { updates } = req.body;
  
  if (!Array.isArray(updates) || updates.length === 0) {
    throw createError('Updates array is required and must not be empty', 400);
  }

  // Validate that each update has id and data
  for (const update of updates) {
    if (!update.id || !update.data) {
      throw createError('Each update must have an id and data property', 400);
    }
  }

  const result = await hubspotService.batchUpdateEdumateContacts(updates);

  const response: ApiResponse = {
    success: true,
    data: result,
    message: `Batch updated ${result.success} contacts successfully. ${result.failed} failed.`
  };

  res.json(response);
});

export const searchEdumateContactsByEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;
  
  const contacts = await hubspotService.searchEdumateContactsByEmail(email as string);

  const response: ApiResponse = {
    success: true,
    data: contacts,
    meta: {
      total: contacts.length
    }
  };

  res.json(response);
});

export const searchEdumateContactsByPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.query;
  
  const contacts = await hubspotService.searchEdumateContactsByPhone(phone as string);

  const response: ApiResponse = {
    success: true,
    data: contacts,
    meta: {
      total: contacts.length
    }
  };

  res.json(response);
});

export const searchEdumateContactsByAdmissionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  
  const contacts = await hubspotService.searchEdumateContactsByAdmissionStatus(status as string);

  const response: ApiResponse = {
    success: true,
    data: contacts,
    meta: {
      total: contacts.length
    }
  };

  res.json(response);
});

export const searchEdumateContactsByStudyDestination = asyncHandler(async (req: Request, res: Response) => {
  const { destination } = req.query;
  
  const contacts = await hubspotService.searchEdumateContactsByStudyDestination(destination as string);

  const response: ApiResponse = {
    success: true,
    data: contacts,
    meta: {
      total: contacts.length
    }
  };

  res.json(response);
});

// Advanced search with multiple filters
export const advancedSearchEdumateContacts = asyncHandler(async (req: Request, res: Response) => {
  const { 
    admissionStatus,
    studyDestination,
    educationLevel,
    priorityLevel,
    assignedCounselor,
    leadSource
  } = req.query;

  // Build filter groups based on provided parameters
  const filters: Array<{
    propertyName: string;
    operator: string;
    value: string;
  }> = [];
  
  if (admissionStatus) {
    filters.push({
      propertyName: 'admission_status',
      operator: 'EQ',
      value: admissionStatus as string
    });
  }
  
  if (studyDestination) {
    filters.push({
      propertyName: 'preferred_study_destination',
      operator: 'EQ',
      value: studyDestination as string
    });
  }
  
  if (educationLevel) {
    filters.push({
      propertyName: 'current_education_level',
      operator: 'EQ',
      value: educationLevel as string
    });
  }
  
  if (priorityLevel) {
    filters.push({
      propertyName: 'priority_level',
      operator: 'EQ',
      value: priorityLevel as string
    });
  }
  
  if (assignedCounselor) {
    filters.push({
      propertyName: 'assigned_counselor',
      operator: 'CONTAINS_TOKEN',
      value: assignedCounselor as string
    });
  }
  
  if (leadSource) {
    filters.push({
      propertyName: 'lead_source',
      operator: 'EQ',
      value: leadSource as string
    });
  }

  if (filters.length === 0) {
    throw createError('At least one search parameter is required', 400);
  }

  // For now, we'll use the first filter as an example
  // In a real implementation, you'd want to build a proper multi-filter search
  const firstFilter = filters[0];
  let contacts;

  switch (firstFilter.propertyName) {
    case 'admission_status':
      contacts = await hubspotService.searchEdumateContactsByAdmissionStatus(firstFilter.value);
      break;
    case 'preferred_study_destination':
      contacts = await hubspotService.searchEdumateContactsByStudyDestination(firstFilter.value);
      break;
    default:
      // For other properties, we'd need to implement generic search
      throw createError('Search by this property is not yet implemented', 501);
  }

  const response: ApiResponse = {
    success: true,
    data: contacts,
    meta: {
      total: contacts.length,
    //   searchCriteria: req.query
    }
  };

  res.json(response);
});