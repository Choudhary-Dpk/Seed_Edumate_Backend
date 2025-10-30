// src/services/hubspot-loan.service.ts

import { Client } from "@hubspot/api-client";
import {
  BatchInputSimplePublicObjectInputForCreate,
  BatchInputSimplePublicObjectBatchInput,
  SimplePublicObjectInput,
} from "@hubspot/api-client/lib/codegen/crm/objects";
import logger from "../utils/logger";
import { config } from "../config/config";
import { handleHubSpotError } from "./hubspotClient";

// Initialize HubSpot Client
const hubspotClient = new Client({ accessToken: config.hubspot.accessToken });
// HubSpot Loan Application Object Type
const LOAN_OBJECT_TYPE = config?.hubspot?.customObjects?.loanApplication; // Replace with your actual HubSpot custom object name

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
  properties: Record<string, any>
): Promise<HubSpotLoanApplication> {
  try {
    const response = await hubspotClient.crm.objects.basicApi.create(
      LOAN_OBJECT_TYPE,
      {
        properties,
        associations: [],
      }
    );

    logger.info("✅ Loan application created in HubSpot", {
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

    logger.info("✅ Created multiple loan applications in HubSpot", {
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

    logger.info("✅ Loan application updated in HubSpot", {
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

    logger.info("✅ Updated multiple loan applications in HubSpot", {
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

    logger.info("✅ Loan application archived in HubSpot", {
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

    logger.info("✅ Retrieved loan application from HubSpot", {
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
 * Search loan applications in HubSpot by property
 */
// export async function searchLoanApplications(
//   propertyName: string,
//   propertyValue: string
// ): Promise<HubSpotLoanApplication[]> {
//   try {
//     const response = await hubspotClient.crm.objects.searchApi.doSearch(
//       LOAN_OBJECT_TYPE,
//       {
//         filterGroups: [
//           {
//             filters: [
//               {
//                 propertyName: propertyName,
//                 operator: "EQ",
//                 value: propertyValue,
//               },
//             ],
//           },
//         ],
//         limit: 100,
//       }
//     );

//     logger.info("✅ Searched loan applications in HubSpot", {
//       count: response.results?.length || 0,
//       propertyName,
//       propertyValue,
//     });

//     return response.results.map((res) =>
//       convertToHubSpotLoanObject<HubSpotLoanApplication>(res)
//     );
//   } catch (error) {
//     logger.error("❌ Error searching loan applications in HubSpot", {
//       error,
//       propertyName,
//       propertyValue,
//     });
//     throw handleHubSpotError(error);
//   }
// }

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

    logger.info("✅ Retrieved multiple loan applications from HubSpot", {
      count: response.results?.length || 0,
    });

    return response.results.map((res) =>
      convertToHubSpotLoanObject<HubSpotLoanApplication>(res)
    );
  } catch (error) {
    logger.error("❌ Error retrieving multiple loan applications from HubSpot", {
      error,
      count: hubspotIds.length,
    });
    throw handleHubSpotError(error);
  }
}