import Constants from "expo-constants"
import { useCallback, useRef } from "react"
import { Platform, Text, View } from "react-native"
import { adTrackingService } from "../services/ad-tracking"
import type { AdPlacement } from "../types"

// Check if we're in Expo Go
const isExpoGo = Constants.executionEnvironment === "storeClient"

// Conditionally import AdMob components
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let NativeAdView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let HeadlineView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let TaglineView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let AdvertiserView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let CallToActionView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let IconView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let StarRatingView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let MediaView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let PriceView: any = null
// biome-ignore lint/suspicious/noExplicitAny: AdMob types are dynamically imported
let StoreView: any = null

if (!isExpoGo) {
  try {
    const adMobModule = require("react-native-google-mobile-ads")
    NativeAdView = adMobModule.NativeAdView
    HeadlineView = adMobModule.HeadlineView
    TaglineView = adMobModule.TaglineView
    AdvertiserView = adMobModule.AdvertiserView
    CallToActionView = adMobModule.CallToActionView
    IconView = adMobModule.IconView
    StarRatingView = adMobModule.StarRatingView
    MediaView = adMobModule.MediaView
    PriceView = adMobModule.PriceView
    StoreView = adMobModule.StoreView
  } catch (error) {
    console.warn("AdMob native components not available:", error)
  }
}

// Environment variables with fallbacks
const NATIVE_AD_UNIT_ID = Platform.select({
  ios:
    process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS ||
    "ca-app-pub-3940256099942544/3986624511", // Test ad unit
  android:
    process.env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID ||
    "ca-app-pub-3940256099942544/2247696110", // Test ad unit
}) as string

type NativeAdTemplate = "card" | "list" | "banner"

interface NativeAdProps {
  placement: AdPlacement
  template?: NativeAdTemplate
  className?: string
  onAdLoaded?: () => void
  onAdFailedToLoad?: (error: string) => void
  onAdClicked?: () => void
  onAdImpression?: () => void
}

export function NativeAd({
  placement,
  template = "card",
  className = "",
  onAdLoaded,
  onAdFailedToLoad,
  onAdClicked,
  onAdImpression,
}: NativeAdProps) {
  // biome-ignore lint/suspicious/noExplicitAny: AdMob ref type is dynamic
  const nativeAdRef = useRef<any>(null)

  // Track ad events
  const trackLoad = useCallback(() => {
    adTrackingService.trackAdLoad("native", placement)
    onAdLoaded?.()
  }, [placement, onAdLoaded])

  const trackError = useCallback(
    (errorMessage: string) => {
      adTrackingService.trackAdError("native", placement, errorMessage)
      onAdFailedToLoad?.(errorMessage)
    },
    [placement, onAdFailedToLoad]
  )

  const trackClick = useCallback(() => {
    adTrackingService.trackAdClick("native", placement)
    onAdClicked?.()
  }, [placement, onAdClicked])

  const trackImpression = useCallback(() => {
    adTrackingService.trackAdImpression("native", placement)
    onAdImpression?.()
  }, [placement, onAdImpression])

  // Render Expo Go placeholder
  if (isExpoGo || !NativeAdView) {
    return (
      <View
        className={`rounded-lg border border-blue-200 bg-blue-50 p-4 ${className}`}
      >
        <View className="mb-2 flex-row items-center">
          <View className="mr-3 h-10 w-10 rounded-lg bg-blue-300" />
          <View className="flex-1">
            <Text className="font-semibold text-blue-800 text-sm">
              Sponsored Content
            </Text>
            <Text className="text-blue-600 text-xs">Native Ad Placeholder</Text>
          </View>
          <View className="rounded bg-blue-500 px-3 py-1">
            <Text className="font-medium text-white text-xs">Install</Text>
          </View>
        </View>
        <Text className="mb-2 text-blue-700 text-sm">
          This is where a native ad would appear in the production app
        </Text>
        <Text className="text-blue-500 text-xs">Placement: {placement}</Text>
      </View>
    )
  }

  // Get template styles
  const getTemplateStyle = () => {
    switch (template) {
      case "list":
        return "flex-row items-center p-3 bg-white border border-gray-200 rounded-lg mx-4 my-1"
      case "banner":
        return "p-2 bg-white border border-gray-200 rounded-lg mx-4 my-1"
      default:
        return "p-4 bg-white border border-gray-200 rounded-lg mx-4 my-2 shadow-sm"
    }
  }

  return (
    <View className={`${getTemplateStyle()} ${className}`}>
      <NativeAdView
        ref={nativeAdRef}
        adUnitID={NATIVE_AD_UNIT_ID}
        onAdLoaded={trackLoad}
        onAdFailedToLoad={(event: { nativeEvent: { error: string } }) =>
          trackError(event.nativeEvent.error)
        }
        onAdClicked={trackClick}
        onAdImpression={trackImpression}
        style={{ flex: 1 }}
      >
        {template === "card" && <CardTemplate />}
        {template === "list" && <ListTemplate />}
        {template === "banner" && <BannerTemplate />}
      </NativeAdView>
    </View>
  )
}

// Card template - rich content display
function CardTemplate() {
  return (
    <View>
      {/* Header with icon and advertiser */}
      <View className="mb-3 flex-row items-center">
        <IconView className="mr-3 h-12 w-12 rounded-lg" />
        <View className="flex-1">
          <HeadlineView className="mb-1 font-semibold text-gray-900 text-lg" />
          <AdvertiserView className="text-gray-500 text-sm" />
        </View>
        <CallToActionView className="rounded-lg bg-blue-500 px-4 py-2">
          <Text className="font-medium text-sm text-white">Install</Text>
        </CallToActionView>
      </View>

      {/* Media content */}
      <MediaView className="mb-3 h-48 w-full rounded-lg bg-gray-100" />

      {/* Description */}
      <TaglineView className="mb-3 text-gray-700 text-sm" />

      {/* Footer with rating and price */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <StarRatingView className="mr-2" />
          <StoreView className="text-gray-500 text-xs" />
        </View>
        <PriceView className="font-semibold text-green-600 text-sm" />
      </View>
    </View>
  )
}

// List template - compact horizontal layout
function ListTemplate() {
  return (
    <View className="flex-row items-center">
      <IconView className="mr-3 h-10 w-10 rounded-lg" />
      <View className="flex-1">
        <HeadlineView className="mb-1 font-semibold text-gray-900 text-sm" />
        <View className="flex-row items-center">
          <StarRatingView className="mr-2" />
          <AdvertiserView className="flex-1 text-gray-500 text-xs" />
        </View>
      </View>
      <CallToActionView className="rounded bg-blue-500 px-3 py-1">
        <Text className="font-medium text-white text-xs">Get</Text>
      </CallToActionView>
    </View>
  )
}

// Banner template - minimal horizontal banner
function BannerTemplate() {
  return (
    <View className="flex-row items-center">
      <IconView className="mr-2 h-8 w-8 rounded" />
      <View className="flex-1">
        <HeadlineView className="font-medium text-gray-800 text-xs" />
        <AdvertiserView className="text-gray-500 text-xs" />
      </View>
      <CallToActionView className="rounded bg-gray-800 px-2 py-1">
        <Text className="text-white text-xs">Ad</Text>
      </CallToActionView>
    </View>
  )
}

// Set displayName for better debugging
NativeAd.displayName = "NativeAd"

export default NativeAd
