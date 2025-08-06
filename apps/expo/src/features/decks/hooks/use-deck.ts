import { useDeckQuery } from "../queries"

export function useDeck(deckId: string, enabled = true) {
  const query = useDeckQuery(deckId, enabled)

  return {
    ...query,
    data: query.data
      ? (() => {
          const { deck_cards, user_profiles, ...deckData } = query.data
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
        })()
      : undefined,
  }
}
