import { Request, Response } from 'express';
import multer from 'multer';
import { TemplateService } from '../services/templateService';
import { OpenAIService } from '../services/openaiService';
import { S3Service } from '../services/s3Service';
import { ApiResponse, EditResponse } from '../types';
import { asyncHandler, ValidationError, NotFoundError, ExternalServiceError } from '../utils/errorHandler';
import logger from '../utils/logger';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export class EditHandler {
  private templateService: TemplateService;
  private openaiService: OpenAIService;
  private s3Service: S3Service;

  constructor() {
    this.templateService = new TemplateService();
    this.openaiService = new OpenAIService();
    this.s3Service = new S3Service();
  }

  // Middleware for handling file upload
  uploadMiddleware = upload.single('image');

  editImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    // Validate request
    if (!req.file) {
      throw new ValidationError('No image file provided');
    }

    const { templateId } = req.body;
    if (!templateId) {
      throw new ValidationError('Template ID is required');
    }

    // Get template and prompt
    const prompt = this.templateService.getTemplatePrompt(templateId);
    if (!prompt) {
      throw new NotFoundError(`Template with ID '${templateId}' not found or invalid`);
    }

    logger.info(`Starting image edit for template: ${templateId}, file: ${req.file.originalname}`);

    try {
      // Upload original image to S3 first
      const originalImageUrl = await this.s3Service.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'uploads'
      );

      logger.info('Original image uploaded to S3 successfully');

      // Edit image with OpenAI
      const editedImageUrl = await this.openaiService.editImage(originalImageUrl, prompt);

      const processingTime = Date.now() - startTime;

      const editResponse: EditResponse = {
        success: true,
        imageUrl: editedImageUrl,
        originalImageUrl,
        processingTime,
        templateId,
      };

      const response: ApiResponse<EditResponse> = {
        success: true,
        data: editResponse,
        message: 'Image edited successfully',
        timestamp: new Date().toISOString(),
      };

      logger.info(`Image edit completed successfully in ${processingTime}ms`);
      res.json(response);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error editing image:', error);

      // Re-throw as external service error if it's from OpenAI or S3
      if (error instanceof Error && (
        error.message.includes('OpenAI') || 
        error.message.includes('S3') ||
        error.message.includes('upload')
      )) {
        throw new ExternalServiceError('Image Processing', error.message);
      }

      throw error;
    }
  });

  // Health check endpoint
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    const response: ApiResponse<{ status: string; timestamp: string }> = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      message: 'Service is running',
    };

    res.json(response);
  };
}
