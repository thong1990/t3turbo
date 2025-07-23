import { useQueryClient } from "@tanstack/react-query"
import * as Clipboard from "expo-clipboard"
import { useState } from "react"
import { toast } from "sonner-native"

import type { Database } from "~/features/supabase/database.types"
import { useUser } from "~/features/supabase/hooks"
import { useSendMessage, useUpdateTradeSession } from "../mutations"
import { useUserProfile } from "../queries"

type TradeCard = Database["public"]["Tables"]["trade_session_card"]["Row"] & {
  cards?: Database["public"]["Tables"]["cards"]["Row"]
}

type TradeSession = Database["public"]["Tables"]["trade_sessions"]["Row"] & {
  trade_session_card?: TradeCard[]
  tradeSessionCards?: TradeCard[]
}

export function useTradeContext(
  tradeSession: TradeSession | null | undefined,
  chatChannelUrl?: string
) {
  const { data: user } = useUser()
  const { data: currentUserProfile } = useUserProfile(user?.id || "")
  const sendMessage = useSendMessage()
  const updateTradeSession = useUpdateTradeSession()
  const queryClient = useQueryClient()
  const currentUserId = user?.id
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

  const currentUserGameName =
    currentUserProfile?.game_account_ign ||
    currentUserProfile?.display_name ||
    "You"

  // Determine partner user ID from trade session
  const partnerUserId = tradeSession
    ? tradeSession.initiator_id === currentUserId
      ? tradeSession.receiver_id
      : tradeSession.initiator_id
    : null

  // Fetch partner's profile to get their game name
  const { data: partnerProfile } = useUserProfile(partnerUserId || "")

  const partnerGameName =
    partnerProfile?.game_account_ign ||
    partnerProfile?.display_name ||
    "Partner"

  // Handle null/undefined tradeSession gracefully
  const allTradeCards = tradeSession
    ? tradeSession.tradeSessionCards || tradeSession.trade_session_card || []
    : []

  // Filter out cards with null user_id for safety
  const tradeCards = allTradeCards.filter(card => card.user_id !== null)

  const myCards = tradeCards.filter(
    (card: TradeCard) => card.user_id === currentUserId
  )

  const partnerCards = tradeCards.filter(
    (card: TradeCard) => card.user_id !== currentUserId
  )

  function toggleCardSelection(cardId: string) {
    setSelectedCards(prev => {
      const newSelection = new Set(prev)
      const isMyCard = myCards.some(card => card.id === cardId)
      const isPartnerCard = partnerCards.some(card => card.id === cardId)

      if (newSelection.has(cardId)) {
        newSelection.delete(cardId)
      } else if (isMyCard) {
        for (const card of myCards) {
          if (newSelection.has(card.id)) {
            newSelection.delete(card.id)
          }
        }
        newSelection.add(cardId)
      } else if (isPartnerCard) {
        for (const card of partnerCards) {
          if (newSelection.has(card.id)) {
            newSelection.delete(card.id)
          }
        }
        newSelection.add(cardId)
      }

      return newSelection
    })
  }

  function getChannelUrl(): string {
    return tradeSession?.sendbird_channel_url || chatChannelUrl || ""
  }

  async function sendCardExchange() {
    if (selectedCards.size === 0) return

    const channelUrl = getChannelUrl()
    if (!channelUrl) {
      toast.error(
        "Chat channel not ready. Please refresh the trade and try again."
      )
      return
    }

    try {
      const allCards = [...myCards, ...partnerCards]
      const selectedCardDetails = allCards.filter(card =>
        selectedCards.has(card.id)
      )

      const cardNames = selectedCardDetails
        .map(card => card.cards?.name || "Unknown Card")
        .join(", ")
      const exchangeMessage = `📋 Card Exchange Request: ${cardNames}`

      const cardExchangeData = {
        type: "card_exchange",
        cardCount: selectedCardDetails.length,
        tradeId: tradeSession?.id || "",
        cards: selectedCardDetails.map(card => ({
          id: card.id,
          cardId: card.card_id,
          name: card.cards?.name || "Unknown",
          imageUrl: card.cards?.image_url || "",
          rarity: card.cards?.rarity || "",
          quantity: card.quantity,
          userId: card.user_id,
        })),
        users: {
          currentUserId: currentUserId || "",
          currentUserName: currentUserGameName,
          partnerUserId: partnerUserId || "",
          partnerUserName: partnerGameName,
        },
      }

      await sendMessage.mutateAsync({
        channelUrl,
        message: exchangeMessage,
        customType: "card_exchange",
        data: JSON.stringify(cardExchangeData),
        currentUserId: currentUserId || "",
      })

      setSelectedCards(new Set())
    } catch (error) {
      console.error("❌ Failed to send card exchange message:", error)
      toast.error("Failed to send card exchange")
    }
  }

  async function completeTrade() {
    if (!tradeSession?.id) {
      toast.error("No active trade session found")
      return
    }

    const channelUrl = getChannelUrl()
    if (!channelUrl) {
      toast.error(
        "Chat channel not ready. Please refresh the trade and try again."
      )
      return
    }

    try {
      // 1. Update trade session status to completed
      await updateTradeSession.mutateAsync({
        tradeId: tradeSession.id,
        status: "completed",
      })

      // 2. Send system message to chat
      await sendMessage.mutateAsync({
        channelUrl,
        message: "Trade completed successfully! 🎉",
        customType: "system",
        data: JSON.stringify({
          action: "trade_completed",
          tradeId: tradeSession.id,
        }),
        currentUserId: currentUserId || "",
      })

      // 3. Invalidate queries for real-time updates
      queryClient.invalidateQueries({
        queryKey: ["tradeSession", tradeSession.id],
      })

      toast.success("Trade completed successfully!")
    } catch (error) {
      console.error("❌ Failed to complete trade:", error)
      toast.error("Failed to complete trade")
    }
  }

  async function copyGameId() {
    try {
      // Copy the actual game ID (game_account_id), not the game name (game_account_ign)
      const gameId = currentUserProfile?.game_account_id || user?.id || ""
      if (!gameId) {
        toast.error("No game ID found")
        return
      }

      await Clipboard.setStringAsync(gameId)
      toast.success("Game ID copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy game ID:", error)
      toast.error("Failed to copy game ID")
    }
  }

  return {
    myCards,
    partnerCards,
    selectedCards,
    currentUserGameName,
    partnerGameName,
    isLoading: sendMessage.isPending || updateTradeSession.isPending,
    toggleCardSelection,
    sendCardExchange,
    completeTrade,
    copyGameId,
  }
}
