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
 * Pagination structure
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
