// src/services/hubspot-loan.service.ts

import { Client } from "@hubspot/api-client";
import {
  BatchInputSimplePublicObjectInputForCreate,
  BatchInputSimplePublicObjectBatchInput,
  SimplePublicObjectInput,
} from "@hubspot/api-client/lib/codegen/crm/objects";
import logger from "../utils/logger";
import { config } from "../config/config";
import { handleHubSpotError } from "./hubspotClient.service";

// Initialize HubSpot Client
const hubspotClient = new Client({ accessToken: config.hubspot.accessToken });
// HubSpot Loan Application Object Type
const LOAN_OBJECT_TYPE = config?.hubspot?.customObjects?.loanApplication; // Replace with your actual HubSpot custom object name
const B2B_PARTNER_LOAN_APP_ASSOCIATION = config?.hubspot?.associations?.loanApplicationToB2BPartner;
const LENDER_LOAN_APP_ASSOCIATION = config?.hubspot?.associations?.loanApplicationToLender;
const LOAN_PRODUCT_LOAN_APP_ASSOCIATION = config?.hubspot?.associations?.loanApplicationToLoanProduct; 
const EDUMATE_CONTACT_LOAN_APP_ASSOCIATION = config?.hubspot?.associations?.edumateContactToLoanApplication; 

/**
 * HubSpot Loan Application Interface
 */
export interface HubSpotLoanApplication {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

/**
 * Convert HubSpot response to typed object
 */
function convertToHubSpotLoanObject<T>(obj: any): T {
  return {
    id: obj.id,
    properties: obj.properties,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    archived: obj.archived,
  } as T;
}

/**
 * Create a single loan application in HubSpot
 */
export async function createLoanApplication(
  properties: Record<string, any>,
  edumateContactHsObjectId: string | null = null,
  b2bPartnerHSId: string | null = null,
  lenderHSId: string | null = null,
  loanProductHSId: string | null = null
): Promise<HubSpotLoanApplication> {
  try {
    const associations: Array<{
      to: { id: string };
      types: Array<{
        associationCategory: any;
        associationTypeId: number;
      }>;
    }> = [];

    // Add Edumate Contact association if available
    if (edumateContactHsObjectId) {
      associations.push({
        to: { id: edumateContactHsObjectId },
        types: [
          {
            associationCategory:
              EDUMATE_CONTACT_LOAN_APP_ASSOCIATION?.associationCategory ||
              "USER_DEFINED",
            associationTypeId:
              EDUMATE_CONTACT_LOAN_APP_ASSOCIATION?.associationTypeId || 485,
          },
        ],
      });
      logger.info("🔗 Adding Edumate Contact association", {
        edumateContactHsObjectId,
      });
    }
    // Add B2B Partner association if available
    if (b2bPartnerHSId) {
      associations.push({
        to: { id: b2bPartnerHSId },
        types: [
          {
            associationCategory:
              B2B_PARTNER_LOAN_APP_ASSOCIATION?.associationCategory ||
              "USER_DEFINED",
            associationTypeId:
              B2B_PARTNER_LOAN_APP_ASSOCIATION?.associationTypeId || 457,
          },
        ],
      });

      logger.info("🔗 Adding B2B Partner association", {
        b2bPartnerHSId,
      });
    }
    // Add Lender association if available
    if (lenderHSId) {
      associations.push({
        to: { id: lenderHSId },
        types: [
          {
            associationCategory:
              LENDER_LOAN_APP_ASSOCIATION?.associationCategory ||
              "USER_DEFINED",
            associationTypeId:
              LENDER_LOAN_APP_ASSOCIATION?.associationTypeId || 425,
          },
        ],
      });
      logger.info("🔗 Adding Lender association", {
        lenderHSId,
      });
    }
    // Add Loan Product association if available
    if (loanProductHSId) {
      associations.push({
        to: { id: loanProductHSId },
        types: [
          {
            associationCategory:
              LOAN_PRODUCT_LOAN_APP_ASSOCIATION?.associationCategory ||
              "USER_DEFINED",
            associationTypeId:
              LOAN_PRODUCT_LOAN_APP_ASSOCIATION?.associationTypeId || 469,
          },
        ],
      });
      logger.info("🔗 Adding Loan Product association", {
        loanProductHSId,
      });
    }

    const response = await hubspotClient.crm.objects.basicApi.create(
      LOAN_OBJECT_TYPE,
      {
        properties,
        associations,
      }
    );

    logger.info(" Loan application created in HubSpot", {
      hubspotId: response.id,
    });

    return convertToHubSpotLoanObject<HubSpotLoanApplication>(response);
  } catch (error) {
    logger.error("❌ Error creating loan application in HubSpot", {
      error,
      properties,
    });
    throw handleHubSpotError(error);
  }
}

/**
 * Create multiple loan applications in HubSpot (Batch API)
 */
export async function createMultipleLoanApplications(
  propertiesList: Record<string, any>[]
): Promise<HubSpotLoanApplication[]> {
  try {
    const batchInput: BatchInputSimplePublicObjectInputForCreate = {
      inputs: propertiesList.map((properties) => ({
        properties,
        associations: [],
      })),
    };

    const response = await hubspotClient.crm.objects.batchApi.create(
      LOAN_OBJECT_TYPE,
      batchInput
    );

    logger.info(" Created multiple loan applications in HubSpot", {
      count: response.results?.length || 0,
    });

    return response.results.map((res) =>
      convertToHubSpotLoanObject<HubSpotLoanApplication>(res)
    );
  } catch (error) {
    logger.error("❌ Error creating multiple loan applications in HubSpot", {
      error,
      count: propertiesList.length,
    });
    throw handleHubSpotError(error);
  }
}

/**
 * Update a single loan application in HubSpot
 */
export async function updateLoanApplication(
  hubspotId: string,
  properties: Record<string, any>
): Promise<HubSpotLoanApplication> {
  try {
    const response = await hubspotClient.crm.objects.basicApi.update(
      LOAN_OBJECT_TYPE,
      hubspotId,
      {
        properties,
      }
    );

    logger.info(" Loan application updated in HubSpot", {
      hubspotId: response.id,
    });

    return convertToHubSpotLoanObject<HubSpotLoanApplication>(response);
  } catch (error) {
    logger.error("❌ Error updating loan application in HubSpot", {
      error,
      hubspotId,
      properties,
    });
    throw handleHubSpotError(error);
  }
}

/**
 * Update multiple loan applications in HubSpot (Batch API)
 */
export async function updateMultipleLoanApplications(
  updates: Array<{ id: string; properties: Record<string, any> }>
): Promise<HubSpotLoanApplication[]> {
  try {
    const batchInput: BatchInputSimplePublicObjectBatchInput = {
      inputs: updates.map((update) => ({
        id: update.id,
        properties: update.properties,
      })),
    };

    const response = await hubspotClient.crm.objects.batchApi.update(
      LOAN_OBJECT_TYPE,
      batchInput
    );

    logger.info(" Updated multiple loan applications in HubSpot", {
      count: response.results?.length || 0,
    });

    return response.results.map((res) =>
      convertToHubSpotLoanObject<HubSpotLoanApplication>(res)
    );
  } catch (error) {
    logger.error("❌ Error updating multiple loan applications in HubSpot", {
      error,
      count: updates.length,
    });
    throw handleHubSpotError(error);
  }
}

/**
 * Delete a loan application in HubSpot (Archive)
 */
export async function deleteLoanApplication(hubspotId: string): Promise<void> {
  try {
    await hubspotClient.crm.objects.basicApi.archive(
      LOAN_OBJECT_TYPE,
      hubspotId
    );

    logger.info(" Loan application archived in HubSpot", {
      hubspotId,
    });
  } catch (error) {
    logger.error("❌ Error archiving loan application in HubSpot", {
      error,
      hubspotId,
    });
    throw handleHubSpotError(error);
  }
}

/**
 * Get loan application from HubSpot by ID
 */
export async function getLoanApplicationById(
  hubspotId: string
): Promise<HubSpotLoanApplication> {
  try {
    const response = await hubspotClient.crm.objects.basicApi.getById(
      LOAN_OBJECT_TYPE,
      hubspotId,
      undefined,
      undefined,
      undefined
    );

    logger.info(" Retrieved loan application from HubSpot", {
      hubspotId: response.id,
    });

    return convertToHubSpotLoanObject<HubSpotLoanApplication>(response);
  } catch (error) {
    logger.error("❌ Error retrieving loan application from HubSpot", {
      error,
      hubspotId,
    });
    throw handleHubSpotError(error);
  }
}

/**
 * Get multiple loan applications by IDs (Batch API)
 */
export async function getMultipleLoanApplications(
  hubspotIds: string[]
): Promise<HubSpotLoanApplication[]> {
  try {
    const response = await hubspotClient.crm.objects.batchApi.read(
      LOAN_OBJECT_TYPE,
      {
        properties: [],
        propertiesWithHistory: [],
        inputs: hubspotIds.map((id) => ({ id })),
      }
    );

    logger.info(" Retrieved multiple loan applications from HubSpot", {
      count: response.results?.length || 0,
    });

    return response.results.map((res) =>
      convertToHubSpotLoanObject<HubSpotLoanApplication>(res)
    );
  } catch (error) {
    logger.error(
      "❌ Error retrieving multiple loan applications from HubSpot",
      {
        error,
        count: hubspotIds.length,
      }
    );
    throw handleHubSpotError(error);
  }
}