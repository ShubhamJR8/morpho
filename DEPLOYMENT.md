# Deployment Guide

This guide will help you deploy the AI Style Editor application to production.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **OpenAI API Key** for image editing
3. **MongoDB Atlas** account (optional, can use JSON files for MVP)
4. **Node.js** 18+ installed locally

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_s3_bucket_name

# MongoDB Configuration (Optional for MVP)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-style-editor

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# API Configuration
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/dev/api
```

## AWS Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
```

Create `cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. Create IAM User

Create an IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

## Backend Deployment (AWS Lambda)

### 1. Install Serverless Framework

```bash
npm install -g serverless
npm install -g serverless-offline
```

### 2. Deploy Backend

```bash
cd backend
npm run build
serverless deploy
```

This will create:
- Lambda function
- API Gateway
- IAM roles
- CloudFormation stack

### 3. Get API Gateway URL

After deployment, note the API Gateway URL from the output. You'll need this for the frontend configuration.

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Set environment variables in Vercel dashboard:
- `VITE_API_URL`: Your API Gateway URL

### Option 2: Netlify

1. Build the project:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to Netlify

3. Set environment variables in Netlify dashboard

### Option 3: AWS S3 + CloudFront

1. Build the project:
```bash
cd frontend
npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://your-frontend-bucket --delete
```

3. Create CloudFront distribution pointing to S3 bucket

## Testing

### 1. Test Backend

```bash
curl https://your-api-gateway-url.amazonaws.com/dev/api/health
```

### 2. Test Frontend

Visit your deployed frontend URL and test the image editing flow.

## Monitoring

### CloudWatch Logs

Monitor your Lambda function logs in AWS CloudWatch.

### Error Tracking

Consider adding error tracking services like Sentry for production monitoring.

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Configure CORS properly for production
3. **Rate Limiting**: Consider adding rate limiting for API endpoints
4. **File Size Limits**: Enforce file size limits (currently 10MB)
5. **Input Validation**: Validate all inputs on both frontend and backend

## Scaling Considerations

For high traffic, consider:

1. **CDN**: Use CloudFront for static assets
2. **Database**: Move from JSON files to MongoDB Atlas
3. **Queue System**: Add SQS or BullMQ for image processing
4. **Caching**: Add Redis for template caching
5. **Load Balancing**: Use Application Load Balancer for multiple Lambda functions

## Cost Optimization

1. **Lambda**: Use provisioned concurrency for consistent performance
2. **S3**: Use S3 Intelligent Tiering for cost optimization
3. **API Gateway**: Monitor usage and consider caching
4. **CloudWatch**: Set up billing alerts

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS configuration in API Gateway
2. **File Upload Issues**: Verify S3 bucket permissions
3. **OpenAI API Errors**: Check API key and rate limits
4. **Lambda Timeout**: Increase timeout in serverless.yml

### Debug Commands

```bash
# View Lambda logs
serverless logs -f api

# Test locally
serverless offline

# Check deployment status
serverless info
```
