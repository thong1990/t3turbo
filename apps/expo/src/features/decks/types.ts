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
  image?: string
  name?: string
  type?: string
}

// User deck interaction types
export type DeckInteractionType = "upvote" | "favorite" | "share"

// This is what the queries return after transformation
export type Deck = Database["public"]["Tables"]["decks"]["Row"] & {
  author: string
  cards: CardInDeck[]
}

export type DeckCard = Database["public"]["Tables"]["deck_cards"]["Row"] & {
  cards: Database["public"]["Tables"]["cards"]["Row"]
}

// User deck interaction
export type UserDeckInteraction =
  Database["public"]["Tables"]["user_deck_interactions"]["Row"]

// Add this filter interface
export interface Filters {
  name: string
  cardType: string[]
  elements: string[]
  rarity: string[]
  pack: string[]
}
