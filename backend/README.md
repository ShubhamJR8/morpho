# AI Style Editor Backend

A robust backend API for the AI Style Editor application, built with Express.js, TypeScript, and AWS services.

## Features

- 🎨 **Template Management**: CRUD operations for image editing templates
- 🤖 **AI Image Editing**: Integration with OpenAI's image editing API
- ☁️ **Cloud Storage**: AWS S3 integration for image storage
- 🔒 **Security**: Helmet.js for security headers, CORS configuration
- 📝 **Logging**: Winston-based structured logging
- ✅ **Validation**: Joi-based request validation
- 🧪 **Testing**: Jest test suite with coverage reporting
- 🚀 **Serverless**: AWS Lambda deployment ready

## Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Language**: TypeScript
- **AI Service**: OpenAI API
- **Storage**: AWS S3
- **Logging**: Winston
- **Validation**: Joi
- **Testing**: Jest
- **Deployment**: Serverless Framework

## API Endpoints

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `GET /api/templates/categories` - Get all categories
- `GET /api/templates/category/:category` - Get templates by category
- `GET /api/templates/search?q=query` - Search templates

### Image Editing
- `POST /api/edit` - Edit image with template

### Health Check
- `GET /health` - Service health status

## Environment Variables

Create a `.env` file based on `env.example`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_s3_bucket_name

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Development

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- AWS account with S3 access
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
```

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build the application
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

## Deployment

### AWS Lambda (Serverless)

```bash
# Deploy to AWS Lambda
npm run deploy

# Deploy to specific stage
serverless deploy --stage production
```

### Local Development with Serverless

```bash
# Start serverless offline
npx serverless offline
```

## Project Structure

```
src/
├── handlers/          # Request handlers
│   ├── editHandler.ts
│   └── templateHandler.ts
├── services/          # Business logic services
│   ├── openaiService.ts
│   ├── s3Service.ts
│   └── templateService.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   ├── errorHandler.ts
│   ├── logger.ts
│   └── validation.ts
├── data/              # Static data files
│   └── templates.json
├── __tests__/         # Test files
│   ├── setup.ts
│   ├── handlers/
│   └── services/
├── handler.ts         # AWS Lambda handler
└── index.ts           # Express app setup
```

## Error Handling

The application uses a centralized error handling system with:

- **Custom Error Classes**: Specific error types for different scenarios
- **Error Middleware**: Global error handling middleware
- **Structured Logging**: Detailed error logging with Winston
- **API Responses**: Consistent error response format

## Validation

Request validation is handled using Joi schemas:

- **Query Parameters**: Search parameters, pagination
- **Path Parameters**: Template IDs, categories
- **Request Body**: Image edit requests
- **File Uploads**: Image file validation

## Logging

Structured logging with Winston:

- **Development**: Console output with colors
- **Production**: File-based logging
- **Log Levels**: error, warn, info, http, debug
- **Request Logging**: HTTP request/response logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
