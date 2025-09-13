# 🎨 AI Style Editor (Morpho)

A full-stack web application that allows users to browse style templates, upload images, and get AI-edited results using OpenAI's DALL·E API. Transform your images with the power of AI and a beautiful, intuitive interface.

![AI Style Editor](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript)
![AWS](https://img.shields.io/badge/AWS-Lambda-FF9900?style=for-the-badge&logo=amazon-aws)

## ✨ Features

- 🎨 **Gallery of Style Templates** - Browse through a curated collection of AI style templates
- 📸 **Image Upload & AI Editing** - Upload your images and transform them with AI
- ⚡ **Fast Processing** - Powered by AWS Lambda for lightning-fast image processing
- 🎭 **Smooth Animations** - Beautiful transitions and micro-interactions with Framer Motion
- 📱 **Responsive Design** - Optimized for all devices with Tailwind CSS
- 🔍 **Smart Search** - Find templates quickly with intelligent search functionality
- 🎯 **Real-time Progress** - Track your image processing with live progress indicators

## 🛠 Tech Stack

### Frontend
- **React 19.1.1** + **Vite** - Modern React with fast build tooling
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Query** - Powerful data synchronization
- **Framer Motion** - Production-ready motion library
- **React Router** - Client-side routing

### Backend
- **Node.js** + **Express** - Server-side JavaScript runtime
- **AWS Lambda** + **API Gateway** - Serverless architecture
- **MongoDB Atlas** - Cloud database
- **AWS S3** - Object storage for images
- **Serverless Framework** - Infrastructure as code

### AI & Services
- **OpenAI DALL·E API** - AI image generation and editing
- **Sharp** - High-performance image processing

## 📁 Project Structure

```
morpho/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend with Lambda functions
│   ├── src/
│   │   ├── handlers/       # Lambda function handlers
│   │   ├── services/       # Business logic services
│   │   ├── data/          # Static data and templates
│   │   └── utils/         # Utility functions
│   └── serverless.yml     # Serverless configuration
├── shared/                 # Shared types and utilities
├── .github/               # GitHub workflows and templates
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS CLI (for deployment)
- MongoDB Atlas account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/morpho.git
cd morpho
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
```bash
# Backend environment
cp backend/env.example backend/.env
# Edit backend/.env with your actual values

# Frontend environment  
cp frontend/env.example frontend/.env
# Edit frontend/.env with your actual values
```

4. **Configure your environment variables**

**Backend (.env):**
```env
OPENAI_API_KEY=your_openai_api_key_here
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_s3_bucket_name
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-style-editor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001/api
```

5. **Start development servers**
```bash
npm run dev
```

This will start both frontend (http://localhost:5173) and backend (http://localhost:3001) servers.

## 🏗 Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in development mode
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build both frontend and backend
npm run build

# Build only frontend
npm run build:frontend

# Build only backend
npm run build:backend
```

### Frontend Development

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend Development

```bash
cd backend
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript
npm run start    # Start production server
npm run deploy   # Deploy to AWS Lambda
npm test         # Run tests
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment (AWS Lambda)

1. Configure AWS credentials:
```bash
aws configure
```

2. Deploy to AWS:
```bash
cd backend
npm run deploy
```

### Environment Variables for Production

Set these in your deployment platform:

**Frontend:**
- `VITE_API_URL` - Your deployed API Gateway URL

**Backend:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET_NAME` - S3 bucket name
- `MONGODB_URI` - MongoDB connection string

## 📚 API Documentation

### Endpoints

- `GET /api/templates` - Get all style templates
- `POST /api/edit` - Edit image with selected template

### Request/Response Examples

**Get Templates:**
```bash
GET /api/templates
```

**Edit Image:**
```bash
POST /api/edit
Content-Type: multipart/form-data

{
  "image": <file>,
  "templateId": "template-id",
  "prompt": "optional custom prompt"
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports & Feature Requests

- 🐛 [Report a bug](https://github.com/yourusername/morpho/issues/new?template=bug_report.md)
- ✨ [Request a feature](https://github.com/yourusername/morpho/issues/new?template=feature_request.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the DALL·E API
- AWS for serverless infrastructure
- The React and TypeScript communities
- All contributors and users

## 📞 Support

- 📧 Email: support@morpho-ai.com
- 💬 Discord: [Join our community](https://discord.gg/morpho-ai)
- 📖 Documentation: [docs.morpho-ai.com](https://docs.morpho-ai.com)

---

<div align="center">
  <p>Made with ❤️ by the Morpho Team</p>
  <p>
    <a href="https://github.com/yourusername/morpho">⭐ Star us on GitHub</a> •
    <a href="https://twitter.com/morpho_ai">🐦 Follow us on Twitter</a> •
    <a href="https://morpho-ai.com">🌐 Visit our website</a>
  </p>
</div>
