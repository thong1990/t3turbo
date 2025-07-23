interface CardExchangeData {
  type: "card_exchange"
  cards: Array<{
    id: string
    cardId: string
    name?: string
    imageUrl?: string
    rarity?: string
    quantity: number
    userId: string
  }>
  tradeId: string
  users?: {
    currentUserId: string
    currentUserName: string
    partnerUserId: string
    partnerUserName: string
  }
}

interface Message {
  id: string
  message?: string
  messageType: string
  customData?: Record<string, unknown>
  timestamp: Date
}

export function useMessageParsing() {
  function parseCardExchangeData(message: Message): CardExchangeData | null {
    try {
      if (message.customData && typeof message.customData === "object") {
        const customData = message.customData as Record<string, unknown>

        if (
          customData.type === "card_exchange" &&
          Array.isArray(customData.cards)
        ) {
          const cardExchangeData = customData as unknown as CardExchangeData

          return cardExchangeData
        }
      }

      if (message.message?.includes("{")) {
        const jsonMatch = message.message.match(/\{.*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
          if (parsed.type === "card_exchange") {
            const cardExchangeData = parsed as unknown as CardExchangeData

            return cardExchangeData
          }
        }
      }
    } catch (error) {
      console.error(error)
    }

    return null
  }

  function getMessageType(message: Message): {
    isTradeAction: boolean
    isSystemMessage: boolean
    isCardExchange: boolean
  } {
    // Check if it's a card exchange first (can be either text or trade_action with card_exchange customType)
    const isCardExchange =
      (message.messageType === "text" ||
        message.messageType === "trade_action") &&
      !!message.message?.includes("📋 Card Exchange Request") &&
      message.customData?.type === "card_exchange"

    return {
      isTradeAction: message.messageType === "trade_action" && !isCardExchange,
      isSystemMessage: message.messageType === "system",
      isCardExchange,
    }
  }

  return {
    parseCardExchangeData,
    getMessageType,
  }
}
