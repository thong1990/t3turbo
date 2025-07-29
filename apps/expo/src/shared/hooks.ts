import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import * as NavigationBar from "expo-navigation-bar"

import * as Notifications from "expo-notifications"
import { type Route, SplashScreen, router } from "expo-router"
import { useColorScheme as useNativewindColorScheme } from "nativewind"
import { useEffect, useState } from "react"
import { Platform } from "react-native"
import Purchases from "react-native-purchases"

import { COLORS } from "~/shared/theme/colors"
import env from "./env"

export function useColorScheme() {
  const { colorScheme, setColorScheme: setNativeWindColorScheme } =
    useNativewindColorScheme()

  async function setColorScheme(colorScheme: "light" | "dark") {
    setNativeWindColorScheme(colorScheme)
    if (Platform.OS !== "android") {
      return
    }

    try {
      await setNavigationBar(colorScheme)
    } catch (error) {
      console.error('useColorScheme.tsx", "setColorScheme', error)
    }
  }

  function toggleColorScheme() {
    return setColorScheme(colorScheme === "light" ? "dark" : "light")
  }

  return {
    colorScheme: colorScheme ?? "light",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[colorScheme ?? "light"],
  }
}

/**
 * Set the Android navigation bar color based on the color scheme.
 */
export function useInitialAndroidBarSync() {
  const { colorScheme } = useColorScheme()
  useEffect(() => {
    if (Platform.OS !== "android") {
      return
    }

    setNavigationBar(colorScheme).catch(error => {
      console.error('useColorScheme.tsx", "useInitialColorScheme', error)
    })
  }, [colorScheme])
}

function setNavigationBar(colorScheme: "light" | "dark") {
  return Promise.all([
    NavigationBar.setButtonStyleAsync(
      colorScheme === "dark" ? "light" : "dark"
    ),
    NavigationBar.setPositionAsync("absolute"),
    NavigationBar.setBackgroundColorAsync(
      colorScheme === "dark" ? "#00000030" : "#ffffff80"
    ),
  ])
}

export function useHideSplashScreen(loaded: boolean) {
  useEffect(() => {
    if (!loaded) {
      return
    }

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        console.warn("Error hiding splash screen:", error)
      }
    }

    hideSplash()
  }, [loaded])
}

export function useOnlineStatus() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const status = state.isConnected ?? false
      onlineManager.setOnline(status)
    })
    return () => unsubscribe()
  }, [])
}

export function useLoadFonts() {
  const [loaded] = useFonts({
    // biome-ignore lint/nursery/noCommonJs: <explanation>
    CalSans: require("../shared/assets/fonts/CalSans-SemiBold.ttf"),
  })

  return loaded
}

export function useInitRevenueCat() {
  const [purchasesConfigured, setPurchasesConfigured] = useState(false);

  // Configure Purchases on app startup
  useEffect(() => {
    const configurePurchases = async () => {
      try {
        // Enable debug logs before calling `configure`
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        // Get the appropriate API key based on platform
        let apiKey = '';
        if (Platform.OS === 'ios') {
          apiKey = env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '';
        } else if (Platform.OS === 'android') {
          apiKey = env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '';
        }

        if (apiKey) {
          // Initialize the RevenueCat Purchases SDK
          // appUserID is null, so an anonymous ID will be generated automatically
          await Purchases.configure({
            apiKey: apiKey,
            appUserID: null,
            useAmazon: false,
            diagnosticsEnabled: true
          });
          setPurchasesConfigured(true);
          console.log('Purchases configured successfully');
        } else {
          console.warn('No API key found for platform:', Platform.OS);
        }
      } catch (e) {
        console.error('Failed to configure Purchases:', e);
      }
    };

    configurePurchases();
  }, []);

  return purchasesConfigured;
}

export function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url
      if (url) {
        router.push(url as Route) // Dangerous
      }
    }

    Notifications.getLastNotificationResponseAsync().then(response => {
      if (!isMounted || !response?.notification) {
        return
      }
      redirect(response?.notification)
    })

    const subscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        redirect(response.notification)
      }
    )

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [])
}
