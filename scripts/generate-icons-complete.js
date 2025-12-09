#!/usr/bin/env node

/**
 * Generate All App Icons from SVG Logo
 * Creates all required iOS app icon sizes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

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
const svgBuffer = fs.readFileSync(SVG_PATH);

console.log('📐 Generating icon sizes...\n');

// Generate each icon size
for (const { size, scale, filename } of iOS_SIZES) {
  const actualSize = size * scale;
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  try {
    await sharp(svgBuffer)
      .resize(actualSize, actualSize, {
        fit: 'contain',
        background: { r: 99, g: 102, b: 241, alpha: 1 } // Purple background
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Created: ${filename} (${actualSize}x${actualSize}px)`);
  } catch (error) {
    console.error(`❌ Error creating ${filename}:`, error.message);
  }
}

console.log('\n🎉 All app icons generated successfully!');
console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
console.log('\n📱 Next steps:');
console.log('1. Open Xcode: npm run cap:open:ios');
console.log('2. Navigate to: App > Assets.xcassets > AppIcon');
console.log('3. Verify all icons are loaded');
console.log('4. Build and test on simulator');

