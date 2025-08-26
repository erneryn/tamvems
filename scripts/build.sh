#!/bin/bash

# Build script for Vercel deployment
echo "🚀 Starting TAMVEMS build process..."

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if generation was successful
if [ $? -ne 0 ]; then
    echo "❌ Prisma generation failed"
    exit 1
fi

echo "✅ Prisma client generated successfully"

# Build Next.js app
echo "🏗️ Building Next.js application..."
npx next build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed"
    exit 1
fi
