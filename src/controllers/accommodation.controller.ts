/**
 * Accommodation API Controller
 * 
 * This controller acts as a pure proxy, forwarding requests to University Living API
 * and returning responses without modification.
 */

import { Response, NextFunction } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import * as universityLivingService from "../services/universityLiving.service";

/**
 * Helper function to handle errors from University Living API
 */
const handleULError = (error: any, res: Response) => {
  if (error.response) {
    // Forward the error response from UL API as-is
    return res.status(error.response.status).json(error.response.data);
  } else if (error.request) {
    // Request was made but no response received
    return sendResponse(
      res,
      503,
      "Unable to reach University Living API. Please try again later."
    );
  } else {
    // Something else happened
    return sendResponse(res, 500, "An error occurred while processing your request");
  }
};

// ============================================================================
// Reference Data Controllers
// ============================================================================

/**
 * Get all accommodation providers
 * GET /accom/providers
 */
export const getProviders = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await universityLivingService.getProviders();
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

/**
 * Get all cities with accommodations
 * GET /accom/cities
 */
export const getCities = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await universityLivingService.getCities();
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

/**
 * Get all universities
 * GET /accom/universities
 */
export const getUniversities = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await universityLivingService.getUniversities();
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

// ============================================================================
// Property Controllers
// ============================================================================

/**
 * Get property listings with optional filters
 * GET /accom/properties?city=London&provider=iQ&universityId=xxx
 */
export const getProperties = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, provider, universityId } = req.query;
    
    const query: any = {};
    if (city) query.city = city;
    if (provider) query.provider = provider;
    if (universityId) query.universityId = universityId;

    const response = await universityLivingService.getProperties(query);
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

/**
 * Get property details by ID
 * GET /accom/properties/:id
 */
export const getPropertyDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const response = await universityLivingService.getPropertyDetails(id);
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

// ============================================================================
// Lead Controllers
// ============================================================================

/**
 * Create a new lead
 * POST /accom/leads
 */
export const createLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const response = await universityLivingService.createLead(payload);
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

/**
 * Get lead status by ID
 * GET /accom/leads/:id
 */
export const getLeadStatus = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const response = await universityLivingService.getLeadStatus(id);
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

// ============================================================================
// Booking Controllers
// ============================================================================

/**
 * Create a new booking
 * POST /accom/bookings
 */
export const createBooking = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const response = await universityLivingService.createBooking(payload);
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};

/**
 * Get booking status by order ID
 * GET /accom/bookings/:id
 */
export const getBookingStatus = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const response = await universityLivingService.getBookingStatus(id);
    return res.status(response.status).json(response.data);
  } catch (error) {
    return handleULError(error, res);
  }
};