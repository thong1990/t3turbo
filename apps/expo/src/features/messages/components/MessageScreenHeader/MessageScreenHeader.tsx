import { useSendbirdChat } from "@sendbird/uikit-react-native"
import type { SendbirdGroupChannel, SendbirdUser } from "@sendbird/uikit-utils"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { Pressable, TextInput, View } from "react-native"

import { useUserProfile } from "~/features/messages/queries"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/shared/components/ui/avatar"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

type OnlineStatus = "online" | "recently_online" | "offline"

function getPartnerInfo(
  channel?: SendbirdGroupChannel,
  currentUserId?: string
) {
  if (!channel?.members) return null

  const partner = channel.members.find(
    (member: SendbirdUser) => member.userId !== currentUserId
  )

  return partner
    ? {
      id: partner.userId,
      name: partner.nickname || partner.userId,
      avatarUrl: partner.profileUrl,
      connectionStatus: partner.connectionStatus || "offline",
    }
    : null
}

function getOnlineStatus(connectionStatus: string): OnlineStatus {
  switch (connectionStatus) {
    case "online":
      return "online"
    case "offline":
      return "offline"
    default:
      return "offline"
  }
}

function getTradeIdFromChannel(
  channel?: SendbirdGroupChannel
): string | undefined {
  try {
    // Extract trade ID from channel metadata or custom data
    if (channel?.data) {
      const parsed = JSON.parse(channel.data) as Record<string, unknown>
      return parsed.tradeId as string | undefined
    }
  } catch {
    // Ignore parsing errors
  }
  return undefined
}

// Chat Header Component for individual chat
export function MessageScreenHeader({
  shouldHideRight,
  onPressHeaderLeft,
  onPressHeaderRight,
  channel,
  onSearchChange,
}: {
  shouldHideRight: () => boolean
  onPressHeaderLeft: () => void
  onPressHeaderRight: () => void
  channel?: SendbirdGroupChannel
  onSearchChange?: (searchText: string) => void
}) {
  const { sdk } = useSendbirdChat()
  const [showMenu, setShowMenu] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchText, setSearchText] = useState("")

  const partnerInfo = useMemo(
    () => getPartnerInfo(channel, sdk?.currentUser?.userId),
    [channel, sdk?.currentUser?.userId]
  )

  // Fetch partner's profile data to get game name
  const { data: partnerProfile } = useUserProfile(partnerInfo?.id || "")

  const partnerOnlineStatus = getOnlineStatus(
    partnerInfo?.connectionStatus || "offline"
  )

  const tradeId = getTradeIdFromChannel(channel)

  // Determine display name from profile data
  const displayName = useMemo(() => {
    if (partnerProfile?.game_account_ign) {
      return partnerProfile.game_account_ign
    }
    if (partnerProfile?.display_name) {
      return partnerProfile.display_name
    }
    return partnerInfo?.name || "Unknown"
  }, [partnerProfile, partnerInfo])

  // Use profile avatar if available
  const avatarUrl = partnerProfile?.avatar_url || partnerInfo?.avatarUrl

  function handleBackPress() {
    onPressHeaderLeft()
  }

  function handleMenuPress() {
    setShowMenu(!showMenu)
  }

  function handleTradeDetailsPress() {
    setShowMenu(false)
    // TODO: Navigate to trade details when route is available
    console.log("Trade details pressed for:", tradeId)
  }

  function handleSearchChange(text: string) {
    setSearchText(text)
    onSearchChange?.(text)
  }

  function handleStartSearch() {
    setIsSearching(true)
  }

  function handleCloseSearch() {
    setIsSearching(false)
    setSearchText("")
    onSearchChange?.("")
  }

  // If we're searching, show search UI
  if (isSearching) {
    return (
      <View className="flex-row items-center border-border border-b bg-background px-3 py-2">
        <Pressable
          onPress={handleCloseSearch}
          className="mr-2 rounded-full p-1"
          hitSlop={15}
        >
          <Ionicons name="arrow-back" size={22} className="text-foreground" />
        </Pressable>

        <View className="flex-1 flex-row items-center rounded-lg border border-border bg-muted px-3 py-2">
          <Ionicons name="search" size={16} className="mr-2 text-muted-foreground" />
          <TextInput
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder="Search messages and cards..."
            className="flex-1 text-foreground"
            placeholderTextColor="rgb(115 115 115)"
            autoFocus
          />
          {searchText.length > 0 && (
            <Pressable
              onPress={() => handleSearchChange("")}
              className="ml-2 rounded-full p-1"
              hitSlop={10}
            >
              <Ionicons name="close" size={16} className="text-muted-foreground" />
            </Pressable>
          )}
        </View>
      </View>
    )
  }

  return (
    <>
      {showMenu && (
        <Pressable
          className="absolute inset-0 z-40"
          onPress={() => setShowMenu(false)}
        />
      )}

      <View className="flex-row items-center border-border border-b bg-background px-3 py-2">
        <Pressable
          onPress={handleBackPress}
          className="mr-2 rounded-full p-1"
          hitSlop={15}
        >
          <Ionicons name="arrow-back" size={22} className="text-foreground" />
        </Pressable>

        <View className="relative mr-2">
          <Avatar alt="" className="h-8 w-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>
              <Text className="text-xs">{displayName[0]?.toUpperCase()}</Text>
            </AvatarFallback>
          </Avatar>

          {partnerOnlineStatus !== "offline" && (
            <View
              className={`-right-0.5 -top-0.5 absolute h-3 w-3 rounded-full border border-background ${partnerOnlineStatus === "online"
                ? "bg-green-500"
                : "bg-yellow-500"
                }`}
            />
          )}
        </View>

        <View className="flex-1 flex-row items-center gap-1">
          <View className="flex-1">
            <Text className="font-semibold text-base" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {partnerOnlineStatus === "online"
                ? "Online"
                : partnerOnlineStatus === "recently_online"
                  ? "Recently online"
                  : "Offline"}
            </Text>
          </View>
        </View>

        {/* Search Button */}
        <Pressable
          onPress={handleStartSearch}
          className="mr-2 rounded-full p-1"
          hitSlop={15}
        >
          <Ionicons name="search" size={20} className="text-muted-foreground" />
        </Pressable>

        <View className="relative">
          <Pressable
            onPress={handleMenuPress}
            className="rounded-full p-1"
            hitSlop={15}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              className="text-muted-foreground"
            />
          </Pressable>

          {showMenu && (
            <View className="absolute top-10 right-0 z-50 min-w-36 rounded-lg border border-border bg-background shadow-lg">
              <Pressable
                onPress={() => {
                  setShowMenu(false)
                  router.push("/(tabs)/profile")
                }}
                className="flex-row items-center gap-2 p-3 active:bg-muted"
              >
                <Ionicons
                  name="person-outline"
                  size={14}
                  className="text-muted-foreground"
                />
                <Text className="text-xs">View Profile</Text>
              </Pressable>

              {tradeId && (
                <Pressable
                  onPress={handleTradeDetailsPress}
                  className="flex-row items-center gap-2 p-3 active:bg-muted"
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    className="text-muted-foreground"
                  />
                  <Text className="text-xs">Trade Details</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </>
  )
}

// Updated Chat List Header Component with working search
export function ChatListHeader({
  onPressRefresh,
  onPressDeleteAll,
  onSearchChange,
}: {
  onPressRefresh: () => void
  onPressDeleteAll: () => void
  onSearchChange: (searchText: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchText, setSearchText] = useState("")

  function handleSearchChange(text: string) {
    setSearchText(text)
    onSearchChange(text)
  }

  function handleCloseSearch() {
    setIsSearching(false)
    setSearchText("")
    onSearchChange("")
  }

  function handleMenuToggle() {
    console.log("🎯 Menu button pressed, current showMenu:", showMenu)
    setShowMenu(!showMenu)
  }

  function handleDeletePress() {
    console.log("🗑️ Clear Message History pressed")
    setShowMenu(false)
    onPressDeleteAll()
  }

  return (
    <View className="relative bg-background">
      {/* Main Header */}
      <View className="flex-row items-center border-border border-b bg-background px-3 py-2">
        {isSearching ? (
          /* Search Input */
          <View className="flex-1 flex-row items-center gap-2">
            <Pressable
              onPress={handleCloseSearch}
              className="rounded-full p-1"
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={20} className="text-foreground" />
            </Pressable>

            <View className="flex-1 flex-row items-center rounded-lg border border-border bg-muted px-3 py-2">
              <Ionicons name="search" size={16} className="mr-2 text-muted-foreground" />
              <TextInput
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Search messages..."
                className="flex-1 text-foreground"
                placeholderTextColor="rgb(115 115 115)"
                autoFocus
              />
              {searchText.length > 0 && (
                <Pressable
                  onPress={() => handleSearchChange("")}
                  className="ml-2 rounded-full p-1"
                  hitSlop={10}
                >
                  <Ionicons name="close" size={16} className="text-muted-foreground" />
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <>
            <View className="flex-1">
              <Text className="font-semibold text-foreground text-lg">Messages</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Pressable
                onPress={() => setIsSearching(true)}
                className="rounded-full p-2"
                hitSlop={10}
              >
                <Ionicons name="search" size={20} className="text-foreground" />
              </Pressable>

              <Pressable
                onPress={onPressRefresh}
                className="rounded-full p-2"
                hitSlop={10}
              >
                <Ionicons name="refresh" size={20} className="text-foreground" />
              </Pressable>

              <View className="relative">
                <Pressable
                  onPress={handleMenuToggle}
                  className="rounded-full p-2"
                  hitSlop={10}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    className="text-foreground"
                  />
                </Pressable>

                {showMenu && (
                  <>
                    {/* Debug indicator */}
                    {__DEV__ && console.log("🎯 Dropdown should be visible now")}

                    {/* Backdrop */}
                    <Pressable
                      className="absolute z-40"
                      style={{
                        position: 'absolute',
                        top: -100,
                        left: -1000,
                        right: -1000,
                        bottom: -1000,
                      }}
                      onPress={() => {
                        console.log("🎯 Backdrop pressed, closing menu")
                        setShowMenu(false)
                      }}
                    />

                    {/* Dropdown Menu */}
                    <View
                      className="absolute top-10 right-0 z-50 min-w-44 rounded-lg border border-border bg-background"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 8,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 16, // Higher elevation for Android
                      }}
                    >
                      <Pressable
                        onPress={handleDeletePress}
                        className="flex-row items-center gap-3 px-4 py-3 active:bg-destructive/10"
                        style={{
                          minHeight: 48, // Standard touch target
                        }}
                      >
                        <Ionicons
                          name="refresh-outline"
                          size={18}
                          className="text-destructive"
                        />
                        <Text className="flex-1 font-medium text-destructive text-sm">
                          Clear Message History
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  )
}
