import { useEffect } from 'react'
import { Platform } from 'react-native'
import type { ReactNode } from 'react'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

import env from '~/shared/env'

interface RevenueCatProviderProps {
  children: ReactNode
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  useEffect(() => {
    const initializeRevenueCat = () => {
      try {
        // Set log level - VERBOSE for development, WARN for production
        const logLevel = __DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN
        void Purchases.setLogLevel(logLevel)

        // Get platform-specific API key
        let apiKey: string | undefined
        if (Platform.OS === 'ios') {
          apiKey = env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
        } else if (Platform.OS === 'android') {
          apiKey = env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
        }

        if (!apiKey) {
          console.warn(
            `RevenueCat: No API key found for ${Platform.OS}. Please check your environment variables.`
          )
          return
        }

        // Configure RevenueCat with the API key  
        Purchases.configure({ 
          apiKey,
          // Optional: Set user ID if you have authentication
          // appUserID: 'your-app-user-id',
        })

        console.log(`RevenueCat configured successfully for ${Platform.OS}`)
      } catch (error) {
        console.error('RevenueCat configuration failed:', error)
      }
    }

    initializeRevenueCat()
  }, [])

  return <>{children}</>
}