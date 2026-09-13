#!/bin/bash
# RME Voyage - Android Build Script
# Automates the AAB build for Google Play Store

set -e

echo "=== RME Voyage Android Build ==="

# 1. Install dependencies
echo "1. Installing dependencies..."
npm install

# 2. Build the web app
echo "2. Building web app..."
npm run build

# 3. Add Android platform if not exists
if [ ! -d "android" ]; then
  echo "3. Adding Android platform..."
  npx cap add android
else
  echo "3. Android platform already exists"
fi

# 4. Sync web assets to Android
echo "4. Syncing Capacitor..."
npx cap sync android

# 5. Build AAB
echo "5. Building Android App Bundle (AAB)..."
cd android
./gradlew bundleRelease

echo "=== Build complete! ==="
echo "AAB file: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "To upload to Google Play:"
echo "1. Go to https://play.google.com/console"
echo "2. Create new app or select existing"
echo "3. Upload the AAB file"
echo "4. Fill in store listing details"
echo "5. Submit for review"

