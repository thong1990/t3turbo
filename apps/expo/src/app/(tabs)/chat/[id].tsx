import { useLocalSearchParams } from "expo-router"
import { View } from "react-native"
import { ChatScreen } from "~/features/chat/components/ChatScreen/ChatScreen"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import { Text } from "~/shared/components/ui/text"

export default function ChatDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return (
      <Container>
        <Header title="Chat" hasBackButton />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Chat not found</Text>
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <ChatScreen tradeId={id} />
    </Container>
  )
}
