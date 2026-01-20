/**
 * University Living API Configuration
 * 
 * This file contains all configuration for the University Living API wrapper.
 * Environment variables are loaded and validated here.
 */

interface UniversityLivingConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  rateLimit: number;
}

/**
 * Load and validate University Living configuration from environment variables
 */
const loadConfig = (): UniversityLivingConfig => {
  const baseUrl = process.env.UL_API_BASE_URL;
  const apiKey = process.env.UL_API_KEY;
  const timeout = parseInt(process.env.UL_API_TIMEOUT || "30000", 10);
  const rateLimit = parseInt(process.env.UL_RATE_LIMIT || "300", 10);

  // Validation
  if (!baseUrl) {
    throw new Error(
      "UL_API_BASE_URL is not defined in environment variables. Please add it to your .env file."
    );
  }

  if (!apiKey) {
    throw new Error(
      "UL_API_KEY is not defined in environment variables. Please add it to your .env file."
    );
  }

  return {
    baseUrl,
    apiKey,
    timeout,
    rateLimit,
  };
};

// Export configuration
export const universityLivingConfig = loadConfig();

// Export individual values for convenience
export const UL_BASE_URL = universityLivingConfig.baseUrl;
export const UL_API_KEY = universityLivingConfig.apiKey;
export const UL_TIMEOUT = universityLivingConfig.timeout;
export const UL_RATE_LIMIT = universityLivingConfig.rateLimit;

// API Endpoints mapping
export const UL_ENDPOINTS = {
  // Reference Data
  PROVIDERS: "/v1/provider",
  CITIES: "/v1/city",
  UNIVERSITIES: "/v1/university",
  
  // Properties
  PROPERTIES: "/v1/properties",
  PROPERTY_DETAILS: "/v1/properties/:propertyId",
  
  // Leads
  CREATE_LEAD: "/v1/lead",
  LEAD_STATUS: "/v1/lead/:leadId",
  
  // Bookings
  CREATE_BOOKING: "/v1/booking",
  BOOKING_STATUS: "/v1/booking/:orderId",
} as const;

// API Header configuration
export const UL_HEADERS = {
  API_KEY_HEADER: "UL-API-KEY",
  CONTENT_TYPE: "application/json",
} as const;

export default universityLivingConfig;