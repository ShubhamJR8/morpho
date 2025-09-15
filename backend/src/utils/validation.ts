import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ValidationError } from '../types';

// Validation schemas
export const schemas = {
  // Template search validation
  templateSearch: Joi.object({
    q: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Search query cannot be empty',
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query cannot exceed 100 characters',
    }),
    category: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(50).default(20).messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50',
    }),
    offset: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Offset must be at least 0',
    }),
  }),

  // Template ID validation
  templateId: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Template ID is required',
    }),
  }),

  // Category validation
  category: Joi.object({
    category: Joi.string().required().messages({
      'string.empty': 'Category is required',
    }),
  }),

  // Image edit validation
  imageEdit: Joi.object({
    templateId: Joi.string().required().messages({
      'string.empty': 'Template ID is required',
    }),
  }),
};

// Generic validation middleware factory
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      const response: ApiResponse<{ errors: ValidationError[] }> = {
        success: false,
        error: 'Validation failed',
        data: { errors: validationErrors },
      };

      res.status(400).json(response);
      return;
    }

    // Replace the original data with validated and sanitized data
    if (source === 'body') {
      req.body = value;
    } else if (source === 'query') {
      req.query = value;
    } else {
      req.params = value;
    }

    next();
  };
};

// File validation middleware
export const validateFile = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'No image file provided',
    };
    res.status(400).json(response);
    return;
  }

  // Check file type
  if (!req.file.mimetype.startsWith('image/')) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Only image files are allowed',
    };
    res.status(400).json(response);
    return;
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'File size too large. Maximum size is 10MB.',
    };
    res.status(400).json(response);
    return;
  }

  next();
};

// Environment validation
export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};
