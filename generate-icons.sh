#!/bin/bash

# Biseda.ai App Icon Generator Script
# This script helps you generate app icons from a master icon file

echo "🎨 Biseda.ai App Icon Generator"
echo "================================"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing..."
    echo "Please install ImageMagick first:"
    echo "  macOS: brew install imagemagick"
    echo "  Linux: sudo apt-get install imagemagick"
    echo ""
    echo "Or use online tools instead:"
    echo "  - https://www.appicon.co/"
    echo "  - https://icon.kitchen/"
    exit 1
fi

# Check if master icon exists
MASTER_ICON="app-icon-master.png"
if [ ! -f "$MASTER_ICON" ]; then
    echo "❌ Master icon not found: $MASTER_ICON"
    echo ""
    echo "Please create a 1024x1024px PNG icon named 'app-icon-master.png'"
    echo "Place it in the project root directory."
    echo ""
    echo "Your icon should have:"
    echo "  - Gradient background (purple to pink)"
    echo "  - White speech bubble in center"
    echo "  - Yellow sparkles in top-right"
    echo "  - No transparency"
    echo "  - 1024x1024px size"
    exit 1
fi

echo "✅ Found master icon: $MASTER_ICON"
echo ""

# Create output directories
echo "📁 Creating output directories..."
mkdir -p icons/ios
mkdir -p icons/android

# iOS Sizes
echo "🍎 Generating iOS icons..."
ios_sizes=(20 29 40 58 60 76 80 87 120 180 1024)
for size in "${ios_sizes[@]}"; do
    if [ "$size" -eq 1024 ]; then
        # App Store icon (no @2x/@3x suffix)
        convert "$MASTER_ICON" -resize "${size}x${size}" "icons/ios/AppIcon-${size}.png"
        echo "  ✅ Generated: AppIcon-${size}.png"
    else
        # Regular icons (@2x and @3x versions)
        convert "$MASTER_ICON" -resize "${size}x${size}" "icons/ios/AppIcon-${size}@2x.png"
        convert "$MASTER_ICON" -resize "$((size * 3 / 2))x$((size * 3 / 2))" "icons/ios/AppIcon-${size}@3x.png"
        echo "  ✅ Generated: AppIcon-${size}@2x.png and AppIcon-${size}@3x.png"
    fi
done

# Android Sizes
echo ""
echo "🤖 Generating Android icons..."
android_sizes=(48 72 96 144 192 512)
android_densities=(mdpi hdpi xhdpi xxhdpi xxxhdpi play)

for i in "${!android_sizes[@]}"; do
    size=${android_sizes[$i]}
    density=${android_densities[$i]}
    
    if [ "$density" == "play" ]; then
        # Play Store icon
        convert "$MASTER_ICON" -resize "${size}x${size}" "icons/android/ic_launcher-play.png"
        echo "  ✅ Generated: ic_launcher-play.png (${size}x${size})"
    else
        # Regular density icons
        mkdir -p "icons/android/mipmap-${density}"
        convert "$MASTER_ICON" -resize "${size}x${size}" "icons/android/mipmap-${density}/ic_launcher.png"
        echo "  ✅ Generated: mipmap-${density}/ic_launcher.png (${size}x${size})"
    fi
done

echo ""
echo "✅ Icon generation complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "iOS:"
echo "  1. Copy icons from icons/ios/ to:"
echo "     ios/App/App/Assets.xcassets/AppIcon.appiconset/"
echo "  2. Or drag and drop in Xcode"
echo ""
echo "Android:"
echo "  1. Copy icons from icons/android/mipmap-*/ to:"
echo "     android/app/src/main/res/mipmap-*/"
echo "  2. Copy ic_launcher-play.png for Play Store"
echo ""
echo "🎉 Done!"

