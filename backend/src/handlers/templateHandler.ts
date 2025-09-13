import { Request, Response } from 'express';
import { TemplateService } from '../services/templateService';

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
    try {
      const templates = this.templateService.getAllTemplates();
      
      const response: ApiResponse<typeof templates> = {
        success: true,
        data: templates,
        message: 'Templates retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting templates:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve templates',
      };

      res.status(500).json(response);
    }
  };

  getTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const template = this.templateService.getTemplateById(id);

      if (!template) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Template not found',
        };
        res.status(404).json(response);
        return;
      }

      // Don't expose the prompt in the public API
      const { prompt, ...publicTemplate } = template;
      
      const response: ApiResponse<typeof publicTemplate> = {
        success: true,
        data: publicTemplate,
        message: 'Template retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting template:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve template',
      };

      res.status(500).json(response);
    }
  };

  getTemplatesByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;
      const templates = this.templateService.getTemplatesByCategory(category);
      
      const response: ApiResponse<typeof templates> = {
        success: true,
        data: templates,
        message: `Templates for category '${category}' retrieved successfully`,
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting templates by category:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve templates by category',
      };

      res.status(500).json(response);
    }
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = this.templateService.getCategories();
      
      const response: ApiResponse<typeof categories> = {
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting categories:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve categories',
      };

      res.status(500).json(response);
    }
  };

  searchTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query, category, limit = '20' } = req.query;
      
      if (!query || typeof query !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Search query is required',
        };
        res.status(400).json(response);
        return;
      }

      const templates = this.templateService.searchTemplates(
        query, 
        category as string, 
        parseInt(limit as string)
      );
      
      const response: ApiResponse<typeof templates> = {
        success: true,
        data: templates,
        message: 'Search completed successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Error searching templates:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to search templates',
      };

      res.status(500).json(response);
    }
  };
}
