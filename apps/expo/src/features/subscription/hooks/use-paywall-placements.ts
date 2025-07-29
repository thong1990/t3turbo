// import { useCallback } from "react"
// import { usePaywall } from reexts/PaywallContext"
// import { useOfferings } from "contexts/RevenueCatContext"

// // RevenueCat paywall placement triggers using centralized context
// export function usePaywallPlacements() {
//   const { presentPaywall, presentPaywallIfNeeded, isLoading } = usePaywall()
//   const { current: currentOffering, isLoading: isLoadingOfferings } = useOfferings()

//   const presentPaywallFromSource = useCallback(async (source: string, onSuccess?: () => void) => {
//     console.log(`Presenting paywall from ${source}`)
    
//     const success = await presentPaywall(currentOffering || undefined)
    
//     if (success) {
//       console.log(`Purchase successful from ${source}`)
//       onSuccess?.()
//     }
    
//     return { success }
//   }, [currentOffering, presentPaywall])

//   // Simple trigger functions that use the current offering
//   const triggerAdFrustrationPaywall = useCallback((onSuccess?: () => void) => 
//     presentPaywallFromSource("ad_interaction", onSuccess), [presentPaywallFromSource])

//   const triggerPremiumFeaturePaywall = useCallback((featureName: string, onSuccess?: () => void) => 
//     presentPaywallFromSource(`premium_feature_${featureName}`, onSuccess), [presentPaywallFromSource])

//   const triggerTradeLimitPaywall = useCallback((onSuccess?: () => void) => 
//     presentPaywallFromSource("trade_limit_exceeded", onSuccess), [presentPaywallFromSource])

//   const triggerProfileSubscribePaywall = useCallback((onSuccess?: () => void) => 
//     presentPaywallFromSource("profile_screen", onSuccess), [presentPaywallFromSource])

//   // Conditional paywall presentation - only shows if user doesn't have entitlement
//   const triggerPaywallIfNeeded = useCallback(async (source: string, onSuccess?: () => void) => {
//     console.log(`Checking if paywall needed from ${source}`)
    
//     const success = await presentPaywallIfNeeded(currentOffering || undefined)
    
//     if (success) {
//       console.log(`Paywall interaction successful from ${source}`)
//       onSuccess?.()
//     }
    
//     return { success }
//   }, [currentOffering, presentPaywallIfNeeded])

//   return {
//     // Trigger functions for specific contexts
//     triggerAdFrustrationPaywall,
//     triggerPremiumFeaturePaywall,
//     triggerTradeLimitPaywall,
//     triggerProfileSubscribePaywall,
//     triggerPaywallIfNeeded,
    
//     // State
//     currentOffering,
//     isLoading: isLoading || isLoadingOfferings,
    
//     // Direct access to context methods for advanced usage
//     presentPaywall: presentPaywallFromSource,
//     presentPaywallIfNeeded: triggerPaywallIfNeeded,
//   }
// }