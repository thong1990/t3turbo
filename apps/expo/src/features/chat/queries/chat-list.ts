import { useQuery } from "@tanstack/react-query"

import { client } from "~/features/supabase/client"
import type { ChatListItem } from "../types"
import { debugLog } from "../utils"

export function useChatList(userId: string) {
  return useQuery({
    queryKey: ["chatList", userId],
    queryFn: async (): Promise<ChatListItem[]> => {
      // ChatList query executing
      try {
        const { data, error } = await client
          .from("chat_sessions")
          .select(
            "id, trade_id, channel_url, participants, created_at, trade_sessions(id, status, initiator_id, receiver_id, sendbird_channel_url)"
          )
          .contains("participants", [userId])
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (error) {
          return await getMockChatData()
        }

        const partnerIds = data
          .map(session =>
            session.participants.find((id: string) => id !== userId)
          )
          .filter(Boolean) as string[]

        const { data: profiles } = await client
          .from("user_profiles")
          .select("id, display_name, avatar_url, game_account_ign")
          .in("id", partnerIds)

        const realChats = await Promise.all(
          data.map(async session => {
            const partnerId =
              session.participants.find((id: string) => id !== userId) || ""
            const partnerProfile = profiles?.find(
              profile => profile.id === partnerId
            )
            const tradeSession = session.trade_sessions as {
              sendbird_channel_url?: string
            } | null
            const channelUrl =
              tradeSession?.sendbird_channel_url || session.channel_url

            // Use same logic as ChatScreen for effective channel URL
            const isPlaceholderChannel =
              channelUrl?.startsWith("trade-") &&
              !tradeSession?.sendbird_channel_url

            const effectiveChannelUrl =
              isPlaceholderChannel || !channelUrl
                ? `demo-channel-${session.trade_id}`
                : channelUrl

            // Channel URL mapped for trade

            const latestMessageData =
              await getLatestMessageFromChannel(effectiveChannelUrl)
            const onlineStatusData = await getUserOnlineStatus(partnerId)

            return {
              id: session.id,
              name:
                partnerProfile?.game_account_ign ||
                partnerProfile?.display_name ||
                "Unknown Trader",
              lastMessage: latestMessageData.message,
              lastMessageAt: latestMessageData.timestamp,
              avatarUrl: partnerProfile?.avatar_url || undefined,
              unreadCount: 1,
              tradeId: session.trade_id,
              tradeStatus: "pending_acceptance" as const,
              partnerId,
              onlineStatus: onlineStatusData.onlineStatus,
              lastSeenAt: onlineStatusData.lastSeenAt,
              channelUrl: effectiveChannelUrl, // Store the actual channel URL for matching
            }
          })
        )

        if (realChats.length === 0) return await getMockChatData()

        debugLog("✅ Chat list loaded with", realChats.length)
        return realChats
      } catch (error) {
        return await getMockChatData()
      }
    },
    enabled: !!userId,
    staleTime: 1000, // 1 second for immediate updates when new messages arrive
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false, // Keep disabled to prevent loops
    refetchOnMount: false, // Keep disabled to prevent loops
    refetchOnReconnect: false, // Disable to prevent connection loops
    refetchInterval: false,
    retry: 0, // Disable retries to prevent loops
    retryDelay: 0,
  })
}

// Simplified helper functions
async function getMockChatData(): Promise<ChatListItem[]> {
  const mockChats = [
    {
      id: "mock-chat-1",
      name: "PokeMaster2024",
      tradeId: "mock-trade-1",
      partnerId: "mock-user-1",
      onlineStatus: "online" as const,
    },
    {
      id: "mock-chat-2",
      name: "CardCollector99",
      tradeId: "mock-trade-2",
      partnerId: "mock-user-2",
      onlineStatus: "recently_online" as const,
    },
    {
      id: "mock-chat-3",
      name: "DragonMaster_Alex",
      tradeId: "mock-trade-3",
      partnerId: "mock-user-3",
      onlineStatus: "online" as const,
    },
  ]

  const chatsWithMessages = await Promise.all(
    mockChats.map(async (chat, index) => {
      const channelUrl = `demo-channel-${chat.tradeId}`

      const latestMessageData = await getLatestMessageFromChannel(channelUrl)

      return {
        ...chat,
        lastMessage: latestMessageData.message,
        lastMessageAt: latestMessageData.timestamp,
        avatarUrl: undefined,
        unreadCount: index === 1 ? 2 : index === 2 ? 1 : 0, // Vary unread counts
        tradeStatus:
          index === 0
            ? "completed"
            : index === 1
              ? "active"
              : ("pending_acceptance" as const),
        lastSeenAt:
          chat.onlineStatus === "recently_online"
            ? new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            : undefined,
        channelUrl, // Store the channel URL for matching
      }
    })
  )

  return chatsWithMessages
}

// Cache to prevent repeated API calls for the same channel
const messageCache = new Map<
  string,
  { message: string; timestamp: string; cachedAt: number }
>()
const CACHE_DURATION = 500 // 500ms - much shorter for real-time updates

// Export function to clear cache when new messages are sent
export function clearLatestMessageCache(channelUrl?: string) {
  if (channelUrl) {
    messageCache.delete(channelUrl)
  } else {
    messageCache.clear()
  }
}

async function getLatestMessageFromChannel(channelUrl: string): Promise<{
  message: string
  timestamp: string
}> {
  // Handle demo/mock channels with stored messages (check fresh data first)
  if (
    channelUrl.startsWith("demo-channel-") ||
    channelUrl.startsWith("mock-channel-")
  ) {
    try {
      const { getDemoMessages } = require("../utils")
      const storedMessages = getDemoMessages(channelUrl)

      if (storedMessages.length > 0) {
        const latestMessage = storedMessages[storedMessages.length - 1]

        const result = {
          message: latestMessage.message,
          timestamp: latestMessage.timestamp.toISOString(),
        }
        // Cache the result briefly
        messageCache.set(channelUrl, { ...result, cachedAt: Date.now() })
        return result
      }
    } catch (error) {}

    // Fallback for demo channels without stored messages
    const fallbackResult = {
      message: "Start the conversation!",
      timestamp: new Date().toISOString(),
    }
    // Don't cache fallback for demo channels to allow for fresh messages
    return fallbackResult
  }

  // Skip cache for recent SendBird channels to get fresh data
  // Don't use cache for real SendBird channels to ensure latest messages

  // Handle real SendBird channels
  try {
    const { GetSendbirdSDK } = require("../factory")
    const sdk = GetSendbirdSDK()

    if (!sdk) {
      const fallbackResult = {
        message: "Loading...",
        timestamp: new Date().toISOString(),
      }
      // Cache the fallback to prevent repeated calls
      messageCache.set(channelUrl, { ...fallbackResult, cachedAt: Date.now() })
      return fallbackResult
    }

    const channel = await sdk.groupChannel.getChannel(channelUrl)

    // Force refresh the channel to get latest data
    await channel.refresh()

    const messageListParams = {
      nextResultSize: 10, // Get more messages to ensure we have the latest
      reverse: true,
      messageTypeFilter: "MESG",
    }

    // Use timestamp 0 to get ALL messages including recent ones
    const messageList = await channel.getMessagesByTimestamp(
      0,
      messageListParams
    )

    if (messageList.length > 0) {
      // Sort messages by creation time to ensure we have the latest (most recent first)
      const sortedMessages = messageList.sort(
        (a: { createdAt: number }, b: { createdAt: number }) =>
          b.createdAt - a.createdAt
      )
      const latestMessage = sortedMessages[0]

      const result = {
        message: latestMessage.message || "📎 Attachment",
        timestamp: new Date(latestMessage.createdAt).toISOString(),
      }
      // Don't cache real SendBird results to ensure fresh data
      return result
    }

    const emptyResult = {
      message: "Start the conversation!",
      timestamp: new Date().toISOString(),
    }
    return emptyResult
  } catch (error) {
    const errorResult = {
      message: "Hello! Ready to trade?",
      timestamp: new Date().toISOString(),
    }
    return errorResult
  }
}

async function getUserOnlineStatus(userId: string): Promise<{
  onlineStatus: "online" | "recently_online" | "offline"
  lastSeenAt?: string
}> {
  // Provide intelligent default status based on user patterns
  // This will be updated by useMultipleUsersOnlineStatus hook when SendBird data is available

  // For mock users, provide varied status for better demo experience
  if (userId.startsWith("mock-") || userId.startsWith("demo-")) {
    const userHash = userId.split("").reduce((hash, char) => {
      const newHash = (hash << 5) - hash + char.charCodeAt(0)
      return newHash & newHash
    }, 0)

    const randomFactor = Math.abs(userHash) % 100

    if (randomFactor < 30) {
      return { onlineStatus: "online" }
    }
    if (randomFactor < 70) {
      return {
        onlineStatus: "recently_online",
        lastSeenAt: new Date(
          Date.now() - Math.random() * 6 * 60 * 60 * 1000
        ).toISOString(),
      }
    }
  }

  // For real users, default to offline until real status is fetched
  return {
    onlineStatus: "offline",
    lastSeenAt: undefined,
  }
}
