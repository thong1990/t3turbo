import { FlatList } from "react-native"
import { Container } from "~/shared/components/container"
import { EmptyState } from "~/shared/components/ui/empty-state"
import type { ChatListItem } from "../../types"
import { ChatListItem as ChatItem } from "./ChatListItem"

interface ChatListContentProps {
  chats: ChatListItem[]
  isLoading: boolean
  hasChats: boolean
  isSearching: boolean
  hasResults: boolean
  searchQuery: string
  onRefresh: () => void
  showRefreshIndicator: boolean
}

export function ChatListContent({
  chats,
  isLoading,
  hasChats,
  isSearching,
  hasResults,
  searchQuery,
  onRefresh,
  showRefreshIndicator,
}: ChatListContentProps) {
  function renderEmptyState() {
    if (isLoading) {
      return (
        <EmptyState
          message="Loading..."
          description="Getting your latest chats..."
        />
      )
    }

    if (isSearching && !hasResults) {
      return (
        <EmptyState
          message="No results found"
          description={`No chats found matching "${searchQuery}"`}
        />
      )
    }

    return (
      <EmptyState
        message="No chat history"
        description="Start trading to begin conversations with other users."
      />
    )
  }

  if (!hasChats || (isSearching && !hasResults)) {
    return <Container className="flex-1">{renderEmptyState()}</Container>
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ChatItem chat={item} />}
      onRefresh={onRefresh}
      refreshing={showRefreshIndicator}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  )
}
