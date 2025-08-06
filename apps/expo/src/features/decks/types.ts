import type { Database } from "../supabase/database.types"

// Deck filters for querying
export type DeckFilters = {
  name?: string
  userId?: string
  isPublic?: boolean
  favoriteUserId?: string
}

// Card in deck with UI properties
export type CardInDeck = {
  id: string
  count: number
  image?: string | null
  name?: string | null
  type?: string | null
  rarity?: string | null
  cardType?: string | null
}

// User deck interaction types
export type DeckInteractionType = "upvote" | "favorite" | "share"

// This is what the queries return after transformation
export type Deck = Omit<Database["public"]["Tables"]["decks"]["Row"], "deck_cards" | "user_profiles"> & {
  author: string
  cards: CardInDeck[]
}

// Type for deck data as returned from detailed queries (with deck_cards)
export type DeckWithCards = Database["public"]["Tables"]["decks"]["Row"] & {
  user_profiles: { display_name: string } | null
  deck_cards: {
    card_id: string
    quantity: number
    cards: {
      id: string
      name: string
      image_url: string | null
      type: string | null
      rarity: string | null
      card_type: string
    }
  }[]
}

export type DeckCard = Database["public"]["Tables"]["deck_cards"]["Row"] & {
  cards: Database["public"]["Tables"]["cards"]["Row"]
}

// User deck interaction
export type UserDeckInteraction =
  Database["public"]["Tables"]["user_deck_interactions"]["Row"]

// Add this filter interface
export interface Filters {
  name?: string
  cardType: string[]
  elements: string[]
  rarity: string[]
  pack: string[]
}
