import { useQuery } from "@supabase-cache-helpers/postgrest-react-query"

import { client } from "~/features/supabase/client"
import type { DeckFilters, Filters } from "./types"

export function useDecksQuery(
  filters?: DeckFilters & { searchQuery?: string; cardFilters?: Filters },
  enabled = true
) {
  const query = client.from("decks").select(`
      *,
      user_profiles (
        display_name
      ),
      deck_cards (
        card_id,
        quantity,
        cards (
          id,
          name,
          image_url,
          card_type,
          rarity,
          type,
          pack_type
        )
      )
    `)

  if (filters?.isPublic !== undefined) {
    query.eq("is_public", filters.isPublic)
  }

  if (filters?.userId) {
    query.eq("user_id", filters.userId)
  }

  if (filters?.name || filters?.searchQuery) {
    const searchTerm = filters.name || filters.searchQuery
    query.ilike("name", `%${searchTerm}%`)
  }

  query.order("created_at", { ascending: false })

  return useQuery(query, { enabled })
}

export function useDeckQuery(deckId: string, enabled = true) {
  return useQuery(
    client
      .from("decks")
      .select(`
        *,
        user_profiles (
          display_name
        ),
        deck_cards (
          card_id,
          quantity,
          cards (
            id,
            name,
            image_url,
            type,
            rarity,
            card_type
          )
        )
      `)
      .eq("id", deckId)
      .single(),
    {
      enabled: enabled && !!deckId,
    }
  )
}

export function useUserDecksQuery(
  userId: string, 
  filters?: { searchQuery?: string; cardFilters?: Filters },
  enabled = true
) {
  const query = client
    .from("decks")
    .select(`
      *,
      user_profiles (
        display_name
      ),
      deck_cards (
        card_id,
        quantity,
        cards (
          id,
          name,
          image_url,
          card_type,
          rarity,
          type,
          pack_type
        )
      )
    `)
    .eq("user_id", userId)

  if (filters?.searchQuery) {
    query.ilike("name", `%${filters.searchQuery}%`)
  }

  query.order("created_at", { ascending: false })

  return useQuery(query, {
    enabled: enabled && !!userId,
  })
}

export function useFavoriteDecksQuery(
  userId: string, 
  filters?: { searchQuery?: string; cardFilters?: Filters },
  enabled = true
) {
  const query = client
    .from("user_deck_interactions")
    .select(`
      deck_id,
      decks (
        *,
        user_profiles (
          display_name
        ),
        deck_cards (
          card_id,
          quantity,
          cards (
            id,
            name,
            image_url,
            type
          )
        )
      )
    `)
    .eq("user_id", userId)
    .eq("interaction_type", "favorite")

  if (filters?.searchQuery) {
    query.ilike("decks.name", `%${filters.searchQuery}%`)
  }

  query.order("created_at", { ascending: false })

  return useQuery(query, {
    enabled: enabled && !!userId,
  })
}

export function useDeckInteractionStatusQuery(
  deckId: string,
  userId: string,
  interactionType: "upvote" | "favorite" | "share",
  enabled = true
) {
  return useQuery(
    client
      .from("user_deck_interactions")
      .select("id")
      .eq("deck_id", deckId)
      .eq("user_id", userId)
      .eq("interaction_type", interactionType)
      .maybeSingle(),
    {
      enabled: enabled && !!deckId && !!userId,
    }
  )
}

export function useDeckInteractionCountsQuery(deckId: string, enabled = true) {
  return useQuery(
    client
      .from("user_deck_interactions")
      .select("interaction_type")
      .eq("deck_id", deckId),
    {
      enabled: enabled && !!deckId,
    }
  )
}
