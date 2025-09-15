import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 403, 'FORBIDDEN', true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true, { retryAfter });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', true, details);
  }
}

export class FileProcessingError extends AppError {
  constructor(message: string, details?: any) {
    super(`File processing error: ${message}`, 422, 'FILE_PROCESSING_ERROR', true, details);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  timestamp: string;
  path: string;
  requestId?: string;
  details?: any;
}

// Main error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).requestId;

  // Log the error
  logger.error('Unhandled error occurred', error, requestId, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    return sendErrorResponse(res, error, requestId, req.path);
  }

  // Handle multer errors
  if (error.name === 'MulterError') {
    return handleMulterError(error, res, requestId, req.path);
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const validationError = new ValidationError(error.message);
    return sendErrorResponse(res, validationError, requestId, req.path);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const jwtError = new UnauthorizedError('Invalid token');
    return sendErrorResponse(res, jwtError, requestId, req.path);
  }

  if (error.name === 'TokenExpiredError') {
    const tokenExpiredError = new UnauthorizedError('Token expired');
    return sendErrorResponse(res, tokenExpiredError, requestId, req.path);
  }

  // Handle database errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    const dbError = new AppError('Database operation failed', 500, 'DATABASE_ERROR', false);
    return sendErrorResponse(res, dbError, requestId, req.path);
  }

  // Handle network errors
  if (error.name === 'FetchError' || error.name === 'NetworkError') {
    const networkError = new ExternalServiceError('Network', 'Network request failed');
    return sendErrorResponse(res, networkError, requestId, req.path);
  }

  // Handle timeout errors
  if (error.name === 'TimeoutError') {
    const timeoutError = new AppError('Request timeout', 408, 'TIMEOUT_ERROR', true);
    return sendErrorResponse(res, timeoutError, requestId, req.path);
  }

  // Default to internal server error
  const internalError = new AppError(
    process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    500,
    'INTERNAL_ERROR',
    false
  );

  return sendErrorResponse(res, internalError, requestId, req.path);
};

// Send error response
function sendErrorResponse(
  res: Response,
  error: AppError,
  requestId: string | undefined,
  path: string
) {
  const response: ErrorResponse = {
    success: false,
    error: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    path,
    requestId
  };

  // Add details in development or for operational errors
  if (process.env.NODE_ENV === 'development' || error.isOperational) {
    response.details = error.details;
  }

  res.status(error.statusCode).json(response);
}

// Handle multer errors specifically
function handleMulterError(
  error: any,
  res: Response,
  requestId: string | undefined,
  path: string
) {
  let appError: AppError;

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      appError = new FileProcessingError('File size too large', { maxSize: '10MB' });
      break;
    case 'LIMIT_FILE_COUNT':
      appError = new FileProcessingError('Too many files', { maxFiles: 1 });
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      appError = new FileProcessingError('Unexpected file field');
      break;
    case 'LIMIT_PART_COUNT':
      appError = new FileProcessingError('Too many parts in multipart form');
      break;
    case 'LIMIT_FIELD_KEY':
      appError = new FileProcessingError('Field name too long');
      break;
    case 'LIMIT_FIELD_VALUE':
      appError = new FileProcessingError('Field value too long');
      break;
    case 'LIMIT_FIELD_COUNT':
      appError = new FileProcessingError('Too many fields');
      break;
    default:
      appError = new FileProcessingError('File upload error');
  }

  return sendErrorResponse(res, appError, requestId, path);
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const notFoundError = new NotFoundError(`Endpoint ${req.method} ${req.path}`);
  
  logger.warn('Endpoint not found', (req as any).requestId, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  return sendErrorResponse(res, notFoundError, (req as any).requestId, req.path);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Health check error handler
export const healthCheckErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).requestId;
  
  logger.error('Health check failed', error, requestId);

  res.status(503).json({
    success: false,
    error: 'Service unhealthy',
    code: 'SERVICE_UNAVAILABLE',
    timestamp: new Date().toISOString(),
    requestId
  });
};
