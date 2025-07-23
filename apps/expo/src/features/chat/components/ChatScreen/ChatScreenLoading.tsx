import { router } from "expo-router"
import { ActivityIndicator, Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface ChatScreenLoadingProps {
  sendbirdConnected: boolean
  isInitiating: boolean
}

export function ChatScreenLoading({
  sendbirdConnected,
  isInitiating,
}: ChatScreenLoadingProps) {
  const loadingText = sendbirdConnected
    ? isInitiating
      ? "Initializing secure chat..."
      : "Loading chat..."
    : "Connecting to chat service..."

  return (
    <View className="flex-1">
      <View className="flex-row items-center border-border border-b bg-background px-4 py-3">
        <Pressable
          onPress={() => router.replace("/(tabs)/chat")}
          className="mr-3 rounded-full p-2"
          hitSlop={20}
        >
          <Ionicons name="arrow-back" size={24} className="text-foreground" />
        </Pressable>
        <Text className="font-semibold text-lg">Loading...</Text>
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="large" className="mb-4" />
        <Text className="text-center text-lg text-muted-foreground">
          {loadingText}
        </Text>
        {!sendbirdConnected && (
          <Text className="mt-2 text-center text-muted-foreground text-sm">
            Establishing secure connection...
          </Text>
        )}
        {isInitiating && (
          <Text className="mt-2 text-center text-muted-foreground text-sm">
            Setting up encrypted messaging...
          </Text>
        )}
      </View>
    </View>
  )
}
