// src/types/common.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    operation?: string;
  };
  errorMeta?: {
    stack?: string;
    statusCode?: number;
  };
}

export interface PaginationOptions {
  limit?: number;
  after?: string;
}

export interface SearchOptions extends PaginationOptions {
  properties?: string[];
  sorts?: {
    propertyName: string;
    direction: 'ASCENDING' | 'DESCENDING';
  }[];
}
