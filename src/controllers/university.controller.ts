import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import {
  findPartnerByNames,
  findUniversityByHsCompanyId,
  findUniversityByName,
  getProgramsForUniversity,
  searchUniversities,
  serializeUniversity,
} from "../services/university.service";

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

export const getUniversityByCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hsCompanyId = (req.params.hs_company_id as string)?.trim();
    if (!hsCompanyId) {
      return sendResponse(res, 400, "hs_company_id is required");
    }

    const includePrograms = String(req.query.include || "")
      .split(",")
      .map((s) => s.trim())
      .includes("programs");

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const size = Math.min(
      Math.max(parseInt(req.query.size as string) || 10, 1),
      100
    );
    const degreeType = (req.query.degree_type as string)?.trim() || null;
    const studentType = (req.query.student_type as string)?.trim() || null;
    const search = (req.query.search as string)?.trim() || null;

    const { partner, university, matchSource } =
      await findUniversityByHsCompanyId(hsCompanyId);

    if (!partner) {
      return sendResponse(res, 404, "No partner found for this hs_company_id");
    }

    // b2b_partner_id is the most important field for the caller — surface it explicitly.
    const partnerOut = {
      b2b_partner_id: partner.id,
      ...partner,
    };

    if (!university) {
      return sendResponse(
        res,
        200,
        "Partner found but no matching university in d_universities",
        {
          partner: partnerOut,
          university: null,
          matchSource: null,
        }
      );
    }

    const universityOut = serializeUniversity(university);

    if (!includePrograms) {
      return sendResponse(res, 200, "University resolved successfully", {
        partner: partnerOut,
        university: universityOut,
        matchSource,
      });
    }

    const programs = await getProgramsForUniversity(
      BigInt(university.id),
      page,
      size,
      { degreeType, studentType, search }
    );

    return sendResponse(
      res,
      200,
      "University and programs resolved successfully",
      {
        partner: partnerOut,
        university: universityOut,
        matchSource,
        programs,
      }
    );
  } catch (err) {
    next(err);
  }
};

export const getUniversityByNameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Accept name from path param OR query string for flexibility with spaces.
    const rawName =
      ((req.params.name as string) || (req.query.name as string) || "").trim();
    if (!rawName || rawName.length < 2) {
      return sendResponse(res, 400, "name must be at least 2 characters");
    }

    const includePrograms = String(req.query.include || "")
      .split(",")
      .map((s) => s.trim())
      .includes("programs");

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const size = Math.min(
      Math.max(parseInt(req.query.size as string) || 10, 1),
      100
    );
    const degreeType = (req.query.degree_type as string)?.trim() || null;
    const studentType = (req.query.student_type as string)?.trim() || null;
    const search = (req.query.search as string)?.trim() || null;

    const { university, matchSource } = await findUniversityByName(rawName);

    if (!university) {
      return sendResponse(res, 404, "No university found matching this name");
    }

    const universityOut = serializeUniversity(university);

    // Try to also resolve a B2B partner row by matching the input name AND the
    // canonical d_universities.name. The partner table often has trailing
    // whitespace or display variants, so we let the helper try both inputs.
    const { partner, matchSource: partnerMatchSource } = await findPartnerByNames([
      rawName,
      university.name,
    ]);

    const partnerOut = partner
      ? {
          b2b_partner_id: partner.id,
          ...partner,
        }
      : null;

    if (!includePrograms) {
      return sendResponse(res, 200, "University resolved successfully", {
        partner: partnerOut,
        partnerMatchSource,
        university: universityOut,
        matchSource,
      });
    }

    const programs = await getProgramsForUniversity(
      BigInt(university.id),
      page,
      size,
      { degreeType, studentType, search }
    );

    return sendResponse(
      res,
      200,
      "University and programs resolved successfully",
      {
        partner: partnerOut,
        partnerMatchSource,
        university: universityOut,
        matchSource,
        programs,
      }
    );
  } catch (err) {
    next(err);
  }
};
