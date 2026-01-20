import { Response, NextFunction } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import logger from "../utils/logger";
import { sendResponse } from "../utils/api";
import prisma from "../config/prisma";

/**
 * Controller to recreate all records in f_program_of_interest table
 * POST /api/programs-of-interest/recreate
 * 
 * This endpoint will:
 * 1. Delete all existing records
 * 2. Insert new records from the payload
 * 3. Return statistics about the operation
 */
export const recreateProgramsOfInterest = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.payload?.id || req.body?.id);
    const { transformedPrograms, totalRecords } = req.body;

    if (!transformedPrograms || !Array.isArray(transformedPrograms)) {
      return sendResponse(res, 400, "Invalid or missing programs data");
    }

    logger.debug(
      `Starting recreation of f_program_of_interest table with ${totalRecords} records by userId: ${id}`
    );

    // Start transaction to ensure atomicity
    const result = await prisma.$transaction(
      async (tx) => {
        // Step 1: Delete all existing records
        logger.debug(`Deleting all existing records from f_program_of_interest`);
        const deleteResult = await tx.fProgramOfInterest.deleteMany({});
        logger.debug(`Deleted ${deleteResult.count} existing records`);

        // Step 2: Insert new records
        logger.debug(`Inserting ${transformedPrograms.length} new records`);
        
        // Batch insert for better performance
        const BATCH_SIZE = 1000;
        let totalInserted = 0;
        const insertionErrors: any[] = [];

        for (let i = 0; i < transformedPrograms.length; i += BATCH_SIZE) {
          const batch = transformedPrograms.slice(i, i + BATCH_SIZE);
          const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

          try {
            logger.debug(
              `Inserting batch ${batchNumber} (${batch.length} records)`
            );

            const insertResult = await tx.fProgramOfInterest.createMany({
              data: batch,
              skipDuplicates: false, // We want to catch duplicate errors
            });

            totalInserted += insertResult.count;
            logger.debug(`Batch ${batchNumber}: ${insertResult.count} records inserted`);
          } catch (error: any) {
            logger.error(`Batch ${batchNumber}: Insertion failed`, { error });
            insertionErrors.push({
              batchNumber,
              error: error.message,
              recordCount: batch.length,
              startIndex: i,
              endIndex: i + batch.length - 1,
            });
            
            // Rollback entire transaction on error
            throw error;
          }
        }

        logger.debug(`Successfully inserted ${totalInserted} records`);

        return {
          deletedCount: deleteResult.count,
          insertedCount: totalInserted,
          errors: insertionErrors,
        };
      },
      {
        timeout: 300000, // 5 minutes timeout for large datasets
      }
    );

    logger.debug(
      `Recreation completed: deleted ${result.deletedCount}, inserted ${result.insertedCount}`
    );

    return sendResponse(
      res,
      201,
      "Programs of interest recreated successfully",
      {
        totalRecords: totalRecords,
        deletedRecords: result.deletedCount,
        insertedRecords: result.insertedCount,
        errors: result.errors,
      }
    );
  } catch (error: any) {
    logger.error("Error in recreateProgramsOfInterest:", error);

    // Check for specific Prisma errors
    if (error.code === "P2002") {
      return sendResponse(
        res,
        409,
        "Duplicate hs_program_id found in database",
        {
          error: error.message,
          meta: error.meta,
        }
      );
    }

    if (error.code === "P2003") {
      return sendResponse(
        res,
        400,
        "Foreign key constraint violation",
        {
          error: error.message,
          meta: error.meta,
        }
      );
    }

    next(error);
  }
};

/**
 * Controller to get all programs of interest
 * GET /api/programs-of-interest
 */
export const getAllProgramsOfInterest = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 100 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    logger.debug(`Fetching programs of interest: page ${page}, limit ${limit}`);

    const [programs, totalCount] = await Promise.all([
      prisma.fProgramOfInterest.findMany({
        skip,
        take,
        orderBy: {
          hs_program_id: "asc",
        },
      }),
      prisma.fProgramOfInterest.count(),
    ]);

    logger.debug(`Found ${programs.length} programs (total: ${totalCount})`);

    return sendResponse(res, 200, "Programs of interest fetched successfully", {
      programs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error in getAllProgramsOfInterest:", error);
    next(error);
  }
};

/**
 * Controller to get a single program of interest by hs_program_id
 * GET /api/programs-of-interest/:hs_program_id
 */
export const getProgramOfInterestById = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const hsProgramId = parseInt(req.params.hs_program_id);

    if (isNaN(hsProgramId)) {
      return sendResponse(res, 400, "Invalid hs_program_id");
    }

    logger.debug(`Fetching program of interest with id: ${hsProgramId}`);

    const program = await prisma.fProgramOfInterest.findUnique({
      where: {
        hs_program_id: hsProgramId,
      },
    });

    if (!program) {
      return sendResponse(res, 404, "Program of interest not found");
    }

    return sendResponse(
      res,
      200,
      "Program of interest fetched successfully",
      program
    );
  } catch (error) {
    logger.error("Error in getProgramOfInterestById:", error);
    next(error);
  }
};

/**
 * Controller to get count of programs
 * GET /api/programs-of-interest/count
 */
export const getProgramsCount = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.debug(`Counting programs of interest`);

    const count = await prisma.fProgramOfInterest.count();

    logger.debug(`Total programs count: ${count}`);

    return sendResponse(res, 200, "Programs count fetched successfully", {
      count,
    });
  } catch (error) {
    logger.error("Error in getProgramsCount:", error);
    next(error);
  }
};

/**
 * Controller to delete all programs (for testing/cleanup)
 * DELETE /api/programs-of-interest/truncate
 * 
 * WARNING: This will delete all records without recreation
 */
export const truncateProgramsOfInterest = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.payload?.id || req.body?.id);

    logger.warn(
      `User ${id} is truncating f_program_of_interest table - THIS WILL DELETE ALL RECORDS`
    );

    const result = await prisma.fProgramOfInterest.deleteMany({});

    logger.warn(`Deleted ${result.count} records from f_program_of_interest`);

    return sendResponse(res, 200, "All programs of interest deleted", {
      deletedCount: result.count,
    });
  } catch (error) {
    logger.error("Error in truncateProgramsOfInterest:", error);
    next(error);
  }
};