import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import React from "react"

import "react-native-reanimated"
import * as Sentry from "@sentry/react-native"
import Providers from "~/shared/components/providers"
import { ErrorBoundary } from "~/shared/components/error-boundary"
import { useAuthEffects } from "~/features/auth/hooks/use-auth-effects"
import {
  useHideSplashScreen,
  useInitialAndroidBarSync,
  useLoadFonts,
  useOnlineStatus,
} from "~/shared/hooks"

import "~/shared/assets/styles/globals.css"

export const unstable_settings = {
  initialRouteName: "welcome",
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

// Initialize Sentry only in production or development with proper DSN
if (process.env.EXPO_PUBLIC_SENTRY_DSN && process.env.NODE_ENV !== 'test') {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    debug: __DEV__,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10000,
  })
}

function RootLayout() {
  useInitialAndroidBarSync()

  const fontsLoaded = useLoadFonts()
  useHideSplashScreen(fontsLoaded)

  
  return (
    <ErrorBoundary>
      <Providers>
        <AuthEffectsWrapper>
          <Stack initialRouteName="welcome">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modal)"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="terms-of-service"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            presentation: "modal",
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            presentation: "modal",
            title: "Sign Up",
            headerShown: false,
          }}
        />
          </Stack>
        </AuthEffectsWrapper>
      </Providers>
    </ErrorBoundary>
  )
}

// Component to handle auth effects inside the Providers context
function AuthEffectsWrapper({ children }: { children: React.ReactNode }) {
  // Track online status for React Query (needs to be inside QueryClientProvider)
  useOnlineStatus()
  
  // Handle Sendbird authentication when user logs in/out
  useAuthEffects()
  
  return <>{children}</>
}

export default RootLayout
// export default monitoringWrap(RootLayout)
