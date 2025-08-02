import Constants from "expo-constants"
import { useEffect, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { NativeModules } from "react-native"

import { adMobService } from "../services/ad-mob-service"
import { adTrackingService } from "../services/ad-tracking"
import type { AdPlacement } from "../types"

interface BannerAdProps {
  placement: AdPlacement
  size?: unknown
  className?: string
}

// Check if AdMob native module is available
const isAdMobNativeModuleAvailable = () => {
  return NativeModules.RNGoogleMobileAdsModule !== undefined
}

export function BannerAd({ placement, size, className = "" }: BannerAdProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdMobAvailable, setIsAdMobAvailable] = useState(false)
  
  const isSubscribed = false
  const triggerAdFrustrationPaywall = () => {}

  // const { isSubscribed } = useSubscription()
  // const { triggerAdFrustrationPaywall } = usePaywallPlacements()

  const adUnitId = adMobService.getBannerAdUnitId()
  const isExpoGo = Constants.executionEnvironment === "storeClient"

  // Don't show ads for subscribed users
  if (isSubscribed) {
    return null
  }

  useEffect(() => {
    // Check if we're in Expo Go or if native module is unavailable
    if (isExpoGo || !isAdMobNativeModuleAvailable()) {
      setIsAdMobAvailable(false)
      return
    }

    // Only try to require AdMob in development builds with native module support
    try {
      const adMobModule = require("react-native-google-mobile-ads")
      if (adMobModule?.BannerAd) {
        setIsAdMobAvailable(true)
        setIsLoading(true)
      } else {
        setIsAdMobAvailable(false)
      }
    } catch (error) {
      setIsAdMobAvailable(false)
    }
  }, [isExpoGo])

  const handleAdLoaded = () => {
    setIsLoading(false)
    setError(null)
    adTrackingService.trackAdLoad("banner", placement)
  }

  const handleAdFailedToLoad = (adError: { message?: string }) => {
    const errorMessage = adError?.message || "Failed to load banner ad"
    setIsLoading(false)
    setError(errorMessage)
    adTrackingService.trackAdError("banner", placement, errorMessage)
  }

  const handleAdOpened = () => {
    adTrackingService.trackAdClick("banner", placement)
    // Trigger paywall after ad interaction (user frustration)
    triggerAdFrustrationPaywall()
  }

  const handleAdImpression = () => {
    adTrackingService.trackAdImpression("banner", placement)
  }

  // Show placeholder when AdMob is not available
  if (!isAdMobAvailable) {
    if (__DEV__) {
      return (
        <View
          className={`h-12 items-center justify-center bg-gray-100 ${className}`}
        >
          <Text style={{ fontSize: 12, color: "#666" }}>
            [AdMob Banner - Development Build Required]
          </Text>
        </View>
      )
    }
    return null
  }

  // Don't render if AdMob service is not ready
  if (!adMobService.isReady()) {
    return null
  }

  // Dynamically render the ad - we know it's safe here
  try {
    const adMobModule = require("react-native-google-mobile-ads")
    const GoogleBannerAd = adMobModule.BannerAd
    const BannerAdSize = adMobModule.BannerAdSize

    return (
      <View className={`h-12 items-center justify-center ${className}`}>
        {isLoading && <ActivityIndicator size="small" color="#666" />}

        {error && __DEV__ && (
          <View className="items-center justify-center">
            <Text style={{ fontSize: 10, color: "#999" }}>
              Ad failed to load
            </Text>
          </View>
        )}

        {!error && (
          <GoogleBannerAd
            unitId={adUnitId}
            size={size || BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: false,
            }}
            onAdLoaded={handleAdLoaded}
            onAdFailedToLoad={handleAdFailedToLoad}
            onAdOpened={handleAdOpened}
            onAdClosed={() => {
              // Track ad close if needed
            }}
            onPaid={(event: { value?: number }) => {
              // Track revenue if available
              if (event.value) {
                // trackAdRevenue('banner', placement, event.value)
              }
            }}
            // Track impressions
            onAdImpression={handleAdImpression}
          />
        )}
      </View>
    )
  } catch (error) {
    // Silently fail in production, show placeholder in development
    if (__DEV__) {
      return (
        <View
          className={`h-12 items-center justify-center bg-red-50 ${className}`}
        >
          <Text style={{ fontSize: 10, color: "#999" }}>
            AdMob Error
          </Text>
        </View>
      )
    }
    return null
  }
}
