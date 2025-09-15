import request from 'supertest';
import app from '../index';
import { TemplateService } from '../services/templateService';
import { OpenAIService } from '../services/openaiService';
import { S3Service } from '../services/s3Service';
import { ImageOptimizationService } from '../services/imageOptimization';

// Mock all services
jest.mock('../services/templateService');
jest.mock('../services/openaiService');
jest.mock('../services/s3Service');
jest.mock('../services/imageOptimization');

describe('EditHandler', () => {
  let mockTemplateService: jest.Mocked<TemplateService>;
  let mockOpenAIService: jest.Mocked<OpenAIService>;
  let mockS3Service: jest.Mocked<S3Service>;
  let mockImageOptimizationService: jest.Mocked<ImageOptimizationService>;

  beforeEach(() => {
    mockTemplateService = new TemplateService() as jest.Mocked<TemplateService>;
    mockOpenAIService = new OpenAIService() as jest.Mocked<OpenAIService>;
    mockS3Service = new S3Service() as jest.Mocked<S3Service>;
    mockImageOptimizationService = new ImageOptimizationService() as jest.Mocked<ImageOptimizationService>;

    (TemplateService as jest.Mock).mockImplementation(() => mockTemplateService);
    (OpenAIService as jest.Mock).mockImplementation(() => mockOpenAIService);
    (S3Service as jest.Mock).mockImplementation(() => mockS3Service);
    (ImageOptimizationService as jest.Mock).mockImplementation(() => mockImageOptimizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/edit', () => {
    const mockImageBuffer = Buffer.from('fake-image-data');
    const mockFile = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: mockImageBuffer,
      size: 1024
    } as Express.Multer.File;

    it('should successfully edit an image', async () => {
      // Setup mocks
      mockTemplateService.getTemplatePrompt.mockReturnValue('Test prompt');
      mockImageOptimizationService.validateImage.mockResolvedValue(true);
      mockImageOptimizationService.getImageMetadata.mockResolvedValue({
        width: 800,
        height: 600,
        format: 'jpeg',
        size: 1024,
        hasAlpha: false,
        channels: 3,
        density: 72
      });
      mockImageOptimizationService.optimizeImage.mockResolvedValue({
        buffer: mockImageBuffer,
        originalSize: 1024,
        optimizedSize: 800,
        compressionRatio: 22,
        format: 'jpeg',
        width: 800,
        height: 600
      });
      mockImageOptimizationService.generateFilename.mockReturnValue('optimized-test.jpg');
      mockS3Service.uploadImage.mockResolvedValue('https://s3.amazonaws.com/test-bucket/uploads/optimized-test.jpg');
      mockOpenAIService.editImage.mockResolvedValue('https://s3.amazonaws.com/test-bucket/generated/result.jpg');

      const response = await request(app)
        .post('/api/edit')
        .attach('image', mockImageBuffer, 'test.jpg')
        .field('templateId', 't1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.imageUrl).toBe('https://s3.amazonaws.com/test-bucket/generated/result.jpg');
      expect(response.body.data.processingTime).toBeGreaterThan(0);

      // Verify service calls
      expect(mockTemplateService.getTemplatePrompt).toHaveBeenCalledWith('t1');
      expect(mockImageOptimizationService.validateImage).toHaveBeenCalledWith(mockImageBuffer);
      expect(mockImageOptimizationService.optimizeImage).toHaveBeenCalled();
      expect(mockS3Service.uploadImage).toHaveBeenCalled();
      expect(mockOpenAIService.editImage).toHaveBeenCalled();
    });

    it('should return 400 if no image file provided', async () => {
      const response = await request(app)
        .post('/api/edit')
        .field('templateId', 't1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No image file provided');
    });

    it('should return 400 if template ID is missing', async () => {
      const response = await request(app)
        .post('/api/edit')
        .attach('image', mockImageBuffer, 'test.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Template ID is required');
    });

    it('should return 404 if template not found', async () => {
      mockTemplateService.getTemplatePrompt.mockReturnValue(null);

      const response = await request(app)
        .post('/api/edit')
        .attach('image', mockImageBuffer, 'test.jpg')
        .field('templateId', 'nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Template not found');
    });

    it('should return 422 if image validation fails', async () => {
      mockTemplateService.getTemplatePrompt.mockReturnValue('Test prompt');
      mockImageOptimizationService.validateImage.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/edit')
        .attach('image', mockImageBuffer, 'test.jpg')
        .field('templateId', 't1')
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('File processing error: Invalid image file');
    });

    it('should handle OpenAI service errors', async () => {
      mockTemplateService.getTemplatePrompt.mockReturnValue('Test prompt');
      mockImageOptimizationService.validateImage.mockResolvedValue(true);
      mockImageOptimizationService.getImageMetadata.mockResolvedValue({
        width: 800,
        height: 600,
        format: 'jpeg',
        size: 1024,
        hasAlpha: false,
        channels: 3,
        density: 72
      });
      mockImageOptimizationService.optimizeImage.mockResolvedValue({
        buffer: mockImageBuffer,
        originalSize: 1024,
        optimizedSize: 800,
        compressionRatio: 22,
        format: 'jpeg',
        width: 800,
        height: 600
      });
      mockImageOptimizationService.generateFilename.mockReturnValue('optimized-test.jpg');
      mockS3Service.uploadImage.mockResolvedValue('https://s3.amazonaws.com/test-bucket/uploads/optimized-test.jpg');
      mockOpenAIService.editImage.mockRejectedValue(new Error('OpenAI API error'));

      const response = await request(app)
        .post('/api/edit')
        .attach('image', mockImageBuffer, 'test.jpg')
        .field('templateId', 't1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to edit image');
    });

    it('should handle S3 upload errors', async () => {
      mockTemplateService.getTemplatePrompt.mockReturnValue('Test prompt');
      mockImageOptimizationService.validateImage.mockResolvedValue(true);
      mockImageOptimizationService.getImageMetadata.mockResolvedValue({
        width: 800,
        height: 600,
        format: 'jpeg',
        size: 1024,
        hasAlpha: false,
        channels: 3,
        density: 72
      });
      mockImageOptimizationService.optimizeImage.mockResolvedValue({
        buffer: mockImageBuffer,
        originalSize: 1024,
        optimizedSize: 800,
        compressionRatio: 22,
        format: 'jpeg',
        width: 800,
        height: 600
      });
      mockImageOptimizationService.generateFilename.mockReturnValue('optimized-test.jpg');
      mockS3Service.uploadImage.mockRejectedValue(new Error('S3 upload failed'));

      const response = await request(app)
        .post('/api/edit')
        .attach('image', mockImageBuffer, 'test.jpg')
        .field('templateId', 't1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to edit image');
    });
  });
});
