import { Alert, Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

import { useUser } from "~/features/supabase/hooks"
import { useDeleteAllChatSessions } from "../../mutations"

interface ChatListHeaderProps {
  onRefresh: () => void
  showRefreshIndicator: boolean
}

export function ChatListHeader({
  onRefresh,
  showRefreshIndicator,
}: ChatListHeaderProps) {
  const { data: user } = useUser()
  const deleteAllMutation = useDeleteAllChatSessions()

  const handleDeleteAllChats = () => {
    if (!user) return

    Alert.alert(
      "Delete All Chats",
      "Are you sure you want to delete all your chats? This action cannot be undone and will remove all chat history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {

            deleteAllMutation.mutate(user.id)
          },
        },
      ]
    )
  }

  return (
    <View className="flex-row items-center gap-4 bg-background px-4 py-3">
      <Text className="flex-1 font-semibold text-xl">Chat</Text>

      <Pressable
        onPress={onRefresh}
        className="rounded-full p-2"
        hitSlop={20}
        disabled={showRefreshIndicator}
      >
        <Ionicons
          name={showRefreshIndicator ? "refresh" : "refresh-outline"}
          className={
            showRefreshIndicator
              ? "animate-spin text-primary"
              : "text-muted-foreground transition-none"
          }
          size={24}
        />
      </Pressable>

      <Pressable
        onPress={handleDeleteAllChats}
        className="rounded-full p-2"
        hitSlop={20}
        disabled={deleteAllMutation.isPending || !user}
      >
        <Ionicons
          name={
            deleteAllMutation.isPending ? "hourglass-outline" : "trash-outline"
          }
          size={24}
          className="text-destructive"
        />
      </Pressable>
    </View>
  )
}
