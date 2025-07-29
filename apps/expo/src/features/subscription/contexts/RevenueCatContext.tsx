// import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
// import Purchases, { type CustomerInfo, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases'

// // Constants
// const ENTITLEMENT_ID = 'entleb8288f890'

// // Types
// interface RevenueCatState {
//   isSubscribed: boolean
//   isLoading: boolean
//   customerInfo: CustomerInfo | null
//   offerings: PurchasesOffering[] | null
//   currentOffering: PurchasesOffering | null
//   error: string | null
// }

// interface RevenueCatActions {
//   purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>
//   restorePurchases: () => Promise<RestoreResult>
//   refreshCustomerInfo: () => Promise<void>
// }

// interface PurchaseResult {
//   success: boolean
//   customerInfo?: CustomerInfo
//   error?: string
//   cancelled?: boolean
// }

// interface RestoreResult {
//   success: boolean
//   customerInfo?: CustomerInfo
//   error?: string
// }

// type RevenueCatContextType = RevenueCatState & RevenueCatActions

// // Context
// const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined)

// // Provider Props
// interface RevenueCatProviderProps {
//   children: ReactNode
// }

// // Provider Component
// export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
//   // State
//   const [state, setState] = useState<RevenueCatState>({
//     isSubscribed: false,
//     isLoading: true,
//     customerInfo: null,
//     offerings: null,
//     currentOffering: null,
//     error: null,
//   })


//   // Refresh customer info
//   const refreshCustomerInfo = useCallback(async () => {
//     try {
//       const customerInfo = await Purchases.getCustomerInfo()
//       const isSubscribed = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
      
//       setState(prev => ({
//         ...prev,
//         customerInfo,
//         isSubscribed,
//         error: null,
//       }))
//     } catch (error) {
//       console.error('Error fetching customer info:', error)
//       setState(prev => ({
//         ...prev,
//         error: error instanceof Error ? error.message : 'Failed to fetch customer info',
//       }))
//     }
//   }, [])

//   // Fetch offerings
//   const fetchOfferings = useCallback(async () => {
//     try {
//       const offeringsResponse = await Purchases.getOfferings()
//       const offerings = Object.values(offeringsResponse.all)
//       const currentOffering = offeringsResponse.current
      
//       setState(prev => ({
//         ...prev,
//         offerings,
//         currentOffering,
//         error: null,
//       }))
//     } catch (error) {
//       console.error('Error fetching offerings:', error)
//       setState(prev => ({
//         ...prev,
//         error: error instanceof Error ? error.message : 'Failed to fetch offerings',
//       }))
//     }
//   }, [])

//   // Purchase package
//   const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
//     try {
//       const { customerInfo } = await Purchases.purchasePackage(pkg)
//       const isSubscribed = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
      
//       // Update state
//       setState(prev => ({
//         ...prev,
//         customerInfo,
//         isSubscribed,
//       }))

//       if (isSubscribed) {
//         console.log('Purchase successful - user is now subscribed')
//         return { success: true, customerInfo }
//       } else {
//         console.warn('Purchase completed but entitlement not activated')
//         return { success: false, error: 'Entitlement not activated' }
//       }
//     } catch (error: any) {
//       if (error.userCancelled) {
//         console.log('User cancelled purchase')
//         return { success: false, cancelled: true }
//       }
      
//       console.error('Purchase error:', error)
//       return { 
//         success: false, 
//         error: error.message || 'Purchase failed' 
//       }
//     }
//   }, [])

//   // Restore purchases
//   const restorePurchases = useCallback(async (): Promise<RestoreResult> => {
//     try {
//       const customerInfo = await Purchases.restorePurchases()
//       const isSubscribed = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
      
//       // Update state
//       setState(prev => ({
//         ...prev,
//         customerInfo,
//         isSubscribed,
//       }))

//       console.log('Purchases restored successfully')
//       return { success: true, customerInfo }
//     } catch (error: any) {
//       console.error('Restore error:', error)
//       return { 
//         success: false, 
//         error: error.message || 'Restore failed' 
//       }
//     }
//   }, [])

//   // Set up customer info listener and initial load
//   useEffect(() => {
//     let isMounted = true

//     // Initial load functions
//     const loadInitialData = async () => {
//       try {
//         // Load customer info
//         setState(prev => ({ ...prev, isLoading: true, error: null }))
//         const customerInfo = await Purchases.getCustomerInfo()
//         const isSubscribed = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
        
//         if (isMounted) {
//           setState(prev => ({
//             ...prev,
//             customerInfo,
//             isSubscribed,
//             isLoading: false,
//           }))
//         }

//         // Load offerings
//         const offeringsResponse = await Purchases.getOfferings()
//         const offerings = Object.values(offeringsResponse.all)
//         const currentOffering = offeringsResponse.current
        
//         if (isMounted) {
//           setState(prev => ({
//             ...prev,
//             offerings,
//             currentOffering,
//           }))
//         }
//       } catch (error) {
//         console.error('Error loading initial data:', error)
//         if (isMounted) {
//           setState(prev => ({
//             ...prev,
//             error: error instanceof Error ? error.message : 'Failed to load data',
//             isLoading: false,
//           }))
//         }
//       }
//     }

//     // Load initial data
//     loadInitialData()

//     // Set up listener for customer info updates
//     const listener = Purchases.addCustomerInfoUpdateListener((customerInfo) => {
//       if (isMounted) {
//         const isSubscribed = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
//         setState(prev => ({
//           ...prev,
//           customerInfo,
//           isSubscribed,
//         }))
//       }
//     })

//     return () => {
//       isMounted = false
//       if (listener?.remove) {
//         listener.remove()
//       }
//     }
//   }, []) // Empty dependency array - runs once on mount

//   // Memoized context value
//   const contextValue = useMemo<RevenueCatContextType>(() => ({
//     // State
//     ...state,
    
//     // Actions
//     purchasePackage,
//     restorePurchases,
//     refreshCustomerInfo,
//   }), [state, purchasePackage, restorePurchases, refreshCustomerInfo])

//   return (
//     <RevenueCatContext.Provider value={contextValue}>
//       {children}
//     </RevenueCatContext.Provider>
//   )
// }

// // Hook to use RevenueCat context
// export function useRevenueCat(): RevenueCatContextType {
//   const context = useContext(RevenueCatContext)
//   if (context === undefined) {
//     throw new Error('useRevenueCat must be used within a RevenueCatProvider')
//   }
//   return context
// }

// // Convenience hooks
// export function useSubscription() {
//   const { isSubscribed, isLoading, customerInfo, refreshCustomerInfo } = useRevenueCat()
//   return { isSubscribed, isLoading, customerInfo, refreshSubscription: refreshCustomerInfo }
// }

// export function usePurchase() {
//   const { purchasePackage, restorePurchases } = useRevenueCat()
//   return { purchasePackage, restorePurchases }
// }

// export function useOfferings() {
//   const { offerings, currentOffering, isLoading } = useRevenueCat()
//   return { offerings, current: currentOffering, isLoading }
// }

// // Export types
// export type { PurchaseResult, RestoreResult }