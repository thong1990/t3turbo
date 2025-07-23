import { useState } from "react"
import type { ChatListItem } from "../types"

export function useChatSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDrawer, setShowSearchDrawer] = useState(false)

  function openSearchDrawer() {
    setShowSearchDrawer(true)
  }

  function closeSearchDrawer() {
    setShowSearchDrawer(false)
  }

  function clearSearch() {
    setSearchQuery("")
    setShowSearchDrawer(false)
  }

  function getSearchResults(chats: ChatListItem[]): {
    filteredChats: ChatListItem[]
    isSearching: boolean
    hasResults: boolean
  } {
    const isSearching = searchQuery.trim().length > 0

    if (!isSearching) {
      return {
        filteredChats: chats,
        isSearching: false,
        hasResults: true,
      }
    }

    const query = searchQuery.toLowerCase().trim()
    const filteredChats = chats.filter(
      chat =>
        chat.name.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    )

    return {
      filteredChats,
      isSearching: true,
      hasResults: filteredChats.length > 0,
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    showSearchDrawer,
    openSearchDrawer,
    closeSearchDrawer,
    clearSearch,
    getSearchResults,
  }
}
