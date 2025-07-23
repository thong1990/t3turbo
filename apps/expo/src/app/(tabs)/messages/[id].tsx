import { useGroupChannel } from "@sendbird/uikit-chat-hooks"
import {
  createGroupChannelFragment,
  useSendbirdChat,
} from "@sendbird/uikit-react-native"
import type { SendbirdMessage } from "@sendbird/uikit-utils"
import type { SendbirdGroupChannel } from "@sendbird/uikit-utils"
import { useQueryClient } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from "react-native"
import { ErrorBoundary } from "~/features/messages/components/ErrorBoundary"
import { MessageInput } from "~/features/messages/components/MessageInput"
import { MessageItem } from "~/features/messages/components/MessageItem/MessageItem"
import { MessageScreenHeader } from "~/features/messages/components/MessageScreenHeader/MessageScreenHeader"
import { NetworkStatus } from "~/features/messages/components/NetworkStatus"
import { TradeSessionPanel } from "~/features/messages/components/TradeSessionPanel/TradeSessionPanel"
import { useUser } from "~/features/supabase/hooks"
import { Text } from "~/shared/components/ui/text"

const GroupChannelFragment = createGroupChannelFragment({
  Header: () => null, // Explicitly disable header
  Input: MessageInput, // Use custom input with templates
})

// Helper function to get trade ID from channel data
function getTradeIdFromChannel(channel: { data?: string }): string | null {
  if (!channel?.data) return null

  try {
    const channelData = JSON.parse(channel.data) as { tradeId?: string }
    return channelData?.tradeId || null
  } catch {
    return null
  }
}

function MessageDetailPageContent() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { sdk } = useSendbirdChat()
  const { channel } = useGroupChannel(sdk, id)
  const { data: user } = useUser()
  const queryClient = useQueryClient()
  const [isTradeSessionExpanded, setIsTradeSessionExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Dismiss keyboard when leaving the screen
      Keyboard.dismiss()
    }
  }, [])

  console.log("🔍 MessageDetailPage Debug:", {
    channelId: id,
    hasChannel: !!channel,
    channelUrl: channel?.url,
    channelData: channel?.data,
    channelType: channel?.channelType,
    memberCount: channel?.memberCount,
    userId: user?.id,
    searchQuery,
    isSearching: !!searchQuery.trim(),
  })

  // Check if this channel has trade session data
  const tradeId = useMemo(() => {
    if (!channel) return null
    const extractedTradeId = getTradeIdFromChannel(channel)
    console.log("🎯 Extracted tradeId:", extractedTradeId)
    return extractedTradeId
  }, [channel])

  // Real-time trade status updates - periodically refresh trade session
  useEffect(() => {
    if (!tradeId) return

    const interval = setInterval(() => {
      console.log("🔄 Refreshing trade session data")
      queryClient.invalidateQueries({
        queryKey: ["tradeSession", tradeId],
      })
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [tradeId, queryClient])

  // Check if we should show trade session panel
  const hasTradeSession = useMemo(() => {
    const hasRealTradeId = !!tradeId
    console.log("🎮 Trade session check:", {
      hasRealTradeId,
      tradeId,
    })
    return hasRealTradeId
  }, [tradeId])

  const handleBackPress = () => {
    // Dismiss keyboard before navigation
    Keyboard.dismiss()
    // Use router.back() to properly handle navigation stack
    router.back()
  }

  const handleTradeSessionToggle = (isExpanded: boolean) => {
    setIsTradeSessionExpanded(isExpanded)
    console.log("📋 Trade panel toggled:", isExpanded)
  }

  const handleSearchChange = (query: string) => {
    console.log("🔍 Search query change:", {
      from: searchQuery,
      to: query,
      trimmed: query.trim(),
      length: query.length
    })
    setSearchQuery(query)
  }

  const handleSearchResultPress = ({ message }: { message: SendbirdMessage }) => {
    // Navigate back to normal view and potentially scroll to message
    setSearchQuery("")
    console.log("📍 Search result pressed:", message.messageId)
  }

  // Determine if we're in search mode
  const isSearching = !!searchQuery.trim()

  console.log("🔍 Current search state:", {
    searchQuery: `"${searchQuery}"`,
    isSearching,
    mode: isSearching ? "SEARCH" : "NORMAL"
  })

  if (!channel) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading channel...</Text>
      </View>
    )
  }

  // Helper function to check if message matches search query
  function messageMatchesSearch(message: SendbirdMessage, query: string): boolean {
    if (!query.trim()) return true

    const searchQuery = query.toLowerCase().trim()

    // Check text message content
    if (message.messageType === "user" && message.message) {
      const messageText = message.message.toLowerCase()
      if (messageText.includes(searchQuery)) {
        return true
      }
    }

    // Check card exchange message data
    if (message.customType === "card_exchange" && message.data) {
      try {
        const cardData = JSON.parse(message.data) as { cardIds?: string[], action?: string }
        const hasCardMatch = cardData.cardIds?.some((cardId: string) =>
          cardId.toLowerCase().includes(searchQuery)
        )
        if (hasCardMatch) {
          return true
        }
      } catch {
        // Ignore parsing errors
      }
    }

    // Check system message content
    if (message.customType === "system" && message.message) {
      const messageText = message.message.toLowerCase()
      if (messageText.includes(searchQuery)) {
        return true
      }
    }

    return false
  }

  // Component to get messages from SendBird context
  function MessageListWrapper({ searchQuery, channel }: { searchQuery: string, channel: SendbirdGroupChannel }) {
    const [messages, setMessages] = useState<SendbirdMessage[]>([])

    useEffect(() => {
      if (!channel) return

      console.log("🔍 Loading messages for search:", searchQuery)

      // Get messages from channel with proper parameters
      const messageListQuery = channel.createPreviousMessageListQuery({
        limit: 100,
        reverse: false
      })

      messageListQuery.load().then((loadedMessages) => {
        console.log("🔍 Loaded", loadedMessages.length, "messages for search")
        setMessages(loadedMessages)
      }).catch((error) => {
        console.error("🔍 Error loading messages:", error)
        setMessages([])
      })
    }, [channel, searchQuery])

    return <FilteredMessagesList messages={messages} searchQuery={searchQuery} />
  }

  // Custom filtered message list component
  function FilteredMessagesList({ messages, searchQuery }: { messages: SendbirdMessage[], searchQuery: string }) {
    const filteredMessages = useMemo(() => {
      const filtered = messages.filter(message => messageMatchesSearch(message, searchQuery))
      console.log("🔍 Filtered", filtered.length, "of", messages.length, "messages for:", `"${searchQuery}"`)
      return filtered
    }, [messages, searchQuery])

    if (filteredMessages.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-center text-muted-foreground">
            No messages found for "{searchQuery}"
          </Text>
        </View>
      )
    }

    return (
      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
        {filteredMessages.map((message) => (
          <MessageItem key={message.messageId} message={message} />
        ))}
      </ScrollView>
    )
  }

  console.log("🎭 Final render decision:", {
    hasTradeSession,
    tradeId,
    channelUrl: channel.url,
    searchQuery,
    isSearching,
  })

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Custom Header with Search */}
        <MessageScreenHeader
          shouldHideRight={() => false}
          onPressHeaderLeft={handleBackPress}
          onPressHeaderRight={() => {
            router.navigate(`/messages/${id}/settings`)
          }}
          channel={channel}
          onSearchChange={handleSearchChange}
        />

        {/* Network Status */}
        <NetworkStatus />

        {/* Trade Panel - hide during search for better UX */}
        {hasTradeSession && !isSearching && (
          <ErrorBoundary>
            <TradeSessionPanel
              isVisible={true}
              tradeId={tradeId}
              onToggle={handleTradeSessionToggle}
            />
          </ErrorBoundary>
        )}

        {/* Chat Messages and Input */}
        <View className="flex-1">
          <ErrorBoundary>
            {(() => {
              if (isSearching) {
                console.log("🔍 RENDERING SEARCH MODE")
                return (
                  /* Search Mode - Use custom filtered message list */
                  <View className="flex-1">
                    <View className="mx-4 mt-2 rounded-lg bg-blue-100 p-3">
                      <Text className="text-blue-800 text-sm">
                        🔍 Searching for: "{searchQuery}"
                      </Text>
                    </View>
                    <MessageListWrapper searchQuery={searchQuery} channel={channel} />
                  </View>
                )
              }

              console.log("🔍 RENDERING NORMAL MODE")
              return (
                /* Normal Mode - Use regular GroupChannelFragment */
                <GroupChannelFragment
                  channel={channel}
                  onChannelDeleted={handleBackPress}
                  onPressHeaderLeft={handleBackPress}
                  onPressHeaderRight={() => {
                    router.navigate(`/messages/${id}/settings`)
                  }}
                  enableMessageGrouping
                  enableTypingIndicator
                  keyboardAvoidOffset={0}
                  renderMessage={({ message }) => (
                    <MessageItem message={message} />
                  )}
                />
              )
            })()}
          </ErrorBoundary>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default function MessageDetailPage() {
  return (
    <ErrorBoundary>
      <MessageDetailPageContent />
    </ErrorBoundary>
  )
}
