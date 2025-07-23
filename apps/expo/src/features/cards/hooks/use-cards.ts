import { useMemo } from "react"
import { useCardsQuery } from "../queries"
import type { Card, CardFilters } from "../types"

interface UseCardsParams {
  filters: CardFilters
  searchQuery?: string
  userId?: string
  enabled?: boolean
}

interface UseCardsReturn {
  cards: Card[]
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export function useCards({
  filters,
  searchQuery,
  userId,
  enabled = true,
}: UseCardsParams): UseCardsReturn {
  const {
    data: cards,
    isLoading: isLoadingCards,
    error: cardsError,
  } = useCardsQuery({
    filters,
    searchQuery,
    userId,
    enabled,
  })

  // Create enriched cards with status information
  const enrichedCards = useMemo((): Card[] => {
    if (!cards) return []

    return cards.map(card => ({
      ...card,
    }))
  }, [cards])

  return {
    cards: enrichedCards,
    isLoading: isLoadingCards,
    isError: !!cardsError,
    error: cardsError as Error | null,
  }
}
