// src/controllers/hubspotController.ts
import { Request, Response } from 'express';
import * as hubspotService from '../services/hubspot.service';
import { ApiResponse } from '../types';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import logger from '../utils/looger';

// Standard HubSpot Objects Controllers

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const { limit, after } = req.query;
  
  const result = await hubspotService.getContacts({
    limit: limit ? parseInt(limit as string) : undefined,
    after: after as string
  });

  const response: ApiResponse = {
    success: true,
    data: result.contacts,
    meta: {
      total: result.contacts.length,
      hasNext: result.hasMore,
      ...(result.nextCursor && { nextCursor: result.nextCursor })
    }
  };

  res.json(response);
});

export const getContactById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const contact = await hubspotService.getContactById(id);
  
  if (!contact) {
    throw createError('Contact not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    data: contact
  };

  res.json(response);
});

export const searchContactsByEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;
  
  const contacts = await hubspotService.searchContactsByEmail(email as string);

  const response: ApiResponse = {
    success: true,
    data: contacts,
    meta: {
      total: contacts.length
    }
  };

  res.json(response);
});

export const getCompanies = asyncHandler(async (req: Request, res: Response) => {
  const { limit, after } = req.query;
  
  const result = await hubspotService.getCompanies({
    limit: limit ? parseInt(limit as string) : undefined,
    after: after as string
  });

  const response: ApiResponse = {
    success: true,
    data: result.companies,
    meta: {
      total: result.companies.length,
      hasNext: result.hasMore,
      ...(result.nextCursor && { nextCursor: result.nextCursor })
    }
  };

  res.json(response);
});

export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const company = await hubspotService.getCompanyById(id);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    data: company
  };

  res.json(response);
});

export const getDeals = asyncHandler(async (req: Request, res: Response) => {
  const { limit, after } = req.query;
  
  const result = await hubspotService.getDeals({
    limit: limit ? parseInt(limit as string) : undefined,
    after: after as string
  });

  const response: ApiResponse = {
    success: true,
    data: result.deals,
    meta: {
      total: result.deals.length,
      hasNext: result.hasMore,
      ...(result.nextCursor && { nextCursor: result.nextCursor })
    }
  };

  res.json(response);
});

export const getDealById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const deal = await hubspotService.getDealById(id);
  
  if (!deal) {
    throw createError('Deal not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    data: deal
  };

  res.json(response);
});

// Edumate Contact Controllers

export const getEdumateContacts = asyncHandler(async (req: Request, res: Response) => {
  const { limit, after } = req.query;
  
  const result = await hubspotService.getEdumateContacts({
    limit: limit ? parseInt(limit as string) : undefined,
    after: after as string
  });

  const response: ApiResponse = {
    success: true,
    data: result.contacts,
    meta: {
      total: result.contacts.length,
      hasNext: result.hasMore,
      ...(result.nextCursor && { nextCursor: result.nextCursor })
    }
  };

  res.json(response);
});

export const getEdumateContactById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const contact = await hubspotService.getEdumateContactById(id);
  
  if (!contact) {
    throw createError('Edumate contact not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    data: contact
  };

  res.json(response);
});

export const createEdumateContact = asyncHandler(async (req: Request, res: Response) => {
  const contactData = req.body;
  
  const contact = await hubspotService.createEdumateContact(contactData);

  const response: ApiResponse = {
    success: true,
    data: contact,
    message: 'Edumate contact created successfully'
  };

  res.status(201).json(response);
});

export const updateEdumateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contactData = req.body;
  
  const contact = await hubspotService.updateEdumateContact(id, contactData);

  const response: ApiResponse = {
    success: true,
    data: contact,
    message: 'Edumate contact updated successfully'
  };

  res.json(response);
});

export const upsertEdumateContact = asyncHandler(async (req: Request, res: Response) => {
  const contactData = req.body;
  
  // Validate that email is provided
  if (!contactData.email) {
    throw createError('Email is required.', 400);
  }

  try {
    // Step 1: Check if contact exists by email
    const existingContacts = await hubspotService.searchEdumateContactsByEmail(contactData.email);
    
    let result;
    let isUpdate = false;
    
    if (existingContacts.length > 0) {
      // Step 2: Contact exists - update the first match
      const existingContact = existingContacts[0];
      result = await hubspotService.updateEdumateContact(existingContact.id, contactData);
      isUpdate = true;
      
      logger.info('Updated existing Edumate contact', { 
        contactId: existingContact.id, 
        email: contactData.email 
      });
    } else {
      // Step 3: Contact doesn't exist - create new one
      result = await hubspotService.createEdumateContact(contactData);
      isUpdate = false;
      
      logger.info('Created new Edumate contact', { 
        contactId: result.id, 
        email: contactData.email 
      });
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      message: isUpdate 
        ? 'Edumate contact updated successfully' 
        : 'Edumate contact created successfully',
      meta: {
        operation: isUpdate ? 'update' : 'create',
      }
    };

    // Return 200 for updates, 201 for creates
    const statusCode = isUpdate ? 200 : 201;
    res.status(statusCode).json(response);

  } catch (error) {
    logger.error('Error in upsertEdumateContact', { 
      email: contactData.email, 
      error 
    });
    throw error; // Re-throw to be handled by asyncHandler
  }
});

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