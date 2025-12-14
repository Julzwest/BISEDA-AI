#!/bin/bash
echo "🚀 Building and deploying to GitHub Pages..."
npm run build
cp CNAME dist/
cp 404.html dist/
rm -rf node_modules/.cache/gh-pages
npx gh-pages -d dist -r https://github.com/Julzwest/BISEDA-AI.git -b gh-pages --dotfiles --no-history
echo "✅ Deployed! Visit https://bisedaai.com in a few minutes."
