// src/services/hubspotClient.ts
import { Client } from '@hubspot/api-client';
import { 
  SimplePublicObjectInputForCreate,
  BatchInputSimplePublicObjectInputForCreate,
  PublicObjectSearchRequest,
  SimplePublicObject
} from '@hubspot/api-client/lib/codegen/crm/objects';
import { config } from '../config/config';
import { logger } from '../utils/looger';
import { 
  HubSpotContact, 
  HubSpotCompany, 
  HubSpotDeal,
  HubSpotEdumateContact,
  HubSpotPaginatedResponse,
  HubSpotError
} from '../types';

// Initialize HubSpot client
const hubspotClient = new Client({ accessToken: config.hubspot.accessToken });
const EDUMATE_CONTACT_OBJECT_TYPE = config.hubspot.customObjects.edumateContact;

/**
 * Convert HubSpot SDK response to our internal type format
 */
const convertToHubSpotResponse = <T>(response: any): HubSpotPaginatedResponse<T> => {
  return {
    results: response.results.map((item: SimplePublicObject) => convertToHubSpotObject<T>(item)),
    paging: response.paging,
    total: response.total
  };
};

/**
 * Convert single HubSpot object to our internal type format
 */
const convertToHubSpotObject = <T>(item: SimplePublicObject): T => {
  return {
    id: item.id,
    properties: item.properties || {},
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    archived: item.archived || false
  } as T;
};

/**
 * Handle HubSpot API errors
 */
const handleHubSpotError = (error: any): Error => {
  // Handle HubSpot API response errors
  if (error.response?.body) {
    const hubspotError = error.response.body as HubSpotError;
    return new Error(`HubSpot API Error: ${hubspotError.message} (${hubspotError.status})`);
  }

  // Handle HubSpot SDK errors
  if (error.body) {
    const hubspotError = error.body as HubSpotError;
    return new Error(`HubSpot API Error: ${hubspotError.message} (${hubspotError.status})`);
  }

  // Handle HTTP errors
  if (error.status) {
    return new Error(`HubSpot API Error: HTTP ${error.status} - ${error.message || 'Unknown error'}`);
  }

  // Handle network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new Error('HubSpot API Error: Network connection failed');
  }

  // Handle timeout errors
  if (error.code === 'ETIMEDOUT') {
    return new Error('HubSpot API Error: Request timeout');
  }

  // Default error handling
  return error instanceof Error ? error : new Error('Unknown HubSpot API error');
};

// Contact methods
export const getContacts = async (options: {
  limit?: number;
  after?: string;
  properties?: string[];
} = {}): Promise<HubSpotPaginatedResponse<HubSpotContact>> => {
  try {
    const { limit = 100, after, properties } = options;
    
    const response = await hubspotClient.crm.contacts.basicApi.getPage(
      limit,
      after,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved contacts from HubSpot', { 
      count: response.results.length,
      hasMore: !!response.paging?.next
    });

    return convertToHubSpotResponse<HubSpotContact>(response);
  } catch (error) {
    logger.error('Error retrieving contacts from HubSpot', { error });
    throw handleHubSpotError(error);
  }
};

export const getContactById = async (contactId: string, properties?: string[]): Promise<HubSpotContact> => {
  try {
    const response = await hubspotClient.crm.contacts.basicApi.getById(
      contactId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved contact by ID from HubSpot', { contactId });
    return convertToHubSpotObject<HubSpotContact>(response);
  } catch (error) {
    logger.error('Error retrieving contact by ID from HubSpot', { contactId, error });
    throw handleHubSpotError(error);
  }
};

export const searchContacts = async (searchRequest: PublicObjectSearchRequest): Promise<HubSpotPaginatedResponse<HubSpotContact>> => {
  try {
    const response = await hubspotClient.crm.contacts.searchApi.doSearch(searchRequest);
    
    logger.debug('Searched contacts in HubSpot', { 
      resultsCount: response.results.length,
      hasMore: !!response.paging?.next
    });

    return convertToHubSpotResponse<HubSpotContact>(response);
  } catch (error) {
    logger.error('Error searching contacts in HubSpot', { searchRequest, error });
    throw handleHubSpotError(error);
  }
};

// Company methods
export const getCompanies = async (options: {
  limit?: number;
  after?: string;
  properties?: string[];
} = {}): Promise<HubSpotPaginatedResponse<HubSpotCompany>> => {
  try {
    const { limit = 100, after, properties } = options;
    
    const response = await hubspotClient.crm.companies.basicApi.getPage(
      limit,
      after,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved companies from HubSpot', { 
      count: response.results.length,
      hasMore: !!response.paging?.next
    });

    return convertToHubSpotResponse<HubSpotCompany>(response);
  } catch (error) {
    logger.error('Error retrieving companies from HubSpot', { error });
    throw handleHubSpotError(error);
  }
};

export const getCompanyById = async (companyId: string, properties?: string[]): Promise<HubSpotCompany> => {
  try {
    const response = await hubspotClient.crm.companies.basicApi.getById(
      companyId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved company by ID from HubSpot', { companyId });
    return convertToHubSpotObject<HubSpotCompany>(response);
  } catch (error) {
    logger.error('Error retrieving company by ID from HubSpot', { companyId, error });
    throw handleHubSpotError(error);
  }
};

// Deal methods
export const getDeals = async (options: {
  limit?: number;
  after?: string;
  properties?: string[];
} = {}): Promise<HubSpotPaginatedResponse<HubSpotDeal>> => {
  try {
    const { limit = 100, after, properties } = options;
    
    const response = await hubspotClient.crm.deals.basicApi.getPage(
      limit,
      after,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved deals from HubSpot', { 
      count: response.results.length,
      hasMore: !!response.paging?.next
    });

    return convertToHubSpotResponse<HubSpotDeal>(response);
  } catch (error) {
    logger.error('Error retrieving deals from HubSpot', { error });
    throw handleHubSpotError(error);
  }
};

export const getDealById = async (dealId: string, properties?: string[]): Promise<HubSpotDeal> => {
  try {
    const response = await hubspotClient.crm.deals.basicApi.getById(
      dealId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved deal by ID from HubSpot', { dealId });
    return convertToHubSpotObject<HubSpotDeal>(response);
  } catch (error) {
    logger.error('Error retrieving deal by ID from HubSpot', { dealId, error });
    throw handleHubSpotError(error);
  }
};

// Edumate Contact Custom Object methods
export const getEdumateContacts = async (options: {
  limit?: number;
  after?: string;
  properties?: string[];
} = {}): Promise<HubSpotPaginatedResponse<HubSpotEdumateContact>> => {
  try {
    const { limit = 100, after, properties } = options;
    
    const response = await hubspotClient.crm.objects.basicApi.getPage(
      EDUMATE_CONTACT_OBJECT_TYPE,
      limit,
      after,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved Edumate contacts from HubSpot', { 
      count: response.results.length,
      hasMore: !!response.paging?.next
    });

    return convertToHubSpotResponse<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error('Error retrieving Edumate contacts from HubSpot', { error });
    throw handleHubSpotError(error);
  }
};

export const getEdumateContactById = async (contactId: string, properties?: string[]): Promise<HubSpotEdumateContact> => {
  try {
    const response = await hubspotClient.crm.objects.basicApi.getById(
      EDUMATE_CONTACT_OBJECT_TYPE,
      contactId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug('Retrieved Edumate contact by ID from HubSpot', { contactId });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error('Error retrieving Edumate contact by ID from HubSpot', { contactId, error });
    throw handleHubSpotError(error);
  }
};

export const createEdumateContact = async (properties: Record<string, any>): Promise<HubSpotEdumateContact> => {
  try {
    const createInput: SimplePublicObjectInputForCreate = {
      properties,
      associations: []
    };

    const response = await hubspotClient.crm.objects.basicApi.create(
      EDUMATE_CONTACT_OBJECT_TYPE,
      createInput
    );

    logger.info('Created Edumate contact in HubSpot', { contactId: response.id });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error('Error creating Edumate contact in HubSpot', { properties, error });
    throw handleHubSpotError(error);
  }
};

export const updateEdumateContact = async (contactId: string, properties: Record<string, any>): Promise<HubSpotEdumateContact> => {
  try {
    const updateInput = {
      properties
    };

    const response = await hubspotClient.crm.objects.basicApi.update(
      EDUMATE_CONTACT_OBJECT_TYPE,
      contactId,
      updateInput
    );

    logger.info('Updated Edumate contact in HubSpot', { contactId });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error('Error updating Edumate contact in HubSpot', { contactId, properties, error });
    throw handleHubSpotError(error);
  }
};

export const deleteEdumateContact = async (contactId: string): Promise<void> => {
  try {
    await hubspotClient.crm.objects.basicApi.archive(
      EDUMATE_CONTACT_OBJECT_TYPE,
      contactId
    );

    logger.info('Deleted Edumate contact from HubSpot', { contactId });
  } catch (error) {
    logger.error('Error deleting Edumate contact from HubSpot', { contactId, error });
    throw handleHubSpotError(error);
  }
};

export const searchEdumateContacts = async (searchRequest: PublicObjectSearchRequest): Promise<HubSpotPaginatedResponse<HubSpotEdumateContact>> => {
  try {
    const response = await hubspotClient.crm.objects.searchApi.doSearch(
      EDUMATE_CONTACT_OBJECT_TYPE,
      searchRequest
    );
    
    logger.debug('Searched Edumate contacts in HubSpot', { 
      resultsCount: response.results.length,
      hasMore: !!response.paging?.next
    });

    return convertToHubSpotResponse<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error('Error searching Edumate contacts in HubSpot', { searchRequest, error });
    throw handleHubSpotError(error);
  }
};

export const batchCreateEdumateContacts = async (contactsData: Record<string, any>[]): Promise<any> => {
  try {
    const batchInput: BatchInputSimplePublicObjectInputForCreate = {
      inputs: contactsData.map(properties => ({
        properties,
        associations: []
      }))
    };

    const response = await hubspotClient.crm.objects.batchApi.create(
      EDUMATE_CONTACT_OBJECT_TYPE,
      batchInput
    );

    logger.info('Batch created Edumate contacts in HubSpot', { 
      count: contactsData.length,
      successCount: response.results?.length || 0
    });

    return response;
  } catch (error) {
    logger.error('Error batch creating Edumate contacts in HubSpot', { count: contactsData.length, error });
    throw handleHubSpotError(error);
  }
};

export const batchUpdateEdumateContacts = async (updates: Array<{ id: string; properties: Record<string, any> }>): Promise<any> => {
  try {
    const batchInput = {
      inputs: updates.map(update => ({
        id: update.id,
        properties: update.properties
      }))
    };

    const response = await hubspotClient.crm.objects.batchApi.update(
      EDUMATE_CONTACT_OBJECT_TYPE,
      batchInput
    );

    logger.info('Batch updated Edumate contacts in HubSpot', { 
      count: updates.length,
      successCount: response.results?.length || 0
    });

    return response;
  } catch (error) {
    logger.error('Error batch updating Edumate contacts in HubSpot', { count: updates.length, error });
    throw handleHubSpotError(error);
  }
};

// Helper function to create search requests
export const createSearchRequest = (filters: any, options: any): PublicObjectSearchRequest => {
  return {
    filterGroups: [{
      filters: filters
    }],
    properties: options?.properties || [], // Default to empty array
    sorts: options?.sorts || [],
    limit: options?.limit || 10,
    after: options?.after || undefined
  };
};