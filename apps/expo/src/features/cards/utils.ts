import type { Card } from "./types"

/**
 * Formats a card's name for display, handling special cases and truncation
 */
export function formatCardName(card: Card, maxLength?: number): string {
  const name = card.name || "Unknown Card"

  if (maxLength && name.length > maxLength) {
    return `${name.substring(0, maxLength - 3)}...`
  }

  return name
}

/**
 * Gets a card's display image URL with fallback handling
 */
export function getCardImageUrl(card: Card): string | undefined {
  return card.image_url ?? undefined
}

/**
 * Checks if a card has user interaction data
 */
export function hasUserInteraction(card: Card): boolean {
  return Array.isArray(card.user_cards) && card.user_cards.length > 0
}

/**
 * Gets user card quantities for display
 */
export function getUserCardQuantities(card: Card) {
  const userCard = Array.isArray(card.user_cards)
    ? card.user_cards[0]
    : undefined

  return {
    owned: userCard?.quantity_owned ?? 0,
    tradeable: userCard?.quantity_tradeable ?? 0,
    desired: userCard?.quantity_desired ?? 0,
  }
}
