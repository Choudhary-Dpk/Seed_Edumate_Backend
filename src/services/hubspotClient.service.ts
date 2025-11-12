// src/services/hubspotClient.ts
import { Client } from '@hubspot/api-client';
import { 
  SimplePublicObjectInputForCreate,
  BatchInputSimplePublicObjectInputForCreate,
  PublicObjectSearchRequest,
  SimplePublicObject
} from '@hubspot/api-client/lib/codegen/crm/objects';
import { config } from '../config/config';
import { logger } from "../utils/logger";
import { 
  HubSpotContact, 
  HubSpotCompany, 
  HubSpotDeal,
  HubSpotEdumateContact,
  HubSpotPaginatedResponse,
  HubSpotError,
  HubSpotOwner
} from '../types';

// Initialize HubSpot client
const hubspotClient = new Client({ accessToken: config.hubspot.accessToken });
const B2B_PARTNER_LEAD_ASSOCIATION = config.hubspot.associations?.edumateContactToB2BPartner;
const EDUMATE_CONTACT_OBJECT_TYPE = config.hubspot.customObjects.edumateContact;
const EDUMATE_B2B_PARTNERS_OBJECT_TYPE =
  config.hubspot.customObjects.b2bPartners || "2-46227624";
const EDUMATE_LOAN_APPLICATIONS_OBJECT_TYPE =
  config.hubspot.customObjects.loanApplication || "2-46227735";

/**
 * Convert HubSpot SDK response to our internal type format
 */
const convertToHubSpotResponse = <T>(
  response: any
): HubSpotPaginatedResponse<T> => {
  return {
    results: response.results.map((item: SimplePublicObject) =>
      convertToHubSpotObject<T>(item)
    ),
    paging: response.paging,
    total: response.total,
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
    archived: item.archived || false,
  } as T;
};

/**
 * Handle HubSpot API errors
 */
export const handleHubSpotError = (error: any): Error => {
  // Handle HubSpot API response errors
  if (error.response?.body) {
    const hubspotError = error.response.body as HubSpotError;
    return new Error(
      `HubSpot API Error: ${hubspotError.message} (${hubspotError.status})`
    );
  }

  // Handle HubSpot SDK errors
  if (error.body) {
    const hubspotError = error.body as HubSpotError;
    return new Error(
      `HubSpot API Error: ${hubspotError.message} (${hubspotError.status})`
    );
  }

  // Handle HTTP errors
  if (error.status) {
    return new Error(
      `HubSpot API Error: HTTP ${error.status} - ${
        error.message || "Unknown error"
      }`
    );
  }

  // Handle network errors
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    return new Error("HubSpot API Error: Network connection failed");
  }

  // Handle timeout errors
  if (error.code === "ETIMEDOUT") {
    return new Error("HubSpot API Error: Request timeout");
  }

  // Default error handling
  return error instanceof Error
    ? error
    : new Error("Unknown HubSpot API error");
};

// Contact methods
export const getContacts = async (
  options: {
    limit?: number;
    after?: string;
    properties?: string[];
  } = {}
): Promise<HubSpotPaginatedResponse<HubSpotContact>> => {
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

    logger.debug("Retrieved contacts from HubSpot", {
      count: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotContact>(response);
  } catch (error) {
    logger.error("Error retrieving contacts from HubSpot", { error });
    throw handleHubSpotError(error);
  }
};

export const getContactById = async (
  contactId: string,
  properties?: string[]
): Promise<HubSpotContact> => {
  try {
    const response = await hubspotClient.crm.contacts.basicApi.getById(
      contactId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug("Retrieved contact by ID from HubSpot", { contactId });
    return convertToHubSpotObject<HubSpotContact>(response);
  } catch (error) {
    logger.error("Error retrieving contact by ID from HubSpot", {
      contactId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const getOwnerById = async (
  ownerId: number
): Promise<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
} | null> => {
  try {
    const response = await hubspotClient.crm.owners.ownersApi.getById(ownerId);

    logger.debug("Retrieved owner by ID from HubSpot", { ownerId });

    return {
      id: response?.id,
      email: response?.email || "",
      firstName: response?.firstName || "",
      lastName: response?.lastName || "",
    };
  } catch (error) {
    logger.error("Error retrieving owner by ID from HubSpot", {
      ownerId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const searchContacts = async (
  searchRequest: PublicObjectSearchRequest
): Promise<HubSpotPaginatedResponse<HubSpotContact>> => {
  try {
    const response = await hubspotClient.crm.contacts.searchApi.doSearch(
      searchRequest
    );

    logger.debug("Searched contacts in HubSpot", {
      resultsCount: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotContact>(response);
  } catch (error) {
    logger.error("Error searching contacts in HubSpot", {
      searchRequest,
      error,
    });
    throw handleHubSpotError(error);
  }
};

// Company methods
export const getCompanies = async (
  options: {
    limit?: number;
    after?: string;
    properties?: string[];
  } = {}
): Promise<HubSpotPaginatedResponse<HubSpotCompany>> => {
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

    logger.debug("Retrieved companies from HubSpot", {
      count: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotCompany>(response);
  } catch (error) {
    logger.error("Error retrieving companies from HubSpot", { error });
    throw handleHubSpotError(error);
  }
};

export const getCompanyById = async (
  companyId: string,
  properties?: string[]
): Promise<HubSpotCompany> => {
  try {
    const response = await hubspotClient.crm.companies.basicApi.getById(
      companyId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug("Retrieved company by ID from HubSpot", { companyId });
    return convertToHubSpotObject<HubSpotCompany>(response);
  } catch (error) {
    logger.error("Error retrieving company by ID from HubSpot", {
      companyId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

// Deal methods
export const getDeals = async (
  options: {
    limit?: number;
    after?: string;
    properties?: string[];
  } = {}
): Promise<HubSpotPaginatedResponse<HubSpotDeal>> => {
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

    logger.debug("Retrieved deals from HubSpot", {
      count: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotDeal>(response);
  } catch (error) {
    logger.error("Error retrieving deals from HubSpot", { error });
    throw handleHubSpotError(error);
  }
};

export const getDealById = async (
  dealId: string,
  properties?: string[]
): Promise<HubSpotDeal> => {
  try {
    const response = await hubspotClient.crm.deals.basicApi.getById(
      dealId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug("Retrieved deal by ID from HubSpot", { dealId });
    return convertToHubSpotObject<HubSpotDeal>(response);
  } catch (error) {
    logger.error("Error retrieving deal by ID from HubSpot", { dealId, error });
    throw handleHubSpotError(error);
  }
};

// Edumate Contact Custom Object methods
export const getEdumateContacts = async (
  options: {
    limit?: number;
    after?: string;
    properties?: string[];
  } = {}
): Promise<HubSpotPaginatedResponse<HubSpotEdumateContact>> => {
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

    logger.debug("Retrieved Edumate contacts from HubSpot", {
      count: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error retrieving Edumate contacts from HubSpot", { error });
    throw handleHubSpotError(error);
  }
};

export const getEdumateContactById = async (
  contactId: string,
  properties?: string[]
): Promise<HubSpotEdumateContact> => {
  try {
    const response = await hubspotClient.crm.objects.basicApi.getById(
      EDUMATE_CONTACT_OBJECT_TYPE,
      contactId,
      properties,
      undefined,
      undefined,
      false
    );

    logger.debug("Retrieved Edumate contact by ID from HubSpot", { contactId });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error retrieving Edumate contact by ID from HubSpot", {
      contactId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const createEdumateContact = async (
  properties: Record<string, any>
): Promise<HubSpotEdumateContact> => {
  try {
    const createInput: SimplePublicObjectInputForCreate = {
      properties,
      associations: [],
    };

    const response = await hubspotClient.crm.objects.basicApi.create(
      EDUMATE_CONTACT_OBJECT_TYPE,
      createInput
    );

    logger.info("Created Edumate contact in HubSpot", {
      contactId: response.id,
    });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error creating Edumate contact in HubSpot", {
      properties,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const updateEdumateContact = async (
  contactId: string,
  properties: Record<string, any>
): Promise<HubSpotEdumateContact> => {
  try {
    const updateInput = {
      properties,
    };

    const response = await hubspotClient.crm.objects.basicApi.update(
      EDUMATE_CONTACT_OBJECT_TYPE,
      contactId,
      updateInput
    );

    logger.info("Updated Edumate contact in HubSpot", { contactId });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error updating Edumate contact in HubSpot", {
      contactId,
      properties,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const deleteEdumateContact = async (
  contactId: string
): Promise<void> => {
  try {
    await hubspotClient.crm.objects.basicApi.archive(
      EDUMATE_CONTACT_OBJECT_TYPE,
      contactId
    );

    logger.info("Deleted Edumate contact from HubSpot", { contactId });
  } catch (error) {
    logger.error("Error deleting Edumate contact from HubSpot", {
      contactId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const searchEdumateContacts = async (
  searchRequest: PublicObjectSearchRequest
): Promise<HubSpotPaginatedResponse<HubSpotEdumateContact>> => {
  try {
    const response = await hubspotClient.crm.objects.searchApi.doSearch(
      EDUMATE_CONTACT_OBJECT_TYPE,
      searchRequest
    );

    logger.debug("Searched Edumate contacts in HubSpot", {
      resultsCount: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error searching Edumate contacts in HubSpot", {
      searchRequest,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const batchCreateEdumateContacts = async (
  contactsData: Record<string, any>[]
): Promise<any> => {
  try {
    const batchInput: BatchInputSimplePublicObjectInputForCreate = {
      inputs: contactsData.map((properties) => ({
        properties,
        associations: [],
      })),
    };

    const response = await hubspotClient.crm.objects.batchApi.create(
      EDUMATE_CONTACT_OBJECT_TYPE,
      batchInput
    );

    logger.info("Batch created Edumate contacts in HubSpot", {
      count: contactsData.length,
      successCount: response.results?.length || 0,
    });

    return response;
  } catch (error) {
    logger.error("Error batch creating Edumate contacts in HubSpot", {
      count: contactsData.length,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const batchUpdateEdumateContacts = async (
  updates: Array<{ id: string; properties: Record<string, any> }>
): Promise<any> => {
  try {
    const batchInput = {
      inputs: updates.map((update) => ({
        id: update.id,
        properties: update.properties,
      })),
    };

    const response = await hubspotClient.crm.objects.batchApi.update(
      EDUMATE_CONTACT_OBJECT_TYPE,
      batchInput
    );

    logger.info("Batch updated Edumate contacts in HubSpot", {
      count: updates.length,
      successCount: response.results?.length || 0,
    });

    return response;
  } catch (error) {
    logger.error("Error batch updating Edumate contacts in HubSpot", {
      count: updates.length,
      error,
    });
    throw handleHubSpotError(error);
  }
};

// Helper function to create search requests
export const createSearchRequest = (
  filters: any,
  options: any
): PublicObjectSearchRequest => {
  return {
    filterGroups: [
      {
        filters: filters,
      },
    ],
    properties: options?.properties || [], // Default to empty array
    sorts: options?.sorts || [],
    limit: options?.limit || 10,
    after: options?.after || undefined,
  };
};

export const getOwnersByEmail = async (
  email: string
): Promise<HubSpotOwner[]> => {
  try {
    const response = await hubspotClient.crm.owners.ownersApi.getPage(
      email, // email filter
      undefined, // after
      100, // limit
      false // archived
    );

    const owners = response.results
      .filter((owner) => owner.email?.toLowerCase() === email.toLowerCase())
      .map((owner) => ({
        id: owner.id!,
        email: owner.email!,
        firstName: owner.firstName || "",
        lastName: owner.lastName || "",
      }));

    logger.debug("Retrieved owners by email from HubSpot", {
      email,
      count: owners.length,
    });

    return owners;
  } catch (error) {
    logger.error("Error retrieving owners by email from HubSpot", {
      email,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const updateContactOwner = async (
  contactId: string,
  ownerId: string
): Promise<void> => {
  try {
    const updateInput = {
      properties: {
        hubspot_owner_id: ownerId,
      },
    };

    await hubspotClient.crm.contacts.basicApi.update(contactId, updateInput);

    logger.debug("Updated contact owner in HubSpot", { contactId, ownerId });
  } catch (error) {
    logger.error("Error updating contact owner in HubSpot", {
      contactId,
      ownerId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const getPartnerByEmail = async (
  searchRequest: PublicObjectSearchRequest
): Promise<any> => {
  try {
    const response = await hubspotClient.crm.objects.searchApi.doSearch(
      EDUMATE_B2B_PARTNERS_OBJECT_TYPE,
      searchRequest
    );

    logger.debug("Searched B2B Partners email in HubSpot", {
      resultsCount: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error searching B2B Partners email in HubSpot", {
      searchRequest,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const getLeadsByEmail = async (
  searchRequest: PublicObjectSearchRequest
): Promise<any> => {
  try {
    const response = await hubspotClient.crm.objects.searchApi.doSearch(
      EDUMATE_LOAN_APPLICATIONS_OBJECT_TYPE,
      searchRequest
    );

    logger.debug("Searched Loan Application email in HubSpot", {
      resultsCount: response.results.length,
      hasMore: !!response.paging?.next,
    });

    return convertToHubSpotResponse<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error searching Loan Application email in HubSpot", {
      searchRequest,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const createHubspotPartner = async (
  properties: Record<string, any>
): Promise<HubSpotEdumateContact> => {
  try {
    const createInput: SimplePublicObjectInputForCreate = {
      properties,
      associations: [],
    };

    const response = await hubspotClient.crm.objects.basicApi.create(
      EDUMATE_B2B_PARTNERS_OBJECT_TYPE,
      createInput
    );

    logger.info("Created Edumate partner in HubSpot for partnerId", {
      partnerId: response.id,
    });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error creating Edumate partner in HubSpot", {
      properties,
      error,
    });
    throw handleHubSpotError(error);
  }
};

// Create multiple loan application leads at once
export const createLoanApplicationLeads = async (
  propertiesList: Record<string, any>[]
): Promise<any> => {
  try {
    // Prepare batch input
    const batchInput: BatchInputSimplePublicObjectInputForCreate = {
      inputs: propertiesList.map((properties) => ({
        properties,
        associations: [],
      })),
    };

    const response = await hubspotClient.crm.objects.batchApi.create(
      EDUMATE_LOAN_APPLICATIONS_OBJECT_TYPE,
      batchInput
    );

    logger.info("Created multiple Loan Applications in HubSpot", {
      count: response.results?.length || 0,
    });

    // Convert response objects into your internal type if needed
    return response.results.map((res) =>
      convertToHubSpotObject<HubSpotEdumateContact>(res)
    );
  } catch (error) {
    logger.error("Error creating Loan Applications in HubSpot", {
      error,
      propertiesList,
    });
    throw handleHubSpotError(error);
  }
};

export const updateLoanLeadInHubspot = async (
  leadId: number,
  properties: Record<string, any>
): Promise<any> => {
  try {
    const updateInput = {
      properties,
    };

    const response = await hubspotClient.crm.objects.basicApi.update(
      EDUMATE_LOAN_APPLICATIONS_OBJECT_TYPE,
      leadId.toString(),
      updateInput
    );

    logger.info("Updated Edumate contact in HubSpot", { leadId });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error updating Edumate contact in HubSpot", {
      leadId,
      properties,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const deleteLoanApplication = async (loanId: string): Promise<void> => {
  try {
    await hubspotClient.crm.objects.basicApi.archive(
      EDUMATE_LOAN_APPLICATIONS_OBJECT_TYPE,
      loanId
    );

    logger.info("Deleted Loan application from HubSpot", { loanId });
  } catch (error) {
    logger.error("Error deleting loan application from HubSpot", {
      loanId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const createContactsLeads = async (
  propertiesList: Record<string, any>[]
): Promise<any> => {
  try {
    // Prepare batch input
    const batchInput: BatchInputSimplePublicObjectInputForCreate = {
      inputs: propertiesList.map((properties) => ({
        properties,
        associations: [],
      })),
    };

    const response = await hubspotClient.crm.objects.batchApi.create(
      EDUMATE_CONTACT_OBJECT_TYPE,
      batchInput
    );

    logger.info("Created multiple contacts leads in HubSpot", {
      count: response.results?.length || 0,
    });

    // Convert response objects into your internal type if needed
    return response.results.map((res) =>
      convertToHubSpotObject<HubSpotEdumateContact>(res)
    );
  } catch (error) {
    logger.error("Error creating contacts leads in HubSpot", {
      error,
      propertiesList,
    });
    throw handleHubSpotError(error);
  }
};

export const updateContactsLoanLeadInHubspot = async (
  leadId: string,
  properties: Record<string, any>
): Promise<any> => {
  try {
    const updateInput = {
      properties,
    };

    const response = await hubspotClient.crm.objects.basicApi.update(
      EDUMATE_CONTACT_OBJECT_TYPE,
      leadId.toString(),
      updateInput
    );

    logger.info("Updated Edumate contact in HubSpot", { leadId });
    return convertToHubSpotObject<HubSpotEdumateContact>(response);
  } catch (error) {
    logger.error("Error updating Edumate contact in HubSpot", {
      leadId,
      properties,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const deleteContactsLead = async (loanId: string): Promise<void> => {
  try {
    await hubspotClient.crm.objects.basicApi.archive(
      EDUMATE_CONTACT_OBJECT_TYPE,
      loanId
    );

    logger.info("Deleted contact lead from HubSpot", { loanId });
  } catch (error) {
    logger.error("Error deleting contact lead from HubSpot", {
      loanId,
      error,
    });
    throw handleHubSpotError(error);
  }
};

export const createMultiContactsLead = async (propertiesList: Record<string, any>[], b2bPartnerHSId: string | null = null) => {
  try {

      const associations: Array<{
      to: { id: string };
      types: Array<{
        associationCategory: any;
        associationTypeId: number;
      }>;
    }> = [];

    // Add B2B Partner association if available
    if (b2bPartnerHSId) {
      associations.push({
        to: { id: b2bPartnerHSId },
        types: [
          {
            associationCategory: B2B_PARTNER_LEAD_ASSOCIATION?.associationCategory || "USER_DEFINED",
            associationTypeId: B2B_PARTNER_LEAD_ASSOCIATION?.associationTypeId || 466,
          },
        ],
      });

      logger.info("🔗 Adding B2B Partner association", {
        b2bPartnerHSId,
      });
    }

    const batchInput: BatchInputSimplePublicObjectInputForCreate = {
      inputs: propertiesList.map((properties) => ({
        properties,
        associations,
      })),
    };

    const response = await hubspotClient.crm.objects.batchApi.create(
      EDUMATE_CONTACT_OBJECT_TYPE,
      batchInput
    );

    logger.info("Created multiple contacts leads applications in HubSpot", {
      count: response.results?.length || 0,
    });

    // Convert response objects into your internal type if needed
    return response.results.map((res) =>
      convertToHubSpotObject<HubSpotEdumateContact>(res)
    );
  } catch (error) {
    logger.error("Error creating contacts leads applications in HubSpot", {
      error,
      propertiesList,
    });
    throw handleHubSpotError(error);
  }
};