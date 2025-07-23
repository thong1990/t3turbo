import {
  CHAT_CONFIG,
  MESSAGES,
  MOCK_CONFIG,
  SENDBIRD_CUSTOM_TYPES,
} from "./constants"
import type { ChatListItem, Message } from "./types"

// Time utilities
export function getExpirationTime(
  hoursFromNow = CHAT_CONFIG.CHAT_SESSION_DURATION_HOURS
): Date {
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + hoursFromNow)
  return expiration
}

export function formatLastMessageTime(timestamp: string | Date): string {
  const date = new Date(timestamp)
  const diffInMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`

  return date.toLocaleDateString()
}

export function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Validation utilities
export function isValidChannelUrl(channelUrl: string): boolean {
  return Boolean(channelUrl?.trim() && !channelUrl.startsWith("pending-"))
}

export function isValidMessage(message: string): boolean {
  return Boolean(
    message?.trim() && message.trim().length <= CHAT_CONFIG.MAX_MESSAGE_LENGTH
  )
}

export function isMockTrade(tradeId: string): boolean {
  return (
    tradeId.startsWith(MOCK_CONFIG.TRADE_PREFIX) ||
    tradeId.startsWith(MOCK_CONFIG.DEMO_PREFIX)
  )
}

export function isPlaceholderChannel(channelUrl: string): boolean {
  return channelUrl?.startsWith("trade-") && !channelUrl.startsWith("sendbird_")
}

// Data transformation utilities
export function createOptimisticMessage(
  channelUrl: string,
  senderId: string,
  message: string,
  customType?: string,
  data?: string
): Message {
  const isCardExchange = customType === SENDBIRD_CUSTOM_TYPES.CARD_EXCHANGE
  let customData: Message["customData"]

  if (isCardExchange && data) {
    try {
      customData = JSON.parse(data) as Message["customData"]
      console.log("🎯 Created optimistic card exchange message:", {
        messageId: `temp-${Date.now()}`,
        customType,
        hasData: !!data,
        parsedCustomData: customData,
        cardCount: customData?.cards?.length || 0,
      })
    } catch (error) {
      console.error(
        "❌ Failed to parse card exchange data in optimistic message:",
        error
      )
    }
  }

  return {
    id: `temp-${Date.now()}`,
    channelUrl,
    senderId,
    message,
    timestamp: new Date(),
    messageType: "text",
    customData,
  }
}

// Search and filtering
export function filterChats(
  chats: ChatListItem[],
  searchQuery: string
): ChatListItem[] {
  if (!chats || !searchQuery.trim()) return chats

  const query = searchQuery.toLowerCase().trim()
  return chats.filter(
    chat =>
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage.toLowerCase().includes(query)
  )
}

// Retry utilities
export function calculateRetryDelay(attemptIndex: number): number {
  return Math.min(
    CHAT_CONFIG.RETRY_DELAY_BASE * 2 ** attemptIndex,
    CHAT_CONFIG.MAX_RETRY_DELAY
  )
}

export function shouldRetry(error: unknown, attemptCount: number): boolean {
  if (attemptCount >= CHAT_CONFIG.MAX_RETRY_ATTEMPTS) return false

  const errorMessage = String(error).toLowerCase()
  const retryableErrors = ["network", "timeout", "connection", "temporary"]

  return retryableErrors.some(keyword => errorMessage.includes(keyword))
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error)
    return String(error.message)
  return "An unexpected error occurred"
}

export function createErrorFromSendbirdError(error: unknown): Error {
  const errorMessage = getErrorMessage(error)

  if (errorMessage.includes("keyName"))
    return new Error(MESSAGES.ERROR.INVALID_MESSAGE_FORMAT)
  if (errorMessage.includes("Channel") && errorMessage.includes("not found")) {
    return new Error(MESSAGES.ERROR.CHANNEL_NOT_FOUND)
  }
  if (errorMessage.includes("User must be a member"))
    return new Error(MESSAGES.ERROR.USER_NOT_MEMBER)

  return new Error(errorMessage)
}

// Debug utilities
export function shouldLog(frequency = 0.1): boolean {
  return Math.random() < frequency
}

export function debugLog(
  message: string,
  data?: unknown,
  frequency?: number
): void {
  if (shouldLog(frequency)) console.log(message, data)
}

// Demo message storage for persistence across navigation
const demoMessageStorage = new Map<string, Message[]>()

export function storeDemoMessage(channelUrl: string, message: Message) {
  const existing = demoMessageStorage.get(channelUrl) || []
  const updated = [...existing, message].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )
  demoMessageStorage.set(channelUrl, updated)
  console.log(`💾 Stored demo message for ${channelUrl}:`, {
    message: message.message,
    timestamp: message.timestamp.toISOString(),
    totalMessages: updated.length,
    allChannels: Array.from(demoMessageStorage.keys()),
  })
}

export function getDemoMessages(channelUrl: string): Message[] {
  const messages = demoMessageStorage.get(channelUrl) || []
  console.log(`📖 Retrieved demo messages for ${channelUrl}:`, {
    messageCount: messages.length,
    latestMessage:
      messages.length > 0
        ? {
            message: messages[messages.length - 1].message,
            timestamp: messages[messages.length - 1].timestamp.toISOString(),
          }
        : null,
    allChannels: Array.from(demoMessageStorage.keys()),
  })
  return messages
}

export function clearDemoMessages(channelUrl: string) {
  demoMessageStorage.delete(channelUrl)
}
