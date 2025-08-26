#!/bin/bash

# TAMVEMS Deployment Script
# Run this script to prepare your app for deployment

echo "🚀 Preparing TAMVEMS for deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# 3. Build the application
echo "🏗️ Building application..."
npm run build

# 4. Test the build
echo "✅ Testing build..."
if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment."
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up your environment variables"
    echo "2. Deploy your database schema with: npx prisma db push"
    echo "3. Deploy to your chosen platform"
    echo ""
    echo "🌟 Recommended platforms:"
    echo "- Vercel + PlanetScale (easiest)"
    echo "- Railway (all-in-one)"
    echo "- DigitalOcean App Platform"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
