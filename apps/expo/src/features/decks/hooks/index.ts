// Export actual hooks
export { useDeck } from "./use-deck"
export { useDeckCrud } from "./use-deck-crud"
export { useDeckInteractions } from "./use-deck-interactions"
export { useDecks, useDecksWithFilters } from "./use-decks"
export { useFavoriteDecks } from "./use-favorite-decks"
export { useUserDecks } from "./use-user-decks"

// Legacy exports for backward compatibility

export const useUserDecksQuery = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  }
}