import type React from "react"
import { useAuthIntegration } from "~/features/subscription/hooks/use-auth-integration"
import { useSubscriptionSync } from "~/features/subscription/hooks/use-subscription-sync"

interface AdProviderProps {
  children: React.ReactNode
}

// AdProvider with subscription integration
export function AdProvider({ children }: AdProviderProps) {
  // Initialize auth integration and database sync
  // RevenueCat events are handled automatically in useSubscription hook
  useAuthIntegration()
  useSubscriptionSync()

  return <>{children}</>
}
