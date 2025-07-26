import { createGroupChannelListFragment, useSendbirdChat } from "@sendbird/uikit-react-native"
import { router } from "expo-router"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"
import { useUser } from "~/features/supabase/hooks"

const GroupChannelListFragment = createGroupChannelListFragment({
  Header: () => null,
})

export default function MessagesScreen() {
  const { data: user } = useUser()
  const { sdk } = useSendbirdChat()

  console.log("📱 Messages screen loaded - User:", !!user, "SDK:", !!sdk)

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons
            name="chatbubbles-outline"
            size={96}
            className="text-muted-foreground"
          />
          <Text className="mt-6 text-center font-semibold text-foreground text-xl">
            Messages
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
      </SafeAreaView>
    )
  }

  // Show messages list for authenticated users
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="p-4">
        <Text className="text-xl font-bold">Messages</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          User: {user.email} | SDK: {sdk ? "Connected" : "Not connected"}
        </Text>
      </View>

      <GroupChannelListFragment
        onPressCreateChannel={() => {
          return
        }}
        onPressChannel={channel => {
          router.navigate(`/messages/${channel.url}`)
        }}
      />
    </SafeAreaView>
  )
}