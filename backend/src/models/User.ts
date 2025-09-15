import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  username: string;
  profilePicture?: string;
  preferences: {
    favoriteCategories: string[];
    defaultImageQuality: number;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  usage: {
    imagesProcessed: number;
    totalProcessingTime: number;
    lastActiveAt: Date;
    createdAt: Date;
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    expiresAt?: Date;
    features: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  incrementUsage(processingTime?: number): Promise<IUser>;
  updatePreferences(preferences: Partial<IUser['preferences']>): Promise<IUser>;
  updateSubscription(plan: string, expiresAt?: Date, features?: string[]): Promise<IUser>;
}

export interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  profilePicture: {
    type: String,
    default: null
  },
  preferences: {
    favoriteCategories: [{
      type: String,
      enum: ['Fantasy', 'Sci-Fi', 'Vintage', 'Artistic', 'Nature']
    }],
    defaultImageQuality: {
      type: Number,
      default: 85,
      min: 10,
      max: 100
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  },
  usage: {
    imagesProcessed: {
      type: Number,
      default: 0,
      min: 0
    },
    totalProcessingTime: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    features: [{
      type: String,
      enum: ['unlimited_edits', 'priority_processing', 'advanced_templates', 'analytics', 'api_access']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
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
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'usage.lastActiveAt': -1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('usage.lastActiveAt')) {
    this.usage.lastActiveAt = new Date();
  }
  next();
});

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.getActiveUsers = function(limit: number = 100) {
  return this.find({ isActive: true })
    .sort({ 'usage.lastActiveAt': -1 })
    .limit(limit);
};

userSchema.statics.getUsageStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        totalImagesProcessed: { $sum: '$usage.imagesProcessed' },
        totalProcessingTime: { $sum: '$usage.totalProcessingTime' },
        avgProcessingTime: { $avg: '$usage.totalProcessingTime' }
      }
    }
  ]);
};

// Instance methods
userSchema.methods.incrementUsage = function(processingTime: number) {
  this.usage.imagesProcessed += 1;
  this.usage.totalProcessingTime += processingTime;
  this.usage.lastActiveAt = new Date();
  return this.save();
};

userSchema.methods.updatePreferences = function(preferences: Partial<IUser['preferences']>) {
  this.preferences = { ...this.preferences, ...preferences };
  return this.save();
};

userSchema.methods.updateSubscription = function(plan: string, expiresAt?: Date, features?: string[]) {
  this.subscription.plan = plan as any;
  this.subscription.expiresAt = expiresAt || null;
  this.subscription.features = features || [];
  return this.save();
};

userSchema.methods.incrementUsage = function(processingTime?: number) {
  this.usage.imagesProcessed += 1;
  this.usage.lastActiveAt = new Date();
  
  if (processingTime) {
    this.usage.totalProcessingTime += processingTime;
  }
  
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username });
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
