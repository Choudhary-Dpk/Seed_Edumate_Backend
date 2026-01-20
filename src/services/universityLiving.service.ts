/**
 * University Living API Service
 * 
 * This service handles all HTTP requests to the University Living API.
 * It acts as a pure proxy - forwarding requests and responses without modification.
 */

import axios from "axios";
import logger from "../utils/logger";
import {
  UL_BASE_URL,
  UL_API_KEY,
  UL_TIMEOUT,
  UL_HEADERS,
} from "../config/universityLiving.config";
import {
  CreateLeadRequest,
  CreateBookingRequest,
  PropertyListQuery,
} from "../types/accommodation.types";

/**
 * Create axios client with base configuration
 */
const createHttpClient = () => {
  const client = axios.create({
    baseURL: UL_BASE_URL,
    timeout: UL_TIMEOUT,
    headers: {
      [UL_HEADERS.API_KEY_HEADER]: UL_API_KEY,
      "Content-Type": UL_HEADERS.CONTENT_TYPE,
    },
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      logger.info(
        `[UL API] ${config.method?.toUpperCase()} ${config.url}`
      );
      return config;
    },
    (error) => {
      logger.error(`[UL API] Request Error: ${error.message}`);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  client.interceptors.response.use(
    (response) => {
      logger.info(
        `[UL API] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`
      );
      return response;
    },
    (error) => {
      if (error.response) {
        logger.error(
          `[UL API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status} - ${error.response.data?.message || error.message}`
        );
      } else {
        logger.error(`[UL API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error: ${error.message}`);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Create shared HTTP client instance
const httpClient = createHttpClient();

/**
 * Generic request function
 * Forwards the request to UL API and returns the response as-is
 */
const makeRequest = async (config: {
  method: string;
  url: string;
  params?: any;
  data?: any;
}) => {
  try {
    const response = await httpClient.request(config);
    return response;
  } catch (error: any) {
    // Re-throw the error to be handled by controller
    throw error;
  }
};

// ============================================================================
// Reference Data APIs
// ============================================================================

/**
 * Get all accommodation providers
 * GET /v1/provider
 */
export const getProviders = async () => {
  return makeRequest({
    method: "GET",
    url: "/v1/provider",
  });
};

/**
 * Get all cities
 * GET /v1/city
 */
export const getCities = async () => {
  return makeRequest({
    method: "GET",
    url: "/v1/city",
  });
};

/**
 * Get all universities
 * GET /v1/university
 */
export const getUniversities = async () => {
  return makeRequest({
    method: "GET",
    url: "/v1/university",
  });
};

// ============================================================================
// Property APIs
// ============================================================================

/**
 * Get property listings with optional filters
 * GET /v1/properties?city=London&provider=iQ&universityId=xxx
 */
export const getProperties = async (query: PropertyListQuery) => {
  return makeRequest({
    method: "GET",
    url: "/v1/properties",
    params: query,
  });
};

/**
 * Get property details by ID
 * GET /v1/properties/:propertyId
 */
export const getPropertyDetails = async (propertyId: string) => {
  return makeRequest({
    method: "GET",
    url: `/v1/properties/${propertyId}`,
  });
};

// ============================================================================
// Lead APIs
// ============================================================================

/**
 * Create a new lead
 * POST /v1/lead
 */
export const createLead = async (payload: CreateLeadRequest) => {
  return makeRequest({
    method: "POST",
    url: "/v1/lead",
    data: payload,
  });
};

/**
 * Get lead status by ID
 * GET /v1/lead/:leadId
 */
export const getLeadStatus = async (leadId: string) => {
  return makeRequest({
    method: "GET",
    url: `/v1/lead/${leadId}`,
  });
};

// ============================================================================
// Booking APIs
// ============================================================================

/**
 * Create a new booking
 * POST /v1/booking
 */
export const createBooking = async (payload: CreateBookingRequest) => {
  return makeRequest({
    method: "POST",
    url: "/v1/booking",
    data: payload,
  });
};

/**
 * Get booking status by order ID
 * GET /v1/booking/:orderId
 */
export const getBookingStatus = async (orderId: string) => {
  return makeRequest({
    method: "GET",
    url: `/v1/booking/${orderId}`,
  });
};