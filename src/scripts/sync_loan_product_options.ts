import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Configuration
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = process.env.HUBSPOT_BASE_URL;
const LOAN_PRODUCT_OBJECT = process.env.HUBSPOT_LOAN_PRODUCTS_OBJECT_TYPE;
const EDUMATE_CONTACT_OBJECT = process.env.HUBSPOT_EDUMATE_CONTACT_OBJECT_TYPE;
const EDUMATE_CONTACT_PROPERTY = 'interested_loan_products';

// Validate environment variables
if (!HUBSPOT_ACCESS_TOKEN || !HUBSPOT_API_BASE || !LOAN_PRODUCT_OBJECT || !EDUMATE_CONTACT_OBJECT) {
  console.error('Error: Missing required environment variables');
  console.error('Required: HUBSPOT_ACCESS_TOKEN, HUBSPOT_BASE_URL, HUBSPOT_LOAN_PRODUCTS_OBJECT_TYPE, HUBSPOT_EDUMATE_CONTACT_OBJECT_TYPE');
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

// Fetch all loan products with pagination
async function fetchLoanProducts(): Promise<Product[]> {
  console.log('Fetching loan products from HubSpot...');
  console.log(`Using object type ID: ${LOAN_PRODUCT_OBJECT}`);
  
  let allProducts: any[] = [];
  let after: string | null = null;
  let hasMore = true;
  
  while (hasMore) {
    const params: any = {
      properties: 'product_name',
      limit: 100
    };
    
    if (after) params.after = after;
    
    const response: any = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/${LOAN_PRODUCT_OBJECT}`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params
      }
    );

    const products = response.data.results || [];
    allProducts = allProducts.concat(products);
    
    after = response.data.paging?.next?.after || null;
    hasMore = !!after;
    
    console.log(`✓ Fetched ${products.length} products (Total: ${allProducts.length})`);
  }
  
  console.log(`✓ Completed fetching all ${allProducts.length} loan products`);
  
  return allProducts.map(product => ({
    label: product.properties.product_name,
    value: product.id
  }));
}

// Update property on Edumate Contact object
async function updateMultiCheckboxProperty(products: Product[]): Promise<any> {
  console.log('Updating multi-checkbox property on Edumate Contact object...');
  console.log(`Target object: ${EDUMATE_CONTACT_OBJECT}, Property: ${EDUMATE_CONTACT_PROPERTY}`);
  debugger
  const options: PropertyOption[] = products.map((product, index) => ({
    label: product.label,
    value: product.value,
    displayOrder: index,
    hidden: false
  }));

  const propertyData: any = {
    description: 'Available loan products from Loan Products object',
    options: options
  };

  try {
    // Try to update existing property
    const response = await axios.patch(
      `${HUBSPOT_API_BASE}/crm/v3/properties/${EDUMATE_CONTACT_OBJECT}/${EDUMATE_CONTACT_PROPERTY}`,
      propertyData,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Property updated successfully');
    return response.data;
  } catch (updateError: any) {
    // If property doesn't exist (404), create it
    if (updateError.response?.status === 404) {
      console.log('Property does not exist, creating new property...');
      
      propertyData.name = EDUMATE_CONTACT_PROPERTY;
      
      const response = await axios.post(
        `${HUBSPOT_API_BASE}/crm/v3/properties/${EDUMATE_CONTACT_OBJECT}`,
        propertyData,
        {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✓ Property created successfully');
      return response.data;
    }
    
    throw updateError;
  }
}

// Main function
export async function updatePropertySync(): Promise<void> {
  const startTime = Date.now();
  console.log('=== HubSpot Property Update Started ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Step 1: Fetch all loan products
    const products = await fetchLoanProducts();
    
    if (products.length === 0) {
      console.log('⚠ No loan products found. Exiting.');
      return;
    }

    console.log('');
    console.log('Products to sync:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.label} (ID: ${product.value})`);
    });
    console.log('');

    // Step 2: Update multi-checkbox property
    await updateMultiCheckboxProperty(products);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('');
    console.log('=== Update Completed Successfully ===');
    console.log(`Duration: ${duration}s`);
    console.log(`Total products synced: ${products.length}`);
  } catch (error: any) {
    console.error('');
    console.error('=== Update Failed ===');
    console.error(error.response?.data || error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updatePropertySync()
    .then(() => {
      console.log('Property update finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Property update failed:', error.message);
      process.exit(1);
    });
}