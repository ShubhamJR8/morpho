import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import { userSessionService } from '../services/userSessionService';
import { databaseService } from '../services/databaseService';
import { logger } from '../middleware/logging';
import { ValidationError } from '../middleware/errorHandling';

// Define types locally
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class AnalyticsHandler {
  /**
   * Get analytics overview
   */
  getAnalyticsOverview = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      const { timeframe = '7d' } = req.query;
      
      logger.debug('Getting analytics overview', requestId, { timeframe });

      const [
        processingStats,
        templateStats,
        topTemplates,
        sessionStats
      ] = await Promise.all([
        analyticsService.getProcessingStats(timeframe as string),
        analyticsService.getTemplateUsageStats(timeframe as string),
        analyticsService.getTopTemplates(timeframe === '7d' ? 7 : 30),
        userSessionService.getSessionStats()
      ]);

      const overview = {
        processing: processingStats[0] || {
          totalSessions: 0,
          completedSessions: 0,
          failedSessions: 0,
          avgProcessingTime: 0,
          totalProcessingTime: 0,
          avgImageSize: 0,
          totalImagesProcessed: 0
        },
        templates: templateStats,
        topTemplates,
        sessions: sessionStats,
        timeframe
      };

      logger.info('Analytics overview retrieved', requestId, {
        sessions: overview.processing.totalSessions,
        templates: overview.templates.length
      });

      res.json({
        success: true,
        data: overview,
        message: 'Analytics overview retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting analytics overview', error, requestId);
      throw error;
    }
  };

  /**
   * Get performance trends
   */
  getPerformanceTrends = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      const { days = '30' } = req.query;
      const daysNum = parseInt(days as string);
      
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        throw new ValidationError('Days must be between 1 and 365');
      }

      logger.debug('Getting performance trends', requestId, { days: daysNum });

      const trends = await analyticsService.getPerformanceTrends(daysNum);

      res.json({
        success: true,
        data: trends,
        message: 'Performance trends retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting performance trends', error, requestId);
      throw error;
    }
  };

  /**
   * Get template analytics
   */
  getTemplateAnalytics = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      const { timeframe = '24h', templateId } = req.query;
      
      logger.debug('Getting template analytics', requestId, { timeframe, templateId });

      let analytics;
      
      if (templateId) {
        // Get analytics for specific template
        const templateStats = await analyticsService.getTemplateUsageStats(timeframe as string);
        analytics = templateStats.find((stat: any) => stat._id === templateId) || null;
      } else {
        // Get analytics for all templates
        analytics = await analyticsService.getTemplateUsageStats(timeframe as string);
      }

      res.json({
        success: true,
        data: analytics,
        message: templateId ? 'Template analytics retrieved successfully' : 'All template analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting template analytics', error, requestId);
      throw error;
    }
  };

  /**
   * Get user analytics
   */
  getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      const { userId } = req.params;
      const { timeframe = '30d' } = req.query;
      
      logger.debug('Getting user analytics', requestId, { userId, timeframe });

      const userActivity = await analyticsService.getUserActivityStats(userId);

      res.json({
        success: true,
        data: userActivity,
        message: 'User analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting user analytics', error, requestId);
      throw error;
    }
  };

  /**
   * Get system health and database stats
   */
  getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      logger.debug('Getting system health', requestId);

      const [dbHealth, dbStats, collectionStats] = await Promise.all([
        databaseService.healthCheck(),
        databaseService.getDatabaseStats(),
        databaseService.getCollectionStats()
      ]);

      const systemHealth = {
        database: dbHealth,
        stats: {
          database: dbStats,
          collections: collectionStats
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      };

      res.json({
        success: true,
        data: systemHealth,
        message: 'System health retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting system health', error, requestId);
      throw error;
    }
  };

  /**
   * Get session statistics
   */
  getSessionStats = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      logger.debug('Getting session statistics', requestId);

      const stats = userSessionService.getSessionStats();

      res.json({
        success: true,
        data: stats,
        message: 'Session statistics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting session statistics', error, requestId);
      throw error;
    }
  };

  /**
   * Get weekly analytics summary
   */
  getWeeklyAnalytics = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      const { weeks = '4' } = req.query;
      const weeksNum = parseInt(weeks as string);
      
      if (isNaN(weeksNum) || weeksNum < 1 || weeksNum > 52) {
        throw new ValidationError('Weeks must be between 1 and 52');
      }

      logger.debug('Getting weekly analytics', requestId, { weeks: weeksNum });

      const weeklyAnalytics = await analyticsService.getWeeklyAnalytics(weeksNum);

      res.json({
        success: true,
        data: weeklyAnalytics,
        message: 'Weekly analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting weekly analytics', error, requestId);
      throw error;
    }
  };

  /**
   * Get monthly analytics summary
   */
  getMonthlyAnalytics = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      const { months = '12' } = req.query;
      const monthsNum = parseInt(months as string);
      
      if (isNaN(monthsNum) || monthsNum < 1 || monthsNum > 24) {
        throw new ValidationError('Months must be between 1 and 24');
      }

      logger.debug('Getting monthly analytics', requestId, { months: monthsNum });

      const monthlyAnalytics = await analyticsService.getMonthlyAnalytics(monthsNum);

      res.json({
        success: true,
        data: monthlyAnalytics,
        message: 'Monthly analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting monthly analytics', error, requestId);
      throw error;
    }
  };

  /**
   * Generate daily analytics (admin endpoint)
   */
  generateDailyAnalytics = async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).requestId;
    
    try {
      const { date } = req.body;
      
      logger.debug('Generating daily analytics', requestId, { date });

      const targetDate = date ? new Date(date) : undefined;
      const analytics = await analyticsService.generateDailyAnalytics(targetDate);

      res.json({
        success: true,
        data: analytics,
        message: 'Daily analytics generated successfully'
      });
    } catch (error) {
      logger.error('Error generating daily analytics', error, requestId);
      throw error;
    }
  };
}
