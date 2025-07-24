import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner-native"

import { client } from "~/features/supabase/client"
import { useCreateChatSession } from "../mutations/chat-session-mutations"
import {
  cleanupDuplicateChatSessions,
  getOrCreateTradeChannel,
} from "../services/channel-management"

export const useTradeChat = () => {
  const createChatSession = useCreateChatSession()

  const initiateChatForTrade = useMutation({
    mutationFn: async ({
      tradeId,
      initiatorId,
      receiverId,
    }: {
      tradeId: string
      initiatorId: string
      receiverId: string
    }) => {
      try {
        const { data: existingChatSession } = await client
          .from("chat_sessions")
          .select("id, channel_url")
          .eq("trade_id", tradeId)
          .eq("status", "active")
          .single()

        if (existingChatSession) {
          const isPlaceholderChannel =
            existingChatSession.channel_url?.startsWith("trade-")

          if (isPlaceholderChannel) {
          } else {
            return {
              chatSession: existingChatSession,
              channelUrl: existingChatSession.channel_url,
            }
          }
        }

        const channelUrl = await getOrCreateTradeChannel(
          tradeId,
          initiatorId,
          receiverId
        )

        let chatSession: { id: string; channelUrl: string }
        if (existingChatSession) {
          const { data: updatedSession, error } = await client
            .from("chat_sessions")
            .update({ channel_url: channelUrl })
            .eq("id", existingChatSession.id)
            .select()
            .single()

          if (error) throw error
          chatSession = {
            id: updatedSession.id,
            channelUrl: updatedSession.channel_url,
          }
        } else {
          chatSession = await createChatSession.mutateAsync({
            tradeId,
            participants: [initiatorId, receiverId],
            channelUrl,
          })
        }

        await cleanupDuplicateChatSessions(tradeId)

        return {
          chatSession,
          channelUrl: chatSession.channelUrl,
        }
      } catch (error) {
        console.error("❌ Failed to initiate chat for trade:", error)
        throw error
      }
    },
    onSuccess: () => {
      toast.success("Chat started for trade!")
    },
    onError: error => {
      console.error("Failed to initiate trade chat:", error)
      toast.error("Failed to start chat for trade")
    },
  })

  return {
    initiateChatForTrade: initiateChatForTrade.mutateAsync,
    isInitiating: initiateChatForTrade.isPending,
  }
}
