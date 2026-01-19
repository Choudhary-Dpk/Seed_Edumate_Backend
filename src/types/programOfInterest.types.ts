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

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example 1: Recreate programs with TypeScript
 */
/*
import axios from 'axios';

const programs: ProgramOfInterest[] = [
  {
    hs_program_id: 12345,
    program_name: "Master of Business Administration",
    school_name: "Harvard Business School",
    hs_company_id: 100
  },
  {
    hs_program_id: 12346,
    program_name: "Master of Science in Computer Science",
    school_name: "Stanford University",
    hs_company_id: 101
  }
];

const recreatePrograms = async (
  authToken: string
): Promise<RecreateProgramsSuccessResponse> => {
  const response = await axios.post<RecreateProgramsSuccessResponse>(
    'https://api.example.com/api/programs-of-interest/recreate',
    { programs },
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

// Usage
try {
  const result = await recreatePrograms('your-auth-token');
  console.log(`Deleted: ${result.data.deletedRecords}`);
  console.log(`Inserted: ${result.data.insertedRecords}`);
} catch (error) {
  console.error('Recreation failed:', error);
}
*/

/**
 * Example 2: Get all programs with pagination
 */
/*
const getAllPrograms = async (
  page: number = 1,
  limit: number = 100,
  authToken: string
): Promise<GetAllProgramsResponseData> => {
  const response = await axios.get<{data: GetAllProgramsResponseData}>(
    `https://api.example.com/api/programs-of-interest?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );

  return response.data.data;
};

// Usage
const { programs, pagination } = await getAllPrograms(1, 100, 'token');
console.log(`Page ${pagination.page} of ${pagination.totalPages}`);
programs.forEach(p => console.log(`${p.program_name} at ${p.school_name}`));
*/

/**
 * Example 3: Get single program by ID
 */
/*
const getProgramById = async (
  hsProgramId: number,
  authToken: string
): Promise<ProgramOfInterest> => {
  const response = await axios.get<{data: ProgramOfInterest}>(
    `https://api.example.com/api/programs-of-interest/${hsProgramId}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );

  return response.data.data;
};

// Usage
const program = await getProgramById(12345, 'token');
console.log(`Program: ${program.program_name}`);
*/

/**
 * Example 4: Get programs count
 */
/*
const getProgramsCount = async (
  authToken: string
): Promise<number> => {
  const response = await axios.get<{data: GetCountResponseData}>(
    'https://api.example.com/api/programs-of-interest/count',
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );

  return response.data.data.count;
};

// Usage
const count = await getProgramsCount('token');
console.log(`Total programs: ${count}`);
*/

/**
 * Example 5: Validation before upload
 */
/*
const validatePrograms = (programs: any[]): string[] => {
  const errors: string[] = [];
  const seenIds = new Set<number>();

  programs.forEach((program, index) => {
    // Check required field
    if (!program.hs_program_id && program.hs_program_id !== 0) {
      errors.push(`Program ${index + 1}: Missing hs_program_id`);
    }

    // Check for duplicates
    const id = Number(program.hs_program_id);
    if (seenIds.has(id)) {
      errors.push(`Program ${index + 1}: Duplicate hs_program_id ${id}`);
    } else {
      seenIds.add(id);
    }

    // Check types
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      errors.push(`Program ${index + 1}: hs_program_id must be an integer`);
    }
  });

  return errors;
};

// Usage before upload
const errors = validatePrograms(programs);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
} else {
  await recreatePrograms('token');
}
*/

/**
 * Example 6: Batch processing for large datasets
 */
/*
const recreateProgramsInBatches = async (
  allPrograms: ProgramOfInterest[],
  authToken: string,
  batchSize: number = 10000
): Promise<void> => {
  // Since the API handles large datasets, we typically don't need to batch
  // But if you have >50k records, you might want to split them
  
  const chunks = chunkArray(allPrograms, batchSize);
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    await recreatePrograms(authToken); // First call deletes all
    // Subsequent chunks would need to use a different endpoint (upsert/create)
  }
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
*/