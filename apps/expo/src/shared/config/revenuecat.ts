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

    console.log('🔧 RevenueCat Configuration:')
    console.log('- Platform:', Platform.OS)
    console.log('- API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET')
    console.log('- Key Length:', apiKey?.length || 0)

    if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
      console.warn('❌ RevenueCat API key not configured - subscription features disabled')
      return false
    }

    // Configure SDK with API key
    console.log('⚙️ Configuring RevenueCat SDK...')
    await Purchases.configure({ apiKey })
    
    // Verify connection by fetching customer info
    console.log('🔍 Verifying SDK connection...')
    const customerInfo = await Purchases.getCustomerInfo()
    console.log('✅ RevenueCat connected successfully!')
    console.log('- Customer ID:', customerInfo.originalAppUserId)
    console.log('- Active Entitlements:', Object.keys(customerInfo.entitlements.active))
    
    // Test offerings availability
    console.log('📦 Checking offerings...')
    const offerings = await Purchases.getOfferings()
    console.log('- Current Offering:', offerings.current?.identifier || 'None')
    console.log('- Available Packages:', offerings.current?.availablePackages?.length || 0)
    
    isConfigured = true
    console.log('🎉 RevenueCat configured successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to configure RevenueCat:', error)
    return false
  }
}

export const isRevenueCatConfigured = () => isConfigured