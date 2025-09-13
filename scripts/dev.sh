#!/bin/bash

# AI Style Editor Development Script

echo "🚀 Starting AI Style Editor Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "🎉 Setup complete! You can now start development:"
echo ""
echo "To start both frontend and backend:"
echo "  npm run dev"
echo ""
echo "To start only frontend:"
echo "  npm run dev:frontend"
echo ""
echo "To start only backend:"
echo "  npm run dev:backend"
echo ""
echo "📝 Don't forget to:"
echo "  1. Copy backend/env.example to backend/.env and fill in your API keys"
echo "  2. Copy frontend/env.example to frontend/.env"
echo "  3. Set up your AWS S3 bucket and OpenAI API key"
echo ""
echo "📚 See DEPLOYMENT.md for detailed setup instructions"
