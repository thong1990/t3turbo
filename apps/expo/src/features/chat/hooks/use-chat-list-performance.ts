import { useCallback, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"

export function useChatListPerformance() {
  const [isUserActive, setIsUserActive] = useState(true)
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false)
  const lastRefreshTime = useRef<number>(Date.now())
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
  const backgroundRefreshTimer = useRef<NodeJS.Timeout | null>(null)

  const resetInactivityTimer = useCallback(() => {
    setIsUserActive(true)

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)

    inactivityTimer.current = setTimeout(
      () => {
        setIsUserActive(false)
      },
      2 * 60 * 1000
    )
  }, [])

  const handleRefresh = async (
    refetchFn: () => Promise<unknown>,
    forceRefreshOnlineStatus: () => void
  ) => {
    setShowRefreshIndicator(true)
    resetInactivityTimer()

    try {
      await refetchFn()
      forceRefreshOnlineStatus()
      lastRefreshTime.current = Date.now()
    } finally {
      setShowRefreshIndicator(false)
    }
  }

  const setupBackgroundRefresh = useCallback(
    (userId: string, refetchFn: () => void) => {
      if (!userId) return

      if (backgroundRefreshTimer.current) {
        clearInterval(backgroundRefreshTimer.current)
      }

      backgroundRefreshTimer.current = setInterval(() => {
        if (isUserActive) {
          if (Math.random() < 0.1) {
          }
          refetchFn()
          lastRefreshTime.current = Date.now()
        }
      }, 30000)
    },
    [isUserActive]
  )

  const setupSmartRefresh = useCallback(
    (refetchFn: () => Promise<unknown>) => {
      const timeSinceLastRefresh = Date.now() - lastRefreshTime.current
      const isDataStale = timeSinceLastRefresh > 5000

      if (isDataStale) {
        setShowRefreshIndicator(true)
        refetchFn().finally(() => {
          setShowRefreshIndicator(false)
          lastRefreshTime.current = Date.now()
        })
      } else {
      }

      resetInactivityTimer()
    },
    [resetInactivityTimer]
  )

  const setupAppStateRefresh = useCallback(
    (refetchFn: () => Promise<unknown>) => {
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === "active") {
          const timeSinceLastRefresh = Date.now() - lastRefreshTime.current
          const isDataStale = timeSinceLastRefresh > 10000

          if (isDataStale) {
            setShowRefreshIndicator(true)
            refetchFn().finally(() => {
              setShowRefreshIndicator(false)
              lastRefreshTime.current = Date.now()
            })
          } else {
          }

          resetInactivityTimer()
        }
      }

      const subscription = AppState.addEventListener(
        "change",
        handleAppStateChange
      )
      return () => subscription?.remove()
    },
    [resetInactivityTimer]
  )

  // Cleanup on unmount
  useEffect(() => {
    resetInactivityTimer()
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      if (backgroundRefreshTimer.current)
        clearInterval(backgroundRefreshTimer.current)
    }
  }, [resetInactivityTimer])

  return {
    isUserActive,
    showRefreshIndicator,
    handleRefresh,
    resetInactivityTimer,
    setupBackgroundRefresh,
    setupSmartRefresh,
    setupAppStateRefresh,
  }
}
