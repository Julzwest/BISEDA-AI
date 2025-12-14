#!/bin/bash

# Deploy to GitHub Pages
# This script will deploy your dist/ folder to bisedaai.com

set -e

echo "🚀 Starting deployment to GitHub Pages..."

# Navigate to project
cd "/Users/xhuljongashi/Desktop/BISEDA COPY BACKUP "

# Build the project
echo "📦 Building project..."
npm run build

# Copy necessary files
echo "📋 Copying files..."
cp CNAME dist/ 2>/dev/null || echo "CNAME already exists"
cp 404.html dist/ 2>/dev/null || echo "404.html already exists"

# Deploy using gh-pages
echo "🌐 Deploying to GitHub Pages..."
echo "   (You'll be prompted for GitHub credentials)"
echo ""

npx gh-pages -d dist -r https://github.com/Julzwest/BISEDA-AI.git -b gh-pages --dotfiles

echo ""
echo "✅ Deployment complete!"
echo "🌍 Your site should be live at https://bisedaai.com in a few minutes"
echo ""
echo "💡 If authentication fails:"
echo "   1. Use GitHub Desktop to push manually"
echo "   2. Or create a Personal Access Token at:"
echo "      https://github.com/settings/tokens"
echo "      (Use token as password when prompted)"
