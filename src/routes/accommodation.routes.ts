/**
 * Accommodation API Routes
 * 
 * Base Route: /accom
 * 
 * These routes wrap University Living B2B APIs for accommodation services.
 * All endpoints require API key authentication.
 */

import { Router } from "express";
import { authenticate } from "../middlewares";
import { validateReqParams } from "../middlewares/validators/validator";
import {
  validateCreateLeadPayload,
  validateCreateBookingPayload,
  validatePropertyId,
  validateLeadId,
  validateOrderId,
} from "../middlewares/accommodation.middleware";
import {
  getProviders,
  getCities,
  getUniversities,
  getProperties,
  getPropertyDetails,
  createLead,
  getLeadStatus,
  createBooking,
  getBookingStatus,
} from "../controllers/accommodation.controller";
import { AuthMethod } from "../types/auth";

const router = Router();

// ============================================================================
// Reference Data Routes
// ============================================================================

/**
 * GET /accom/providers
 * Get all accommodation providers
 * 
 * Returns: Array of provider objects with name field
 */
router.get(
  "/providers",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  getProviders
);

/**
 * GET /accom/cities
 * Get all cities with available accommodations
 * 
 * Returns: Array of city objects with location, country, name, and id
 */
router.get(
  "/cities",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  getCities
);

/**
 * GET /accom/universities
 * Get all universities
 * 
 * Returns: Array of university objects with name, country, city, and id
 */
router.get(
  "/universities",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  getUniversities
);

// ============================================================================
// Property Routes
// ============================================================================

/**
 * GET /accom/properties
 * Get property listings with optional filters
 * 
 * Query Parameters:
 * - city (optional): Filter by city name
 * - provider (optional): Filter by provider name
 * - universityId (optional): Filter by university ID
 * 
 * Returns: Array of property objects
 */
router.get(
  "/properties",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateReqParams,
  getProperties
);

/**
 * GET /accom/properties/:id
 * Get detailed property information
 * 
 * Path Parameters:
 * - id: Property ID (24 characters)
 * 
 * Returns: Complete property details including rooms, amenities, rates, etc.
 */
router.get(
  "/properties/:id",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validatePropertyId,
  validateReqParams,
  getPropertyDetails
);

// ============================================================================
// Lead Routes
// ============================================================================

/**
 * POST /accom/leads
 * Create a new accommodation lead
 * 
 * Request Body:
 * {
 *   "firstName": string (required, max 25 chars),
 *   "lastName": string (required, max 25 chars),
 *   "email": string (required, max 52 chars),
 *   "contactNo": string (required, format: +91-xxxxxxxxxx),
 *   "dateOfBirth": string (required, format: YYYY-MM-DD),
 *   "budget": string (required, e.g., "INR-10000"),
 *   "gender": string (required, max 6 chars),
 *   "nationality": string (required),
 *   "universityId": string (required, 24 chars),
 *   "message": string (optional, max 255 chars)
 * }
 * 
 * Returns: Lead creation response with leadId
 */
router.post(
  "/leads",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateCreateLeadPayload,
  validateReqParams,
  createLead
);

/**
 * GET /accom/leads/:id
 * Get lead status by lead ID
 * 
 * Path Parameters:
 * - id: Lead ID (format: ULINAPI15424178715626)
 * 
 * Returns: Lead status object with firstName, lastName, email, contactNo, status, leadId
 */
router.get(
  "/leads/:id",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateLeadId,
  validateReqParams,
  getLeadStatus
);

// ============================================================================
// Booking Routes
// ============================================================================

/**
 * POST /accom/bookings
 * Create a new booking
 * 
 * Request Body:
 * {
 *   "propertyId": string (required, 24 chars),
 *   "price": number (required),
 *   "tenancy": string (required, e.g., "17 weeks"),
 *   "categoryId": string (required, 24 chars),
 *   "roomId": string (required, 24 chars),
 *   "message": string (optional, max 255 chars),
 *   "personalInfo": {
 *     "firstName": string (required),
 *     "lastName": string (required),
 *     "email": string (required),
 *     "mobile": string (required, format: +91-xxxxxxxxxx),
 *     "dob": string (required, format: YYYY-MM-DD),
 *     "gender": string (required),
 *     "address": string (required),
 *     "city": string (required),
 *     "state": string (required),
 *     "postcode": string (required),
 *     "country": string (required),
 *     "nationality": string (required)
 *   },
 *   "universityInfo": {
 *     "universityId": string (required, 24 chars),
 *     "courseName": string (required),
 *     "yearOfStudy": string (required),
 *     "startDate": string (required, format: YYYY-MM-DD),
 *     "endDate": string (required, format: YYYY-MM-DD)
 *   },
 *   "guardianInfo": {
 *     "fullName": string (required),
 *     "email": string (required),
 *     "mobile": string (required, format: +91-xxxxxxxxxx),
 *     "relationship": string (required),
 *     "address": string (required),
 *     "city": string (required),
 *     "state": string (required),
 *     "postcode": string (required),
 *     "country": string (required),
 *     "nationality": string (required)
 *   }
 * }
 * 
 * Returns: Booking creation response with orderId
 */
router.post(
  "/bookings",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateCreateBookingPayload,
  validateReqParams,
  createBooking
);

/**
 * GET /accom/bookings/:id
 * Get booking status by order ID
 * 
 * Path Parameters:
 * - id: Order ID (format: ULINAC08822940981927)
 * 
 * Returns: Complete booking details including status, rate, personal info, etc.
 */
router.get(
  "/bookings/:id",
  authenticate({
    method: AuthMethod.API_KEY,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  validateOrderId,
  validateReqParams,
  getBookingStatus
);

export { router as accommodationRoutes };