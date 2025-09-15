import mongoose, { Document, Schema } from 'mongoose';

export interface IEditSession extends Document {
  _id: string;
  userId?: string;
  sessionId: string;
  templateId: string;
  originalImage: {
    url: string;
    filename: string;
    size: number;
    width: number;
    height: number;
    format: string;
  };
  editedImage: {
    url: string;
    filename: string;
    size: number;
    width: number;
    height: number;
    format: string;
  };
  processing: {
    startTime: Date;
    endTime: Date;
    duration: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    optimizationApplied: boolean;
    compressionRatio?: number;
  };
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    requestId: string;
    templateVersion: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IEditSessionModel extends mongoose.Model<IEditSession> {
  getTemplateUsageStats(timeframe: string): Promise<any[]>;
  getProcessingStats(timeframe: string): Promise<any>;
  getUserActivityStats(userId: string): Promise<any>;
}

const editSessionSchema = new Schema<IEditSession>({
  userId: {
    type: String,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  templateId: {
    type: String,
    required: true,
    index: true
  },
  originalImage: {
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    width: {
      type: Number,
      required: true,
      min: 1
    },
    height: {
      type: Number,
      required: true,
      min: 1
    },
    format: {
      type: String,
      required: true,
      enum: ['jpeg', 'jpg', 'png', 'gif', 'webp']
    }
  },
  editedImage: {
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    width: {
      type: Number,
      required: true,
      min: 1
    },
    height: {
      type: Number,
      required: true,
      min: 1
    },
    format: {
      type: String,
      required: true,
      enum: ['jpeg', 'jpg', 'png', 'gif', 'webp']
    }
  },
  processing: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    error: {
      type: String,
      default: null
    },
    optimizationApplied: {
      type: Boolean,
      default: false
    },
    compressionRatio: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    }
  },
  metadata: {
    userAgent: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    requestId: {
      type: String,
      required: true
    },
    templateVersion: {
      type: String,
      default: '1.0.0'
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
editSessionSchema.index({ userId: 1, createdAt: -1 });
editSessionSchema.index({ sessionId: 1 });
editSessionSchema.index({ templateId: 1, createdAt: -1 });
editSessionSchema.index({ 'processing.status': 1 });
editSessionSchema.index({ 'processing.startTime': -1 });
editSessionSchema.index({ 'metadata.requestId': 1 });
editSessionSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate duration
editSessionSchema.pre('save', function(next) {
  if (this.processing.startTime && this.processing.endTime) {
    this.processing.duration = this.processing.endTime.getTime() - this.processing.startTime.getTime();
  }
  next();
});

// Static methods
editSessionSchema.statics.findBySessionId = function(sessionId: string) {
  return this.findOne({ sessionId });
};

editSessionSchema.statics.findByUserId = function(userId: string, limit: number = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

editSessionSchema.statics.findByTemplateId = function(templateId: string, limit: number = 100) {
  return this.find({ templateId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

editSessionSchema.statics.getProcessingStats = function(timeframe: string = '24h') {
  const timeframes = {
    '1h': 1 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  const timeAgo = new Date(Date.now() - (timeframes[timeframe as keyof typeof timeframes] || timeframes['24h']));

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: timeAgo }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$processing.status', 'completed'] }, 1, 0] }
        },
        failedSessions: {
          $sum: { $cond: [{ $eq: ['$processing.status', 'failed'] }, 1, 0] }
        },
        avgProcessingTime: { $avg: '$processing.duration' },
        totalProcessingTime: { $sum: '$processing.duration' },
        avgImageSize: { $avg: '$originalImage.size' },
        totalImagesProcessed: {
          $sum: { $cond: [{ $eq: ['$processing.status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
};

editSessionSchema.statics.getTemplateUsageStats = function(timeframe: string = '24h') {
  const timeframes = {
    '1h': 1 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  const timeAgo = new Date(Date.now() - (timeframes[timeframe as keyof typeof timeframes] || timeframes['24h']));

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: timeAgo },
        'processing.status': 'completed'
      }
    },
    {
      $group: {
        _id: '$templateId',
        usageCount: { $sum: 1 },
        avgProcessingTime: { $avg: '$processing.duration' },
        totalProcessingTime: { $sum: '$processing.duration' },
        avgImageSize: { $avg: '$originalImage.size' },
        avgCompressionRatio: { $avg: '$processing.compressionRatio' }
      }
    },
    {
      $sort: { usageCount: -1 }
    }
  ]);
};

editSessionSchema.statics.getUserActivityStats = function(userId: string) {
  return this.aggregate([
    {
      $match: { userId }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        sessionsCount: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$processing.status', 'completed'] }, 1, 0] }
        },
        totalProcessingTime: { $sum: '$processing.duration' },
        avgProcessingTime: { $avg: '$processing.duration' }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
    }
  ]);
};

// Instance methods
editSessionSchema.methods.markAsCompleted = function() {
  this.processing.status = 'completed';
  this.processing.endTime = new Date();
  return this.save();
};

editSessionSchema.methods.markAsFailed = function(error: string) {
  this.processing.status = 'failed';
  this.processing.error = error;
  this.processing.endTime = new Date();
  return this.save();
};

// Static methods
editSessionSchema.statics.getTemplateUsageStats = function(timeframe: string) {
  const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 1;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$templateId',
        usageCount: { $sum: 1 },
        avgProcessingTime: { $avg: '$processing.duration' }
      }
    },
    {
      $sort: { usageCount: -1 }
    }
  ]);
};

editSessionSchema.statics.getProcessingStats = function(timeframe: string) {
  const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 1;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgProcessingTime: { $avg: '$processing.duration' },
        successRate: {
          $avg: {
            $cond: [{ $eq: ['$processing.status', 'completed'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

editSessionSchema.statics.getUserActivityStats = function(userId: string) {
  return this.aggregate([
    {
      $match: { userId }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgProcessingTime: { $avg: '$processing.duration' },
        templatesUsed: { $addToSet: '$templateId' },
        lastActivity: { $max: '$createdAt' }
      }
    }
  ]);
};

export const EditSession = mongoose.model<IEditSession, IEditSessionModel>('EditSession', editSessionSchema);
