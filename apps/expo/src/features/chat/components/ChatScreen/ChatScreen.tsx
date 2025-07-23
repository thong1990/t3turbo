import { useEffect, useRef, useState } from "react"
import { KeyboardAvoidingView, View } from "react-native"

import { useUser } from "~/features/supabase/hooks"
import { usePartnerInfo } from "../../hooks/use-partner-info"
import { useSendbirdInitialization } from "../../hooks/use-sendbird-initialization"
import { useTradeChat } from "../../hooks/use-trade-chat"
import { useChatSession } from "../../queries/chat-sessions"
import type { ChatScreenProps } from "../../types"
import { TradeContext } from "../CardExchange/TradeContext"
import { MessageInput } from "../ChatMessage/MessageInput"
import { MessageList } from "../ChatMessage/MessageList"
import { ChatScreenError } from "./ChatScreenError"
import { ChatScreenHeader } from "./ChatScreenHeader"
import { ChatScreenLoading } from "./ChatScreenLoading"

export function ChatScreen({ tradeId }: ChatScreenProps) {
  const { data: user } = useUser()
  const { isInitialized: sendbirdReady, error: sendbirdError } =
    useSendbirdInitialization()

  const [isTradeContextExpanded, setIsTradeContextExpanded] = useState(true)

  const {
    data: chatSession,
    isLoading: chatLoading,
    error: chatError,
    refetch: refetchChatSession,
  } = useChatSession(tradeId)

  // Create fallback demo session early for use in hooks
  const fallbackSession = {
    id: `fallback-${tradeId}`,
    tradeId,
    channelUrl: `demo-channel-${tradeId}`,
    participants: [user?.id || "unknown", "demo-partner"],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    status: "active" as const,
    tradeSession: {
      id: tradeId,
      status: "pending_acceptance" as const,
      initiatorId: user?.id || "unknown",
      receiverId: "demo-partner",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sendbirdChannelUrl: undefined,
    },
  }

  const { partnerProfile, partnerOnlineStatus, partnerName } = usePartnerInfo(
    chatSession || fallbackSession,
    user || null
  )

  const { initiateChatForTrade, isInitiating } = useTradeChat()
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const creationAttempts = useRef(0)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  // Auto-create real SendBird channels for placeholder URLs
  useEffect(() => {
    if (!chatSession || !user || !sendbirdReady || isCreatingChannel) return

    const isPlaceholderChannel =
      !chatSession.channelUrl || chatSession.channelUrl.startsWith("trade-")

    const hasTradeSession = chatSession.tradeSession

    // Prevent infinite attempts - max 2 attempts per session
    if (
      isPlaceholderChannel &&
      hasTradeSession &&
      creationAttempts.current < 2
    ) {

      setIsCreatingChannel(true)
      creationAttempts.current++

      // Get partner ID from trade session (with type guard)
      const partnerId =
        hasTradeSession.initiatorId === user.id
          ? hasTradeSession.receiverId
          : hasTradeSession.initiatorId

      // Add timeout protection to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn(
          "⏰ Channel creation timeout, falling back to demo channel"
        )
        setIsCreatingChannel(false)
      }, 15000) // 15 second timeout

      // Automatically create real SendBird channel
      initiateChatForTrade({
        tradeId,
        initiatorId: hasTradeSession.initiatorId,
        receiverId: hasTradeSession.receiverId,
      })
        .then(() => {

          clearTimeout(timeoutId)
          creationAttempts.current = 0 // Reset on success
          refetchChatSession()
        })
        .catch(error => {
          console.warn(
            "⚠️ Failed to auto-create channel, using fallback:",
            error
          )
          clearTimeout(timeoutId)
        })
        .finally(() => {
          setIsCreatingChannel(false)
        })
    } else if (isPlaceholderChannel && creationAttempts.current >= 2) {

    }
  }, [
    chatSession,
    user,
    sendbirdReady,
    tradeId,
    initiateChatForTrade,
    refetchChatSession,
    isCreatingChannel,
  ])

  // Maximum loading timeout to prevent infinite loading
  useEffect(() => {
    const loadingTimeoutId = setTimeout(() => {
      console.warn(
        "⏰ ChatScreen loading timeout - forcing fallback to demo channel"
      )
      setHasTimedOut(true)
    }, 20000) // 20 second maximum loading time

    // Clear timeout if we stop loading
    if (!chatLoading || chatSession || chatError) {
      clearTimeout(loadingTimeoutId)
    }

    return () => clearTimeout(loadingTimeoutId)
  }, [chatLoading, chatSession, chatError])

  // Use actual session or fallback
  const effectiveSession = chatSession || fallbackSession
  const effectiveChannelUrl =
    effectiveSession.channelUrl || `demo-channel-${tradeId}`

  if (hasTimedOut && !chatSession) {

  }

  // Debug logging removed to prevent infinite loops

  // Enhanced loading state - only show loading if actually loading
  if ((chatLoading && !hasTimedOut) || !user || isCreatingChannel) {

    return (
      <ChatScreenLoading
        sendbirdConnected={sendbirdReady && !sendbirdError}
        isInitiating={isCreatingChannel}
      />
    )
  }

  // Enhanced error state - only show error if truly an error
  if (!chatSession && chatError && !hasTimedOut) {
    const errorMessage = chatError?.message || "Chat session not found"
    return (
      <ChatScreenError
        errorMessage={errorMessage}
        onRetry={() => {
          refetchChatSession()
        }}
      />
    )
  }

  return (
    <View className="flex-1">
      <ChatScreenHeader
        partnerName={partnerName}
        partnerAvatarUrl={partnerProfile?.avatar_url || undefined}
        partnerOnlineStatus={partnerOnlineStatus?.onlineStatus || "offline"}
        tradeId={tradeId}
      />

      {effectiveSession.tradeSession && (
        <TradeContext
          tradeSession={effectiveSession.tradeSession}
          partnerName={partnerName}
          partnerAvatar={partnerProfile?.avatar_url || undefined}
          chatChannelUrl={effectiveChannelUrl}
          onToggle={setIsTradeContextExpanded}
        />
      )}

      <View className="flex-1">
        <MessageList
          channelUrl={effectiveChannelUrl}
          currentUserId={user?.id || ""}
        />
      </View>

      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={35}>
        <MessageInput
          channelUrl={effectiveChannelUrl}
          disabled={(() => {
            const isDisabled =
              effectiveSession.tradeSession?.status === "completed" ||
              effectiveSession.tradeSession?.status === "expired"



            return isDisabled
          })()}
        />
      </KeyboardAvoidingView>
    </View>
  )
}
