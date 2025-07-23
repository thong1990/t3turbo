import { useEffect, useState } from "react"

// Simple initialization hook that doesn't depend on UIKit components
export function useSendbirdInitialization() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeSendbird() {
      try {
        // For now, we'll initialize when the app loads
        // The actual SDK will be set when UIKit container initializes
        if (mounted) {
          setIsInitialized(true)
        }
      } catch (err) {
        if (mounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to initialize SendBird"
          setError(errorMessage)
          console.error("❌ Failed to initialize SendBird:", err)
        }
      }
    }

    initializeSendbird()

    return () => {
      mounted = false
    }
  }, [])

  return { isInitialized, error }
}
