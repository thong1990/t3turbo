import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from "sonner-native"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { SendbirdUIKitContainer } from "@sendbird/uikit-react-native"
import { MMKVStorage } from "~/features/messages/storage/mmkv-storage"

import { AdProvider } from "~/features/ads/components/AdProvider"
import { AppOpenAdProvider } from "~/features/ads/components/AppOpenAd"
import { SendbirdProvider } from "~/features/messages/providers/sendbird-provider"
import { platformServices } from "~/features/messages/services"
import { SupabaseProvider } from "~/features/supabase/components/supabase-provider"
import { queryClient } from "~/shared/api"
import ThemeProvider from "~/shared/components/theme-provider"
import { configureRevenueCat } from "~/shared/config/revenuecat"
import env from "~/shared/env"
import RevenueCatUI from 'react-native-purchases-ui';

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
              localCacheStorage: MMKVStorage, // Smart storage: MMKV in dev builds, AsyncStorage in Expo Go
              enableAutoPushTokenRegistration: false,
            }}
          >
            <SendbirdProvider>   <RevenueCatUI.Paywall
            options={{
              displayCloseButton: true,
              offering: null,
              fontFamily: null
            }}
            // onPurchaseStarted={({ packageBeingPurchased }) => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Purchase started for: ${packageBeingPurchased.identifier}`);
            // }}
            // onPurchaseCompleted={({ customerInfo, storeTransaction }) => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Purchase completed! Transaction: ${storeTransaction.transactionIdentifier}`);
            //   setShowModalPaywall(false);
            // }}
            // onPurchaseError={({ error }) => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Purchase error: ${error.message}`);
            // }}
            // onPurchaseCancelled={() => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Purchase cancelled`);
            // }}
            // onRestoreStarted={() => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Restore started`);
            // }}
            // onRestoreCompleted={({ customerInfo }) => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Restore completed`);
            // }}
            // onRestoreError={({ error }) => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Restore error: ${error.message}`);
            // }}
            // onDismiss={() => {
            //   setLastResult(`[${new Date().toLocaleTimeString()}] Modal paywall dismissed`);
            //   setShowModalPaywall(false);
            // }}
          />
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
        </SupabaseProvider>
      </QueryClientProvider>
  )
}
