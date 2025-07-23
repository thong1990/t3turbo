import { useQuery } from "@supabase-cache-helpers/postgrest-react-query"
import { client } from "~/features/supabase/client"
import type { CardFilters } from "./types"

type CardQueryMode = "all" | "give" | "want"

export function useCardsQuery({
  filters,
  searchQuery,
  userId,
  mode = "all",
  enabled = true,
}: {
  filters: CardFilters
  searchQuery?: string
  userId?: string
  mode?: CardQueryMode
  enabled?: boolean
}) {
  // Build initial query based on mode
  let query

  if (userId && mode === "give") {
    query = client
      .from("cards")
      .select("*, user_cards!inner(*)", { count: "exact" })
      .eq("user_cards.user_id", userId)
      .gt("user_cards.quantity_tradeable", 0)
  } else if (userId && mode === "want") {
    query = client
      .from("cards")
      .select("*, user_cards!inner(*)", { count: "exact" })
      .eq("user_cards.user_id", userId)
      .gt("user_cards.quantity_desired", 0)
  } else {
    // All cards mode
    query = client
      .from("cards")
      .select("*, user_cards!left(*)", { count: "exact" })

    if (userId) {
      query = query.eq("user_cards.user_id", userId)
    }
  }

  // Apply card type filters
  if (filters.cardType.length) {
    const orConditions = []
    for (const type of filters.cardType) {
      const lowerType = type.toLowerCase()
      orConditions.push(
        `card_type.ilike.%${type}%`,
        `card_type_1.ilike.%${lowerType}%`,
        `card_type_2.ilike.%${lowerType}%`
      )
    }
    query = query.or(orConditions.join(","))
  }

  // Apply other filters
  if (filters.rarity.length) {
    query = query.in("rarity", filters.rarity)
  }
  if (filters.elements.length) {
    query = query.in("type", filters.elements)
  }
  if (filters.pack.length) {
    query = query.in("pack_type", filters.pack)
  }

  // Apply user interaction filters (only for all cards mode)
  if (filters.userInteractions.length && userId && mode === "all") {
    const orConditions = filters.userInteractions
      .map(interaction => {
        switch (interaction) {
          case "owned":
            return "user_cards.quantity_owned.gt.0"
          case "desired":
            return "user_cards.quantity_desired.gt.0"
          case "tradable":
            return "user_cards.is_tradable.eq.true"
          default:
            return ""
        }
      })
      .filter(Boolean)

    if (orConditions.length > 0) {
      query = query.or(`(${orConditions.join(",")})`, {
        foreignTable: "user_cards",
      })
    }
  }

  // Apply search query
  if (searchQuery?.trim()) {
    query = query.ilike("name", `%${searchQuery.trim()}%`)
  }

  return useQuery(query, { enabled })
}

export function useCardQuery(
  { id, userId }: { id: string; userId?: string },
  enabled = true
) {
  let query = client.from("cards").select("*, user_cards!left(*)").eq("id", id)

  if (userId) {
    query = query.eq("user_cards.user_id", userId)
  }

  return useQuery(query.single(), { enabled })
}

export function useUserCardQuery(
  { cardId, userId }: { cardId: string; userId: string },
  enabled = true
) {
  const query = client
    .from("user_cards")
    .select("*")
    .eq("card_id", cardId)
    .eq("user_id", userId)

  return useQuery(query.maybeSingle(), { enabled })
}

// Legacy queries for backward compatibility
export function useGiveCardsQuery({
  filters,
  searchQuery,
  userId,
  enabled = true,
}: {
  filters: CardFilters
  searchQuery?: string
  userId?: string
  enabled?: boolean
}) {
  return useCardsQuery({
    filters,
    searchQuery,
    userId,
    mode: "give",
    enabled,
  })
}

export function useWantCardsQuery({
  filters,
  searchQuery,
  userId,
  enabled = true,
}: {
  filters: CardFilters
  searchQuery?: string
  userId?: string
  enabled?: boolean
}) {
  return useCardsQuery({
    filters,
    searchQuery,
    userId,
    mode: "want",
    enabled,
  })
}
