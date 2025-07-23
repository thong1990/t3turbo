import {
  useInsertMutation,
  useUpdateMutation,
} from "@supabase-cache-helpers/postgrest-react-query"

import { createTradeChannel } from "~/features/chat/services/channel-management"
import { client } from "~/features/supabase/client"
import type { TradeMatch } from "./types"

// Create trade session mutation
export function useCreateTradeSessionMutation() {
  return useInsertMutation(client.from("trade_sessions"), ["id"], null, {
    onSuccess: () => {
      // Invalidate trade matches to refresh the list
      // This will be handled by the hook that uses this mutation
    },
  })
}

// Accept trade session mutation
export function useAcceptTradeSessionMutation() {
  return useUpdateMutation(client.from("trade_sessions"), ["id"], null, {
    onSuccess: () => {
      // Cache invalidation handled automatically
    },
  })
}

// Reject trade session mutation
export function useRejectTradeSessionMutation() {
  return useUpdateMutation(client.from("trade_sessions"), ["id"], null, {
    onSuccess: () => {
      // Cache invalidation handled automatically
    },
  })
}

// Cancel trade session mutation
export function useCancelTradeSessionMutation() {
  return useUpdateMutation(client.from("trade_sessions"), ["id"], null, {
    onSuccess: () => {
      // Cache invalidation handled automatically
    },
  })
}

// Complex trade session creation function
export async function createTradeSession(
  match: TradeMatch,
  currentUserId: string
) {
  try {
    // Create the trade session
    const { data: tradeSession, error: sessionError } = await client
      .from("trade_sessions")
      .insert({
        initiator_id: currentUserId,
        receiver_id: match.partnerId,
        status: "pending_acceptance",
        expired_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days from now
      })
      .select()
      .single()

    if (sessionError) {
      console.error("❌ Trade session creation error:", sessionError)
      throw sessionError
    }

    // Add cards to the trade session
    const tradeCards = [
      // Cards I'm offering (they want)
      ...match.cardsIGive.map(card => ({
        trade_session_id: tradeSession.id,
        user_id: currentUserId,
        card_id: card.id,
        quantity: 1,
      })),
      // Cards I want (they're offering)
      ...match.cardsIWant.map(card => ({
        trade_session_id: tradeSession.id,
        user_id: match.partnerId,
        card_id: card.id,
        quantity: 1,
      })),
    ]

    const { error: cardsError } = await client
      .from("trade_session_card")
      .insert(tradeCards)

    if (cardsError) {
      console.error("❌ Trade cards insertion error:", cardsError)
      throw cardsError
    }

    // Create SendBird channel immediately

    try {
      const channelUrl = await createTradeChannel(
        tradeSession.id,
        currentUserId,
        match.partnerId
      )

      // Update trade session with channel URL
      const { error: updateError } = await client
        .from("trade_sessions")
        .update({ sendbird_channel_url: channelUrl })
        .eq("id", tradeSession.id)

      if (updateError) {
        console.warn(
          "⚠️ Failed to update trade session with channel URL:",
          updateError
        )
      }

      // Create chat session record
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours from now

      const { data: chatSession, error: chatError } = await client
        .from("chat_sessions")
        .insert({
          trade_id: tradeSession.id,
          channel_url: channelUrl, // Use the actual SendBird channel URL
          participants: [currentUserId, match.partnerId],
          expires_at: expiresAt.toISOString(),
          status: "active",
        })
        .select()
        .single()

      if (chatError) {
        console.warn("⚠️ Failed to create chat session:", chatError)
        // Don't throw error - trade session is still valid without chat session record
      } else {
      }

      // Return trade session with channel URL
      return {
        ...tradeSession,
        sendbird_channel_url: channelUrl,
      }
    } catch (channelError) {
      console.error("❌ Failed to create SendBird channel:", channelError)

      // Still return the trade session - channel will be created on first access
      return tradeSession
    }
  } catch (error) {
    console.error("❌ Error creating trade session:", error)
    console.error("❌ Error details:", JSON.stringify(error, null, 2))
    throw error
  }
}
