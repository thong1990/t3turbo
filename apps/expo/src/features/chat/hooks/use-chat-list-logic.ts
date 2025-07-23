import { useMemo } from "react"
import { useUser } from "~/features/supabase/hooks"
import { useChatList } from "../queries"
import type { ChatListItem } from "../types"
import { filterChats } from "../utils"
import {
  useForceRefreshOnlineStatus,
  useMultipleUsersOnlineStatus,
  useOnlineStatusRefresh,
} from "./use-online-status"

export function useChatListLogic() {
  const { data: user } = useUser()

  const {
    data: chats = [],
    refetch,
    isLoading,
    isRefetching,
    error,
    dataUpdatedAt,
  } = useChatList(user?.id || "")

  const partnerIds = useMemo(() => {
    return chats.map(chat => chat.partnerId).filter(Boolean)
  }, [chats])

  const { data: onlineStatuses = {} } = useMultipleUsersOnlineStatus(partnerIds)
  useOnlineStatusRefresh(partnerIds)

  const { forceRefresh } = useForceRefreshOnlineStatus()

  const chatsWithUpdatedStatus = useMemo(() => {
    const updatedChats = chats.map(chat => {
      const onlineStatus = onlineStatuses[chat.partnerId]
      if (onlineStatus) {
        return {
          ...chat,
          onlineStatus: onlineStatus.onlineStatus,
          lastSeenAt: onlineStatus.lastSeenAt,
        }
      }
      return chat
    })

    // Debug log to track chat list updates
    if (updatedChats.length > 0) {
    }

    return updatedChats
  }, [chats, onlineStatuses])

  function getFilteredChats(searchQuery: string): ChatListItem[] {
    return filterChats(chatsWithUpdatedStatus, searchQuery)
  }

  return {
    user,
    chats: chatsWithUpdatedStatus,
    getFilteredChats,
    refetch,
    isLoading,
    isRefetching,
    error,
    dataUpdatedAt,
    forceRefreshOnlineStatus: forceRefresh,
    hasChats: chatsWithUpdatedStatus.length > 0,
  }
}
