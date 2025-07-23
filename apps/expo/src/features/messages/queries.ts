import { useQuery } from "@tanstack/react-query"

import { client } from "~/features/supabase/client"
import type { Database } from "~/features/supabase/database.types"

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]

type TradeSession = Database["public"]["Tables"]["trade_sessions"]["Row"] & {
  trade_session_card?: {
    id: string
    user_id: string | null
    card_id: string | null
    quantity: number
    cards?: {
      id: string
      name: string
      image_url: string | null
      rarity: string | null
      type: string | null
      card_type: string
    } | null
  }[]
  tradeSessionCards?: {
    id: string
    user_id: string | null
    card_id: string | null
    quantity: number
    cards?: {
      id: string
      name: string
      image_url: string | null
      rarity: string | null
      type: string | null
      card_type: string
    }
  }[]
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null

      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    },
    enabled: !!userId,
  })
}

export function useTradeSession(tradeId: string) {
  return useQuery({
    queryKey: ["tradeSession", tradeId],
    queryFn: async (): Promise<TradeSession | null> => {
      if (!tradeId) return null

      const { data, error } = await client
        .from("trade_sessions")
        .select(`
          *,
          trade_session_card (
            id,
            user_id,
            card_id,
            quantity,
            cards (
              id,
              name,
              image_url,
              rarity,
              type,
              card_type
            )
          )
        `)
        .eq("id", tradeId)
        .single()

      if (error) {
        console.error("Error fetching trade session:", error)
        return null
      }

      return {
        ...data,
        tradeSessionCards: data.trade_session_card?.map(card => ({
          ...card,
          cards: card.cards || undefined, // Convert null to undefined for type compatibility
        })), // Normalize property name
      }
    },
    enabled: !!tradeId,
    staleTime: 30000, // Cache for 30 seconds
  })
}
