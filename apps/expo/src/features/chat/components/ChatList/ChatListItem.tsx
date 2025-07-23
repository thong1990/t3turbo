import { router } from "expo-router"
import { Alert, Pressable, View } from "react-native"
import { Swipeable } from "react-native-gesture-handler"
import { Ionicons } from "~/shared/components/ui/icons"

import { RelativeDateTime } from "~/shared/components/datetime-relative"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/shared/components/ui/avatar"
import { Text } from "~/shared/components/ui/text"
import { UnreadCountBadge } from "~/shared/components/unread-count-badge"
import { useDeleteChatSession } from "../../mutations"
import type { ChatListItem as ChatListItemType } from "../../types"

// Type for a chat item
export type ChatListItemProps = {
  chat: ChatListItemType
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const deleteMutation = useDeleteChatSession()

  const handlePress = () => {
    // Use the channel URL if available, otherwise fall back to trade ID
    const routeId = chat.channelUrl || chat.tradeId
    console.log("🎯 ChatListItem routing to:", routeId)

    if (routeId) {
      router.push(`/messages/${routeId}`)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete your chat with ${chat.name}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(chat.id)
          },
        },
      ]
    )
  }

  const renderRightActions = () => {
    // Only log occasionally to prevent log spam - this was causing infinite loop logs
    if (Math.random() < 0.05) {
      console.log("🗑️ Rendering delete action for chat:", chat.name)
    }
    return (
      <View className="my-1 w-[100px] items-center justify-center bg-destructive px-2 py-1">
        <Pressable
          onPress={() => {
            console.log("🗑️ Delete button pressed for:", chat.name)
            handleDelete()
          }}
          className="h-full w-full items-center justify-center rounded-lg"
          disabled={deleteMutation.isPending}
        >
          <Ionicons
            name={
              deleteMutation.isPending ? "hourglass-outline" : "trash-outline"
            }
            size={24}
            className="text-destructive-foreground"
          />
          <Text className="mt-1 text-center font-semibold text-destructive-foreground text-xs">
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={30} // Lower threshold to make it easier to trigger
      friction={1}
      overshootRight={false}
      onSwipeableOpen={() => console.log("🏃 Swipe opened for:", chat.name)}
      onSwipeableClose={() => console.log("🔒 Swipe closed for:", chat.name)}
    >
      <Pressable
        className="flex-row items-center border-border border-b bg-background px-4 py-3"
        onPress={handlePress}
        style={{ minHeight: 80 }} // Ensure consistent height
      >
        <View className="relative">
          <Avatar alt="" className="h-16 w-16">
            <AvatarImage src={chat.avatarUrl} />
            <AvatarFallback>
              <Text className="text-2xl">{chat.name[0]}</Text>
            </AvatarFallback>
          </Avatar>

          {/* Enhanced Online Status Indicator */}
          <View
            className={`-right-1 -top-1 absolute h-5 w-5 rounded-full border-2 border-background ${chat.onlineStatus === "online"
              ? "bg-green-500"
              : chat.onlineStatus === "recently_online"
                ? "bg-yellow-500"
                : "bg-gray-400"
              }`}
          />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-foreground text-xl">
              {chat.name}
            </Text>
          </View>
          <Text className="text-lg text-muted-foreground" numberOfLines={1}>
            {chat.lastMessage}
          </Text>
        </View>
        <View className="ml-2 items-end">
          <RelativeDateTime
            date={chat.lastMessageAt}
            displayAbsoluteTimeAfterDay={1}
            className="text-muted-foreground text-xs"
          />
          {chat.unreadCount > 0 && (
            <View className="mt-1">
              <UnreadCountBadge count={chat.unreadCount} />
            </View>
          )}
        </View>
      </Pressable>
    </Swipeable>
  )
}
