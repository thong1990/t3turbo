import Constants from "expo-constants"
import { Platform } from "react-native"

import type { AdUnitIds } from "../types"

// Check if we're in Expo Go (where native modules aren't available)
const isExpoGo = Constants.executionEnvironment === "storeClient"

// Mock TestIds for Expo Go compatibility
const mockTestIds = {
  BANNER: "ca-app-pub-3940256099942544/6300978111",
  INTERSTITIAL: "ca-app-pub-3940256099942544/1033173712",
  REWARDED: "ca-app-pub-3940256099942544/5224354917",
  NATIVE: "ca-app-pub-3940256099942544/2247696110",
  APP_OPEN: "ca-app-pub-3940256099942544/3419835294",
}

// Safe AdMob imports with fallbacks
let mobileAds: any = null
let InterstitialAd: any = null
let RewardedAd: any = null
let TestIds = mockTestIds

// Try to import AdMob only if not in Expo Go
if (isExpoGo) {
} else {
  try {
    const adMobModule = require("react-native-google-mobile-ads")
    mobileAds = adMobModule.default
    InterstitialAd = adMobModule.InterstitialAd
    RewardedAd = adMobModule.RewardedAd
    TestIds = adMobModule.TestIds
  } catch (error) {
    console.warn("⚠️ AdMob module not available, using mock mode:", error)
  }
}

class AdMobService {
  private isInitialized = false
  private isTestMode = __DEV__ // Use test mode in development
  private isAdMobAvailable = !isExpoGo && mobileAds !== null

  // Ad Unit IDs from environment variables with fallbacks from PRD
  private adUnitIds: AdUnitIds = {
    banner: {
      android:
        process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID ||
        "ca-app-pub-8269861113952335/4649404400",
      ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS || TestIds.BANNER,
    },
    interstitial: {
      android:
        process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ||
        "ca-app-pub-8269861113952335/3265457978",
      ios:
        process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS || TestIds.INTERSTITIAL,
    },
    rewarded: {
      android:
        process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID || TestIds.REWARDED,
      ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS || TestIds.REWARDED,
    },
    native: {
      android:
        process.env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID ||
        "ca-app-pub-8269861113952335/8097609104",
      ios: process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS || TestIds.NATIVE,
    },
    appOpen: {
      android:
        process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID ||
        "ca-app-pub-8269861113952335/3627881059",
      ios: process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_IOS || TestIds.APP_OPEN,
    },
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    if (!this.isAdMobAvailable) {
      this.isInitialized = true
      return
    }

    try {
      await mobileAds().initialize()
      this.isInitialized = true

      // Set request configuration for better targeting
      await mobileAds().setRequestConfiguration({
        // Max Ad Content Rating
        maxAdContentRating: "T",
        // For families program
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        // Test device IDs (add your test device IDs here)
        testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : [],
      })
    } catch (error) {
      console.error("❌ Failed to initialize AdMob:", error)
      // Don't throw - allow app to continue without ads
      this.isInitialized = true
    }
  }

  getBannerAdUnitId(): string {
    if (this.isTestMode) {
      return TestIds.BANNER
    }
    return Platform.OS === "ios"
      ? this.adUnitIds.banner.ios
      : this.adUnitIds.banner.android
  }

  getInterstitialAdUnitId(): string {
    if (this.isTestMode) {
      return TestIds.INTERSTITIAL
    }
    return Platform.OS === "ios"
      ? this.adUnitIds.interstitial.ios
      : this.adUnitIds.interstitial.android
  }

  getRewardedAdUnitId(): string {
    if (this.isTestMode) {
      return TestIds.REWARDED
    }
    return Platform.OS === "ios"
      ? this.adUnitIds.rewarded.ios
      : this.adUnitIds.rewarded.android
  }

  getNativeAdUnitId(): string {
    if (this.isTestMode) {
      return TestIds.NATIVE
    }
    return Platform.OS === "ios"
      ? this.adUnitIds.native.ios
      : this.adUnitIds.native.android
  }

  getAppOpenAdUnitId(): string {
    if (this.isTestMode) {
      return TestIds.APP_OPEN
    }
    return Platform.OS === "ios"
      ? this.adUnitIds.appOpen.ios
      : this.adUnitIds.appOpen.android
  }

  setTestMode(testMode: boolean): void {
    this.isTestMode = testMode
  }

  getTestMode(): boolean {
    return this.isTestMode
  }

  isReady(): boolean {
    return this.isInitialized
  }

  isAvailable(): boolean {
    return this.isAdMobAvailable
  }

  // Create a pre-loaded interstitial ad
  createInterstitialAd(): any {
    if (!this.isAdMobAvailable || !InterstitialAd) {
      return null
    }

    try {
      const adUnitId = this.getInterstitialAdUnitId()
      return InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      })
    } catch (error) {
      console.warn("⚠️ Failed to create interstitial ad:", error)
      return null
    }
  }

  // Create a pre-loaded rewarded ad
  createRewardedAd(): any {
    if (!this.isAdMobAvailable || !RewardedAd) {
      return null
    }

    try {
      const adUnitId = this.getRewardedAdUnitId()
      return RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      })
    } catch (error) {
      console.warn("⚠️ Failed to create rewarded ad:", error)
      return null
    }
  }
}

// Export singleton instance
export const adMobService = new AdMobService()
