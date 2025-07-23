import Constants from "expo-constants"
import { useEffect, useState } from "react"

import { adMobService } from "../services/ad-mob-service"
import { adTrackingService } from "../services/ad-tracking"
import type { AdPlacement, AdState } from "../types"

// Check if we're in Expo Go
const isExpoGo = Constants.executionEnvironment === "storeClient"

// Conditionally import AdMob types
type InterstitialAd = any
let AdEventType: any = null

if (!isExpoGo) {
  try {
    const adMobModule = require("react-native-google-mobile-ads")
    AdEventType = adMobModule.AdEventType
  } catch (error) {
    console.warn("AdMob AdEventType not available:", error)
  }
}

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [bannerState, setBannerState] = useState<AdState>({
    isLoaded: false,
    isLoading: false,
    isShowing: false,
    error: null,
    lastLoadTime: null,
  })

  const [interstitialState, setInterstitialState] = useState<AdState>({
    isLoaded: false,
    isLoading: false,
    isShowing: false,
    error: null,
    lastLoadTime: null,
  })

  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(
    null
  )

  // Initialize AdMob on hook mount
  useEffect(() => {
    const initializeAdMob = async () => {
      if (isExpoGo) {
        return
      }

      try {
        await adMobService.initialize()
        setIsInitialized(true)

        // Pre-load interstitial ad
        await loadInterstitialAd()
      } catch (error) {
        console.error("Failed to initialize AdMob:", error)
      }
    }

    initializeAdMob()
  }, [])

  // Load banner ad (handled by BannerAd component, this is for state management)
  const loadBannerAd = async (placement: AdPlacement): Promise<void> => {
    if (!isInitialized) {
      throw new Error("AdMob not initialized")
    }

    setBannerState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      adTrackingService.trackAdLoad("banner", placement)
      setBannerState(prev => ({
        ...prev,
        isLoaded: true,
        isLoading: false,
        lastLoadTime: Date.now(),
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      adTrackingService.trackAdError("banner", placement, errorMessage)
      setBannerState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Load interstitial ad
  const loadInterstitialAd = async (): Promise<void> => {
    if (!isInitialized || isExpoGo || !AdEventType) {
      return
    }

    setInterstitialState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const ad = adMobService.createInterstitialAd()

      if (!ad) {
        setInterstitialState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to create interstitial ad",
        }))
        return
      }

      // Set up event listeners
      ad.addAdEventListener(AdEventType.LOADED, () => {
        setInterstitialState(prev => ({
          ...prev,
          isLoaded: true,
          isLoading: false,
          lastLoadTime: Date.now(),
        }))
      })

      ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        const errorMessage = error?.message || "Failed to load interstitial ad"
        setInterstitialState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
      })

      ad.addAdEventListener(AdEventType.OPENED, () => {
        setInterstitialState(prev => ({ ...prev, isShowing: true }))
      })

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setInterstitialState(prev => ({
          ...prev,
          isShowing: false,
          isLoaded: false,
        }))
        // Pre-load next interstitial
        setTimeout(() => {
          loadInterstitialAd()
        }, 1000)
      })

      // Load the ad
      ad.load()
      setInterstitialAd(ad)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      setInterstitialState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    }
  }

  // Show interstitial ad
  const showInterstitialAd = async (
    placement: AdPlacement
  ): Promise<boolean> => {
    if (!interstitialAd || !interstitialState.isLoaded) {
      console.warn("Interstitial ad not ready")
      return false
    }

    try {
      adTrackingService.trackAdImpression("interstitial", placement)
      await interstitialAd.show()
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      adTrackingService.trackAdError("interstitial", placement, errorMessage)
      console.error("Failed to show interstitial ad:", error)
      return false
    }
  }

  // Track ad events
  const trackAdEvent = (
    event: Parameters<typeof adTrackingService.trackAdEvent>[0]
  ) => {
    adTrackingService.trackAdEvent(event)
  }

  // Configuration methods
  const setTestMode = (testMode: boolean) => {
    adMobService.setTestMode(testMode)
  }

  const isTestMode = adMobService.getTestMode()

  return {
    // State
    isInitialized,
    bannerState,
    interstitialState,

    // Methods
    loadBannerAd,
    loadInterstitialAd,
    showInterstitialAd,
    trackAdEvent,

    // Configuration
    isTestMode,
    setTestMode,

    // Services (for direct access if needed)
    adMobService,
    adTrackingService,
  }
}
