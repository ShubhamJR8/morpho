import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { TemplateHandler } from './handlers/templateHandler';
import { EditHandler } from './handlers/editHandler';
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from './utils/errorHandler';
import { validate, validateFile, validateEnvironment } from './utils/validation';
import { schemas } from './utils/validation';
import logger from './utils/logger';
import { HealthCheckResponse } from './types';

// Load environment variables
dotenv.config();

// Validate environment variables
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}

// Handle unhandled promise rejections and uncaught exceptions
handleUnhandledRejection();
handleUncaughtException();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize handlers
const templateHandler = new TemplateHandler();
const editHandler = new EditHandler();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthResponse: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-style-editor-backend',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
  };
  
  res.json(healthResponse);
});

// Template routes
app.get('/api/templates', templateHandler.getAllTemplates);
app.get('/api/templates/categories', templateHandler.getCategories);
app.get('/api/templates/category/:category', 
  validate(schemas.category, 'params'), 
  templateHandler.getTemplatesByCategory
);
app.get('/api/templates/search', 
  validate(schemas.templateSearch, 'query'), 
  templateHandler.searchTemplates
);
app.get('/api/templates/:id', 
  validate(schemas.templateId, 'params'), 
  templateHandler.getTemplateById
);

// Image editing routes
app.post('/api/edit', 
  editHandler.uploadMiddleware, 
  validateFile,
  validate(schemas.imageEdit, 'body'),
  editHandler.editImage
);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (must be after all routes)
app.use('*', notFoundHandler);

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📊 Health check available at: http://localhost:${PORT}/health`);
  });
}

export default app;
