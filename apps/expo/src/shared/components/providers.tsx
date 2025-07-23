import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from "sonner-native"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { SendbirdUIKitContainer } from "@sendbird/uikit-react-native"

import { AdProvider } from "~/features/ads/components/AdProvider"
import { AppOpenAdProvider } from "~/features/ads/components/AppOpenAd"
import { ChatProvider } from "~/features/chat/provider"
import { platformServices } from "~/features/messages/services"
import { SupabaseProvider } from "~/features/supabase/components/supabase-provider"
import { queryClient } from "~/shared/api"
import ThemeProvider from "~/shared/components/theme-provider"
import { configureRevenueCat } from "~/shared/config/revenuecat"
import env from "~/shared/env"

export default function Providers({ children }: { children: ReactNode }) {
  // Configure RevenueCat on app start - official pattern
  useEffect(() => {
    configureRevenueCat()
  }, [])

  return (
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <SendbirdUIKitContainer
            appId={env.EXPO_PUBLIC_SENDBIRD_APP_ID}
            platformServices={platformServices}
            chatOptions={{
              localCacheEnabled: true,
              localCacheStorage: AsyncStorage,
              enableAutoPushTokenRegistration: false,
            }}
          >
            <ChatProvider>
              {/* <KeyboardProvider statusBarTranslucent navigationBarTranslucent> */}
              <ThemeProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <SafeAreaProvider>

                    <AppOpenAdProvider>
                      <AdProvider>{children}</AdProvider>
                    </AppOpenAdProvider>
                    <Toaster duration={1000} position="bottom-center" />
                  </SafeAreaProvider>
                </GestureHandlerRootView>
              </ThemeProvider>
              {/* </KeyboardProvider> */}
            </ChatProvider>
          </SendbirdUIKitContainer>
        </SupabaseProvider>
      </QueryClientProvider>
  )
}
