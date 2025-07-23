import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import env from '~/shared/env'

let isConfigured = false

export const configureRevenueCat = async (): Promise<boolean> => {
  if (isConfigured) return true

  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG)
    }

    // Get platform-specific API key
    const apiKey = Platform.select({
      ios: env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
      android: env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
    })

    if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
      console.warn('RevenueCat API key not configured - subscription features disabled')
      return false
    }

    // Configure SDK with API key
    await Purchases.configure({ apiKey })
    
    isConfigured = true
    console.log('RevenueCat configured successfully')
    return true
  } catch (error) {
    console.error('Failed to configure RevenueCat:', error)
    return false
  }
}

export const isRevenueCatConfigured = () => isConfigured