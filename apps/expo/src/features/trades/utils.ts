import type { Card, TradeableRarity } from "./types"
import { TRADEABLE_RARITIES } from "./types"

export { TRADEABLE_RARITIES }

export function isTradeableRarity(rarity: string): rarity is TradeableRarity {
  return TRADEABLE_RARITIES.includes(rarity as TradeableRarity)
}

export function canTradeCards(card1: Card, card2: Card): boolean {
  return (
    isTradeableRarity(card1.rarity) &&
    isTradeableRarity(card2.rarity) &&
    card1.rarity === card2.rarity
  )
}

export function getRarityDisplayName(rarity: TradeableRarity): string {
  switch (rarity) {
    case "◊":
      return "1 Diamond"
    case "◊◊":
      return "2 Diamond"
    case "◊◊◊":
      return "3 Diamond"
    case "◊◊◊◊":
      return "4 Diamond"
    case "☆":
      return "1 Star"
    default:
      return rarity
  }
}

export function calculateMatchScore(
  cardsIWant: Card[],
  cardsIGive: Card[]
): number {
  // Simple scoring algorithm - can be enhanced later
  const baseScore = Math.min(cardsIWant.length, cardsIGive.length) * 10
  const balanceBonus =
    Math.abs(cardsIWant.length - cardsIGive.length) <= 1 ? 5 : 0
  return baseScore + balanceBonus
}

// Filter trade matches based on search query and filters
export function filterTradeMatches(
  matches: import("./types").TradeMatch[],
  searchQuery: string,
  filters: {
    cardType: string[]
    rarity: string[]
    elements: string[]
    sets: string[]
  }
): import("./types").TradeMatch[] {
  const filtered = matches.filter(match => {
    // Debug: Log sample card data for the first match
    if (matches.length > 0 && match === matches[0]) {
    }

    // Search by partner name or card names
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const partnerNameMatch = match.partnerName.toLowerCase().includes(query)
      const partnerIGNMatch = match.partnerGameIGN
        ?.toLowerCase()
        .includes(query)

      const cardNameMatch = [...match.cardsIGive, ...match.cardsIWant].some(
        card => card.name.toLowerCase().includes(query)
      )

      if (!partnerNameMatch && !partnerIGNMatch && !cardNameMatch) {
        return false
      }
    }

    // Filter by card type (using card_type field)
    if (filters.cardType.length > 0) {
      const hasMatchingType = [...match.cardsIGive, ...match.cardsIWant].some(
        card =>
          filters.cardType.includes(card.card_type || "") ||
          filters.cardType.includes(card.type || "")
      )

      if (!hasMatchingType) {
        return false
      }
    }

    // Filter by rarity
    if (filters.rarity.length > 0 && !filters.rarity.includes(match.rarity)) {
      return false
    }

    // Filter by elements (using type field for Pokemon elements)
    if (filters.elements.length > 0) {
      const hasMatchingElement = [
        ...match.cardsIGive,
        ...match.cardsIWant,
      ].some(card => {
        // For Pokemon cards, the type field contains the element
        const cardElement = card.type?.toLowerCase() || ""
        return filters.elements.some(element =>
          cardElement.includes(element.toLowerCase())
        )
      })

      if (!hasMatchingElement) {
        return false
      }
    }

    // Filter by sets (using pack_type field)
    if (filters.sets.length > 0) {
      const hasMatchingSet = [...match.cardsIGive, ...match.cardsIWant].some(
        card => filters.sets.includes(card.pack_type || "")
      )

      if (!hasMatchingSet) {
        return false
      }
    }

    return true
  })

  return filtered
}
