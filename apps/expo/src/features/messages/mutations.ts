import { useSendbirdChat } from "@sendbird/uikit-react-native"
import { useMutation } from "@tanstack/react-query"
import { client } from "~/features/supabase/client"

interface SendMessageParams {
  channelUrl: string
  message: string
  customType?: string
  data?: string
  currentUserId: string
}

interface UpdateTradeSessionParams {
  tradeId: string
  status: "pending" | "completed" | "cancelled"
}

export function useSendMessage() {
  const { sdk } = useSendbirdChat()

  return useMutation({
    mutationFn: async ({
      channelUrl,
      message,
      customType,
      data,
    }: SendMessageParams) => {
      if (!sdk) {
        throw new Error("Sendbird SDK not initialized")
      }

      const channel = await sdk.groupChannel.getChannel(channelUrl)

      const params = {
        message,
        customType: customType || "",
        data: data || "",
      }

      const sentMessage = await channel.sendUserMessage(params)
      return sentMessage
    },
  })
}

export function useUpdateTradeSession() {
  return useMutation({
    mutationFn: async ({ tradeId, status }: UpdateTradeSessionParams) => {
      const { data, error } = await client
        .from("trade_sessions")
        .update({ status })
        .eq("id", tradeId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
  })
}
