import { Analytics, IAnalytics } from '../models/Analytics';
import { EditSession } from '../models/EditSession';
import { Template } from '../models/Template';
import { User } from '../models/User';
import { logger } from '../middleware/logging';

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Record a new edit session
   */
  public async recordEditSession(sessionData: {
    userId?: string;
    sessionId: string;
    templateId: string;
    originalImage: any;
    editedImage: any;
    processing: any;
    metadata: any;
  }): Promise<void> {
    try {
      const editSession = new EditSession(sessionData);
      await editSession.save();

      // Update template usage
      const template = await Template.findById(sessionData.templateId);
      if (template) {
        await template.incrementUsage(
          sessionData.processing.duration,
          sessionData.processing.status === 'completed'
        );
      }

      // Update user usage if userId provided
      if (sessionData.userId) {
        const user = await User.findById(sessionData.userId);
        if (user) {
          await user.incrementUsage(sessionData.processing.duration);
        }
      }

      logger.debug('Edit session recorded', undefined, {
        sessionId: sessionData.sessionId,
        templateId: sessionData.templateId,
        userId: sessionData.userId
      });
    } catch (error) {
      logger.error('Error recording edit session', error);
      throw error;
    }
  }

  /**
   * Generate daily analytics
   */
  public async generateDailyAnalytics(date?: Date): Promise<IAnalytics> {
    try {
      const targetDate = date || new Date();
      targetDate.setHours(0, 0, 0, 0);

      // Check if analytics already exist for this date
      let analytics = await Analytics.findOne({ date: targetDate });
      
      if (!analytics) {
        analytics = new Analytics({ date: targetDate });
      }

      // Calculate user metrics
      const userStats = await this.getUserMetrics(targetDate);
      
      // Calculate session metrics
      const sessionStats = await this.getSessionMetrics(targetDate);
      
      // Calculate template metrics
      const templateStats = await this.getTemplateMetrics(targetDate);
      
      // Calculate performance metrics
      const performanceStats = await this.getPerformanceMetrics(targetDate);
      
      // Calculate system metrics
      const systemStats = await this.getSystemMetrics();

      analytics.metrics = {
        users: userStats,
        sessions: sessionStats,
        templates: templateStats,
        performance: performanceStats,
        system: systemStats
      };

      await analytics.save();
      
      logger.info('Daily analytics generated', undefined, {
        date: targetDate.toISOString().split('T')[0],
        sessions: sessionStats.total,
        users: userStats.active
      });

      return analytics;
    } catch (error) {
      logger.error('Error generating daily analytics', error);
      throw error;
    }
  }

  /**
   * Get user metrics for a specific date
   */
  private async getUserMetrics(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      'usage.lastActiveAt': { $gte: startOfDay, $lte: endOfDay }
    });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    return {
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
      returning: activeUsers - newUsers
    };
  }

  /**
   * Get session metrics for a specific date
   */
  private async getSessionMetrics(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await EditSession.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const total = sessions.length;
    const completed = sessions.filter(s => s.processing.status === 'completed').length;
    const failed = sessions.filter(s => s.processing.status === 'failed').length;
    const avgDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.processing.duration, 0) / sessions.length 
      : 0;

    return {
      total,
      completed,
      failed,
      avgDuration
    };
  }

  /**
   * Get template metrics for a specific date
   */
  private async getTemplateMetrics(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await EditSession.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      'processing.status': 'completed'
    });

    const templateUsage = new Map<string, number>();
    const categoryDistribution = new Map<string, number>();

    for (const session of sessions) {
      // Count template usage
      templateUsage.set(session.templateId, (templateUsage.get(session.templateId) || 0) + 1);
      
      // Get template category
      const template = await Template.findById(session.templateId);
      if (template) {
        categoryDistribution.set(template.category, (categoryDistribution.get(template.category) || 0) + 1);
      }
    }

    // Get most popular templates
    const mostPopular = Array.from(templateUsage.entries())
      .map(([templateId, usageCount]) => ({ templateId, usageCount }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      totalUsed: sessions.length,
      mostPopular,
      categoryDistribution: Object.fromEntries(categoryDistribution)
    };
  }

  /**
   * Get performance metrics for a specific date
   */
  private async getPerformanceMetrics(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await EditSession.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const total = sessions.length;
    const failed = sessions.filter(s => s.processing.status === 'failed').length;
    const errorRate = total > 0 ? (failed / total) * 100 : 0;
    
    const avgProcessingTime = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.processing.duration, 0) / sessions.length 
      : 0;
    
    const totalProcessingTime = sessions.reduce((sum, s) => sum + s.processing.duration, 0);
    
    // Calculate throughput (requests per hour)
    const throughput = total / 24; // Assuming 24-hour period

    return {
      avgProcessingTime,
      totalProcessingTime,
      errorRate,
      throughput
    };
  }

  /**
   * Get system metrics
   */
  private async getSystemMetrics(): Promise<any> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memoryUsage: memoryUsage.heapUsed,
      cpuUsage: 0, // Would need additional library to get CPU usage
      responseTime: 0, // Would be calculated from actual requests
      uptime
    };
  }

  /**
   * Get analytics for a date range
   */
  public async getAnalyticsRange(startDate: Date, endDate: Date): Promise<IAnalytics[]> {
    try {
      return await Analytics.getDailyAnalytics(startDate, endDate);
    } catch (error) {
      logger.error('Error getting analytics range', error);
      throw error;
    }
  }

  /**
   * Get weekly analytics
   */
  public async getWeeklyAnalytics(weeks: number = 4): Promise<any[]> {
    try {
      return await Analytics.getWeeklyAnalytics(weeks);
    } catch (error) {
      logger.error('Error getting weekly analytics', error);
      throw error;
    }
  }

  /**
   * Get monthly analytics
   */
  public async getMonthlyAnalytics(months: number = 12): Promise<any[]> {
    try {
      return await Analytics.getMonthlyAnalytics(months);
    } catch (error) {
      logger.error('Error getting monthly analytics', error);
      throw error;
    }
  }

  /**
   * Get top templates
   */
  public async getTopTemplates(days: number = 30): Promise<any[]> {
    try {
      return await Analytics.getTopTemplates(days);
    } catch (error) {
      logger.error('Error getting top templates', error);
      throw error;
    }
  }

  /**
   * Get performance trends
   */
  public async getPerformanceTrends(days: number = 30): Promise<any[]> {
    try {
      return await Analytics.getPerformanceTrends(days);
    } catch (error) {
      logger.error('Error getting performance trends', error);
      throw error;
    }
  }

  /**
   * Get template usage statistics
   */
  public async getTemplateUsageStats(timeframe: string = '24h'): Promise<any[]> {
    try {
      return await EditSession.getTemplateUsageStats(timeframe);
    } catch (error) {
      logger.error('Error getting template usage stats', error);
      throw error;
    }
  }

  /**
   * Get processing statistics
   */
  public async getProcessingStats(timeframe: string = '24h'): Promise<any[]> {
    try {
      return await EditSession.getProcessingStats(timeframe);
    } catch (error) {
      logger.error('Error getting processing stats', error);
      throw error;
    }
  }

  /**
   * Get user activity statistics
   */
  public async getUserActivityStats(userId: string): Promise<any[]> {
    try {
      return await EditSession.getUserActivityStats(userId);
    } catch (error) {
      logger.error('Error getting user activity stats', error);
      throw error;
    }
  }

  /**
   * Schedule daily analytics generation
   */
  public scheduleDailyAnalytics(): void {
    // Run analytics generation every day at 1 AM
    const scheduleTime = new Date();
    scheduleTime.setHours(1, 0, 0, 0);
    
    if (scheduleTime <= new Date()) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    const timeUntilRun = scheduleTime.getTime() - new Date().getTime();

    setTimeout(() => {
      this.generateDailyAnalytics().catch(error => {
        logger.error('Error in scheduled analytics generation', error);
      });

      // Schedule next run (24 hours later)
      setInterval(() => {
        this.generateDailyAnalytics().catch(error => {
          logger.error('Error in scheduled analytics generation', error);
        });
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilRun);

    logger.info('Daily analytics generation scheduled', undefined, {
      nextRun: scheduleTime.toISOString()
    });
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
