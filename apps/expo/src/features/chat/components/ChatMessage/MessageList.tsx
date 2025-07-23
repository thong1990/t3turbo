import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useEffect, useRef, useState } from "react"
import { FlatList, RefreshControl, View } from "react-native"

import { Text } from "~/shared/components/ui/text"
import { useMessages } from "../../queries"
import type { Message } from "../../types"
import { MessageItem } from "./MessageItem"

export interface MessageListProps {
  channelUrl: string
  currentUserId: string
  loading?: boolean
}

export function MessageList({ channelUrl, currentUserId }: MessageListProps) {
  const flatListRef = useRef<FlatList>(null)
  const previousMessageCount = useRef<number>(0)
  const performanceStartTime = useRef<number>(0)
  const [retryCount, setRetryCount] = useState(0)
  const hasInitiallyScrolled = useRef<boolean>(false)

  // Create a unique prefix for this MessageList instance to avoid key conflicts
  const listId = useRef(Math.random().toString(36).substring(2, 8)).current

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useMessages(channelUrl, currentUserId)

  // Performance monitoring
  useEffect(() => {
    if (isLoading) {
      performanceStartTime.current = performance.now()
    } else if (data && performanceStartTime.current > 0) {
      const loadTime = performance.now() - performanceStartTime.current

      performanceStartTime.current = 0
    }
  }, [isLoading, data, channelUrl, retryCount])

  // Refresh messages when user focuses on this chat
  useFocusEffect(
    useCallback(() => {

      refetch()
    }, [refetch])
  )

  // Reset scroll tracking when channel changes and handle initial scroll
  useEffect(() => {
    // Reset tracking for new channel
    hasInitiallyScrolled.current = false
    previousMessageCount.current = 0

    const allMessages =
      data?.pages.flatMap(page => {
        const typedPage = page as { messages: Message[] }
        return typedPage.messages
      }) || []

    // Scroll to bottom immediately when messages first load
    if (allMessages.length > 0 && !isLoading) {

      setTimeout(() => {
        try {
          flatListRef.current?.scrollToEnd({ animated: false })
          hasInitiallyScrolled.current = true
          previousMessageCount.current = allMessages.length
        } catch (error) {
          console.warn("Failed to initial scroll to end:", error)
        }
      }, 100) // Small delay to ensure FlatList is fully rendered
    }
  }, [data?.pages, isLoading, channelUrl])

  // Auto-scroll for new messages (after initial load)
  useEffect(() => {
    const allMessages =
      data?.pages.flatMap(page => {
        const typedPage = page as { messages: Message[] }
        return typedPage.messages
      }) || []

    const currentMessageCount = allMessages.length


    if (
      currentMessageCount > 0 &&
      hasInitiallyScrolled.current &&
      currentMessageCount > previousMessageCount.current &&
      !isFetchingNextPage
    ) {

      try {
        flatListRef.current?.scrollToEnd({ animated: false })
      } catch (error) {
        console.warn("Failed to scroll to end:", error)
      }
    }

    previousMessageCount.current = currentMessageCount
  }, [data?.pages, isFetchingNextPage])


  const handleRetry = () => {
    setRetryCount(prev => prev + 1)

    refetch()
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading messages...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-2 text-destructive">Failed to load messages</Text>
        <Text className="mb-4 text-center text-muted-foreground text-sm">
          {retryCount > 0 && `Retry attempt ${retryCount} failed. `}
          Check your internet connection and try again.
        </Text>
        <Text className="text-primary underline" onPress={handleRetry}>
          {retryCount > 2 ? "Try again" : "Tap to retry"}
        </Text>
      </View>
    )
  }

  const messages =
    data?.pages.flatMap(page => {
      const typedPage = page as { messages: Message[] }
      return typedPage.messages
    }) || []

  // Deduplicate messages by ID to prevent React key conflicts
  const deduplicatedMessages = messages.reduce((acc: Message[], message) => {
    if (!acc.find(existing => existing.id === message.id)) {
      acc.push(message)
    }
    return acc
  }, [])

  // Debug: Log if duplicates were found
  if (messages.length !== deduplicatedMessages.length) {
    console.warn(
      `⚠️ Found ${messages.length - deduplicatedMessages.length} duplicate messages in ${channelUrl}`,
      {
        original: messages.length,
        deduplicated: deduplicatedMessages.length,
        channelUrl: `${channelUrl.substring(0, 20)}...`, // Log partial URL for privacy
      }
    )
  }

  if (deduplicatedMessages.length === 0) {
    return (
      <View className="flex-1">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-muted-foreground">
            No messages yet{"\n"}Start the conversation!
          </Text>
        </View>
      </View>
    )
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {

      fetchNextPage()
    }
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem message={item} isMe={item.senderId === currentUserId} />
  )

  const renderHeader = () => {
    if (!isFetchingNextPage) return null

    return (
      <View className="py-4">
        <Text className="text-center text-muted-foreground">
          Loading more messages...
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={deduplicatedMessages}
        renderItem={renderMessage}
        keyExtractor={item => `${listId}-${item.id}`}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexGrow: 1,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={undefined} // Let FlatList calculate item heights dynamically
      />
    </View>
  )
}
