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
  // newArchEnabled: false, // Let React Native 0.79.5 use default New Architecture settings
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.futhong.poketradetcg",
    supportsTablet: true,
    icon: {
      light: "./assets/icon-light.png",
      dark: "./assets/icon-dark.png",
    },
  },
  android: {
    package: "com.futhong.poketradetcg",
    jsEngine: "hermes",
    versionCode: 3,
    adaptiveIcon: {
      foregroundImage: "./assets/icon-light.png",
      backgroundColor: "#1F104A",
    },
    // Removed edgeToEdgeEnabled to fix Safe Area View compatibility
  },
  extra: {
    eas: {
      projectId: "31694801-c6c1-48fe-9c16-4f6251283c42",
    },
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
    [
      "expo-build-properties",
      {
        "ios": {
          "useFrameworks": "static",
          "deploymentTarget": "15.1",
          "skAdNetworkItems": [
            "cstr6suwn9.skadnetwork",
            "4fzdc2evr5.skadnetwork",
            "2fnua5tdw4.skadnetwork",
            "ydx93a7ass.skadnetwork",
            "p78axxw29g.skadnetwork",
            "v72qych5uu.skadnetwork",
            "ludvb6z3bs.skadnetwork",
            "cp8zw746q7.skadnetwork",
            "3sh42y64q3.skadnetwork",
            "c6k4g5qg8m.skadnetwork",
            "s39g8k73mm.skadnetwork",
            "3qy4746246.skadnetwork",
            "hs6bdukanm.skadnetwork",
            "mlmmfzh3r3.skadnetwork",
            "v4nxqhlyqp.skadnetwork",
            "wzmmz9fp6w.skadnetwork",
            "su67r6k2v3.skadnetwork",
            "yclnxrl5pm.skadnetwork",
            "7ug5zh24hu.skadnetwork",
            "gta9lk7p23.skadnetwork",
            "vutu7akeur.skadnetwork",
            "y5ghdn5j9k.skadnetwork",
            "v9wttpbfk9.skadnetwork",
            "n38lu8286q.skadnetwork",
            "47vhws6wlr.skadnetwork",
            "kbd757ywx3.skadnetwork",
            "9t245vhmpl.skadnetwork",
            "a2p9lx4jpn.skadnetwork",
            "22mmun2rn5.skadnetwork",
            "4468km3ulz.skadnetwork",
            "2u9pt9hc89.skadnetwork",
            "8s468mfl3y.skadnetwork",
            "ppxm28t8ap.skadnetwork",
            "uw77j35x4d.skadnetwork",
            "pwa73g5rt2.skadnetwork",
            "578prtvx9j.skadnetwork",
            "4dzt52r2t5.skadnetwork",
            "tl55sbb4fm.skadnetwork",
            "e5fvkxwrpn.skadnetwork",
            "8c4e2ghe7u.skadnetwork",
            "3rd42ekr43.skadnetwork",
            "3qcr597p9d.skadnetwork"
          ]
        }
      }
    ],
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-8269861113952335~3453160239",
        "iosAppId": "ca-app-pub-8269861113952335~5381319576",
        "delayAppMeasurementInit": true,
        "userTrackingUsageDescription": "This identifier will be used to deliver personalized ads to you."
      }
    ]
  ],
});
