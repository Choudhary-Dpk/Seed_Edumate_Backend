import { Client } from "@hubspot/api-client";
import { handleHubSpotError } from "./hubspotClient.service";
import logger from "../utils/logger";
import { config } from "../config/config";
import { SimplePublicObjectInputForCreate } from "@hubspot/api-client/lib/codegen/crm/companies";

const hubspotClient = new Client({ accessToken: config.hubspot.accessToken });
const COMMISSION_SETTLEMENTS_OBJECT_TYPE =
  config?.hubspot?.customObjects?.commissionSettlements;

export interface HubSpotCommissionSettlements {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

/**
 * Convert HubSpot response to typed object
 */
export function convertToHubSpotCommissionSettlementsObject<T>(obj: any): T {
  return {
    id: obj.id,
    properties: obj.properties,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    archived: obj.archived,
  } as T;
}

/**
 * Update a single loan application in HubSpot
 */
export async function updateCommissionSettlementsApplication(
  hubspotId: string,
  properties: Record<string, any>
): Promise<HubSpotCommissionSettlements> {
  try {
    const response = await hubspotClient.crm.objects.basicApi.update(
      COMMISSION_SETTLEMENTS_OBJECT_TYPE,
      hubspotId,
      {
        properties,
      }
    );

    logger.info("Commission Settlements updated in HubSpot", {
      hubspotId: response.id,
    });

    return convertToHubSpotCommissionSettlementsObject<HubSpotCommissionSettlements>(
      response
    );
  } catch (error) {
    logger.error("Error updating Commission Settlements in HubSpot", {
      error,
      hubspotId,
      properties,
    });
    throw handleHubSpotError(error);
  }
}

/**
 * Delete a commission settlement in HubSpot (Archive)
 */
export async function deleteCommissionSettlement(
  hubspotId: string
): Promise<void> {
  try {
    await hubspotClient.crm.objects.basicApi.archive(
      COMMISSION_SETTLEMENTS_OBJECT_TYPE,
      hubspotId
    );

    logger.info("Commission Settlement archived in HubSpot", {
      hubspotId,
    });
  } catch (error) {
    logger.error("Error archiving commission settlement in HubSpot", {
      error,
      hubspotId,
    });
    throw handleHubSpotError(error);
  }
}

export const createCommissionSettlementsOnHubspot = async (
  commissionProperties: any
) => {
  try {
    const createInput: SimplePublicObjectInputForCreate = {
      properties: commissionProperties,
      associations: [],
    };
    const response = await hubspotClient.crm.objects.basicApi.create(
      COMMISSION_SETTLEMENTS_OBJECT_TYPE,
      createInput
    );

    return response;
  } catch (error) {
    logger.error("Error in createCommissionSettlementsOnHubspot service", {
      error,
    });
    throw handleHubSpotError(error);
  }
};
