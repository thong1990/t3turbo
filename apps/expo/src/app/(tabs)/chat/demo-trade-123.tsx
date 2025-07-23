import { ChatScreen } from "~/features/chat/components/ChatScreen/ChatScreen"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"

export default function DemoChatPage() {
  // Demo trade ID for testing
  const demoTradeId = "demo-trade-123"

  return (
    <Container>
      <Header title="Demo Chat" hasBackButton />
      <ChatScreen tradeId={demoTradeId} />
    </Container>
  )
}
