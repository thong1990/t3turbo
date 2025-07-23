import { router } from "expo-router"
import { Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface ChatScreenErrorProps {
  errorMessage: string
  onRetry: () => void
}

export function ChatScreenError({
  errorMessage,
  onRetry,
}: ChatScreenErrorProps) {
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
        <Text className="font-semibold text-lg">Chat</Text>
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <Ionicons name="warning" size={48} className="mb-4 text-destructive" />
        <Text className="mb-2 text-center text-destructive text-lg">
          Unable to load chat
        </Text>
        <Text className="mb-4 text-center text-muted-foreground">
          {errorMessage}
        </Text>
        <Pressable
          onPress={onRetry}
          className="rounded-lg bg-primary px-6 py-3"
        >
          <Text className="text-center font-medium text-primary-foreground">
            Try Again
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
