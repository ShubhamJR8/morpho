# AI Style Editor Backend

A robust, production-ready backend API for AI-powered image style editing built with Node.js, Express, and AWS Lambda.

## 🚀 Features

### Core Functionality
- **AI Image Editing**: Integration with OpenAI's image editing API
- **Template Management**: Dynamic template system with categories and search
- **File Processing**: Advanced image optimization and validation
- **Cloud Storage**: AWS S3 integration for image storage

### Production-Ready Features
- **Comprehensive Validation**: Input sanitization and validation for all endpoints
- **Rate Limiting**: Configurable rate limits to prevent abuse
- **Caching Layer**: In-memory caching for improved performance
- **Structured Logging**: Request/response tracking with unique request IDs
- **Error Handling**: Custom error classes with proper HTTP status codes
- **Security**: Helmet.js security headers, CORS configuration
- **API Documentation**: Complete OpenAPI/Swagger documentation
- **Testing Suite**: Unit and integration tests with Jest

## 📁 Project Structure

```
src/
├── handlers/           # Request handlers
│   ├── editHandler.ts  # Image editing logic
│   └── templateHandler.ts # Template management
├── middleware/         # Express middleware
│   ├── errorHandling.ts # Error handling utilities
│   ├── logging.ts      # Structured logging
│   ├── rateLimiting.ts # Rate limiting logic
│   └── validation.ts   # Input validation
├── services/          # Business logic services
│   ├── cacheService.ts # Caching implementation
│   ├── imageOptimization.ts # Image processing
│   ├── openaiService.ts # OpenAI integration
│   ├── s3Service.ts    # AWS S3 operations
│   └── templateService.ts # Template management
├── docs/              # API documentation
│   ├── swagger.ts     # Swagger definition
│   └── paths.ts       # API endpoint definitions
├── tests/             # Test files
│   ├── setup.ts       # Test configuration
│   ├── templateHandler.test.ts
│   └── editHandler.test.ts
├── data/              # Static data
│   └── templates.json # Template definitions
├── index.ts           # Main application entry
└── handler.ts         # AWS Lambda handler
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Build the project
npm run build

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key
S3_BUCKET_NAME=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Optional
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ai-style-editor
```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:3001/api-docs`
- **OpenAPI JSON**: `http://localhost:3001/api-docs.json`

### Key Endpoints

#### Health Check
```http
GET /health
```

#### Templates
```http
GET /api/templates                    # Get all templates
GET /api/templates/{id}               # Get specific template
GET /api/templates/categories         # Get all categories
GET /api/templates/category/{category} # Get templates by category
GET /api/templates/search?q={query}   # Search templates
```

#### Image Editing
```http
POST /api/edit
Content-Type: multipart/form-data

{
  "image": <file>,
  "templateId": "t1"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints with mocked services
- **Mocked Services**: OpenAI and S3 services are mocked for testing

## 🔒 Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Image Editing**: 10 requests per hour
- **Search**: 50 requests per 5 minutes
- **Health Check**: 30 requests per minute

### Input Validation
- **File Validation**: Type, size, and format validation
- **Parameter Sanitization**: XSS protection and input cleaning
- **Schema Validation**: Request body and query parameter validation

### Security Headers
- **Helmet.js**: Comprehensive security headers
- **CORS**: Configured for specific origins
- **Content Security Policy**: Restrictive CSP rules

## 📊 Monitoring & Logging

### Structured Logging
- **Request Tracking**: Unique request IDs for tracing
- **Performance Metrics**: Response times and processing durations
- **Error Tracking**: Detailed error information with stack traces
- **Audit Trail**: All API requests and responses logged

### Log Levels
- **INFO**: Normal operation events
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **DEBUG**: Detailed debugging information (development only)

## 🚀 Deployment

### AWS Lambda Deployment
```bash
# Deploy to AWS Lambda
npm run deploy

# Deploy to specific stage
npm run deploy -- --stage production
```

### Environment Setup
- **Development**: Local Express server
- **Production**: AWS Lambda with API Gateway
- **Testing**: In-memory MongoDB and mocked services

## 📈 Performance Features

### Caching
- **Template Caching**: Templates cached for 10-30 minutes
- **Search Results**: Search results cached for 5 minutes
- **LRU Eviction**: Automatic cleanup of expired entries

### Image Optimization
- **Automatic Compression**: Images optimized before processing
- **Format Conversion**: Automatic format optimization
- **Size Limits**: Configurable size and dimension limits
- **Validation**: Comprehensive image validation

## 🔧 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run deploy       # Deploy to AWS Lambda
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Jest**: Comprehensive testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the API docs at `/api-docs`
- **Issues**: Create an issue on GitHub
- **Email**: support@aistyleeditor.com

---

Built with ❤️ using Node.js, Express, TypeScript, and AWS Lambda.
