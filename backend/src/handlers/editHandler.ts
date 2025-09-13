import { Request, Response } from 'express';
import multer from 'multer';
import { TemplateService } from '../services/templateService';
import { OpenAIService } from '../services/openaiService';
import { S3Service } from '../services/s3Service';

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

  constructor() {
    this.templateService = new TemplateService();
    this.openaiService = new OpenAIService();
    this.s3Service = new S3Service();
  }

  // Middleware for handling file upload
  uploadMiddleware = upload.single('image');

  editImage = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
      // Validate request
      if (!req.file) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No image file provided',
        };
        res.status(400).json(response);
        return;
      }

      const { templateId } = req.body;
      if (!templateId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Template ID is required',
        };
        res.status(400).json(response);
        return;
      }

      // Get template and prompt
      const prompt = this.templateService.getTemplatePrompt(templateId);
      if (!prompt) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Template not found or invalid',
        };
        res.status(404).json(response);
        return;
      }

      console.log(`Starting image edit for template: ${templateId}`);

      // Upload original image to S3 first
      const originalImageUrl = await this.s3Service.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'uploads'
      );

      console.log('Original image uploaded to S3:', originalImageUrl);

      // Edit image with OpenAI
      const editedImageUrl = await this.openaiService.editImage(originalImageUrl, prompt);

      const processingTime = Date.now() - startTime;

      const editResponse: EditResponse = {
        success: true,
        imageUrl: editedImageUrl,
        processingTime,
      };

      const response: ApiResponse<EditResponse> = {
        success: true,
        data: editResponse,
        message: 'Image edited successfully',
      };

      console.log(`Image edit completed in ${processingTime}ms`);
      res.json(response);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Error editing image:', error);

      const editResponse: EditResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime,
      };

      const response: ApiResponse<EditResponse> = {
        success: false,
        data: editResponse,
        error: 'Failed to edit image',
      };

      res.status(500).json(response);
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
