import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import * as NavigationBar from "expo-navigation-bar"
import * as Notifications from "expo-notifications"
import { type Route, SplashScreen, router } from "expo-router"
import { useColorScheme as useNativewindColorScheme } from "nativewind"
import { useEffect, useState } from "react"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { COLORS } from "~/shared/theme/colors"

// Export adaptive tab bar hooks
export { 
  useAdaptiveTabBar, 
  useModernTabBar,
  useCleanTabBar, 
  useTabBarDebugInfo,
  type CleanTabBarStyle,
  type CleanTabBarMetrics 
} from "./hooks/use-adaptive-tab-bar"

export function useColorScheme() {
  const { setColorScheme: setNativeWindColorScheme } = useNativewindColorScheme()
  const [hasInitialized, setHasInitialized] = useState(false)

  // Force light theme always
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Always set to light theme
        setNativeWindColorScheme('light')
        // Clear any stored theme preference
        await AsyncStorage.removeItem('colorScheme')
        setHasInitialized(true)
      } catch (error) {
        console.error('Failed to initialize theme:', error)
        setNativeWindColorScheme('light')
        setHasInitialized(true)
      }
    }
    
    initializeTheme()
  }, [setNativeWindColorScheme])

  // Deprecated function - always keeps light theme
  async function setColorScheme(colorScheme: "light" | "dark") {
    // Force light theme regardless of input
    setNativeWindColorScheme('light')
    
    if (Platform.OS !== "android") {
      return
    }

    try {
      await setNavigationBar('light')
    } catch (error) {
      console.error('useColorScheme.tsx", "setColorScheme', error)
    }
  }

  // Deprecated function - no longer toggles
  function toggleColorScheme() {
    return setColorScheme('light')
  }

  return {
    colorScheme: 'light',
    isDarkColorScheme: false,
    setColorScheme,
    toggleColorScheme,
    colors: COLORS.light,
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
      colorScheme === "dark" ? "rgba(33, 35, 39, 0.95)" : "rgba(255, 255, 255, 0.8)"
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
