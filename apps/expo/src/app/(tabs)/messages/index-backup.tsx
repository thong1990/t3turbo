import { createGroupChannelListFragment, useSendbirdChat } from "@sendbird/uikit-react-native"
import type { SendbirdUserMessage } from "@sendbird/uikit-utils"
import { router } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, RefreshControl, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"

import { BannerAd } from "~/features/ads/components/BannerAd"
import { CustomChannelPreview } from "~/features/messages/components/CustomChannelPreview"
import { ChatListHeader } from "~/features/messages/components/MessageScreenHeader/MessageScreenHeader"
import { useUser } from "~/features/supabase/hooks"
import { Text } from "~/shared/components/ui/text"

const GroupChannelListFragment = createGroupChannelListFragment({
  Header: () => null,
})

export default function MessagesScreen() {
  const { data: user } = useUser()
  const { sdk } = useSendbirdChat()
  
  console.log("🔍 Messages page debug:", { hasUser: !!user, hasSdk: !!sdk, userId: user?.id })
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filteredChannelUrls, setFilteredChannelUrls] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Force re-render after deletions
  const searchAbortController = useRef<AbortController | null>(null)

  const searchChannels = useCallback(async (query: string) => {
    if (!sdk || !query.trim()) {
      setFilteredChannelUrls([])
      setIsSearching(false)
      return
    }

    // Cancel any existing search
    if (searchAbortController.current) {
      searchAbortController.current.abort()
    }

    // Create new abort controller
    searchAbortController.current = new AbortController()
    const signal = searchAbortController.current.signal

    setIsSearching(true)

    try {
      // Get channels with very conservative limit
      const channelListQuery = sdk.groupChannel.createMyGroupChannelListQuery({
        includeEmpty: false, // Only include channels with messages
        limit: 20, // Reduced from 50 to 20
      })

      const channels = await channelListQuery.next()
      const matchingChannelUrls: string[] = []

      // Process only first 15 channels to be very conservative
      const channelsToProcess = channels.slice(0, 15)

      // Process channels sequentially with aggressive rate limiting
      for (let i = 0; i < channelsToProcess.length; i++) {
        if (signal.aborted) {
          return
        }

        const channel = channelsToProcess[i]
        let hasMatch = false

        // Check channel name
        if (channel.name?.toLowerCase().includes(query.toLowerCase())) {
          hasMatch = true
        }

        // Check member nicknames
        if (!hasMatch && channel.members) {
          for (const member of channel.members) {
            if (member.nickname?.toLowerCase().includes(query.toLowerCase())) {
              hasMatch = true
              break
            }
          }
        }

        // Only search messages for first 10 channels and only if no match found
        if (!hasMatch && i < 10) {
          try {
            // Add significant delay before message search
            await new Promise(resolve => setTimeout(resolve, 300))

            if (signal.aborted) return

            const messageListQuery = channel.createPreviousMessageListQuery({
              limit: 5, // Reduced from 10 to 5
              reverse: false,
            })

            const messages = await messageListQuery.load()

            for (const message of messages) {
              if (signal.aborted) return

              if (message.messageType === "user") {
                const userMessage = message as SendbirdUserMessage
                if (userMessage.message?.toLowerCase().includes(query.toLowerCase())) {
                  hasMatch = true
                  break
                }
              }
            }

            // Add significant delay between message searches
            await new Promise(resolve => setTimeout(resolve, 500))
          } catch (error) {
            console.error("Error searching messages in channel:", channel.url, error)
            // If we hit rate limit, wait much longer and skip message search for remaining channels
            if (error instanceof Error && error.message?.includes("Too many requests")) {
              await new Promise(resolve => setTimeout(resolve, 5000))
              // Skip message search for remaining channels
              break
            }
          }
        }

        if (hasMatch && !signal.aborted) {
          matchingChannelUrls.push(channel.url)
        }

        // Add delay between all channel processing
        if (i < channelsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      if (!signal.aborted) {
        setFilteredChannelUrls(matchingChannelUrls)
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error("Error searching channels:", error)
      }
    } finally {
      if (!signal.aborted) {
        setIsSearching(false)
      }
    }
  }, [sdk])

  useEffect(() => {
    if (searchText.trim()) {
      const debounceTimer = setTimeout(() => {
        searchChannels(searchText)
      }, 800) // Increased debounce from 500ms to 800ms

      return () => clearTimeout(debounceTimer)
    }

    setFilteredChannelUrls([])
    setIsSearching(false)
  }, [searchText, searchChannels])

  // Cleanup search on unmount
  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort()
      }
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    if (!sdk) return

    setRefreshing(true)
    try {
      // Force refresh the channel list
      await sdk.groupChannel.createMyGroupChannelListQuery({
        includeEmpty: false,
        includeFrozen: false,
      }).next()

      // Force component re-render
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error("Error refreshing channels:", error)
    } finally {
      setRefreshing(false)
    }
  }, [sdk])

  const handleDeleteAllMessages = useCallback(async () => {
    if (!sdk) return

    Alert.alert(
      "Clear Message History",
      "This will clear all message history from your view while keeping the conversations active. You can continue chatting in these channels afterward. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear History",
          style: "destructive",
          onPress: async () => {
            try {
              // Get all channels
              const channelListQuery = sdk.groupChannel.createMyGroupChannelListQuery({
                includeEmpty: false, // Only get channels with messages
                limit: 100,
              })

              const channels = await channelListQuery.next()
              let processedChannels = 0

              // Reset chat history for each channel
              for (let i = 0; i < channels.length; i++) {
                const channel = channels[i]
                try {
                  // Use SendBird's built-in reset history method
                  // This clears message history from user's view without leaving the channel
                  await channel.resetMyHistory()
                  processedChannels++

                  // Small delay between channels to avoid rate limiting
                  if (i < channels.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                  }
                } catch (error) {
                  console.error("Error clearing history for channel:", channel.url, error)
                  if (error instanceof Error && error.message?.includes("Too many requests")) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                  }
                }
              }

              // Refresh the UI to reflect the cleared state
              await handleRefresh()

              Alert.alert(
                "Success",
                `Cleared message history for ${processedChannels} conversation${processedChannels !== 1 ? 's' : ''}. You can continue chatting in these channels.`
              )
            } catch (error) {
              console.error("Error clearing message history:", error)
              Alert.alert("Error", "Failed to clear message history. Please try again.")
            }
          },
        },
      ]
    )
  }, [sdk, handleRefresh])

  function handleSearchChange(text: string) {
    setSearchText(text)
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    console.log("👤 User not authenticated, showing login screen")
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons
            name="chatbubbles-outline"
            size={96}
            className="text-muted-foreground"
          />
          <Text className="mt-6 text-center font-semibold text-foreground text-xl">
            Chat with Traders
          </Text>
          <Text className="mt-3 text-center text-base text-muted-foreground leading-6">
            Connect with other traders to discuss deals,{"\n"}
            exchange cards, and build your collection.
          </Text>
          <Button onPress={() => router.push("/login")} className="mt-8 px-8">
            <Text className="font-medium text-primary-foreground">
              Sign In to Chat
            </Text>
          </Button>
          <Text className="mt-4 text-center text-muted-foreground text-sm">
            New to trading?{" "}
            <Text
              className="text-primary underline"
              onPress={() => router.push("/sign-up")}
            >
              Create an account
            </Text>
          </Text>
        </View>
        {/* Banner Ad at bottom */}
        <BannerAd placement="chat-bottom" />
      </SafeAreaView>
    )
  }

  // Show messages list for authenticated users
  console.log("✅ User authenticated, showing messages list")
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ChatListHeader
        onPressRefresh={handleRefresh}
        onPressDeleteAll={handleDeleteAllMessages}
        onSearchChange={handleSearchChange}
      />

      <GroupChannelListFragment
        key={refreshKey} // Force re-render when refreshKey changes
        channelListQueryParams={{
          includeEmpty: false, // Hide empty channels after deleting all messages
          includeFrozen: false,
          channelUrlsFilter: searchText.trim() ? filteredChannelUrls : undefined,
        }}
        onPressCreateChannel={() => {
          return
        }}
        onPressChannel={channel => {
          // Navigate to GroupChannel function.
          router.navigate(`/messages/${channel.url}`)
        }}
        renderGroupChannelPreview={(props) => (
          <CustomChannelPreview
            channel={props.channel}
            onPress={() => router.navigate(`/messages/${props.channel.url}`)}
          />
        )}
        // Add pull to refresh directly to the fragment
        flatListProps={{
          refreshControl: (
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          ),
        }}
      />

      <BannerAd placement="chat-bottom" />
    </SafeAreaView>
  )
}
