import dotenv from "dotenv";
import axios from "axios";
import { emailQueue } from "../utils/queue";

dotenv.config();

// Configuration
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = process.env.HUBSPOT_BASE_URL;
const LOAN_PRODUCT_OBJECT = process.env.HUBSPOT_LOAN_PRODUCTS_OBJECT_TYPE;
const EDUMATE_CONTACT_OBJECT = process.env.HUBSPOT_EDUMATE_CONTACT_OBJECT_TYPE;
const EDUMATE_CONTACT_PROPERTY = "interested_loan_products";

// Validate environment variables
if (
  !HUBSPOT_ACCESS_TOKEN ||
  !HUBSPOT_API_BASE ||
  !LOAN_PRODUCT_OBJECT ||
  !EDUMATE_CONTACT_OBJECT
) {
  console.error("Error: Missing required environment variables");
  console.error(
    "Required: HUBSPOT_ACCESS_TOKEN, HUBSPOT_BASE_URL, HUBSPOT_LOAN_PRODUCTS_OBJECT_TYPE, HUBSPOT_EDUMATE_CONTACT_OBJECT_TYPE",
  );
  process.exit(1);
}

interface Product {
  label: string;
  value: string;
}

interface PropertyOption {
  label: string;
  value: string;
  displayOrder: number;
  hidden: boolean;
}

// Logger function type
type LogFunction = (taskName: string, message: string) => void;

// Email recipients
const NOTIFICATION_EMAILS = ["deepak@seedglobaleducation.com"];

// Send email notification
function sendNotification(
  success: boolean,
  productsCount: number,
  duration: number,
  error?: any,
): void {
  const status = success ? "Success" : "Failed";
  const statusEmoji = success ? "✅" : "❌";
  const subject = `[Cron Job] HubSpot Property Sync - ${statusEmoji} ${status}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: ${
      success ? "#4CAF50" : "#f44336"
    }; color: white; padding: 20px; border-radius: 5px; }
    .info { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .stats { background: #fff; padding: 15px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${statusEmoji} HubSpot Property Sync - ${status}</h2>
  </div>
  <div class="info">
    <p><strong>Status:</strong> ${
      success ? "Completed Successfully" : "Failed"
    }</p>
    <p><strong>Duration:</strong> ${duration.toFixed(2)} seconds</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  </div>
  <div class="stats">
    <h3>Statistics</h3>
    <p><strong>📦 Products Synced:</strong> ${productsCount}</p>
    <p><strong>🎯 Property:</strong> ${EDUMATE_CONTACT_PROPERTY}</p>
    <p><strong>📋 Object:</strong> ${EDUMATE_CONTACT_OBJECT}</p>
    ${
      error
        ? `<p style="color: #f44336;"><strong>Error:</strong> ${error.message}</p>`
        : ""
    }
  </div>
</body>
</html>`;

  for (const email of NOTIFICATION_EMAILS) {
    emailQueue.push({
      to: email,
      subject: subject,
      html: html,
      retry: 0,
    });
  }
}

// Fetch all loan products with pagination
async function fetchLoanProducts(logger?: LogFunction): Promise<Product[]> {
  const logMsg = (msg: string) => {
    if (logger) logger("property-update", msg);
  };

  logMsg("Fetching loan products from HubSpot...");
  logMsg(`Using object type ID: ${LOAN_PRODUCT_OBJECT}`);

  let allProducts: any[] = [];
  let after: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const params: any = {
      properties: "product_name",
      limit: 100,
    };

    if (after) params.after = after;

    const response: any = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/${LOAN_PRODUCT_OBJECT}`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        params,
      },
    );

    const products = response.data.results || [];
    allProducts = allProducts.concat(products);

    after = response.data.paging?.next?.after || null;
    hasMore = !!after;

    logMsg(
      `✓ Fetched ${products.length} products (Total: ${allProducts.length})`,
    );
  }

  logMsg(`✓ Completed fetching all ${allProducts.length} loan products`);

  return allProducts.map((product) => ({
    label: product.properties.product_name,
    value: product.id,
  }));
}

// Update property on Edumate Contact object
async function updateMultiCheckboxProperty(
  products: Product[],
  logger?: LogFunction,
): Promise<any> {
  const logMsg = (msg: string) => {
    if (logger) logger("property-update", msg);
  };

  logMsg("Updating multi-checkbox property on Edumate Contact object...");
  logMsg(
    `Target object: ${EDUMATE_CONTACT_OBJECT}, Property: ${EDUMATE_CONTACT_PROPERTY}`,
  );

  const options: PropertyOption[] = products.map((product, index) => ({
    label: product.label,
    value: product.value,
    displayOrder: index,
    hidden: false,
  }));

  const propertyData: any = {
    description: "Available loan products from Loan Products object",
    options: options,
  };

  try {
    // Try to update existing property
    const response = await axios.patch(
      `${HUBSPOT_API_BASE}/crm/v3/properties/${EDUMATE_CONTACT_OBJECT}/${EDUMATE_CONTACT_PROPERTY}`,
      propertyData,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    logMsg("✓ Property updated successfully");
    return response.data;
  } catch (updateError: any) {
    // If property doesn't exist (404), create it
    if (updateError.response?.status === 404) {
      logMsg("Property does not exist, creating new property...");

      propertyData.name = EDUMATE_CONTACT_PROPERTY;

      const response = await axios.post(
        `${HUBSPOT_API_BASE}/crm/v3/properties/${EDUMATE_CONTACT_OBJECT}`,
        propertyData,
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      logMsg("✓ Property created successfully");
      return response.data;
    }

    throw updateError;
  }
}

// Main function - now accepts optional logger
export async function updatePropertySync(logger?: LogFunction): Promise<void> {
  const startTime = Date.now();

  const logMsg = (msg: string) => {
    if (logger) logger("property-update", msg);
  };

  logMsg("=== HubSpot Property Update Started ===");
  logMsg(`Timestamp: ${new Date().toISOString()}`);

  try {
    // Step 1: Fetch all loan products
    const products = await fetchLoanProducts(logger);

    if (products.length === 0) {
      logMsg("⚠ No loan products found. Exiting.");
      const duration = (Date.now() - startTime) / 1000;
      sendNotification(true, 0, duration);
      return;
    }

    logMsg("Products to sync:");
    products.forEach((product, index) => {
      logMsg(`  ${index + 1}. ${product.label} (ID: ${product.value})`);
    });

    // Step 2: Update multi-checkbox property
    await updateMultiCheckboxProperty(products, logger);

    const duration = (Date.now() - startTime) / 1000;
    logMsg("=== Update Completed Successfully ===");
    logMsg(`Duration: ${duration.toFixed(2)}s`);
    logMsg(`Total products synced: ${products.length}`);

    // Send success notification
    sendNotification(true, products.length, duration);
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;
    logMsg("=== Update Failed ===");
    logMsg(error.response?.data || error.message);

    // Send failure notification
    sendNotification(false, 0, duration, error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updatePropertySync()
    .then(() => {
      console.log("Property update finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Property update failed:", error.message);
      process.exit(1);
    });
}
