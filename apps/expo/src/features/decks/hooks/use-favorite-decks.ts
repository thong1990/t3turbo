import { useFavoriteDecksQuery } from "../queries"
import type { Filters } from "../types"

// Helper function to check if deck matches card filters
function deckMatchesCardFilters(deck: any, cardFilters: Filters): boolean {
  if (!deck.deck_cards || deck.deck_cards.length === 0) return false;
  
  const deckCards = deck.deck_cards.map((dc: any) => dc.cards).filter(Boolean);
  if (deckCards.length === 0) return false;

  // Check if any cards in the deck match the filters
  return deckCards.some((card: any) => {
    // Check card type filter
    if (cardFilters.cardType && cardFilters.cardType.length > 0) {
      if (!cardFilters.cardType.includes(card.card_type)) return false;
    }
    
    // Check rarity filter
    if (cardFilters.rarity && cardFilters.rarity.length > 0) {
      if (!cardFilters.rarity.includes(card.rarity)) return false;
    }
    
    // Check elements filter (type column contains element)
    if (cardFilters.elements && cardFilters.elements.length > 0) {
      if (!cardFilters.elements.includes(card.type)) return false;
    }
    
    // Check pack filter
    if (cardFilters.pack && cardFilters.pack.length > 0) {
      if (!cardFilters.pack.includes(card.pack_type)) return false;
    }
    
    return true;
  });
}

export function useFavoriteDecks(
  userId: string, 
  filters?: { searchQuery?: string; cardFilters?: Filters },
  enabled = true
) {
  const query = useFavoriteDecksQuery(userId, filters, enabled)

  return {
    ...query,
    data: query.data?.map(interaction => {
      if (!interaction.decks) return null
      const { deck_cards, user_profiles, ...deckData } = interaction.decks
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
    }).filter(deck => {
      if (!deck) return false
      // Apply card filters if present
      if (filters?.cardFilters) {
        return deckMatchesCardFilters(deck, filters.cardFilters);
      }
      return true;
    }),
  }
}
