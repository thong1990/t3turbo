import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { useCallback, useEffect, useState } from "react"
import { Platform } from "react-native"

import { adTrackingService } from "../services/ad-tracking"

// Check if we're in Expo Go
const isExpoGo = Constants.executionEnvironment === "standalone"

// Conditionally import AdMob components
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let AppOpenAd: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let AdEventType: any = null

if (!isExpoGo) {
  try {
    const adMobModule = require("react-native-google-mobile-ads")
    AppOpenAd = adMobModule.AppOpenAd
    AdEventType = adMobModule.AdEventType
  } catch (error) {
    console.warn("AdMob AppOpenAd not available:", error)
  }
}

// Environment variables with fallbacks
const APP_OPEN_AD_UNIT_ID = Platform.select({
  ios:
    process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_IOS ||
    "ca-app-pub-3940256099942544/5662855259", // Test ad unit
  android:
    process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID ||
    "ca-app-pub-3940256099942544/9257395921", // Test ad unit
}) as string

// Storage keys
const LAST_APP_OPEN_AD_TIMESTAMP_KEY = "lastAppOpenAdTimestamp"
const APP_OPEN_AD_FREQUENCY_CAP_HOURS = 24 // Show max once per day

interface AppOpenAdState {
  isLoaded: boolean
  isShowing: boolean
  error: string | null
  lastShownTime: number | null
}

interface UseAppOpenAdsReturn {
  adState: AppOpenAdState
  loadAd: () => Promise<void>
  showAd: () => Promise<boolean>
  canShowAd: () => Promise<boolean>
}

export function useAppOpenAds(): UseAppOpenAdsReturn {
  // biome-ignore lint/suspicious/noExplicitAny: AdMob ad instance type is dynamic
  const [appOpenAd, setAppOpenAd] = useState<any>(null)
  const [adState, setAdState] = useState<AppOpenAdState>({
    isLoaded: false,
    isShowing: false,
    error: null,
    lastShownTime: null,
  })

  // Check if we should show app open ad based on frequency cap
  const canShowAd = useCallback(async (): Promise<boolean> => {
    try {
      const lastTimestampStr = await AsyncStorage.getItem(
        LAST_APP_OPEN_AD_TIMESTAMP_KEY
      )

      if (!lastTimestampStr) {
        return true // First time, show ad
      }

      const lastTimestamp = Number.parseInt(lastTimestampStr, 10)
      const now = Date.now()
      const hoursSinceLastAd = (now - lastTimestamp) / (1000 * 60 * 60)

      return hoursSinceLastAd >= APP_OPEN_AD_FREQUENCY_CAP_HOURS
    } catch (error) {
      console.warn("Failed to check app open ad frequency:", error)
      return true // Default to showing ad if check fails
    }
  }, [])

  // Load app open ad
  const loadAd = useCallback(async (): Promise<void> => {
    if (isExpoGo || !AppOpenAd || !AdEventType) {
      return
    }

    try {
      setAdState(prev => ({ ...prev, error: null }))

      const ad = AppOpenAd.createForAdUnitId(APP_OPEN_AD_UNIT_ID)

      ad.addAdEventListener(AdEventType.LOADED, () => {
        setAdState(prev => ({ ...prev, isLoaded: true }))
        adTrackingService.trackAdLoad("app-open", "app-launch")
      })

      ad.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
        console.warn("App open ad failed to load:", error)
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? (error.message as string)
            : "Failed to load"
        setAdState(prev => ({
          ...prev,
          isLoaded: false,
          error: errorMessage,
        }))
        adTrackingService.trackAdError("app-open", "app-launch", errorMessage)
      })

      ad.addAdEventListener(AdEventType.OPENED, () => {
        setAdState(prev => ({ ...prev, isShowing: true }))
        adTrackingService.trackAdImpression("app-open", "app-launch")
      })

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setAdState(prev => ({
          ...prev,
          isShowing: false,
          isLoaded: false,
          lastShownTime: Date.now(),
        }))
        setAppOpenAd(null)
      })

      ad.addAdEventListener(AdEventType.CLICKED, () => {
        adTrackingService.trackAdClick("app-open", "app-launch")
      })

      await ad.load()
      setAppOpenAd(ad)
    } catch (error) {
      console.error("Failed to load app open ad:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      setAdState(prev => ({ ...prev, isLoaded: false, error: errorMessage }))
    }
  }, [])

  // Show app open ad
  const showAd = useCallback(async (): Promise<boolean> => {
    if (!adState.isLoaded || !appOpenAd || adState.isShowing) {
      return false
    }

    const shouldShow = await canShowAd()
    if (!shouldShow) {
      return false
    }

    try {
      await appOpenAd.show()
      // Store timestamp when ad is shown
      await AsyncStorage.setItem(
        LAST_APP_OPEN_AD_TIMESTAMP_KEY,
        Date.now().toString()
      )
      return true
    } catch (error) {
      console.error("Failed to show app open ad:", error)
      return false
    }
  }, [adState.isLoaded, adState.isShowing, appOpenAd, canShowAd])

  // Auto-load ad on mount
  useEffect(() => {
    loadAd()
  }, [loadAd])

  return {
    adState,
    loadAd,
    showAd,
    canShowAd,
  }
}
