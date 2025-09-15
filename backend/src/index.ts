import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import { TemplateHandler } from './handlers/templateHandler';
import { EditHandler } from './handlers/editHandler';
import { AnalyticsHandler } from './handlers/analyticsHandler';
import { requestLogging, errorLogging, logger } from './middleware/logging';
import { rateLimits } from './middleware/rateLimiting';
import { sanitizeInput } from './middleware/validation';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandling';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from './docs/swagger';
import paths from './docs/paths';
import { databaseService } from './services/databaseService';
import { analyticsService } from './services/analyticsService';
import { userSessionService } from './services/userSessionService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize handlers
const templateHandler = new TemplateHandler();
const editHandler = new EditHandler();
const analyticsHandler = new AnalyticsHandler();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    // Store raw body for signature verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Custom middleware
app.use(requestLogging);
app.use(sanitizeInput);

// Swagger documentation
const swaggerOptions = {
  definition: {
    ...swaggerDefinition,
    paths
  },
  apis: ['./src/**/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Style Editor API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Serve raw swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/health', rateLimits.health, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dbHealth = databaseService.isConnectedToDatabase() 
    ? await databaseService.healthCheck()
    : { status: 'disconnected', details: { connectionState: 'disconnected' } };
  
  const sessionStats = userSessionService.getSessionStats();

  (res as any).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ai-style-editor-backend',
    version: process.env.npm_package_version || '1.0.0',
    database: dbHealth,
    sessions: {
      active: sessionStats.activeSessions,
      total: sessionStats.totalSessions
    },
    uptime: process.uptime()
  });
}));

// Template routes with rate limiting and validation
app.get('/api/templates', rateLimits.templates, asyncHandler(templateHandler.getAllTemplates));
app.get('/api/templates/categories', rateLimits.templates, asyncHandler(templateHandler.getCategories));
app.get('/api/templates/category/:category', rateLimits.templates, asyncHandler(templateHandler.getTemplatesByCategory));
app.get('/api/templates/search', rateLimits.search, asyncHandler(templateHandler.searchTemplates));
app.get('/api/templates/:id', rateLimits.templates, asyncHandler(templateHandler.getTemplateById));

// Image editing routes with strict rate limiting
app.post('/api/edit', rateLimits.imageEdit, editHandler.uploadMiddleware, asyncHandler(editHandler.editImage));

// Analytics routes
app.get('/api/analytics/overview', rateLimits.general, asyncHandler(analyticsHandler.getAnalyticsOverview));
app.get('/api/analytics/performance-trends', rateLimits.general, asyncHandler(analyticsHandler.getPerformanceTrends));
app.get('/api/analytics/templates', rateLimits.general, asyncHandler(analyticsHandler.getTemplateAnalytics));
app.get('/api/analytics/users/:userId', rateLimits.general, asyncHandler(analyticsHandler.getUserAnalytics));
app.get('/api/analytics/system-health', rateLimits.health, asyncHandler(analyticsHandler.getSystemHealth));
app.get('/api/analytics/sessions', rateLimits.general, asyncHandler(analyticsHandler.getSessionStats));
app.get('/api/analytics/weekly', rateLimits.general, asyncHandler(analyticsHandler.getWeeklyAnalytics));
app.get('/api/analytics/monthly', rateLimits.general, asyncHandler(analyticsHandler.getMonthlyAnalytics));
app.post('/api/analytics/generate-daily', rateLimits.general, asyncHandler(analyticsHandler.generateDailyAnalytics));

// Error handling middleware
app.use(errorLogging);
app.use(errorHandler);

// 404 handler
app.use('*', notFoundHandler);

// Initialize database and start server
const initializeServer = async () => {
  try {
    // Connect to database
    if (process.env.MONGODB_URI) {
      await databaseService.connect();
      await databaseService.createIndexes();
      await databaseService.seedInitialData();
      
      // Schedule analytics generation
      analyticsService.scheduleDailyAnalytics();
      
      logger.info('Database initialized successfully');
    } else {
      logger.warn('MongoDB URI not provided, running without database');
    }

    // Start server
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        logger.info('Server started successfully', undefined, {
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
          frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
          database: databaseService.isConnectedToDatabase() ? 'connected' : 'disconnected'
        });
        
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  Database: ${databaseService.isConnectedToDatabase() ? 'Connected' : 'Disconnected'}`);
        console.log(`📊 Analytics: Scheduled`);
        console.log(`👥 Sessions: Active`);
      });
    }
  } catch (error) {
    logger.error('Failed to initialize server', error);
    process.exit(1);
  }
};

// Start the server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  initializeServer();
}

export default app;
