import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import { CHAT_CONFIG } from "../constants"

/**
 * Hook to manage chat performance optimizations including:
 * - Smart refresh timing
 * - User activity tracking
 * - Background/foreground management
 * - Debounced operations
 */
export function useChatPerformance() {
  const [isUserActive, setIsUserActive] = useState(true)
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now())
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
  const backgroundRefreshTimer = useRef<NodeJS.Timeout | null>(null)

  const resetInactivityTimer = () => {
    setIsUserActive(true)

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)

    inactivityTimer.current = setTimeout(() => {
      setIsUserActive(false)
    }, CHAT_CONFIG.USER_INACTIVITY_TIMEOUT)
  }

  const isDataStale = (customStaleTime?: number) => {
    const staleTime = customStaleTime || CHAT_CONFIG.REFRESH_COOLDOWN
    return Date.now() - lastRefreshTime > staleTime
  }

  const smartRefresh = async (
    refreshFn: () => Promise<unknown>,
    forceRefresh = false
  ) => {
    if (!forceRefresh && !isDataStale()) {
      return
    }

    try {
      await refreshFn()
      setLastRefreshTime(Date.now())
    } catch (error) {
      console.error("❌ Smart refresh failed:", error)
    }
  }

  // Setup background refresh for active users
  useEffect(() => {
    if (!isUserActive) {
      if (backgroundRefreshTimer.current)
        clearInterval(backgroundRefreshTimer.current)
      return
    }

    backgroundRefreshTimer.current = setInterval(() => {
      setLastRefreshTime(prev => {
        const timeSinceLastUpdate = Date.now() - prev
        if (timeSinceLastUpdate >= CHAT_CONFIG.MESSAGE_POLLING_INTERVAL) {
          return Date.now()
        }
        return prev
      })
    }, CHAT_CONFIG.MESSAGE_POLLING_INTERVAL)

    return () => {
      if (backgroundRefreshTimer.current)
        clearInterval(backgroundRefreshTimer.current)
    }
  }, [isUserActive])

  // Handle app state changes
  useFocusEffect(
    useCallback(() => {
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === "active") {
          resetInactivityTimer()
          if (isDataStale(10000)) setLastRefreshTime(Date.now())
        }
      }

      const subscription = AppState.addEventListener(
        "change",
        handleAppStateChange
      )
      resetInactivityTimer()

      return () => subscription?.remove()
    }, [lastRefreshTime])
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      if (backgroundRefreshTimer.current)
        clearInterval(backgroundRefreshTimer.current)
    }
  }, [])

  return {
    isUserActive,
    lastRefreshTime,
    isDataStale,
    smartRefresh,
    resetInactivityTimer,
    getOptimizedQueryOptions: (baseOptions: Record<string, unknown> = {}) => ({
      ...baseOptions,
      staleTime: CHAT_CONFIG.REFRESH_COOLDOWN * 6,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      retry: 2,
      retryDelay: (attemptIndex: number) =>
        Math.min(3000 * attemptIndex, 15000),
    }),
  }
}
