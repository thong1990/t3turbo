import type React from "react"
// import { useAuthIntegration, useSubscriptionSync } from "~/features/subscription"

interface AdProviderProps {
  children: React.ReactNode
}

// AdProvider with subscription integration
export function AdProvider({ children }: AdProviderProps) {
  // Initialize auth integration and database sync
  // RevenueCat events are handled automatically in useSubscription hook
  // useAuthIntegration()
  // useSubscriptionSync()

  return <>{children}</>
}
