// Core API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Template Types
export interface Template {
  id: string;
  title: string;
  previewUrl: string;
  prompt: string;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicTemplate extends Omit<Template, 'prompt'> {}

export interface TemplateSearchParams {
  query: string;
  category?: string;
  limit?: number;
  offset?: number;
}

// Image Editing Types
export interface EditRequest {
  templateId: string;
  image: Express.Multer.File;
}

export interface EditResponse {
  success: boolean;
  imageUrl?: string;
  originalImageUrl?: string;
  error?: string;
  processingTime?: number;
  templateId?: string;
}

// S3 Service Types
export interface S3UploadParams {
  file: Buffer;
  originalName: string;
  folder: string;
  contentType?: string;
}

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
}

// OpenAI Service Types
export interface OpenAIImageEditParams {
  imageUrl: string;
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  responseFormat?: 'url' | 'b64_json';
}

export interface OpenAIImageVariationParams {
  imageUrl: string;
  size?: '256x256' | '512x512' | '1024x1024';
  responseFormat?: 'url' | 'b64_json';
}

// Error Types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Environment Configuration
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  OPENAI_API_KEY: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  MONGODB_URI?: string;
  FRONTEND_URL: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  version?: string;
  uptime?: number;
  dependencies?: {
    database?: 'connected' | 'disconnected';
    s3?: 'connected' | 'disconnected';
    openai?: 'connected' | 'disconnected';
  };
}

// Request/Response Middleware Types
export interface RequestWithUser extends Express.Request {
  user?: {
    id: string;
    email?: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
