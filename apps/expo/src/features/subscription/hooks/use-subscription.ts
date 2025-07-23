import { useCallback, useEffect, useState } from "react"
import Purchases, { type CustomerInfo } from "react-native-purchases"

// Official RevenueCat pattern - simple subscription checking
export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  const checkSubscription = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo()
      setCustomerInfo(customerInfo)
      
      // Official pattern: Check specific entitlement
      const isActive = typeof customerInfo.entitlements.active['pro'] !== 'undefined'
      setIsSubscribed(isActive)
    } catch (error) {
      console.error('Error fetching customer info:', error)
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSubscription()

    // Official listener pattern
    const listener = Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      setCustomerInfo(customerInfo)
      const isActive = typeof customerInfo.entitlements.active['pro'] !== 'undefined'
      setIsSubscribed(isActive)
    })

    return () => {
      if (listener?.remove) listener.remove()
    }
  }, [checkSubscription])

  return { 
    isSubscribed, 
    isLoading, 
    customerInfo,
    refreshSubscription: checkSubscription 
  }
}