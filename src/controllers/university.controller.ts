import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { searchUniversities } from "../services/university.service";

export const searchUniversitiesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req.query.q as string || "").trim();

    if (!query || query.length < 2) {
      return sendResponse(res, 400, "Query parameter 'q' must be at least 2 characters");
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const size = Math.min(
      Math.max(parseInt(req.query.size as string) || 10, 1),
      100
    );

    const result = await searchUniversities(query, page, size);

    if (!result.total) {
      return sendResponse(res, 404, "No universities found matching your query");
    }

    return sendResponse(res, 200, "Universities fetched successfully", result);
  } catch (err) {
    next(err);
  }
};
