import { Request, Response, NextFunction } from 'express';
import { TemplateHandler } from '../../handlers/templateHandler';
import { TemplateService } from '../../services/templateService';

// Mock the TemplateService
jest.mock('../../services/templateService');
const MockedTemplateService = TemplateService as jest.MockedClass<typeof TemplateService>;

describe('TemplateHandler', () => {
  let templateHandler: TemplateHandler;
  let mockTemplateService: jest.Mocked<TemplateService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockTemplateService = new MockedTemplateService() as jest.Mocked<TemplateService>;
    templateHandler = new TemplateHandler();
    
    // Mock the templateService property
    (templateHandler as any).templateService = mockTemplateService;

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTemplates', () => {
    it('should return all templates successfully', async () => {
      const mockTemplates = [
        { id: 't1', title: 'Template 1', previewUrl: 'url1', category: 'Category 1' },
        { id: 't2', title: 'Template 2', previewUrl: 'url2', category: 'Category 2' },
      ];

      mockTemplateService.getAllTemplates.mockReturnValue(mockTemplates);

      await templateHandler.getAllTemplates(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTemplateService.getAllTemplates).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTemplates,
        message: 'Templates retrieved successfully',
        timestamp: expect.any(String),
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return template for valid ID', async () => {
      const mockTemplate = {
        id: 't1',
        title: 'Template 1',
        previewUrl: 'url1',
        prompt: 'prompt1',
        category: 'Category 1',
      };

      mockRequest.params = { id: 't1' };
      mockTemplateService.getTemplateById.mockReturnValue(mockTemplate);

      await templateHandler.getTemplateById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith('t1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 't1',
          title: 'Template 1',
          previewUrl: 'url1',
          category: 'Category 1',
        },
        message: 'Template retrieved successfully',
        timestamp: expect.any(String),
      });
    });

    it('should handle invalid ID gracefully', async () => {
      mockRequest.params = { id: 'invalid' };
      mockTemplateService.getTemplateById.mockReturnValue(null);

      // The asyncHandler will catch the error and pass it to the error middleware
      await templateHandler.getTemplateById(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that the service was called
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith('invalid');
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for valid category', async () => {
      const mockTemplates = [
        { id: 't1', title: 'Template 1', previewUrl: 'url1', category: 'Category 1' },
      ];

      mockRequest.params = { category: 'Category 1' };
      mockTemplateService.getTemplatesByCategory.mockReturnValue(mockTemplates);

      await templateHandler.getTemplatesByCategory(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTemplateService.getTemplatesByCategory).toHaveBeenCalledWith('Category 1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTemplates,
        message: "Templates for category 'Category 1' retrieved successfully",
        timestamp: expect.any(String),
      });
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = ['Category 1', 'Category 2'];

      mockTemplateService.getCategories.mockReturnValue(mockCategories);

      await templateHandler.getCategories(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTemplateService.getCategories).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCategories,
        message: 'Categories retrieved successfully',
        timestamp: expect.any(String),
      });
    });
  });

  describe('searchTemplates', () => {
    it('should search templates successfully', async () => {
      const mockTemplates = [
        { id: 't1', title: 'Template 1', previewUrl: 'url1', category: 'Category 1' },
      ];

      mockRequest.query = { q: 'Template 1', limit: '10' };
      mockTemplateService.searchTemplates.mockReturnValue(mockTemplates);

      await templateHandler.searchTemplates(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTemplateService.searchTemplates).toHaveBeenCalledWith('Template 1', undefined, 10);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTemplates,
        message: 'Search completed successfully',
        timestamp: expect.any(String),
      });
    });

    it('should handle missing query gracefully', async () => {
      mockRequest.query = { limit: '10' };

      // The asyncHandler will catch the error and pass it to the error middleware
      await templateHandler.searchTemplates(mockRequest as Request, mockResponse as Response, mockNext);
      
      // The validation should prevent the service from being called
      expect(mockTemplateService.searchTemplates).not.toHaveBeenCalled();
    });
  });
});
