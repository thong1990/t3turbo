import { useInfiniteQuery } from "@tanstack/react-query"

import { CHAT_CONFIG, MESSAGES } from "../constants"
import { GetSendbirdSDK } from "../factory"
import { recordChatMembershipFailure } from "../hooks/use-realtime-messages"
import { ensureUserIsMember } from "../services/channel-management"
import type { Message } from "../types"
import { debugLog } from "../utils"

interface SendBirdMessage {
  messageId?: string | number
  sender?: { userId?: string }
  message?: string
  createdAt?: number
  customType?: string
  data?: string
}

export function useMessages(channelUrl: string, currentUserId?: string) {
  return useInfiniteQuery({
    queryKey: ["messages", channelUrl],
    initialPageParam: null as unknown,
    queryFn: async ({
      pageParam,
    }: { pageParam: unknown }): Promise<{
      messages: Message[]
      nextCursor?: unknown
    }> => {
      debugLog("🔍 useMessages queryFn called for:", {
        channelUrl,
        currentUserId,
        pageParam,
      })

      if (channelUrl.startsWith("mock-") || channelUrl.startsWith("demo-")) {
        return handleMockMessages(channelUrl, currentUserId)
      }

      const sdk = GetSendbirdSDK()
      if (!sdk || !channelUrl) {
        console.warn("SendBird SDK not available, returning empty messages")
        return { messages: [] }
      }

      try {
        const channel = await sdk.groupChannel.getChannel(channelUrl)

        if (currentUserId) await ensureUserIsMember(channel.url, currentUserId)

        const messageListParams = {
          nextResultSize: CHAT_CONFIG.MESSAGES_PER_PAGE,
          reverse: true,
          messageTypeFilter: "MESG",
          ...(pageParam && {
            prevResultSize: 0,
            nextResultSize: CHAT_CONFIG.MESSAGES_PER_PAGE,
          }),
        }

        const oldTimestamp = 0 // Get all messages from beginning

        const messageList = await channel.getMessagesByTimestamp(
          oldTimestamp,
          messageListParams
        )

        const messages = messageList
          .map(transformSendbirdMessage(channelUrl))
          .sort(sortByTimestamp)

        return {
          messages,
          nextCursor:
            messageList.length === CHAT_CONFIG.MESSAGES_PER_PAGE
              ? Date.now()
              : undefined,
        }
      } catch (error) {
        console.error("❌ Failed to load messages:", error)

        if (String(error).includes("User must be a member")) {
          recordChatMembershipFailure(channelUrl)
          throw new Error(MESSAGES.ERROR.CHANNEL_NEEDS_RECREATION)
        }

        throw error
      }
    },
    getNextPageParam: lastPage => lastPage.nextCursor,
    enabled: !!channelUrl,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}

// Helper functions
function handleMockMessages(channelUrl: string, currentUserId?: string) {
  debugLog("🎭 Returning mock messages for:", channelUrl)

  const tradeId = channelUrl
    .replace("mock-channel-", "")
    .replace("demo-channel-", "")
  const mockMessages = generateMockMessages(
    channelUrl,
    tradeId,
    currentUserId || "current-user"
  )

  // Include stored demo messages for persistence
  const { getDemoMessages } = require("../utils")
  const storedMessages = getDemoMessages(channelUrl)

  // Combine mock messages with stored messages and deduplicate
  const allMessages = [...mockMessages, ...storedMessages]
  const deduplicatedMessages = allMessages.reduce((acc: Message[], message) => {
    if (!acc.find(existing => existing.id === message.id)) {
      acc.push(message)
    }
    return acc
  }, [])

  debugLog(
    `🎭 Generated ${mockMessages.length} mock + ${storedMessages.length} stored = ${deduplicatedMessages.length} total messages for trade ${tradeId}`
  )
  return { messages: deduplicatedMessages.sort(sortByTimestamp) }
}

function generateMockMessages(
  channelUrl: string,
  tradeId: string,
  currentUserId: string
): Message[] {
  const seed = tradeId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (index: number) => (seed + index) % 7
  const partnerId = `mock-partner-${tradeId}`
  const baseTime = Date.now() - 1000 * 60 * 60 * 2

  const templates = [
    {
      sender: partnerId,
      text: "Hey! I'm interested in your card collection 👋",
      time: 0,
    },
    {
      sender: currentUserId,
      text: "Hi there! Which cards are you looking at?",
      time: 1,
    },
    {
      sender: partnerId,
      text: "I really like your Charizard! Would you be willing to trade?",
      time: 3,
    },
    {
      sender: currentUserId,
      text: "Sure! What do you have to offer?",
      time: 5,
    },
    {
      sender: partnerId,
      text: "I have a shiny Pikachu that's in mint condition",
      time: 8,
    },
  ]

  return templates
    .filter((_, index) => random(index) > 2)
    .map((template, index) => ({
      id: `mock-msg-${tradeId}-${index}`,
      channelUrl,
      senderId: template.sender,
      message: template.text,
      timestamp: new Date(baseTime + template.time * 60 * 1000),
      messageType: "text" as const,
    }))
}

function transformSendbirdMessage(channelUrl: string) {
  return (msg: any): Message => ({
    id: msg.messageId?.toString() || `msg-${Date.now()}`,
    channelUrl,
    senderId: msg.sender?.userId || "unknown",
    message: msg.message || "",
    timestamp: new Date(msg.createdAt || Date.now()),
    messageType: determineMessageType(msg),
    customData: parseCustomData(msg.data, msg.customType),
  })
}

function determineMessageType(msg: any): Message["messageType"] {
  if (msg.customType === "trade_action" || msg.customType === "card_exchange")
    return "trade_action"
  return "text"
}

function parseCustomData(
  data: string,
  customType: string
): Message["customData"] {
  if (!data || !customType) {
    return undefined
  }

  try {
    const parsed = JSON.parse(data) as Message["customData"]

    return parsed
  } catch (error) {
    console.error("❌ Failed to parse custom data from SendBird:", error)
    return undefined
  }
}

function sortByTimestamp(a: Message, b: Message): number {
  return a.timestamp.getTime() - b.timestamp.getTime()
}
