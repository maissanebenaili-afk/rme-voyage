# 📱 Capacitor Build Guide — iOS & Android

This guide explains how to build RME Voyage for App Store and Play Store.

## Prerequisites

### For iOS Build
- Mac with Xcode (13+) installed
- Apple Developer Account ($99/year)
- CocoaPods (`brew install cocoapods`)

### For Android Build
- Android Studio or Android SDK CLI
- Java 11+
- Signing key for Play Store

### Both Platforms
- Node.js 18+
- `npx @capacitor/cli@latest`

---

## Build Process

### 1. Build Next.js Production
```bash
npm run build
npx cap sync
```

This generates `.next/standalone/public` which Capacitor uses.

### 2. iOS Build

#### First time setup:
```bash
npx cap add ios
```

#### Build for simulator:
```bash
npx cap run ios
# Opens Xcode simulator in browser
```

#### Build for device:
```bash
npx cap run ios
# In Xcode: Select device + Scheme "App" + Run (Cmd+R)
```

#### Build for App Store:
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select Generic iOS Device
3. Product → Archive
4. Distribute App → App Store Connect
5. Fill metadata:
   - Version: `1.0.0`
   - Build: `1`
   - Screenshots (see Assets section below)

### 3. Android Build

#### First time setup:
```bash
npx cap add android
cd android
./gradlew build
```

#### Build for Play Store:
```bash
cd android
./gradlew bundleRelease
```

Sign with your Play Store key. Result: `android/app/build/outputs/bundle/release/app-release.aab`

---

## App Store Assets

Required for submission:

### iOS (App Store)
- **App Icon:** 1024×1024 PNG (no rounded corners)
- **Screenshots:** 1242×2208 (6 max)
  - iPhone 15 Pro Max dimensions
  - Show key features: caftans, properties, travel planning
- **Description:** ~180 chars
- **Keywords:** "voyage, maroc, caftans, immobilier"
- **Privacy Policy URL:** https://your-domain.com/api/legal/privacy
- **Terms URL:** https://your-domain.com/api/legal/terms

### Android (Play Store)
- **App Icon:** 512×512 PNG
- **Feature Graphic:** 1024×500 PNG (banner)
- **Screenshots:** 1080×1920 (8 max)
- **Description:** ~500 chars
- **Privacy Policy URL:** Same as iOS
- **Content Rating:** General (Travel app, no restricted content)

---

## App Store Submission Steps

### iOS
1. App Store Connect → Create new app
2. Fill app info:
   - Bundle ID: `com.rmevoyage.app`
   - App name: `RME Voyage`
   - Primary category: Travel
   - Secondary: Lifestyle
3. Upload build (Xcode or Transporter)
4. Fill metadata (screenshots, description, keywords)
5. Add TestFlight testers (internal + external)
6. Submit for review (typically 1-3 days)

### Android
1. Google Play Console → Create new app
2. Fill store listing (screenshots, description)
3. Upload signed APK/AAB
4. Review content rating form
5. Set pricing (free)
6. Submit for review (typically 2-4 hours)

---

## Environment Variables

Make sure these are set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_BASE_URL=https://rme-voyage.app
```

Capacitor will use these when building the web view.

---

## Testing Before Submission

### Local Testing
```bash
npx cap run ios
npx cap run android
```

Test on real devices (TestFlight for iOS, Google Play internal testing for Android).

### Checklist
- [ ] Login/signup works
- [ ] Can view caftans without auth
- [ ] Can book caftan (WhatsApp link works)
- [ ] Can view properties without auth
- [ ] Can book property (WhatsApp link works)
- [ ] Location map works (if using geolocation)
- [ ] App doesn't crash on cold start
- [ ] Handles network errors gracefully

---

## Troubleshooting

### iOS Build Fails
```bash
# Clear cache
rm -rf ios/Pods
rm -rf ios/App/Podfile.lock
npx cap sync ios
```

### Android Build Fails
```bash
# Clear cache
cd android
./gradlew clean
./gradlew bundleRelease
```

### App Crashes on Launch
- Check `.next/standalone/public` exists after `npm run build`
- Verify `capacitor.config.ts` has correct `webDir`
- Check browser console for JavaScript errors

---

## CI/CD Integration

To automate builds, see `.github/workflows/build-ios.yml` and `.github/workflows/build-android.yml` (not yet created, but Claude can set up).

---

## Support

For issues:
- Capacitor docs: https://capacitorjs.com
- App Store: https://developer.apple.com
- Play Store: https://developer.android.com

---

**Last updated:** 2026-09-20  
**Maintained by:** Claude AI Partner
