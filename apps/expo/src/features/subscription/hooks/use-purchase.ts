import { useCallback } from "react"
import Purchases, { type PurchasesPackage } from "react-native-purchases"

// Official RevenueCat pattern - simple purchase with error handling
export function usePurchase() {
  const purchasePackage = useCallback(async (packageToPurchase: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase)
      
      if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
        // User is now subscribed
        console.log('Purchase successful - user is now subscribed')
        return { success: true, customerInfo }
      }
      
      return { success: false, error: 'Entitlement not activated' }
    } catch (error: any) {
      if (error.userCancelled) {
        // User cancelled - don't show error
        console.log('User cancelled purchase')
        return { success: false, cancelled: true }
      }
      
      console.error('Purchase error:', error)
      return { success: false, error: error.message || 'Purchase failed' }
    }
  }, [])

  const restorePurchases = useCallback(async () => {
    try {
      const customerInfo = await Purchases.restorePurchases()
      console.log('Purchases restored successfully')
      return { success: true, customerInfo }
    } catch (error: any) {
      console.error('Restore error:', error)
      return { success: false, error: error.message || 'Restore failed' }
    }
  }, [])

  return { purchasePackage, restorePurchases }
}