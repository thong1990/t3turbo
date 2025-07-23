import { router } from "expo-router"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"

import { BannerAd } from "~/features/ads/components/BannerAd"
import { ChatList } from "~/features/chat/components/ChatList/ChatList"
import { useUser } from "~/features/supabase/hooks"
import { Text } from "~/shared/components/ui/text"

export default function ChatScreen() {
  const { data: user } = useUser()

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

  // Show chat list for authenticated users
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        <ChatList />
      </View>
      {/* Banner Ad at bottom */}
      <BannerAd placement="chat-bottom" />
    </SafeAreaView>
  )
}
