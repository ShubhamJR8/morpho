import { v4 as uuidv4 } from 'uuid';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  cleanupInterval: number; // Cleanup interval in milliseconds
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 15 * 60 * 1000, // 15 minutes
      maxSize: 1000,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      ...config
    };

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now
    });
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let totalAccessCount = 0;
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalAccessCount += entry.accessCount;
      
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      totalAccessCount,
      expiredCount,
      hitRate: this.calculateHitRate()
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Evict the oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private calculateHitRate(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track hits and misses separately
    const stats = this.getStats();
    return stats.totalAccessCount > 0 ? (stats.size / stats.totalAccessCount) * 100 : 0;
  }

  /**
   * Generate cache key for templates
   */
  static generateTemplateKey(id: string): string {
    return `template:${id}`;
  }

  /**
   * Generate cache key for templates by category
   */
  static generateCategoryKey(category: string): string {
    return `category:${category}`;
  }

  /**
   * Generate cache key for search results
   */
  static generateSearchKey(query: string, category?: string, limit?: number): string {
    const parts = ['search', query];
    if (category) parts.push(category);
    if (limit) parts.push(limit.toString());
    return parts.join(':');
  }

  /**
   * Generate cache key for all templates
   */
  static generateAllTemplatesKey(): string {
    return 'templates:all';
  }

  /**
   * Generate cache key for categories
   */
  static generateCategoriesKey(): string {
    return 'categories:all';
  }

  /**
   * Destroy the cache service
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Create a singleton instance
export const cacheService = new CacheService({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for templates
  maxSize: 500,
  cleanupInterval: 2 * 60 * 1000 // 2 minutes
});

// Cleanup on process exit
process.on('SIGINT', () => {
  cacheService.destroy();
});

process.on('SIGTERM', () => {
  cacheService.destroy();
});
