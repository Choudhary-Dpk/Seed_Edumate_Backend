import { Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";

/**
 * Middleware to validate program of interest payload for bulk recreation
 */
export const validateProgramsPayload = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { programs } = req.body;

    // Check if programs array exists
    if (!programs) {
      return sendResponse(res, 400, "Missing 'programs' array in request body");
    }

    // Check if programs is an array
    if (!Array.isArray(programs)) {
      return sendResponse(res, 400, "'programs' must be an array");
    }

    // Check if array is empty
    if (programs.length === 0) {
      return sendResponse(res, 400, "Programs array cannot be empty");
    }

    // Check maximum allowed records (prevent overload)
    const MAX_RECORDS = 50000;
    if (programs.length > MAX_RECORDS) {
      return sendResponse(
        res,
        400,
        `Maximum ${MAX_RECORDS} programs allowed per request. You provided ${programs.length}.`
      );
    }

    // Validate structure of first program to ensure proper format
    const firstProgram = programs[0];
    if (typeof firstProgram !== "object" || firstProgram === null) {
      return sendResponse(
        res,
        400,
        "Each program must be an object with properties"
      );
    }

    // Validate required fields on each program
    const errors: string[] = [];
    const seenIds = new Set<number>();

    programs.forEach((program: any, index: number) => {
      // Check for required field: hs_program_id
      if (
        !program.hs_program_id &&
        program.hs_program_id !== 0 &&
        !program.hsProgramId
      ) {
        errors.push(
          `Row ${index + 1}: Missing required field 'hs_program_id' or 'hsProgramId'`
        );
      }

      // Extract hs_program_id (support both naming conventions)
      const hsProgramId = program.hs_program_id || program.hsProgramId;

      // Validate it's a number
      if (hsProgramId !== undefined && !Number.isInteger(Number(hsProgramId))) {
        errors.push(`Row ${index + 1}: 'hs_program_id' must be an integer`);
      }

      // Check for duplicates within the payload
      const programId = Number(hsProgramId);
      if (seenIds.has(programId)) {
        errors.push(
          `Row ${index + 1}: Duplicate hs_program_id '${programId}' found in payload`
        );
      } else {
        seenIds.add(programId);
      }
    });

    // If validation errors exist, return them
    if (errors.length > 0) {
      return sendResponse(res, 400, "Validation failed", { errors });
    }

    // Transform programs to consistent format (snake_case)
    const transformedPrograms = programs.map((program: any) => ({
      hs_program_id:
        program.hs_program_id || program.hsProgramId || program.id,
      program_name: program.program_name || program.programName,
      school_name: program.school_name || program.schoolName,
      hs_company_id: program.hs_company_id || program.hsCompanyId,
    }));

    // Attach transformed data to request for controller
    req.body.transformedPrograms = transformedPrograms;
    req.body.totalRecords = programs.length;

    next();
  } catch (error) {
    console.error("Error in validateProgramsPayload:", error);
    sendResponse(res, 500, "Error while validating programs payload");
  }
};