/**
 * Utility functions for deck card counting and management
 */

export interface CardCountInfo {
  count: number;
  index: number;
}

/**
 * Convert array of card IDs to unique cards with their counts
 * This ensures consistency between top grid and bottom list
 */
export function getUniqueCardsWithCount(selectedCards: string[]): Record<string, CardCountInfo> {
  return selectedCards.reduce(
    (acc, cardId) => {
      if (acc[cardId]) {
        acc[cardId].count++
      } else {
        acc[cardId] = { count: 1, index: Object.keys(acc).length }
      }
      return acc
    },
    {} as Record<string, CardCountInfo>
  )
}

/**
 * Get the count of a specific card in the selected cards array
 */
export function getCardCount(cardId: string, selectedCards: string[]): number {
  return selectedCards.filter(id => id === cardId).length
}

/**
 * Check if a card has reached its maximum copies
 */
export function isCardAtMax(cardId: string, selectedCards: string[], maxCopies: number = 2): boolean {
  return getCardCount(cardId, selectedCards) >= maxCopies
}

/**
 * Check if deck is full
 */
export function isDeckFull(selectedCards: string[], maxCards: number = 20): boolean {
  return selectedCards.length >= maxCards
}