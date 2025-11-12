import axios from "axios";
import logger from "../utils/logger";

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_API_URL = "https://api.hubapi.com";
const LOAN_PRODUCT_OBJECT_TYPE = "2-52086541"; // Your custom object type ID

export interface HubSpotLoanProduct {
  properties: Record<string, any>;
}

/**
 * Create Loan Product in HubSpot
 */
export async function createLoanProduct(
  productData: Record<string, any>,
  lenderHsObjectId?: string | null
): Promise<{ id: string }> {
  try {
    const response:any = await axios.post(
      `${HUBSPOT_API_URL}/crm/v3/objects/${LOAN_PRODUCT_OBJECT_TYPE}`,
      {
        properties: productData,
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    logger.info("✅ Loan Product created in HubSpot", {
      hubspotId: response.data.id,
    });

    // Create association with Lender if provided
    if (lenderHsObjectId && response.data.id) {
      await createLenderAssociation(response.data.id, lenderHsObjectId);
    }

    return { id: response.data.id };
  } catch (error: any) {
    logger.error(
      "Failed to create loan product in HubSpot:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Update Loan Product in HubSpot
 */
export async function updateLoanProduct(
  hubspotId: string,
  productData: Record<string, any>
): Promise<{ id: string }> {
  try {
    const response = await axios.patch(
      `${HUBSPOT_API_URL}/crm/v3/objects/${LOAN_PRODUCT_OBJECT_TYPE}/${hubspotId}`,
      {
        properties: productData,
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    logger.info("✅ Loan Product updated in HubSpot", { hubspotId });

    return { id: response.data.id };
  } catch (error: any) {
    logger.error(
      "Failed to update loan product in HubSpot:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Delete Loan Product from HubSpot
 */
export async function deleteLoanProduct(hubspotId: string): Promise<void> {
  try {
    await axios.delete(
      `${HUBSPOT_API_URL}/crm/v3/objects/${LOAN_PRODUCT_OBJECT_TYPE}/${hubspotId}`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
      }
    );

    logger.info("✅ Loan Product deleted from HubSpot", { hubspotId });
  } catch (error: any) {
    logger.error(
      "Failed to delete loan product from HubSpot:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Create association between Loan Product and Lender
 */
async function createLenderAssociation(
  productHsId: string,
  lenderHsId: string
): Promise<void> {
  try {
    await axios.put(
      `${HUBSPOT_API_URL}/crm/v4/objects/${LOAN_PRODUCT_OBJECT_TYPE}/${productHsId}/associations/default/lenders/${lenderHsId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
      }
    );

    logger.info("✅ Lender association created", {
      productHsId,
      lenderHsId,
    });
  } catch (error: any) {
    logger.warn(
      "Failed to create lender association:",
      error.response?.data || error.message
    );
  }
}
