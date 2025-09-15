import request from 'supertest';
import app from '../index';
import { TemplateService } from '../services/templateService';

// Mock the TemplateService
jest.mock('../services/templateService');

describe('TemplateHandler', () => {
  let mockTemplateService: jest.Mocked<TemplateService>;

  beforeEach(() => {
    mockTemplateService = new TemplateService() as jest.Mocked<TemplateService>;
    (TemplateService as jest.Mock).mockImplementation(() => mockTemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/templates', () => {
    it('should return all templates successfully', async () => {
      const mockTemplates = [
        {
          id: 't1',
          title: 'Test Template',
          previewUrl: 'https://example.com/image.jpg',
          description: 'Test description',
          category: 'Test'
        }
      ];

      mockTemplateService.getAllTemplates.mockReturnValue(mockTemplates);

      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTemplates,
        message: 'Templates retrieved successfully',
      });

      expect(mockTemplateService.getAllTemplates).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      mockTemplateService.getAllTemplates.mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await request(app)
        .get('/api/templates')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to retrieve templates');
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should return a specific template', async () => {
      const mockTemplate = {
        id: 't1',
        title: 'Test Template',
        previewUrl: 'https://example.com/image.jpg',
        prompt: 'Test prompt for AI processing',
        description: 'Test description',
        category: 'Test'
      };

      mockTemplateService.getTemplateById.mockReturnValue(mockTemplate);

      const response = await request(app)
        .get('/api/templates/t1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTemplate,
        message: 'Template retrieved successfully',
      });

      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith('t1');
    });

    it('should return 404 for non-existent template', async () => {
      mockTemplateService.getTemplateById.mockReturnValue(null);

      const response = await request(app)
        .get('/api/templates/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Template not found');
    });
  });

  describe('GET /api/templates/categories', () => {
    it('should return all categories', async () => {
      const mockCategories = ['Fantasy', 'Sci-Fi', 'Vintage'];

      mockTemplateService.getCategories.mockReturnValue(mockCategories);

      const response = await request(app)
        .get('/api/templates/categories')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockCategories,
        message: 'Categories retrieved successfully',
      });

      expect(mockTemplateService.getCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/templates/category/:category', () => {
    it('should return templates for a specific category', async () => {
      const mockTemplates = [
        {
          id: 't1',
          title: 'Fantasy Template',
          previewUrl: 'https://example.com/image.jpg',
          description: 'Fantasy description',
          category: 'Fantasy'
        }
      ];

      mockTemplateService.getTemplatesByCategory.mockReturnValue(mockTemplates);

      const response = await request(app)
        .get('/api/templates/category/Fantasy')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTemplates,
        message: "Templates for category 'Fantasy' retrieved successfully",
      });

      expect(mockTemplateService.getTemplatesByCategory).toHaveBeenCalledWith('Fantasy');
    });
  });

  describe('GET /api/templates/search', () => {
    it('should return search results', async () => {
      const mockSearchResults = [
        {
          id: 't1',
          title: 'Fantasy Template',
          previewUrl: 'https://example.com/image.jpg',
          description: 'Fantasy description',
          category: 'Fantasy'
        }
      ];

      mockTemplateService.searchTemplates.mockReturnValue(mockSearchResults);

      const response = await request(app)
        .get('/api/templates/search?q=fantasy')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockSearchResults,
        message: 'Search completed successfully',
      });

      expect(mockTemplateService.searchTemplates).toHaveBeenCalledWith('fantasy', undefined, 20);
    });

    it('should require search query', async () => {
      const response = await request(app)
        .get('/api/templates/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Search query is required');
    });

    it('should handle category filter in search', async () => {
      const mockSearchResults = [
        {
          id: 't1',
          title: 'Fantasy Template',
          previewUrl: 'https://example.com/image.jpg',
          description: 'Fantasy description',
          category: 'Fantasy'
        }
      ];

      mockTemplateService.searchTemplates.mockReturnValue(mockSearchResults);

      const response = await request(app)
        .get('/api/templates/search?q=fantasy&category=Fantasy&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockTemplateService.searchTemplates).toHaveBeenCalledWith('fantasy', 'Fantasy', 10);
    });
  });
});
