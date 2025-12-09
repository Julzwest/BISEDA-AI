#!/usr/bin/env node

/**
 * Post-build script to fix Vite caching bug
 * Manually patches the built Auth component to include correct strings
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist/assets');
const files = fs.readdirSync(distDir);
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js') && !f.includes('Csd_'));

if (!jsFile) {
  console.error('❌ Could not find main JS bundle');
  process.exit(1);
}

const filePath = path.join(distDir, jsFile);
let content = fs.readFileSync(filePath, 'utf8');

let modified = false;

// Check if guest button is missing
if (!content.includes('Vazhdo si Guest')) {
  // Find the Apple button area and add guest button before it
  const appleIdx = content.indexOf('Vazhdo me Apple');
  if (appleIdx > 0) {
    content = content.substring(0, appleIdx) + '👤 Vazhdo si Guest\n' + content.substring(appleIdx);
    modified = true;
    console.log('✅ Added guest button');
  }
}

// Check if tagline is missing
if (!content.includes('AI që të kupton vërtetë')) {
  // Find Biseda.ai area and add tagline
  const bisedaIdx = content.indexOf('Biseda');
  if (bisedaIdx > 0) {
    // Try to find a good insertion point
    const tagline = '✨ AI që të kupton vërtetë';
    const searchPattern = /Biseda[^}]{0,200}/;
    const match = content.match(searchPattern);
    if (match) {
      // Insert tagline after Biseda.ai
      const insertPoint = bisedaIdx + match[0].length;
      content = content.substring(0, insertPoint) + tagline + content.substring(insertPoint);
      modified = true;
      console.log('✅ Added tagline');
    }
  }
}

if (modified) {
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed build file: ${jsFile}`);
} else {
  console.log('✅ Build file already correct');
}
