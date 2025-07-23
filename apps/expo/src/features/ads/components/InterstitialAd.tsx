import type React from "react"

import { useSubscription } from "~/features/subscription/hooks/use-subscription"
import { usePaywallPlacements } from "~/features/subscription/hooks/use-paywall-placements"
import { useAdMob } from "../hooks/use-ad-mob"
import type { AdPlacement } from "../types"

interface InterstitialAdProps {
  placement: AdPlacement
  children: (showAd: () => Promise<boolean>) => React.ReactNode
}

export function InterstitialAd({ placement, children }: InterstitialAdProps) {
  const { isSubscribed } = useSubscription()
  const { triggerAdFrustrationPaywall } = usePaywallPlacements()
  const { showInterstitialAd } = useAdMob()

  const handleShowAd = async () => {
    if (isSubscribed) {
      return true // Skip ad for subscribed users
    }
    
    const result = await showInterstitialAd(placement)
    // Trigger paywall after ad interaction (user frustration)
    triggerAdFrustrationPaywall()
    return result
  }

  return <>{children(handleShowAd)}</>
}
