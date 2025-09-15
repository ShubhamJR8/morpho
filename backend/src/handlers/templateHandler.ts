import { Request, Response } from 'express';
import { TemplateService } from '../services/templateService';
import { ApiResponse, PublicTemplate } from '../types';
import { asyncHandler, NotFoundError, ValidationError } from '../utils/errorHandler';
import logger from '../utils/logger';

export class TemplateHandler {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  getAllTemplates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Fetching all templates');
    const templates = this.templateService.getAllTemplates();
    
    const response: ApiResponse<PublicTemplate[]> = {
      success: true,
      data: templates,
      message: 'Templates retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    logger.info(`Retrieved ${templates.length} templates`);
    res.json(response);
  });

  getTemplateById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    logger.info(`Fetching template with ID: ${id}`);
    
    const template = this.templateService.getTemplateById(id);

    if (!template) {
      throw new NotFoundError(`Template with ID '${id}' not found`);
    }

    // Don't expose the prompt in the public API
    const { prompt, ...publicTemplate } = template;
    
    const response: ApiResponse<PublicTemplate> = {
      success: true,
      data: publicTemplate,
      message: 'Template retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    logger.info(`Template '${id}' retrieved successfully`);
    res.json(response);
  });

  getTemplatesByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { category } = req.params;
    logger.info(`Fetching templates for category: ${category}`);
    
    const templates = this.templateService.getTemplatesByCategory(category);
    
    const response: ApiResponse<PublicTemplate[]> = {
      success: true,
      data: templates,
      message: `Templates for category '${category}' retrieved successfully`,
      timestamp: new Date().toISOString(),
    };

    logger.info(`Retrieved ${templates.length} templates for category '${category}'`);
    res.json(response);
  });

  getCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Fetching all categories');
    const categories = this.templateService.getCategories();
    
    const response: ApiResponse<string[]> = {
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    logger.info(`Retrieved ${categories.length} categories`);
    res.json(response);
  });

  searchTemplates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { q: query, category, limit = '20' } = req.query;
    
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Search query is required');
    }

    logger.info(`Searching templates with query: '${query}', category: '${category}', limit: ${limit}`);
    
    const templates = this.templateService.searchTemplates(
      query, 
      category as string, 
      parseInt(limit as string)
    );
    
    const response: ApiResponse<PublicTemplate[]> = {
      success: true,
      data: templates,
      message: 'Search completed successfully',
      timestamp: new Date().toISOString(),
    };

    logger.info(`Search returned ${templates.length} templates`);
    res.json(response);
  });
}
