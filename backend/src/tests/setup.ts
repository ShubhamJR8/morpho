import { config } from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.S3_BUCKET_NAME = 'test-bucket';
  process.env.AWS_REGION = 'us-east-1';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  
  // Start in-memory MongoDB for testing
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

// Global test cleanup
afterAll(async () => {
  // Cleanup global resources
});

// Mock external services for testing
jest.mock('../services/openaiService');
jest.mock('../services/s3Service');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
