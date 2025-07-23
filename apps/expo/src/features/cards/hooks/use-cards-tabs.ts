import { useMemo, useState } from "react"
import { useUser } from "~/features/supabase/hooks"
import { useCardsQuery } from "../queries"
import type { CardFilters, TabState, TradeMode } from "../types"

export function useCardsTabs({
  filters,
  searchQuery,
  enabled = true,
}: {
  filters: CardFilters
  searchQuery?: string
  enabled?: boolean
}) {
  const { data: user } = useUser()
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  // Use unified query for all three modes
  const allCardsQuery = useCardsQuery({
    filters,
    searchQuery,
    userId: user?.id,
    mode: "all",
    enabled,
  })

  const giveCardsQuery = useCardsQuery({
    filters,
    searchQuery,
    userId: user?.id,
    mode: "give",
    enabled,
  })

  const wantCardsQuery = useCardsQuery({
    filters,
    searchQuery,
    userId: user?.id,
    mode: "want",
    enabled,
  })

  // Memoized processed data
  const displayAllCards = useMemo(() => {
    return (allCardsQuery.data ?? []).map(c => ({
      ...c,
      user_cards: Array.isArray(c.user_cards) ? c.user_cards : [],
    }))
  }, [allCardsQuery.data])

  const displayGiveCards = useMemo(() => {
    return giveCardsQuery.data ?? []
  }, [giveCardsQuery.data])

  const displayWantCards = useMemo(() => {
    return wantCardsQuery.data ?? []
  }, [wantCardsQuery.data])

  // Combined refresh handler (with loading animation)
  const handleRefresh = async () => {
    setIsManualRefreshing(true)
    try {
      await Promise.all([
        allCardsQuery.refetch(),
        giveCardsQuery.refetch(),
        wantCardsQuery.refetch(),
      ])
    } catch (error) {
      console.error("Failed to refresh cards data:", error)
    } finally {
      setIsManualRefreshing(false)
    }
  }

  // Silent refresh handler (without loading animation)
  const handleSilentRefresh = () => {
    // Refetch in background without awaiting to avoid loading states
    allCardsQuery.refetch()
    giveCardsQuery.refetch()
    wantCardsQuery.refetch()
  }

  // Combined loading/error states
  const getTabState = (tab: TradeMode): TabState => {
    switch (tab) {
      case "cards":
        return {
          data: displayAllCards,
          isLoading: allCardsQuery.isLoading,
          isError: allCardsQuery.isError,
          error: allCardsQuery.error,
          isRefetching: allCardsQuery.isRefetching,
        }
      case "give":
        return {
          data: displayGiveCards,
          isLoading: giveCardsQuery.isLoading,
          isError: giveCardsQuery.isError,
          error: giveCardsQuery.error,
          isRefetching: giveCardsQuery.isRefetching,
        }
      case "want":
        return {
          data: displayWantCards,
          isLoading: wantCardsQuery.isLoading,
          isError: wantCardsQuery.isError,
          error: wantCardsQuery.error,
          isRefetching: wantCardsQuery.isRefetching,
        }
    }
  }

  // Only show refresh animation for manual refreshes
  const isRefreshing = isManualRefreshing

  return {
    getTabState,
    handleRefresh,
    handleSilentRefresh,
    isRefreshing,
    user,
  }
}
