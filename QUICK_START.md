# AI Style Editor - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- AWS account (for S3 storage)
- Git

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd morpho
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### 2. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp env.example .env
# Edit .env with your API keys:
# - OPENAI_API_KEY=your_openai_key
# - AWS_ACCESS_KEY_ID=your_aws_key
# - AWS_SECRET_ACCESS_KEY=your_aws_secret
# - S3_BUCKET_NAME=your_bucket_name
```

#### Frontend (.env)
```bash
cd frontend
cp env.example .env
# Edit .env:
# - VITE_API_URL=http://localhost:3001/api
```

### 3. Start Development
```bash
# From project root
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:3001).

## 🎨 Features

### ✅ Implemented
- **Gallery Page**: Browse 6 pre-made style templates
- **Template Selection**: Choose from Fantasy, Sci-Fi, Vintage, Artistic, Nature categories
- **Image Upload**: Drag & drop or click to upload (10MB limit)
- **AI Processing**: OpenAI DALL·E integration for image editing
- **Results Page**: View and download transformed images
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Framer Motion for delightful UX
- **Error Handling**: Comprehensive error states and user feedback

### 🏗️ Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + AWS Lambda ready
- **Storage**: AWS S3 for images
- **AI**: OpenAI DALL·E API
- **State**: React Query for server state management

## 📁 Project Structure
```
morpho/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── handlers/      # API route handlers
│   │   ├── services/      # Business logic
│   │   └── data/          # Template data
├── shared/            # Shared types (future use)
└── scripts/           # Development scripts
```

## 🎯 Usage Flow

1. **Browse Gallery**: Visit homepage to see available style templates
2. **Select Template**: Click on a template card to view details
3. **Upload Image**: Drag & drop or select an image file
4. **Process**: Click "Transform Image" to start AI processing
5. **View Results**: See the transformed image and download it

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

## 🚀 Deployment

### Backend (AWS Lambda)
```bash
cd backend
npm run build
serverless deploy
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting platform
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🎨 Style Templates

The app includes 6 pre-configured style templates:

1. **Pastel Balloon Sky** (Fantasy) - Dreamy pastel world with floating balloons
2. **Cyberpunk Neon** (Sci-Fi) - Futuristic urban environment with neon lights
3. **Vintage Film Noir** (Vintage) - Classic black and white with dramatic shadows
4. **Watercolor Dream** (Artistic) - Beautiful watercolor painting effect
5. **Tropical Paradise** (Nature) - Lush tropical paradise setting
6. **Steampunk Adventure** (Fantasy) - Victorian-era steampunk world

## 🔒 Security & Best Practices

- ✅ Input validation on both frontend and backend
- ✅ File type and size validation (10MB limit)
- ✅ CORS configuration for production
- ✅ Environment variable management
- ✅ Error handling and logging
- ✅ TypeScript for type safety

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all dependencies are installed
2. **API Errors**: Check environment variables are set correctly
3. **Image Upload Issues**: Verify S3 bucket permissions
4. **OpenAI Errors**: Check API key and rate limits

### Debug Commands
```bash
# Check backend logs
cd backend && npm run dev

# Check frontend build
cd frontend && npm run build

# Test API endpoints
curl http://localhost:3001/api/health
```

## 📈 Future Enhancements

- User authentication and accounts
- Payment integration (Stripe)
- Image history and favorites
- More AI models (Stable Diffusion, Replicate)
- Batch processing
- Advanced editing options
- Social sharing features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy Image Editing! 🎨✨**
