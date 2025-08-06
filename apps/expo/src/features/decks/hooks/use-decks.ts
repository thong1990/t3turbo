import { useState } from "react"
import { useDecksQuery } from "../queries"
import type { DeckFilters, Filters } from "../types"

// Helper function to check if any card filters are active
function hasActiveCardFilters(filters: Filters): boolean {
  return (
    (filters.cardType && filters.cardType.length > 0) ||
    (filters.elements && filters.elements.length > 0) ||
    (filters.rarity && filters.rarity.length > 0) ||
    (filters.pack && filters.pack.length > 0)
  )
}

export function useDecks(
  filters?: DeckFilters & { searchQuery?: string; cardFilters?: Filters },
  enabled = true
) {
  const query = useDecksQuery(filters, enabled)

  return {
    ...query,
    data: query.data?.map(deck => {
      const { deck_cards, user_profiles, ...deckData } = deck
      return {
        ...deckData,
        cards: (deck_cards || []).map(deckCard => ({
          id: deckCard.card_id,
          count: deckCard.quantity,
          image: deckCard.cards?.image_url,
          name: deckCard.cards?.name,
          type: deckCard.cards?.type,
          rarity: deckCard.cards?.rarity,
          cardType: deckCard.cards?.card_type,
        })),
        author: user_profiles?.display_name || "Unknown",
      }
    }),
  }
}

// Hook for deck filtering UI - provides filter state management
export function useDecksWithFilters() {
  const [filters, setFiltersState] = useState({
    cardType: [] as string[],
    rarity: [] as string[],
    elements: [] as string[],
    pack: [] as string[],
  })

  const setFilters = (newFilters: typeof filters) => {
    setFiltersState(newFilters)
  }

  const resetFilters = () => {
    setFiltersState({
      cardType: [],
      rarity: [],
      elements: [],
      pack: [],
    })
  }

  const handleToggleItem = (key: string, value: string) => {
    setFiltersState(prev => {
      const currentValues = prev[key as keyof typeof prev] || []
      const isSelected = currentValues.includes(value)
      
      return {
        ...prev,
        [key]: isSelected
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      }
    })
  }

  return {
    filters,
    setFilters,
    resetFilters,
    handleToggleItem,
  }
}
