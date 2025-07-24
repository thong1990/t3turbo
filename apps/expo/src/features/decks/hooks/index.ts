// Export actual hooks
export { useDeck } from "./use-deck"
export { useDeckCrud } from "./use-deck-crud"
export { useDeckInteractions } from "./use-deck-interactions"
export { useDecks } from "./use-decks"
export { useFavoriteDecks } from "./use-favorite-decks"
export { useUserDecks } from "./use-user-decks"

// Legacy exports for backward compatibility
export const useDecksWithFilters = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  }
}

export const useUserDecksQuery = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  }
}