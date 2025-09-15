import mongoose from 'mongoose';
import { logger } from '../middleware/logging';

export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;
  private connectionString: string;

  private constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-style-editor';
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      // Configure mongoose options
      const options: any = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
        retryWrites: true, // Retry failed writes
        w: 'majority', // Write concern
        readPreference: 'primary' // Read from primary replica
      };

      logger.info('Connecting to MongoDB...', undefined, {
        uri: this.connectionString.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
      });

      await mongoose.connect(this.connectionString, options);

      this.isConnected = true;

      // Set up event listeners
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', this.gracefulShutdown);
      process.on('SIGTERM', this.gracefulShutdown);

      logger.info('MongoDB connection established successfully');

    } catch (error) {
      logger.error('Failed to connect to MongoDB', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info('Database not connected');
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection', error);
      throw error;
    }
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnectionState(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  public async getDatabaseStats(): Promise<any> {
    if (!this.isConnectedToDatabase()) {
      throw new Error('Database not connected');
    }

    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      
      const stats = await db.stats();
      
      return {
        database: db.databaseName,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        fileSize: stats.fileSize
      };
    } catch (error) {
      logger.error('Error getting database stats', error);
      throw error;
    }
  }

  public async getCollectionStats(): Promise<any[]> {
    if (!this.isConnectedToDatabase()) {
      throw new Error('Database not connected');
    }

    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      
      const collections = await db.listCollections().toArray();
      const stats = [];

      for (const collection of collections) {
        try {
          const collectionStats = await (db.collection(collection.name) as any).stats();
          stats.push({
            name: collection.name,
            count: collectionStats.count,
            size: collectionStats.size,
            avgObjSize: collectionStats.avgObjSize,
            storageSize: collectionStats.storageSize,
            totalIndexSize: collectionStats.totalIndexSize,
            indexes: collectionStats.nindexes
          });
        } catch (error) {
          logger.warn(`Error getting stats for collection ${collection.name}`, undefined, { error });
        }
      }

      return stats;
    } catch (error) {
      logger.error('Error getting collection stats', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.isConnectedToDatabase()) {
        return {
          status: 'unhealthy',
          details: {
            connectionState: this.getConnectionState(),
            error: 'Database not connected'
          }
        };
      }

      // Test basic operations
      const startTime = Date.now();
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      await db.admin().ping();
      const responseTime = Date.now() - startTime;

      const stats = await this.getDatabaseStats();

      return {
        status: 'healthy',
        details: {
          connectionState: this.getConnectionState(),
          responseTime,
          database: stats.database,
          collections: stats.collections,
          dataSize: stats.dataSize
        }
      };
    } catch (error) {
      logger.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        details: {
          connectionState: this.getConnectionState(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private gracefulShutdown = async (): Promise<void> => {
    logger.info('Received shutdown signal, closing database connection...');
    
    try {
      await this.disconnect();
      logger.info('Database connection closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', error);
      process.exit(1);
    }
  };

  // Utility methods for common operations
  public async createIndexes(): Promise<void> {
    if (!this.isConnectedToDatabase()) {
      throw new Error('Database not connected');
    }

    try {
      logger.info('Creating database indexes...');
      
      // Import models to ensure indexes are created
      await import('../models/User');
      await import('../models/EditSession');
      await import('../models/Template');
      await import('../models/Analytics');
      
      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes', error);
      throw error;
    }
  }

  public async seedInitialData(): Promise<void> {
    if (!this.isConnectedToDatabase()) {
      throw new Error('Database not connected');
    }

    try {
      const { Template } = await import('../models/Template');
      
      // Check if templates already exist
      const existingTemplates = await Template.countDocuments();
      if (existingTemplates > 0) {
        logger.info('Templates already exist, skipping seed');
        return;
      }

      // Import template data from JSON file
      const fs = await import('fs');
      const path = await import('path');
      const templatesPath = path.join(__dirname, '../data/templates.json');
      const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

      // Transform and insert templates
      const templatesToInsert = templatesData.map((template: any) => ({
        title: template.title,
        description: template.description,
        category: template.category,
        previewUrl: template.previewUrl,
        prompt: template.prompt,
        tags: template.tags || [],
        metadata: {
          version: '1.0.0',
          author: 'System',
          isActive: true,
          priority: 0
        },
        usage: {
          totalUses: 0,
          successfulUses: 0,
          failedUses: 0,
          avgProcessingTime: 0,
          popularityScore: 0
        },
        settings: {
          maxImageSize: 10 * 1024 * 1024, // 10MB
          supportedFormats: ['jpeg', 'jpg', 'png', 'webp'],
          quality: 85,
          requiresOptimization: true
        },
        analytics: {
          dailyUsage: [],
          userFeedback: [],
          avgRating: 0
        }
      }));

      await Template.insertMany(templatesToInsert);
      logger.info(`Seeded ${templatesToInsert.length} templates successfully`);
    } catch (error) {
      logger.error('Error seeding initial data', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
