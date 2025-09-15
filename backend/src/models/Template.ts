import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  previewUrl: string;
  prompt: string;
  tags: string[];
  metadata: {
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    priority: number;
  };
  usage: {
    totalUses: number;
    successfulUses: number;
    failedUses: number;
    avgProcessingTime: number;
    lastUsedAt?: Date;
    popularityScore: number;
  };
  settings: {
    maxImageSize: number;
    supportedFormats: string[];
    quality: number;
    requiresOptimization: boolean;
  };
  analytics: {
    dailyUsage: Array<{
      date: Date;
      count: number;
    }>;
    userFeedback: Array<{
      userId: string;
      rating: number;
      comment?: string;
      createdAt: Date;
    }>;
    avgRating: number;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  incrementUsage(processingTime?: number, success?: boolean): Promise<ITemplate>;
  updateSettings(settings: Partial<ITemplate['settings']>): Promise<ITemplate>;
}

const templateSchema = new Schema<ITemplate>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['Fantasy', 'Sci-Fi', 'Vintage', 'Artistic', 'Nature'],
    index: true
  },
  previewUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Preview URL must be a valid HTTP/HTTPS URL'
    }
  },
  prompt: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50
  }],
  metadata: {
    version: {
      type: String,
      default: '1.0.0',
      match: [/^\d+\.\d+\.\d+$/, 'Version must be in semantic versioning format']
    },
    author: {
      type: String,
      default: 'System',
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  usage: {
    totalUses: {
      type: Number,
      default: 0,
      min: 0
    },
    successfulUses: {
      type: Number,
      default: 0,
      min: 0
    },
    failedUses: {
      type: Number,
      default: 0,
      min: 0
    },
    avgProcessingTime: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUsedAt: {
      type: Date,
      default: null
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  settings: {
    maxImageSize: {
      type: Number,
      default: 10 * 1024 * 1024, // 10MB
      min: 1024 * 1024, // 1MB
      max: 50 * 1024 * 1024 // 50MB
    },
    supportedFormats: [{
      type: String,
      enum: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      default: ['jpeg', 'jpg', 'png', 'webp']
    }],
    quality: {
      type: Number,
      default: 85,
      min: 10,
      max: 100
    },
    requiresOptimization: {
      type: Boolean,
      default: true
    }
  },
  analytics: {
    dailyUsage: [{
      date: {
        type: Date,
        required: true
      },
      count: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    userFeedback: [{
      userId: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500,
        default: null
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
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
templateSchema.index({ title: 'text', description: 'text', tags: 'text' });
templateSchema.index({ category: 1, 'metadata.isActive': 1 });
templateSchema.index({ 'usage.popularityScore': -1 });
templateSchema.index({ 'usage.lastUsedAt': -1 });
templateSchema.index({ 'metadata.priority': -1 });
templateSchema.index({ 'analytics.avgRating': -1 });
templateSchema.index({ createdAt: -1 });

// Pre-save middleware
templateSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  
  // Calculate popularity score based on usage and rating
  const usageWeight = 0.7;
  const ratingWeight = 0.3;
  this.usage.popularityScore = 
    (this.usage.successfulUses * usageWeight) + 
    (this.analytics.avgRating * 20 * ratingWeight); // Scale rating to 0-100
  
  // Calculate average rating
  if (this.analytics.userFeedback.length > 0) {
    const totalRating = this.analytics.userFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
    this.analytics.avgRating = totalRating / this.analytics.userFeedback.length;
  }
  
  next();
});

// Static methods
templateSchema.statics.findActiveTemplates = function() {
  return this.find({ 'metadata.isActive': true })
    .sort({ 'metadata.priority': -1, 'usage.popularityScore': -1 });
};

templateSchema.statics.findByCategory = function(category: string) {
  return this.find({ 
    category: category,
    'metadata.isActive': true 
  })
  .sort({ 'usage.popularityScore': -1, 'metadata.priority': -1 });
};

templateSchema.statics.searchTemplates = function(query: string, category?: string, limit: number = 20) {
  const searchQuery: any = {
    'metadata.isActive': true,
    $text: { $search: query }
  };

  if (category) {
    searchQuery.category = category;
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, 'usage.popularityScore': -1 })
    .limit(limit);
};

templateSchema.statics.getPopularTemplates = function(limit: number = 10) {
  return this.find({ 'metadata.isActive': true })
    .sort({ 'usage.popularityScore': -1 })
    .limit(limit);
};

templateSchema.statics.getTemplateStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalTemplates: { $sum: 1 },
        activeTemplates: {
          $sum: { $cond: [{ $eq: ['$metadata.isActive', true] }, 1, 0] }
        },
        totalUses: { $sum: '$usage.totalUses' },
        avgRating: { $avg: '$analytics.avgRating' },
        avgProcessingTime: { $avg: '$usage.avgProcessingTime' }
      }
    }
  ]);
};

templateSchema.statics.getCategoryStats = function() {
  return this.aggregate([
    {
      $match: { 'metadata.isActive': true }
    },
    {
      $group: {
        _id: '$category',
        templateCount: { $sum: 1 },
        totalUses: { $sum: '$usage.totalUses' },
        avgRating: { $avg: '$analytics.avgRating' },
        avgProcessingTime: { $avg: '$usage.avgProcessingTime' }
      }
    },
    {
      $sort: { totalUses: -1 }
    }
  ]);
};

// Instance methods
templateSchema.methods.incrementUsage = function(processingTime: number, success: boolean = true) {
  this.usage.totalUses += 1;
  this.usage.lastUsedAt = new Date();
  
  if (success) {
    this.usage.successfulUses += 1;
  } else {
    this.usage.failedUses += 1;
  }
  
  // Update average processing time
  const totalTime = this.usage.avgProcessingTime * (this.usage.successfulUses - 1) + processingTime;
  this.usage.avgProcessingTime = totalTime / this.usage.successfulUses;
  
  // Update daily usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingUsage = this.analytics.dailyUsage.find((usage: any) => 
    usage.date.getTime() === today.getTime()
  );
  
  if (existingUsage) {
    existingUsage.count += 1;
  } else {
    this.analytics.dailyUsage.push({ date: today, count: 1 });
  }
  
  // Keep only last 30 days of usage data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.analytics.dailyUsage = this.analytics.dailyUsage.filter(
    (usage: any) => usage.date >= thirtyDaysAgo
  );
  
  return this.save();
};

templateSchema.methods.addFeedback = function(userId: string, rating: number, comment?: string) {
  // Remove existing feedback from this user
  this.analytics.userFeedback = this.analytics.userFeedback.filter(
    (feedback: any) => feedback.userId !== userId
  );
  
  // Add new feedback
  this.analytics.userFeedback.push({
    userId,
    rating,
    comment,
    createdAt: new Date()
  });
  
  return this.save();
};

templateSchema.methods.updateSettings = function(settings: Partial<ITemplate['settings']>) {
  this.settings = { ...this.settings, ...settings };
  return this.save();
};

templateSchema.methods.incrementUsage = function(processingTime?: number, success?: boolean) {
  this.usage.totalUses += 1;
  this.usage.lastUsedAt = new Date();
  
  if (success) {
    this.usage.successfulUses += 1;
  } else {
    this.usage.failedUses += 1;
  }
  
  if (processingTime) {
    this.usage.avgProcessingTime = (this.usage.avgProcessingTime * (this.usage.totalUses - 1) + processingTime) / this.usage.totalUses;
  }
  
  return this.save();
};

export const Template = mongoose.model<ITemplate>('Template', templateSchema);
