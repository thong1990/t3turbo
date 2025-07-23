import { router } from "expo-router"
import { useState } from "react"
import { Pressable, View } from "react-native"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/shared/components/ui/avatar"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface ChatScreenHeaderProps {
  partnerName: string
  partnerAvatarUrl?: string
  partnerOnlineStatus: "online" | "recently_online" | "offline"
  tradeId: string
}

export function ChatScreenHeader({
  partnerName,
  partnerAvatarUrl,
  partnerOnlineStatus,
  tradeId,
}: ChatScreenHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

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
          onPress={() => router.replace("/(tabs)/chat")}
          className="mr-2 rounded-full p-1"
          hitSlop={15}
        >
          <Ionicons name="arrow-back" size={22} className="text-foreground" />
        </Pressable>

        <View className="relative mr-2">
          <Avatar alt="" className="h-8 w-8">
            <AvatarImage src={partnerAvatarUrl} />
            <AvatarFallback>
              <Text className="text-xs">{partnerName[0]}</Text>
            </AvatarFallback>
          </Avatar>

          {partnerOnlineStatus !== "offline" && (
            <View
              className={`-right-0.5 -top-0.5 absolute h-3 w-3 rounded-full border border-background ${
                partnerOnlineStatus === "online"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            />
          )}
        </View>

        <View className="flex-1 flex-row items-center gap-1">
          <View className="flex-1">
            <Text className="font-semibold text-base" numberOfLines={1}>
              {partnerName}
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

        <View className="relative">
          <Pressable
            onPress={() => setShowMenu(!showMenu)}
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

              <Pressable
                onPress={() => {
                  setShowMenu(false)
                  if (tradeId) {
                    router.push("/(tabs)/trade")
                  }
                }}
                className="flex-row items-center gap-2 p-3 active:bg-muted"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  className="text-muted-foreground"
                />
                <Text className="text-xs">Trade Details</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </>
  )
}
