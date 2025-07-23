import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useEffect } from "react"
import { View } from "react-native"
import { Text } from "~/shared/components/ui/text"

import { useChatListLogic } from "../../hooks/use-chat-list-logic"
import { useChatListPerformance } from "../../hooks/use-chat-list-performance"
import { useChatSearch } from "../../hooks/use-chat-search"
import { ChatListContent } from "./ChatListContent"
import { ChatListHeader } from "./ChatListHeader"
import { ChatSearchInput } from "./ChatSearchInput"

export function ChatList() {
  const {
    user,
    chats,
    refetch,
    isLoading,
    error,
    forceRefreshOnlineStatus,
    hasChats,
  } = useChatListLogic()

  const {
    showRefreshIndicator,
    handleRefresh,
    setupBackgroundRefresh,
    setupSmartRefresh,
    setupAppStateRefresh,
  } = useChatListPerformance()

  const { searchQuery, setSearchQuery, clearSearch, getSearchResults } =
    useChatSearch()

  // Setup performance optimizations
  useEffect(() => {
    if (user?.id) {
      setupBackgroundRefresh(user.id, refetch)
    }
  }, [user?.id, setupBackgroundRefresh, refetch])

  useFocusEffect(
    useCallback(() => {
      setupSmartRefresh(refetch)
    }, [setupSmartRefresh, refetch])
  )

  useFocusEffect(
    useCallback(() => {
      return setupAppStateRefresh(refetch)
    }, [setupAppStateRefresh, refetch])
  )

  // TODO: Re-implement user change refresh with proper throttling to prevent API rate limiting
  // The original useEffect caused infinite loops and exceeded SendBird rate limits

  // Auth loading state
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-muted-foreground">
          Loading user information...
        </Text>
      </View>
    )
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1">
        <ChatListHeader
          onRefresh={() => handleRefresh(refetch, forceRefreshOnlineStatus)}
          showRefreshIndicator={showRefreshIndicator}
        />

        <ChatSearchInput
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={clearSearch}
        />

        <View className="flex-1 items-center justify-center p-4">
          <Text className="mb-2 font-semibold text-destructive text-lg">
            Failed to load chats
          </Text>
          <Text className="mb-4 text-center text-muted-foreground">
            Check your connection and try again
          </Text>
          <Text
            className="text-primary underline"
            onPress={() => handleRefresh(refetch, forceRefreshOnlineStatus)}
          >
            Tap to retry
          </Text>
        </View>
      </View>
    )
  }

  const { filteredChats, isSearching, hasResults } = getSearchResults(chats)

  return (
    <View className="flex-1">
      <ChatListHeader
        onRefresh={() => handleRefresh(refetch, forceRefreshOnlineStatus)}
        showRefreshIndicator={showRefreshIndicator}
      />

      <ChatSearchInput
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={clearSearch}
      />

      <ChatListContent
        chats={filteredChats}
        isLoading={isLoading}
        hasChats={hasChats}
        isSearching={isSearching}
        hasResults={hasResults}
        searchQuery={searchQuery}
        onRefresh={() => handleRefresh(refetch, forceRefreshOnlineStatus)}
        showRefreshIndicator={showRefreshIndicator}
      />
    </View>
  )
}
