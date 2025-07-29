// import React, { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react'
// import type { PurchasesOffering } from 'react-native-purchases'
// import { useRevenueCat, type PurchaseResult } from './RevenueCatContext'

// // Types
// interface PaywallContextType {
//   presentPaywall: (offering?: PurchasesOffering) => Promise<boolean>
//   presentPaywallIfNeeded: (offering?: PurchasesOffering) => Promise<boolean>
//   isLoading: boolean
// }

// // Context
// const PaywallContext = createContext<PaywallContextType | undefined>(undefined)

// // Provider Props
// interface PaywallProviderProps {
//   children: ReactNode
// }

// // Provider Component
// export function PaywallProvider({ children }: PaywallProviderProps) {
//   const { 
//     isSubscribed, 
//     isLoading, 
//     currentOffering, 
//     purchasePackage 
//   } = useRevenueCat()

//   // Present paywall - triggers purchase flow
//   const presentPaywall = useCallback(async (offering?: PurchasesOffering): Promise<boolean> => {
//     try {
//       // Use provided offering or fall back to current offering
//       const targetOffering = offering || currentOffering
      
//       if (!targetOffering?.availablePackages?.length) {
//         console.warn('No packages available for purchase')
//         return false
//       }

//       console.log('targetOffering', targetOffering)

//       // Use the first available package (typical pattern)
//       const packageToPurchase = targetOffering.availablePackages[0]
//       console.log(`Presenting paywall - starting purchase flow for ${packageToPurchase.identifier}`)
      
//       const result: PurchaseResult = await purchasePackage(packageToPurchase)

//       if (result.success) {
//         console.log('Paywall purchase successful')
//         return true
//       } else if (result.cancelled) {
//         console.log('User cancelled paywall')
//         return false
//       } else {
//         console.error('Paywall purchase failed:', result.error)
//         return false
//       }
//     } catch (error) {
//       console.error('Error presenting paywall:', error)
//       return false
//     }
//   }, [currentOffering, purchasePackage])

//   // Present paywall only if needed (user not subscribed)
//   const presentPaywallIfNeeded = useCallback(async (offering?: PurchasesOffering): Promise<boolean> => {
//     try {
//       // Check if user already has subscription
//       if (isSubscribed) {
//         console.log('Paywall not needed - user already subscribed')
//         return true // User already has entitlement
//       }

//       // If not subscribed, present the paywall
//       console.log('User needs subscription - presenting paywall')
//       return await presentPaywall(offering)
//     } catch (error) {
//       console.error('Error checking if paywall needed:', error)
//       return false
//     }
//   }, [isSubscribed, presentPaywall])

//   // Memoized context value
//   const contextValue = useMemo<PaywallContextType>(() => ({
//     presentPaywall,
//     presentPaywallIfNeeded,
//     isLoading,
//   }), [presentPaywall, presentPaywallIfNeeded, isLoading])

//   return (
//     <PaywallContext.Provider value={contextValue}>
//       {children}
//     </PaywallContext.Provider>
//   )
// }

// // Hook to use Paywall context
// export function usePaywall(): PaywallContextType {
//   const context = useContext(PaywallContext)
//   if (context === undefined) {
//     throw new Error('usePaywall must be used within a PaywallProvider')
//   }
//   return context
// }