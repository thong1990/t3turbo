import { useCallback } from "react"
import Purchases from "react-native-purchases"

// Official RevenueCat authentication pattern
export function useRevenueCatAuth() {
  const logIn = useCallback(async (userId: string) => {
    try {
      const { customerInfo, created } = await Purchases.logIn(userId)
      console.log('RevenueCat user logged in:', customerInfo.originalAppUserId)
      return { success: true, customerInfo, created }
    } catch (error) {
      console.error('RevenueCat login failed:', error)
      return { success: false, error }
    }
  }, [])

  const logOut = useCallback(async () => {
    try {
      const { customerInfo } = await Purchases.logOut()
      console.log('RevenueCat user logged out')
      return { success: true, customerInfo }
    } catch (error) {
      console.error('RevenueCat logout failed:', error)
      return { success: false, error }
    }
  }, [])

  const setAttributes = useCallback(async (attributes: Record<string, string | null>) => {
    try {
      await Purchases.setAttributes(attributes)
      return { success: true }
    } catch (error) {
      console.error('Failed to set attributes:', error)
      return { success: false, error }
    }
  }, [])

  return { logIn, logOut, setAttributes }
}