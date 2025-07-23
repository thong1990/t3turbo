try {
  import("../components/NativeAd")
  import("../components/AppOpenAd")
  import("../hooks/use-native-ads.ios")
  import("../hooks/use-app-open-ads")
} catch (error) {
  console.error("❌ Import error:", error)
}

import type { AdPlacement, AdType } from "../types"

const validPlacements: AdPlacement[] = [
  "home-bottom",
  "cards-bottom",
  "decks-bottom",
  "chat-bottom",
  "profile-bottom",
  "deck-creation",
  "trade-completion",
  "chat-transition",
  "app-launch",
  "cards-feed",
  "decks-feed",
]

const validAdTypes: AdType[] = [
  "banner",
  "interstitial",
  "rewarded",
  "native",
  "app-open",
]

const requiredEnvVars = [
  "EXPO_PUBLIC_ADMOB_NATIVE_IOS",
  "EXPO_PUBLIC_ADMOB_NATIVE_ANDROID",
  "EXPO_PUBLIC_ADMOB_APP_OPEN_IOS",
  "EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID",
]

let envChecksPassed = 0
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    envChecksPassed++
  } else {
  }
}

import Constants from "expo-constants"
const isExpoGo = Constants.executionEnvironment === "expo"
