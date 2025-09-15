import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Generic validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errorMessages
    });
  }

  return next();
};

// Custom validation rules
export const validateTemplateId = [
  param('id').isLength({ min: 1, max: 50 }).withMessage('Template ID must be between 1 and 50 characters'),
  param('id').matches(/^[a-zA-Z0-9_-]+$/).withMessage('Template ID can only contain letters, numbers, hyphens, and underscores'),
  handleValidationErrors
];

export const validateSearchQuery = [
  query('q').isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  query('category').optional().isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateCategory = [
  param('category').isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),
  param('category').matches(/^[a-zA-Z0-9\s-_]+$/).withMessage('Category can only contain letters, numbers, spaces, hyphens, and underscores'),
  handleValidationErrors
];

export const validateEditRequest = [
  body('templateId').isLength({ min: 1, max: 50 }).withMessage('Template ID must be between 1 and 50 characters'),
  body('templateId').matches(/^[a-zA-Z0-9_-]+$/).withMessage('Template ID can only contain letters, numbers, hyphens, and underscores'),
  handleValidationErrors
];

// File validation middleware
export const validateImageFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No image file provided',
      code: 'MISSING_FILE'
    });
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds 10MB limit',
      code: 'FILE_TOO_LARGE'
    });
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed',
      code: 'INVALID_FILE_TYPE'
    });
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = req.file.originalname.toLowerCase().substring(req.file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file extension',
      code: 'INVALID_FILE_EXTENSION'
    });
  }

  return next();
};

// Sanitize input data
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]?.toString().trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].trim();
      }
    });
  }

  next();
};
