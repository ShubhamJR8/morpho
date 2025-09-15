import { TemplateService } from '../../services/templateService';
import { Template } from '../../types';

// Mock fs module
jest.mock('fs');
import fs from 'fs';

describe('TemplateService', () => {
  let templateService: TemplateService;
  const mockTemplates: Template[] = [
    {
      id: 't1',
      title: 'Test Template 1',
      previewUrl: 'https://example.com/preview1.jpg',
      prompt: 'Test prompt 1',
      description: 'Test description 1',
      category: 'Test Category',
    },
    {
      id: 't2',
      title: 'Test Template 2',
      previewUrl: 'https://example.com/preview2.jpg',
      prompt: 'Test prompt 2',
      description: 'Test description 2',
      category: 'Another Category',
    },
  ];

  beforeEach(() => {
    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockTemplates));
    templateService = new TemplateService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTemplates', () => {
    it('should return all templates without prompts', () => {
      const templates = templateService.getAllTemplates();
      
      expect(templates).toHaveLength(2);
      expect(templates[0]).not.toHaveProperty('prompt');
      expect(templates[0]).toHaveProperty('id', 't1');
      expect(templates[0]).toHaveProperty('title', 'Test Template 1');
    });
  });

  describe('getTemplateById', () => {
    it('should return template with prompt for valid ID', () => {
      const template = templateService.getTemplateById('t1');
      
      expect(template).toBeDefined();
      expect(template?.id).toBe('t1');
      expect(template?.prompt).toBe('Test prompt 1');
    });

    it('should return null for invalid ID', () => {
      const template = templateService.getTemplateById('invalid');
      
      expect(template).toBeNull();
    });
  });

  describe('getTemplatePrompt', () => {
    it('should return prompt for valid template ID', () => {
      const prompt = templateService.getTemplatePrompt('t1');
      
      expect(prompt).toBe('Test prompt 1');
    });

    it('should return null for invalid template ID', () => {
      const prompt = templateService.getTemplatePrompt('invalid');
      
      expect(prompt).toBeNull();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for valid category', () => {
      const templates = templateService.getTemplatesByCategory('Test Category');
      
      expect(templates).toHaveLength(1);
      expect(templates[0].category).toBe('Test Category');
      expect(templates[0]).not.toHaveProperty('prompt');
    });

    it('should return empty array for invalid category', () => {
      const templates = templateService.getTemplatesByCategory('Invalid Category');
      
      expect(templates).toHaveLength(0);
    });
  });

  describe('getCategories', () => {
    it('should return all unique categories', () => {
      const categories = templateService.getCategories();
      
      expect(categories).toHaveLength(2);
      expect(categories).toContain('Test Category');
      expect(categories).toContain('Another Category');
    });
  });

  describe('searchTemplates', () => {
    it('should search templates by title', () => {
      const templates = templateService.searchTemplates('Template 1');
      
      expect(templates).toHaveLength(1);
      expect(templates[0].title).toBe('Test Template 1');
    });

    it('should search templates by description', () => {
      const templates = templateService.searchTemplates('description 2');
      
      expect(templates).toHaveLength(1);
      expect(templates[0].title).toBe('Test Template 2');
    });

    it('should search templates by category', () => {
      const templates = templateService.searchTemplates('Test Category');
      
      expect(templates).toHaveLength(1);
      expect(templates[0].category).toBe('Test Category');
    });

    it('should filter by category when provided', () => {
      const templates = templateService.searchTemplates('Template', 'Test Category');
      
      expect(templates).toHaveLength(1);
      expect(templates[0].category).toBe('Test Category');
    });

    it('should respect limit parameter', () => {
      const templates = templateService.searchTemplates('Template', undefined, 1);
      
      expect(templates).toHaveLength(1);
    });

    it('should return empty array for empty query', () => {
      const templates = templateService.searchTemplates('');
      
      expect(templates).toHaveLength(0);
    });
  });
});
