import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"

import "react-native-reanimated"
import * as Sentry from "@sentry/react-native"
import Providers from "~/shared/components/providers"
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

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
})
Sentry.captureException(new Error("First error"))

function RootLayout() {
  useInitialAndroidBarSync()

  // Track online status for React Query
  useOnlineStatus()

  const fontsLoaded = useLoadFonts()
  useHideSplashScreen(fontsLoaded)

  return (
    <Providers>
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
    </Providers>
  )
}

export default RootLayout
// export default monitoringWrap(RootLayout)
