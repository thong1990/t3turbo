import { useEffect, useState } from "react"
import Purchases, { type PurchasesOfferings } from "react-native-purchases"

// Official RevenueCat pattern - simple offerings fetch
export function useOfferings() {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getOfferings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const offerings = await Purchases.getOfferings()
        setOfferings(offerings)
      } catch (err) {
        console.error('Error fetching offerings:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch offerings')
      } finally {
        setIsLoading(false)
      }
    }

    getOfferings()
  }, [])

  return { offerings, isLoading, error }
}