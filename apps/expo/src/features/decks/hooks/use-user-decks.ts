import { useUserDecksQuery } from "../queries"

export function useUserDecks(userId: string, enabled = true) {
  const query = useUserDecksQuery(userId, enabled)

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
