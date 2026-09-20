import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rmevoyage.app",
  appName: "RME Voyage",
  webDir: ".next/standalone/public",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f1f3d",
      showSpinner: false,
      androidScaleType: "centerInside",
      splashImmersive: false,
      spinnerStyle: "large",
    },
    Geolocation: {
      permissions: ["location"],
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
