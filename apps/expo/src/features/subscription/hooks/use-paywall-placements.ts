import { useCallback } from "react"
import { useOfferings } from "./use-offerings"
import { usePurchase } from "./use-purchase"

// Official RevenueCat pattern - simple paywall triggers
export function usePaywallPlacements() {
  const { offerings, isLoading: isLoadingOfferings } = useOfferings()
  const { purchasePackage } = usePurchase()

  const presentPaywall = useCallback(async (source: string, onSuccess?: () => void) => {
    if (!offerings?.current) {
      console.warn("No current offering available")
      return { success: false, error: "No offerings available" }
    }

    const packageToPurchase = offerings.current.availablePackages[0]
    if (!packageToPurchase) {
      console.warn("No packages available in current offering")
      return { success: false, error: "No packages available" }
    }

    console.log(`Presenting paywall from ${source}`)
    const result = await purchasePackage(packageToPurchase)
    
    if (result.success) {
      console.log(`Purchase successful from ${source}`)
      onSuccess?.()
    }
    
    return result
  }, [offerings, purchasePackage])

  // Simple trigger functions that use the current offering
  const triggerAdFrustrationPaywall = useCallback((onSuccess?: () => void) => 
    presentPaywall("ad_interaction", onSuccess), [presentPaywall])

  const triggerPremiumFeaturePaywall = useCallback((featureName: string, onSuccess?: () => void) => 
    presentPaywall(`premium_feature_${featureName}`, onSuccess), [presentPaywall])

  const triggerTradeLimitPaywall = useCallback((onSuccess?: () => void) => 
    presentPaywall("trade_limit_exceeded", onSuccess), [presentPaywall])

  const triggerProfileSubscribePaywall = useCallback((onSuccess?: () => void) => 
    presentPaywall("profile_screen", onSuccess), [presentPaywall])

  return {
    triggerAdFrustrationPaywall,
    triggerPremiumFeaturePaywall,
    triggerTradeLimitPaywall,
    triggerProfileSubscribePaywall,
    offerings,
    isLoadingOfferings,
  }
}