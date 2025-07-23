import { useFavoriteDecksQuery } from "../queries"

export function useFavoriteDecks(userId: string, enabled = true) {
  const query = useFavoriteDecksQuery(userId, enabled)

  return {
    ...query,
    data: query.data?.map(interaction => ({
      ...interaction.decks,
      cards: (interaction.decks?.deck_cards || []).map(deckCard => ({
        id: deckCard.card_id,
        count: deckCard.quantity,
        image: deckCard.cards?.image_url,
        name: deckCard.cards?.name,
        type: deckCard.cards?.type,
      })),
      author: interaction.decks?.user_profiles?.display_name || "Unknown",
    })),
  }
}
