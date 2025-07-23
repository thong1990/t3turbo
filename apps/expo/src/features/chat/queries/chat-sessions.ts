import { useQuery } from "@tanstack/react-query"

import { client } from "~/features/supabase/client"
import { MOCK_CONFIG } from "../constants"
import type { ChatSession } from "../types"
import { isMockTrade } from "../utils"

export function useChatSessions(userId: string) {
  return useQuery({
    queryKey: ["chatSessions", userId],
    queryFn: async (): Promise<ChatSession[]> => {
      const { data, error } = await client
        .from("chat_sessions")
        .select(`*, trade_sessions(
          id, status, initiator_id, receiver_id, created_at, updated_at,
          trade_session_card(
            id, user_id, card_id, quantity,
            cards(id, name, image_url, rarity)
          )
        )`)
        .contains("participants", [userId])
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) throw error

      return data.map(transformChatSessionData)
    },
    enabled: !!userId,
  })
}

export function useChatSession(tradeId: string) {
  return useQuery({
    queryKey: ["chatSession", tradeId],
    queryFn: async (): Promise<ChatSession | null> => {
      if (isMockTrade(tradeId)) {
        return createMockChatSession(tradeId)
      }

      try {
        const { data: chatSessions, error } = await client
          .from("chat_sessions")
          .select(
            `*, trade_sessions(
              id, status, initiator_id, receiver_id, created_at, updated_at, sendbird_channel_url,
              trade_session_card(
                id, user_id, card_id, quantity,
                cards(id, name, image_url, rarity)
              )
            )`
          )
          .eq("trade_id", tradeId)
          .order("created_at", { ascending: false })

        if (error && error.code !== "PGRST116") {
          console.error("❌ Database error in useChatSession:", error)
          throw error
        }

        if (!chatSessions?.length) {
          return handleMissingChatSession(tradeId)
        }

        const bestSession = selectBestChatSession(chatSessions)
        const result = transformDetailedChatSessionData(bestSession)

        return result
      } catch (error) {
        console.error("❌ Error loading chat session:", error)
        // Don't return null immediately - try to handle missing session
        try {
          return await handleMissingChatSession(tradeId)
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError)
          return null
        }
      }
    },
    enabled: !!tradeId,
    staleTime: 10000,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: 1000,
  })
}

// Helper functions
function transformChatSessionData(session: any): ChatSession {
  return {
    id: session.id,
    tradeId: session.trade_id,
    channelUrl: session.channel_url,
    participants: session.participants,
    createdAt: new Date(session.created_at),
    expiresAt: new Date(session.expires_at),
    status: session.status,
    tradeSession: session.trade_sessions
      ? transformTradeSessionData(session.trade_sessions)
      : undefined,
  }
}

function transformTradeSessionData(
  tradeSession: any
): ChatSession["tradeSession"] {
  if (!tradeSession) return undefined

  return {
    id: tradeSession.id,
    status: tradeSession.status,
    initiatorId: tradeSession.initiator_id, // Convert snake_case to camelCase
    receiverId: tradeSession.receiver_id, // Convert snake_case to camelCase
    createdAt: tradeSession.created_at,
    updatedAt: tradeSession.updated_at,
    sendbirdChannelUrl: tradeSession.sendbird_channel_url,
    tradeSessionCards: tradeSession.trade_session_card, // Convert to correct property name
  }
}

function createMockChatSession(tradeId: string): ChatSession {
  return {
    id: `mock-session-${tradeId}`,
    tradeId,
    channelUrl: `${MOCK_CONFIG.CHANNEL_PREFIX}${tradeId}`,
    participants: ["current-user", "mock-partner"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23),
    status: "active",
    tradeSession: {
      id: tradeId,
      status: "active",
      initiatorId: "current-user",
      receiverId: "mock-partner",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date().toISOString(),
      sendbirdChannelUrl: undefined,
      // Add mock cards to show your trade design
      tradeSessionCards: [
        {
          id: "mock-card-1",
          user_id: "current-user",
          card_id: "charizard-1",
          quantity: 1,
          cards: {
            id: "charizard-1",
            name: "Charizard",
            image_url: "https://images.pokemontcg.io/base1/4_hires.png",
            rarity: "Rare Holo",
          },
        },
        {
          id: "mock-card-2",
          user_id: "current-user",
          card_id: "blastoise-1",
          quantity: 2,
          cards: {
            id: "blastoise-1",
            name: "Blastoise",
            image_url: "https://images.pokemontcg.io/base1/2_hires.png",
            rarity: "Rare Holo",
          },
        },
        {
          id: "mock-card-3",
          user_id: "mock-partner",
          card_id: "pikachu-1",
          quantity: 1,
          cards: {
            id: "pikachu-1",
            name: "Pikachu",
            image_url: "https://images.pokemontcg.io/base1/58_hires.png",
            rarity: "Common",
          },
        },
        {
          id: "mock-card-4",
          user_id: "mock-partner",
          card_id: "venusaur-1",
          quantity: 1,
          cards: {
            id: "venusaur-1",
            name: "Venusaur",
            image_url: "https://images.pokemontcg.io/base1/15_hires.png",
            rarity: "Rare Holo",
          },
        },
      ],
    },
  }
}

async function handleMissingChatSession(
  tradeId: string
): Promise<ChatSession | null> {
  const { data: tradeData, error } = await client
    .from("trade_sessions")
    .select("id, initiator_id, receiver_id, sendbird_channel_url")
    .eq("id", tradeId)
    .single()

  if (error || !tradeData) {
    return null
  }

  return {
    id: `pending-${tradeId}`,
    tradeId,
    channelUrl: "",
    participants: [tradeData.initiator_id, tradeData.receiver_id],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    status: "active",
    tradeSession: {
      id: tradeId,
      status: "pending_acceptance",
      initiatorId: tradeData.initiator_id,
      receiverId: tradeData.receiver_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sendbirdChannelUrl: tradeData.sendbird_channel_url,
    },
  }
}

function selectBestChatSession(chatSessions: any[]) {
  return (
    chatSessions.find(
      session =>
        session.channel_url &&
        !session.channel_url.startsWith("trade-") &&
        session.channel_url.startsWith("sendbird_")
    ) || chatSessions[0]
  )
}

function transformDetailedChatSessionData(data: any): ChatSession {
  const tradeSessionData = data.trade_sessions as {
    sendbird_channel_url?: string
  } | null
  const channelUrl = tradeSessionData?.sendbird_channel_url || data.channel_url

  const isPlaceholderChannel =
    channelUrl?.startsWith("trade-") &&
    !data.trade_sessions?.sendbird_channel_url

  if (isPlaceholderChannel) {
    return { ...transformChatSessionData(data), channelUrl: "" }
  }

  return { ...transformChatSessionData(data), channelUrl }
}
