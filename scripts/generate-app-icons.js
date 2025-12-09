#!/usr/bin/env node

/**
 * Generate App Icons from SVG Logo
 * This script creates all required iOS app icon sizes from the SVG logo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS App Icon sizes required
const iOS_SIZES = [
  { size: 20, scale: 2, filename: 'AppIcon-20@2x.png' },
  { size: 20, scale: 3, filename: 'AppIcon-20@3x.png' },
  { size: 29, scale: 2, filename: 'AppIcon-29@2x.png' },
  { size: 29, scale: 3, filename: 'AppIcon-29@3x.png' },
  { size: 40, scale: 2, filename: 'AppIcon-40@2x.png' },
  { size: 40, scale: 3, filename: 'AppIcon-40@3x.png' },
  { size: 60, scale: 2, filename: 'AppIcon-60@2x.png' },
  { size: 60, scale: 3, filename: 'AppIcon-60@3x.png' },
  { size: 1024, scale: 1, filename: 'AppIcon-1024.png' }
];

const SVG_PATH = path.join(__dirname, '../public/biseda-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');

console.log('🎨 Generating App Icons from SVG Logo...\n');

// Check if SVG exists
if (!fs.existsSync(SVG_PATH)) {
  console.error('❌ Error: SVG logo not found at:', SVG_PATH);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read the SVG
const svgContent = fs.readFileSync(SVG_PATH, 'utf8');

// Create an optimized 1024x1024 SVG for app icon
const optimizedSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Main gradient -->
    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
    
    <!-- Secondary gradient -->
    <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    
    <!-- Sparkle gradient -->
    <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fde047;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadow filter -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="4" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background (full square) -->
  <rect x="0" y="0" width="120" height="120" rx="24" fill="url(#mainGradient)"/>
  
  <!-- Main speech bubble -->
  <rect x="12" y="12" width="96" height="96" rx="24" fill="url(#mainGradient)" filter="url(#shadow)"/>
  
  <!-- Highlight overlay -->
  <rect x="12" y="12" width="96" height="96" rx="24" fill="url(#mainGradient)" opacity="0.2"/>
  
  <!-- MessageSquare icon (simplified) -->
  <path d="M 36 36 L 84 36 L 84 72 L 60 84 L 36 72 Z" fill="white" opacity="0.95"/>
  <path d="M 42 42 L 78 42 L 78 66 L 60 72 L 42 66 Z" fill="none" stroke="white" stroke-width="2" opacity="0.8"/>
  
  <!-- Sparkle icon (top-right) -->
  <circle cx="96" cy="24" r="8" fill="url(#sparkleGradient)"/>
  <path d="M 96 16 L 96 20 M 96 28 L 96 32 M 88 24 L 92 24 M 100 24 L 104 24 M 90 18 L 92 20 M 102 20 L 104 18 M 90 30 L 92 28 M 102 28 L 104 30" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/>
  
  <!-- Small secondary speech bubble (bottom-right) -->
  <rect x="88" y="88" width="32" height="32" rx="8" fill="url(#secondaryGradient)" stroke="#0f172a" stroke-width="2"/>
  <circle cx="104" cy="104" r="6" fill="white"/>
</svg>`;

// Save optimized SVG
const optimizedSVGPath = path.join(OUTPUT_DIR, 'app-icon-master.svg');
fs.writeFileSync(optimizedSVGPath, optimizedSVG);
console.log('✅ Created optimized SVG: app-icon-master.svg');

console.log('\n📱 To generate PNG icons, you have two options:\n');

console.log('Option 1: Use Online Tool (Easiest)');
console.log('1. Go to: https://www.appicon.co/');
console.log('2. Upload the file:', optimizedSVGPath);
console.log('3. Select iOS platform');
console.log('4. Download and extract the icons');
console.log('5. Copy all PNG files to:', OUTPUT_DIR);
console.log('');

console.log('Option 2: Use macOS sips (Command Line)');
console.log('First, convert SVG to PNG using:');
console.log('  - Open SVG in Preview/Safari');
console.log('  - Export as PNG at 1024x1024');
console.log('  - Then run: node scripts/generate-icons-sips.js');
console.log('');

console.log('📋 Required icon files:');
iOS_SIZES.forEach(({ filename, size, scale }) => {
  const actualSize = size * scale;
  console.log(`  - ${filename} (${actualSize}x${actualSize}px)`);
});

console.log('\n✅ Script complete! Follow the instructions above to generate PNG icons.');

