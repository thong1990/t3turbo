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
  const { colorScheme, setColorScheme: setNativeWindColorScheme } =
    useNativewindColorScheme()
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize theme preference on first launch
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('colorScheme')
        
        if (storedTheme === null) {
          // First time user - default to light mode
          setNativeWindColorScheme('light')
          await AsyncStorage.setItem('colorScheme', 'light')
        }
        
        setHasInitialized(true)
      } catch (error) {
        console.error('Failed to initialize theme:', error)
        setNativeWindColorScheme('light')
        setHasInitialized(true)
      }
    }
    
    initializeTheme()
  }, [setNativeWindColorScheme])

  async function setColorScheme(colorScheme: "light" | "dark") {
    setNativeWindColorScheme(colorScheme)
    
    // Persist the theme preference
    try {
      await AsyncStorage.setItem('colorScheme', colorScheme)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
    
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
    colorScheme: hasInitialized ? (colorScheme ?? "light") : "light",
    isDarkColorScheme: hasInitialized ? (colorScheme === "dark") : false,
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[hasInitialized ? (colorScheme ?? "light") : "light"],
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
