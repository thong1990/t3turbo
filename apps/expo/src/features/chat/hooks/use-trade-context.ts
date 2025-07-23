import * as Clipboard from "expo-clipboard"
import { useState } from "react"
import { toast } from "sonner-native"
import { useUser } from "~/features/supabase/hooks"
import { useSendMessage } from "../mutations"
import { useUserProfile } from "../queries"

interface TradeCard {
  id: string
  user_id: string
  card_id: string
  quantity: number
  cards?: {
    id: string
    name: string
    image_url: string
    rarity: string
  }
}

interface TradeSession {
  id: string
  status: string
  sendbird_channel_url?: string
  channel_url?: string
  channelUrl?: string
  trade_session_card?: TradeCard[]
  tradeSessionCards?: TradeCard[] // Add camelCase version
  [key: string]: unknown
}

export function useTradeContext(
  tradeSession: TradeSession,
  chatChannelUrl?: string
) {
  const { data: user } = useUser()
  const { data: currentUserProfile } = useUserProfile(user?.id || "")
  const sendMessage = useSendMessage()
  const currentUserId = user?.id
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

  const currentUserGameName =
    currentUserProfile?.game_account_ign ||
    currentUserProfile?.display_name ||
    "You"

  const tradeCards =
    tradeSession.tradeSessionCards || tradeSession.trade_session_card || []

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
    return (
      tradeSession.sendbird_channel_url ||
      tradeSession.channel_url ||
      tradeSession.channelUrl ||
      chatChannelUrl ||
      ""
    )
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
        tradeId: tradeSession.id,
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
          partnerUserId: partnerCards[0]?.user_id || "",
          partnerUserName: "Partner",
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

  async function copyGameId() {
    try {
      const gameAccountId =
        currentUserProfile?.game_account_ign || user?.id || ""
      if (!gameAccountId) {
        toast.error("No game ID found")
        return
      }

      await Clipboard.setStringAsync(gameAccountId)
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
    isLoading: sendMessage.isPending,
    toggleCardSelection,
    sendCardExchange,
    copyGameId,
  }
}
