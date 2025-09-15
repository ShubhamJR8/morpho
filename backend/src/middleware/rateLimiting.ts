import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private getKey(req: Request): string {
    // Use IP address as the key, but you could also use user ID if authenticated
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    
    // Create a more specific key for different endpoints
    const endpoint = req.path;
    
    return `${ip}:${endpoint}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  private isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      return false;
    }

    // Increment counter
    entry.count++;
    return true;
  }

  private getRemainingRequests(key: string, config: RateLimitConfig): number {
    const entry = this.store.get(key);
    if (!entry || entry.resetTime < Date.now()) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - entry.count);
  }

  private getResetTime(key: string): number {
    const entry = this.store.get(key);
    return entry ? entry.resetTime : Date.now();
  }

  middleware(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const isAllowed = this.isAllowed(key, config);

      if (!isAllowed) {
        const resetTime = this.getResetTime(key);
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

        res.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': retryAfter.toString()
        });

        return res.status(429).json({
          success: false,
          error: config.message || 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter
        });
      }

      // Add rate limit headers to successful requests
      const remaining = this.getRemainingRequests(key, config);
      const resetTime = this.getResetTime(key);

      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString()
      });

      return next();
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter();

// Different rate limit configurations for different endpoints
export const rateLimits = {
  // General API rate limit
  general: rateLimiter.middleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP, please try again later'
  }),

  // Strict rate limit for image editing (expensive operation)
  imageEdit: rateLimiter.middleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Image editing rate limit exceeded. Please try again in an hour'
  }),

  // Moderate rate limit for template operations
  templates: rateLimiter.middleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
    message: 'Template request rate limit exceeded'
  }),

  // Search rate limit
  search: rateLimiter.middleware({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    message: 'Search rate limit exceeded. Please try again in a few minutes'
  }),

  // Health check rate limit (very permissive)
  health: rateLimiter.middleware({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Health check rate limit exceeded'
  })
};

// Cleanup on process exit
process.on('SIGINT', () => {
  rateLimiter.destroy();
});

process.on('SIGTERM', () => {
  rateLimiter.destroy();
});
