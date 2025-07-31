import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "expo",
  slug: "t3turbo",
  scheme: "expo",
  version: "0.1.0",
  owner: "futhong",
  orientation: "portrait",
  icon: "./assets/icon-light.png",
  userInterfaceStyle: "automatic",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  newArchEnabled: false, // Try to build with this enabled
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.futhong.poketradetcg",
    supportsTablet: true,
    usesNonExemptEncryption: false,
    icon: {
      light: "./assets/icon-light.png",
      dark: "./assets/icon-dark.png",
    },
  },
  android: {
    package: "com.futhong.poketradetcg",
    jsEngine: "jsc",
    adaptiveIcon: {
      foregroundImage: "./assets/icon-light.png",
      backgroundColor: "#1F104A",
    },
    edgeToEdgeEnabled: true,
  },
  extra: {
    eas: {
      projectId: "31694801-c6c1-48fe-9c16-4f6251283c42",
    },
  },
  "react-native-google-mobile-ads": {
    android_app_id: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
    ios_app_id: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-dev-client",
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    "expo-font",
    "expo-notifications",
    [
      "onesignal-expo-plugin",
      {
        mode: "development",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#E4E4E7",
        image: "./assets/icon-light.png",
        dark: {
          backgroundColor: "#18181B",
          image: "./assets/icon-dark.png",
        },
      },
    ],
  ],
});
