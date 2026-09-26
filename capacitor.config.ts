import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rmevoyage.app",
  appName: "RME Voyage",
  webDir: "public",
  server: {
    url: "https://rme-route.vercel.app",
    cleartext: false,
    androidScheme: "https",
    iosScheme: "capacitor",
    allowNavigation: ["rme-route.vercel.app"],
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
  },
};

export default config;
