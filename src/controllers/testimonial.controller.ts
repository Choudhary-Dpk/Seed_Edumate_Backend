import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonialById,
  getTestimonials,
  updateTestimonial,
} from "../models/helpers/testimonial.helper";
import logger from "../utils/logger";

export const createTestimonialController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.debug("Creating new testimonial", {
      body: req.body,
    });
    const result = await createTestimonial(req.body);
    logger.debug("Testimonial created successfully", { id: result.id });

    sendResponse(res, 201, "Testimonial created successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getAllTestimonialsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const offset = (page - 1) * size;

    logger.debug("Fetching testimonials", {
      page,
      size,
      offset,
    });

    const { rows, count } = await getTestimonials(size, offset);

    logger.debug("Testimonials fetched successfully", {
      count,
      returned: rows.length,
    });

    sendResponse(res, 200, "Testimonials fetched successfully", {
      data: rows,
      total: count,
      page,
      size,
      totalPages: Math.ceil(count / size),
    });
  } catch (error) {
    next(error);
  }
};

export const getTestimonailByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    logger.debug("Fetching testimonial", { id });
    const result = await getTestimonialById(id);
    if (!result) {
      logger.debug("Testimonial not found", {
        id,
      });
      return sendResponse(res, 404, "Testimonial not found");
    }

    logger.debug("Testimonial fetched successfully", { id });

    sendResponse(res, 200, "Testimonial fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const editTestimonialController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    logger.debug("Updating testimonial", {
      id,
      body: req.body,
    });
    const existing = await getTestimonialById(id);
    if (!existing) {
      logger.debug("Testimonial not found", { id });
      return sendResponse(res, 404, "Testimonial not found");
    }

    const result = await updateTestimonial(id, req.body);

    logger.debug("Testimonial updated successfully", { id });

    sendResponse(res, 200, "Testimonial updated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonialController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    logger.debug("Deleting testimonial", { id });
    const existing = await getTestimonialById(id);
    if (!existing) {
      logger.debug("Testimonial not found", {
        id,
      });
      return sendResponse(res, 404, "Testimonial not found");
    }

    await deleteTestimonial(id);

    logger.debug("Testimonial deleted successfully", { id });

    sendResponse(res, 200, "Testimonial deleted successfully");
  } catch (error) {
    next(error);
  }
};
