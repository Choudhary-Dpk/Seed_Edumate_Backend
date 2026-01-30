/**
 * Type definitions for Program of Interest API
 */

/**
 * Program of Interest structure matching database schema
 */
export interface ProgramOfInterest {
  hs_program_id: number; // Primary key, must be unique
  program_name: string | null;
  school_name: string | null;
  hs_company_id: number | null;
}

/**
 * Alternative camelCase version for API requests
 */
export interface ProgramOfInterestCamelCase {
  hsProgramId: number;
  programName?: string | null;
  schoolName?: string | null;
  hsCompanyId?: number | null;
}

/**
 * Request body for recreating programs
 */
export interface RecreateProgramsRequest {
  programs: (ProgramOfInterest | ProgramOfInterestCamelCase)[];
}

/**
 * Response data for recreate operation
 */
export interface RecreateProgramsResponseData {
  totalRecords: number;
  deletedRecords: number;
  insertedRecords: number;
  errors: InsertionError[];
}

/**
 * Insertion error structure
 */
export interface InsertionError {
  batchNumber: number;
  error: string;
  recordCount: number;
  startIndex: number;
  endIndex: number;
}

/**
 * API response structure (success)
 */
export interface RecreateProgramsSuccessResponse {
  statusCode: 201;
  message: string;
  data: RecreateProgramsResponseData;
}

/**
 * Pagination structure
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response for get all programs
 */
export interface GetAllProgramsResponseData {
  programs: ProgramOfInterest[];
  pagination: Pagination;
}

/**
 * Response for get count
 */
export interface GetCountResponseData {
  count: number;
}

/**
 * Response for truncate operation
 */
export interface TruncateProgramsResponseData {
  deletedCount: number;
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  statusCode: 400 | 401 | 403 | 404 | 409 | 500;
  message: string;
  data?: any;
}