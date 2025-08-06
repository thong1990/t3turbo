import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from "sonner-native"

import { SendbirdUIKitContainer } from "@sendbird/uikit-react-native"
import { MMKVStorage } from "~/features/messages/storage/mmkv-storage"

import { AdProvider } from "~/features/ads/components/AdProvider"
import { AppOpenAdProvider } from "~/features/ads/components/AppOpenAd"
import { SendbirdProvider } from "~/features/messages/providers/sendbird-provider"
import { platformServices } from "~/features/messages/services"
import { SubscriptionProvider } from "~/features/subscriptions"
import { SupabaseProvider } from "~/features/supabase/components/supabase-provider"
import { queryClient } from "~/shared/api"
import ThemeProvider from "~/shared/components/theme-provider"
import env from "~/shared/env"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <SubscriptionProvider >
          <SendbirdUIKitContainer
            appId={env.EXPO_PUBLIC_SENDBIRD_APP_ID}
            platformServices={platformServices}
            chatOptions={{
              localCacheEnabled: true,
              localCacheStorage: MMKVStorage, // Smart storage: MMKV in dev builds, AsyncStorage in Expo Go
              enableAutoPushTokenRegistration: false,
            }}
          >
            <SendbirdProvider>
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
            </SendbirdProvider>
          </SendbirdUIKitContainer>
        </SubscriptionProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  )
}