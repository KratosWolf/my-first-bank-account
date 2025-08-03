#!/bin/bash
# scripts/setup.sh

set -e

echo "🚀 Setting up development environment..."

# Verify Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Verify npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Configure environment variables
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Please update .env.local with your configuration"
fi

# Setup Git hooks
echo "🔧 Setting up Git hooks..."
npm run prepare

# Test build
echo "🔨 Testing build..."
npm run build

# Execute tests
echo "🧪 Running tests..."
npm run test:ci

echo "✅ Setup completed successfully!"
echo "🎯 Run 'npm run dev' to start development server" 