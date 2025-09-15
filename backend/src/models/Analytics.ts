import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  _id: string;
  date: Date;
  metrics: {
    users: {
      total: number;
      active: number;
      new: number;
      returning: number;
    };
    sessions: {
      total: number;
      completed: number;
      failed: number;
      avgDuration: number;
    };
    templates: {
      totalUsed: number;
      mostPopular: string[];
      categoryDistribution: Record<string, number>;
    };
    performance: {
      avgProcessingTime: number;
      totalProcessingTime: number;
      errorRate: number;
      throughput: number; // requests per hour
    };
    system: {
      memoryUsage: number;
      cpuUsage: number;
      responseTime: number;
      uptime: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyticsModel extends mongoose.Model<IAnalytics> {
  getDailyAnalytics(startDate: Date, endDate: Date): Promise<IAnalytics[]>;
  getWeeklyAnalytics(weeks: number): Promise<IAnalytics[]>;
  getMonthlyAnalytics(months: number): Promise<IAnalytics[]>;
  getTopTemplates(days: number): Promise<any[]>;
  getPerformanceTrends(days: number): Promise<IAnalytics[]>;
}

const analyticsSchema = new Schema<IAnalytics>({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  metrics: {
    users: {
      total: {
        type: Number,
        default: 0,
        min: 0
      },
      active: {
        type: Number,
        default: 0,
        min: 0
      },
      new: {
        type: Number,
        default: 0,
        min: 0
      },
      returning: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    sessions: {
      total: {
        type: Number,
        default: 0,
        min: 0
      },
      completed: {
        type: Number,
        default: 0,
        min: 0
      },
      failed: {
        type: Number,
        default: 0,
        min: 0
      },
      avgDuration: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    templates: {
      totalUsed: {
        type: Number,
        default: 0,
        min: 0
      },
      mostPopular: [{
        templateId: {
          type: String,
          required: true
        },
        usageCount: {
          type: Number,
          required: true,
          min: 0
        }
      }],
      categoryDistribution: {
        type: Map,
        of: Number,
        default: {}
      }
    },
    performance: {
      avgProcessingTime: {
        type: Number,
        default: 0,
        min: 0
      },
      totalProcessingTime: {
        type: Number,
        default: 0,
        min: 0
      },
      errorRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      throughput: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    system: {
      memoryUsage: {
        type: Number,
        default: 0,
        min: 0
      },
      cpuUsage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      responseTime: {
        type: Number,
        default: 0,
        min: 0
      },
      uptime: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better query performance
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ 'metrics.users.total': -1 });
analyticsSchema.index({ 'metrics.sessions.total': -1 });
analyticsSchema.index({ 'metrics.performance.errorRate': -1 });

// Pre-save middleware to ensure date is at start of day
analyticsSchema.pre('save', function(next) {
  if (this.date) {
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

// Static methods
analyticsSchema.statics.getDailyAnalytics = function(startDate: Date, endDate: Date) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

analyticsSchema.statics.getWeeklyAnalytics = function(weeks: number = 4) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          week: { $week: '$date' }
        },
        users: {
          $push: '$metrics.users'
        },
        sessions: {
          $push: '$metrics.sessions'
        },
        templates: {
          $push: '$metrics.templates'
        },
        performance: {
          $push: '$metrics.performance'
        },
        system: {
          $push: '$metrics.system'
        }
      }
    },
    {
      $project: {
        _id: 1,
        metrics: {
          users: {
            total: { $avg: '$users.total' },
            active: { $avg: '$users.active' },
            new: { $sum: '$users.new' },
            returning: { $avg: '$users.returning' }
          },
          sessions: {
            total: { $sum: '$sessions.total' },
            completed: { $sum: '$sessions.completed' },
            failed: { $sum: '$sessions.failed' },
            avgDuration: { $avg: '$sessions.avgDuration' }
          },
          templates: {
            totalUsed: { $sum: '$templates.totalUsed' }
          },
          performance: {
            avgProcessingTime: { $avg: '$performance.avgProcessingTime' },
            totalProcessingTime: { $sum: '$performance.totalProcessingTime' },
            errorRate: { $avg: '$performance.errorRate' },
            throughput: { $avg: '$performance.throughput' }
          },
          system: {
            memoryUsage: { $avg: '$system.memoryUsage' },
            cpuUsage: { $avg: '$system.cpuUsage' },
            responseTime: { $avg: '$system.responseTime' },
            uptime: { $avg: '$system.uptime' }
          }
        }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.week': -1 }
    }
  ]);
};

analyticsSchema.statics.getMonthlyAnalytics = function(months: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        users: {
          $push: '$metrics.users'
        },
        sessions: {
          $push: '$metrics.sessions'
        },
        templates: {
          $push: '$metrics.templates'
        },
        performance: {
          $push: '$metrics.performance'
        },
        system: {
          $push: '$metrics.system'
        }
      }
    },
    {
      $project: {
        _id: 1,
        metrics: {
          users: {
            total: { $avg: '$users.total' },
            active: { $avg: '$users.active' },
            new: { $sum: '$users.new' },
            returning: { $avg: '$users.returning' }
          },
          sessions: {
            total: { $sum: '$sessions.total' },
            completed: { $sum: '$sessions.completed' },
            failed: { $sum: '$sessions.failed' },
            avgDuration: { $avg: '$sessions.avgDuration' }
          },
          templates: {
            totalUsed: { $sum: '$templates.totalUsed' }
          },
          performance: {
            avgProcessingTime: { $avg: '$performance.avgProcessingTime' },
            totalProcessingTime: { $sum: '$performance.totalProcessingTime' },
            errorRate: { $avg: '$performance.errorRate' },
            throughput: { $avg: '$performance.throughput' }
          },
          system: {
            memoryUsage: { $avg: '$system.memoryUsage' },
            cpuUsage: { $avg: '$system.cpuUsage' },
            responseTime: { $avg: '$system.responseTime' },
            uptime: { $avg: '$system.uptime' }
          }
        }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    }
  ]);
};

analyticsSchema.statics.getTopTemplates = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $unwind: '$metrics.templates.mostPopular'
    },
    {
      $group: {
        _id: '$metrics.templates.mostPopular.templateId',
        totalUsage: { $sum: '$metrics.templates.mostPopular.usageCount' },
        daysUsed: { $sum: 1 }
      }
    },
    {
      $sort: { totalUsage: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

analyticsSchema.statics.getPerformanceTrends = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    date: { $gte: startDate }
  })
  .select('date metrics.performance metrics.system')
  .sort({ date: 1 });
};

// Instance methods
analyticsSchema.methods.updateMetrics = function(metrics: Partial<IAnalytics['metrics']>) {
  this.metrics = { ...this.metrics, ...metrics };
  return this.save();
};

export const Analytics = mongoose.model<IAnalytics, IAnalyticsModel>('Analytics', analyticsSchema);
