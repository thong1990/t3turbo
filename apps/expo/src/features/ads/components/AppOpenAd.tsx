import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { useCallback, useEffect, useRef, useState } from "react"
import { AppState, Platform, type AppStateStatus } from "react-native"

import { adTrackingService } from "../services/ad-tracking"

// Check if we're in Expo Go
const isExpoGo = Constants.executionEnvironment === "storeClient"

// Conditionally import AdMob components
let AppOpenAd: any = null
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

interface AppOpenAdProviderProps {
  children: React.ReactNode
}

export function AppOpenAdProvider({ children }: AppOpenAdProviderProps) {
  const [appOpenAd, setAppOpenAd] = useState<any>(null)
  const [isAdLoaded, setIsAdLoaded] = useState(false)
  const [isAdShowing, setIsAdShowing] = useState(false)
  const appStateRef = useRef(AppState.currentState)
  const appStartTimeRef = useRef(Date.now())

  // Load app open ad
  const loadAppOpenAd = useCallback(async () => {
    if (isExpoGo || !AppOpenAd || !AdEventType) {
      return
    }

    try {
      const ad = AppOpenAd.createForAdUnitId(APP_OPEN_AD_UNIT_ID)

      ad.addAdEventListener(AdEventType.LOADED, () => {

        setIsAdLoaded(true)
        adTrackingService.trackAdLoad("app-open", "app-launch")
      })

      ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.warn("App open ad failed to load:", error)
        setIsAdLoaded(false)
        adTrackingService.trackAdError(
          "app-open",
          "app-launch",
          error?.message || "Failed to load"
        )
      })

      ad.addAdEventListener(AdEventType.OPENED, () => {
        setIsAdShowing(true)
        adTrackingService.trackAdImpression("app-open", "app-launch")
      })

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setIsAdShowing(false)
        setIsAdLoaded(false)
        setAppOpenAd(null)
        // Don't preload immediately to respect frequency capping
      })

      ad.addAdEventListener(AdEventType.CLICKED, () => {
        adTrackingService.trackAdClick("app-open", "app-launch")
      })

      await ad.load()
      setAppOpenAd(ad)
    } catch (error) {
      console.error("Failed to load app open ad:", error)
      setIsAdLoaded(false)
    }
  }, [])

  // Check if we should show app open ad
  const shouldShowAppOpenAd = useCallback(async (): Promise<boolean> => {
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

  // Show app open ad
  const showAppOpenAd = useCallback(async () => {
    if (!isAdLoaded || !appOpenAd || isAdShowing) {
      return
    }

    const shouldShow = await shouldShowAppOpenAd()
    if (!shouldShow) {
      return
    }

    try {
      await appOpenAd.show()
      // Store timestamp when ad is shown
      await AsyncStorage.setItem(
        LAST_APP_OPEN_AD_TIMESTAMP_KEY,
        Date.now().toString()
      )
    } catch (error) {
      console.error("Failed to show app open ad:", error)
    }
  }, [isAdLoaded, appOpenAd, isAdShowing, shouldShowAppOpenAd])

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasInBackground = appStateRef.current === "background"
      const isNowActive = nextAppState === "active"

      // Show ad when coming back from background (but not on initial app launch)
      if (wasInBackground && isNowActive) {
        const timeSinceStart = Date.now() - appStartTimeRef.current
        // Only show if app has been running for more than 10 seconds (not initial launch)
        if (timeSinceStart > 10000) {
          showAppOpenAd()
        }
      }

      appStateRef.current = nextAppState
    }

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    )
    return () => subscription?.remove()
  }, [showAppOpenAd])

  // Initial load
  useEffect(() => {
    loadAppOpenAd()
  }, [loadAppOpenAd])

  // Show ad on cold start after a delay
  useEffect(() => {
    const timer = setTimeout(async () => {
      const shouldShow = await shouldShowAppOpenAd()
      if (shouldShow && isAdLoaded && !isAdShowing) {
        showAppOpenAd()
      }
    }, 2000) // Wait 2 seconds after app start

    return () => clearTimeout(timer)
  }, [isAdLoaded, showAppOpenAd, shouldShowAppOpenAd, isAdShowing])

  return <>{children}</>
}

export default AppOpenAdProvider
