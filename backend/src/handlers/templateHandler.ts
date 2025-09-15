import { Request, Response } from 'express';
import { TemplateService } from '../services/templateService';
import { cacheService, CacheService } from '../services/cacheService';
import { logger } from '../middleware/logging';
import { NotFoundError, ValidationError } from '../middleware/errorHandling';

// Define types locally
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class TemplateHandler {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  getAllTemplates = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      logger.debug('Getting all templates', requestId);
      
      // Try to get from cache first
      const cacheKey = CacheService.generateAllTemplatesKey();
      const cachedTemplates = cacheService.get(cacheKey);
      
      if (cachedTemplates) {
        logger.debug('Templates retrieved from cache', requestId);
        res.json({
          success: true,
          data: cachedTemplates,
          message: 'Templates retrieved successfully (cached)',
        });
        return;
      }

      // Get from service and cache the result
      const templates = this.templateService.getAllTemplates();
      cacheService.set(cacheKey, templates, 10 * 60 * 1000); // 10 minutes
      
      logger.info('Templates retrieved successfully', requestId, {
        count: templates.length
      });
      
      res.json({
        success: true,
        data: templates,
        message: 'Templates retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting templates', error, requestId);
      throw error;
    }
  };

  getTemplateById = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    const { id } = req.params;
    
    try {
      logger.debug('Getting template by ID', requestId, { templateId: id });
      
      // Try to get from cache first
      const cacheKey = CacheService.generateTemplateKey(id);
      const cachedTemplate = cacheService.get(cacheKey);
      
      if (cachedTemplate) {
        logger.debug('Template retrieved from cache', requestId);
        res.json({
          success: true,
          data: cachedTemplate,
          message: 'Template retrieved successfully (cached)',
        });
        return;
      }

      const template = this.templateService.getTemplateById(id);

      if (!template) {
        throw new NotFoundError('Template');
      }

      // Don't expose the prompt in the public API
      const { prompt, ...publicTemplate } = template;
      
      // Cache the result
      cacheService.set(cacheKey, publicTemplate, 15 * 60 * 1000); // 15 minutes
      
      logger.info('Template retrieved successfully', requestId, {
        templateId: id,
        title: template.title
      });
      
      res.json({
        success: true,
        data: publicTemplate,
        message: 'Template retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting template', error, requestId, { templateId: id });
      throw error;
    }
  };

  getTemplatesByCategory = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    const { category } = req.params;
    
    try {
      logger.debug('Getting templates by category', requestId, { category });
      
      // Try to get from cache first
      const cacheKey = CacheService.generateCategoryKey(category);
      const cachedTemplates = cacheService.get(cacheKey);
      
      if (cachedTemplates) {
        logger.debug('Templates by category retrieved from cache', requestId);
        res.json({
          success: true,
          data: cachedTemplates,
          message: `Templates for category '${category}' retrieved successfully (cached)`,
        });
        return;
      }

      const templates = this.templateService.getTemplatesByCategory(category);
      
      // Cache the result
      cacheService.set(cacheKey, templates, 10 * 60 * 1000); // 10 minutes
      
      logger.info('Templates by category retrieved successfully', requestId, {
        category,
        count: templates.length
      });
      
      res.json({
        success: true,
        data: templates,
        message: `Templates for category '${category}' retrieved successfully`,
      });
    } catch (error) {
      logger.error('Error getting templates by category', error, requestId, { category });
      throw error;
    }
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      logger.debug('Getting categories', requestId);
      
      // Try to get from cache first
      const cacheKey = CacheService.generateCategoriesKey();
      const cachedCategories = cacheService.get(cacheKey);
      
      if (cachedCategories) {
        logger.debug('Categories retrieved from cache', requestId);
        res.json({
          success: true,
          data: cachedCategories,
          message: 'Categories retrieved successfully (cached)',
        });
        return;
      }

      const categories = this.templateService.getCategories();
      
      // Cache the result
      cacheService.set(cacheKey, categories, 30 * 60 * 1000); // 30 minutes (categories don't change often)
      
      logger.info('Categories retrieved successfully', requestId, {
        count: categories.length
      });
      
      res.json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting categories', error, requestId);
      throw error;
    }
  };

  searchTemplates = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    const { q: query, category, limit = '20' } = req.query;
    
    try {
      if (!query || typeof query !== 'string') {
        throw new ValidationError('Search query is required');
      }

      logger.debug('Searching templates', requestId, {
        query,
        category: category as string,
        limit: limit as string
      });

      // Try to get from cache first
      const cacheKey = CacheService.generateSearchKey(
        query, 
        category as string, 
        parseInt(limit as string)
      );
      const cachedResults = cacheService.get(cacheKey);
      
      if (cachedResults) {
        logger.debug('Search results retrieved from cache', requestId);
        res.json({
          success: true,
          data: cachedResults,
          message: 'Search completed successfully (cached)',
        });
        return;
      }

      const templates = this.templateService.searchTemplates(
        query, 
        category as string, 
        parseInt(limit as string)
      );
      
      // Cache the result for a shorter time (5 minutes) since search results can vary
      cacheService.set(cacheKey, templates, 5 * 60 * 1000);
      
      logger.info('Search completed successfully', requestId, {
        query,
        category: category as string,
        resultCount: templates.length
      });
      
      res.json({
        success: true,
        data: templates,
        message: 'Search completed successfully',
      });
    } catch (error) {
      logger.error('Error searching templates', error, requestId, {
        query,
        category: category as string
      });
      throw error;
    }
  };
}
