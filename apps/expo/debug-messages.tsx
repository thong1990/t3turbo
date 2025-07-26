import { useSendbirdChat } from "@sendbird/uikit-react-native"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useUser } from "~/features/supabase/hooks"
import { Text } from "~/shared/components/ui/text"

export default function DebugMessagesScreen() {
  const { data: user } = useUser()
  const { sdk } = useSendbirdChat()

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-xl font-bold mb-4">Debug Messages Screen</Text>
        <Text className="mb-2">User: {user ? "✅ Authenticated" : "❌ Not authenticated"}</Text>
        <Text className="mb-2">User ID: {user?.id || "N/A"}</Text>
        <Text className="mb-2">User Email: {user?.email || "N/A"}</Text>
        <Text className="mb-2">Sendbird SDK: {sdk ? "✅ Available" : "❌ Not available"}</Text>
        <Text className="mb-2">SDK Current User: {sdk?.currentUser ? "✅ Connected" : "❌ Not connected"}</Text>
        <Text className="mb-2">SDK Connection State: {sdk?.connectionState || "Unknown"}</Text>
      </View>
    </SafeAreaView>
  )
}