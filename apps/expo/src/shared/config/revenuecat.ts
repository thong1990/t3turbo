import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import env from '~/shared/env'

let isConfigured = false
let isProductionMode = false

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
    
    // Detect if using production or sandbox API key
    const isProductionKey = apiKey && !apiKey.startsWith('appl_') && !apiKey.includes('_dev_') && !apiKey.includes('sandbox')
    isProductionMode = isProductionKey
    console.log('- Mode:', isProductionKey ? '🟢 PRODUCTION' : '🟡 SANDBOX/PREVIEW')
    
    if (!isProductionKey) {
      console.warn('⚠️  Using sandbox/preview mode - paywall UI may not display properly')
      console.warn('💡 To enable production mode:')
      console.warn('   1. Get production API keys from RevenueCat dashboard')
      console.warn('   2. Update EXPO_PUBLIC_REVENUECAT_API_KEY_IOS/ANDROID environment variables')
      console.warn('   3. Ensure offerings are published in RevenueCat dashboard')
    }

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
    
    // Additional checks for production readiness
    if (isProductionMode) {
      console.log('🔍 Production Mode Checks:')
      console.log('- Offerings Available:', !!offerings.current)
      console.log('- Has Packages:', (offerings.current?.availablePackages?.length || 0) > 0)
      
      if (!offerings.current || (offerings.current.availablePackages?.length || 0) === 0) {
        console.warn('⚠️  No offerings or packages found in production mode')
        console.warn('💡 Ensure offerings are published in RevenueCat dashboard')
      }
    } else {
      console.log('🔍 Preview Mode Active:')
      console.log('- Paywall UI will show "NOT_PRESENTED"')
      console.log('- Use custom subscription plans for testing')
    }
    
    isConfigured = true
    console.log('🎉 RevenueCat configured successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to configure RevenueCat:', error)
    return false
  }
}

export const isRevenueCatConfigured = () => isConfigured
export const isRevenueCatProductionMode = () => isProductionMode
export const getRevenueCatMode = () => isProductionMode ? 'production' : 'preview'