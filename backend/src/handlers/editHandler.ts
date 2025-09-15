import { Request, Response } from 'express';
import multer from 'multer';
import { TemplateService } from '../services/templateService';
import { OpenAIService } from '../services/openaiService';
import { S3Service } from '../services/s3Service';
import { ImageOptimizationService } from '../services/imageOptimization';
import { logger } from '../middleware/logging';
import { ValidationError, NotFoundError, FileProcessingError, ExternalServiceError } from '../middleware/errorHandling';
import { analyticsService } from '../services/analyticsService';
import { userSessionService } from '../services/userSessionService';
import { Template } from '../models/Template';
import { v4 as uuidv4 } from 'uuid';

// Define types locally
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface EditResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  processingTime?: number;
}

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
  private imageOptimizationService: ImageOptimizationService;

  constructor() {
    this.templateService = new TemplateService();
    this.openaiService = new OpenAIService();
    this.s3Service = new S3Service();
    this.imageOptimizationService = new ImageOptimizationService();
  }

  // Middleware for handling file upload
  uploadMiddleware = upload.single('image');

  editImage = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const requestId = (req as any).requestId;
    
    try {
      // Validate request
      if (!req.file) {
        throw new ValidationError('No image file provided');
      }

      const { templateId } = req.body;
      if (!templateId) {
        throw new ValidationError('Template ID is required');
      }

      // Get or create session
      let sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        const session = await userSessionService.createSession(undefined, {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress
        });
        sessionId = session.sessionId;
      }

      // Update session activity
      userSessionService.updateSessionActivity(sessionId);

      logger.info('Starting image edit process', requestId, {
        templateId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        sessionId
      });

      // Validate and optimize the uploaded image
      const isValidImage = await this.imageOptimizationService.validateImage(req.file.buffer);
      if (!isValidImage) {
        throw new FileProcessingError('Invalid image file');
      }

      // Get image metadata
      const metadata = await this.imageOptimizationService.getImageMetadata(req.file.buffer);
      logger.debug('Image metadata', requestId, metadata);

      // Optimize the image before processing
      const optimizationResult = await this.imageOptimizationService.optimizeImage(
        req.file.buffer,
        {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 90,
          format: 'jpeg'
        }
      );

      logger.info('Image optimized', requestId, {
        originalSize: optimizationResult.originalSize,
        optimizedSize: optimizationResult.optimizedSize,
        compressionRatio: optimizationResult.compressionRatio
      });

      // Get template and prompt (try database first, fallback to service)
      let template = null;
      let prompt = null;

      try {
        template = await Template.findById(templateId);
        if (template) {
          prompt = template.prompt;
        }
      } catch (error) {
        logger.debug('Template not found in database, trying service', requestId);
      }

      if (!prompt) {
        prompt = this.templateService.getTemplatePrompt(templateId);
        if (!prompt) {
          throw new NotFoundError('Template');
        }
      }

      // Upload optimized original image to S3
      const originalImageUrl = await this.s3Service.uploadImage(
        optimizationResult.buffer,
        this.imageOptimizationService.generateFilename(req.file.originalname, 'jpg'),
        'uploads'
      );

      logger.debug('Original image uploaded to S3', requestId, { originalImageUrl });

      // Edit image with OpenAI
      const editedImageUrl = await this.openaiService.editImage(originalImageUrl, prompt);

      const processingTime = Date.now() - startTime;

      // Record analytics and session data
      try {
        const session = userSessionService.getSession(sessionId);
        
        await analyticsService.recordEditSession({
          userId: session?.userId,
          sessionId,
          templateId,
          originalImage: {
            url: originalImageUrl,
            filename: req.file.originalname,
            size: req.file.size,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format || 'jpg'
          },
          editedImage: {
            url: editedImageUrl,
            filename: `edited_${uuidv4()}.jpg`,
            size: optimizationResult.optimizedSize,
            width: optimizationResult.width,
            height: optimizationResult.height,
            format: 'jpg'
          },
          processing: {
            startTime: new Date(startTime),
            endTime: new Date(),
            duration: processingTime,
            status: 'completed',
            optimizationApplied: true,
            compressionRatio: optimizationResult.compressionRatio
          },
          metadata: {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            requestId,
            templateVersion: template?.metadata?.version || '1.0.0'
          }
        });

        // Update template usage if from database
        if (template && 'incrementUsage' in template && typeof (template as any).incrementUsage === 'function') {
          await (template as any).incrementUsage(processingTime, true);
        }
      } catch (analyticsError) {
        logger.warn('Failed to record analytics', undefined, { error: String(analyticsError) });
        // Don't fail the request if analytics fails
      }

      const editResponse: EditResponse = {
        success: true,
        imageUrl: editedImageUrl,
        processingTime,
      };

      logger.info('Image edit completed successfully', requestId, {
        templateId,
        processingTime,
        originalImageUrl,
        editedImageUrl,
        sessionId
      });

      // Set session ID header for client
      res.set('X-Session-ID', sessionId);

      res.json({
        success: true,
        data: editResponse,
        message: 'Image edited successfully',
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'ExternalServiceError') {
        logger.error('External service error during image edit', error, requestId, {
          templateId: req.body?.templateId,
          processingTime
        });
        throw new ExternalServiceError('OpenAI', error.message);
      }

      logger.error('Error editing image', error, requestId, {
        templateId: req.body?.templateId,
        processingTime,
        fileName: req.file?.originalname
      });

      throw error;
    }
  };

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
