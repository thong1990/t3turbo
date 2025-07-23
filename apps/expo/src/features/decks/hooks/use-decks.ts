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
    data: query.data?.map(deck => ({
      ...deck,
      cards: (deck.deck_cards || []).map(deckCard => ({
        id: deckCard.card_id,
        count: deckCard.quantity,
        image: deckCard.cards?.image_url,
        name: deckCard.cards?.name,
        type: deckCard.cards?.type,
      })),
      author: deck.user_profiles?.display_name || "Unknown",
    })),
  }
}

// Hook for deck filtering UI - provides filter state management
export function useDecksWithFilters() {
  // Basic implementation for filter state management
  // This would typically include useState for managing filter state
  const filters = {
    cardType: [] as string[],
    rarity: [] as string[],
    elements: [] as string[],
    pack: [] as string[],
  }

  const setFilters = () => {}
  const resetFilters = () => {}
  const handleToggleItem = () => {}

  return {
    filters,
    setFilters,
    resetFilters,
    handleToggleItem,
  }
}
