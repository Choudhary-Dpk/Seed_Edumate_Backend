// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/looger';
import { ApiResponse } from '../types';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export interface ErrorWithMetadata extends Error {
  statusCode?: number;
  isOperational?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Main error handling middleware
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error details with context
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    statusCode,
    isOperational,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Prepare error response
  const response: ApiResponse = {
    success: false,
    message: isOperational ? err.message : 'Internal server error'
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.errorMeta = {
      stack: err.stack,
      statusCode
    };
  }

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) => {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create a custom error with proper typing
 */
export const createError = (
  message: string, 
  statusCode: number = 500,
  metadata?: Record<string, any>
): ErrorWithMetadata => {
  const error: ErrorWithMetadata = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.metadata = metadata;
  return error;
};

/**
 * Create validation error
 */
export const createValidationError = (
  message: string,
  field?: string,
  value?: any
): ErrorWithMetadata => {
  return createError(message, 400, {
    type: 'validation',
    field,
    value
  });
};

/**
 * Create not found error
 */
export const createNotFoundError = (resource: string, id?: string): ErrorWithMetadata => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return createError(message, 404, {
    type: 'not_found',
    resource,
    id
  });
};

/**
 * Create unauthorized error
 */
export const createUnauthorizedError = (message: string = 'Unauthorized'): ErrorWithMetadata => {
  return createError(message, 401, {
    type: 'unauthorized'
  });
};

/**
 * Create forbidden error
 */
export const createForbiddenError = (message: string = 'Forbidden'): ErrorWithMetadata => {
  return createError(message, 403, {
    type: 'forbidden'
  });
};

/**
 * Create HubSpot API error
 */
export const createHubSpotError = (
  message: string,
  originalError?: any,
  operation?: string
): ErrorWithMetadata => {
  return createError(`HubSpot API Error: ${message}`, 502, {
    type: 'hubspot_api',
    originalError: originalError?.message,
    operation
  });
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
  
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Exit the process as the application is in an unstable state
  process.exit(1);
});

/**
 * Graceful shutdown handler
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});