import { useEffect, useRef } from "react"
import { useChatSession, useTradeSession } from "../queries"
import { useMessages } from "../queries"
import { recreateChannelWithMembers } from "../services/channel-management"
import { useRealtimeMessages } from "./use-realtime-messages"
import { useTradeChat } from "./use-trade-chat"

export function useChatInitialization(
  tradeId: string,
  sendbirdConnected: boolean,
  user: { id: string } | null
) {
  const lastInitAttempt = useRef<number>(0)

  const {
    data: chatSession,
    isLoading: chatLoading,
    refetch: refetchChatSession,
    error: chatError,
  } = useChatSession(tradeId)

  const {
    data: tradeSession,
    isLoading: tradeLoading,
    error: tradeError,
  } = useTradeSession(tradeId)

  const { initiateChatForTrade, isInitiating } = useTradeChat()

  // Set up real-time message listeners
  useRealtimeMessages(chatSession?.channelUrl || "", sendbirdConnected)

  // Check for channel recreation needs
  const { error: messagesError } = useMessages(
    chatSession?.channelUrl || "",
    sendbirdConnected ? user?.id : undefined
  )

  // Auto-initialize chat if needed
  useEffect(() => {
    const now = Date.now()
    const timeSinceLastAttempt = now - lastInitAttempt.current
    const cooldownPeriod = 5000

    const shouldInitializeChat =
      sendbirdConnected &&
      chatSession &&
      !chatSession.channelUrl &&
      chatSession.participants.length === 2 &&
      user?.id &&
      !isInitiating &&
      timeSinceLastAttempt > cooldownPeriod

    if (shouldInitializeChat) {
      lastInitAttempt.current = now

      const [initiatorId, receiverId] = chatSession.participants
      const currentUserId = user.id
      const isCurrentUserInitiator = initiatorId === currentUserId

      initiateChatForTrade({
        tradeId,
        initiatorId: isCurrentUserInitiator ? currentUserId : receiverId,
        receiverId: isCurrentUserInitiator ? receiverId : currentUserId,
      })
        .then(() => {
          refetchChatSession()
        })
        .catch(error => {
          console.error("❌ Failed to initialize chat:", error)
        })
    }
  }, [
    sendbirdConnected,
    chatSession,
    user?.id,
    tradeId,
    initiateChatForTrade,
    isInitiating,
    refetchChatSession,
  ])

  // Handle channel recreation if needed
  useEffect(() => {
    const needsRecreation =
      messagesError?.message === "CHANNEL_NEEDS_RECREATION" &&
      chatSession?.channelUrl &&
      tradeSession &&
      user?.id &&
      !isInitiating

    if (needsRecreation) {
      recreateChannelWithMembers(
        tradeId,
        tradeSession.initiator_id,
        tradeSession.receiver_id,
        chatSession.channelUrl
      )
        .then((newChannelUrl: string) => {
          refetchChatSession()
        })
        .catch((error: unknown) => {})
    }
  }, [
    messagesError,
    chatSession,
    tradeSession,
    user?.id,
    tradeId,
    isInitiating,
    refetchChatSession,
  ])

  return {
    chatSession,
    tradeSession,
    chatLoading,
    tradeLoading,
    isInitiating,
    chatError,
    tradeError,
    refetchChatSession,
  }
}
