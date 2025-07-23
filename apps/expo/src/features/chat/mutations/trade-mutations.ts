import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner-native"

import { client } from "~/features/supabase/client"
import { MESSAGES } from "../constants"
import type { TradeAction } from "../types"
import { useSendMessage } from "./message-mutations"

export function useAcceptTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tradeId: string) => {
      const { data, error } = await client
        .from("trade_sessions")
        .update({ status: "completed" })
        .eq("id", tradeId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["tradeSession", data.id] })
      queryClient.invalidateQueries({ queryKey: ["chatSession", data.id] })
      toast.success(MESSAGES.SUCCESS.TRADE_ACCEPTED)
    },
    onError: error => {
      console.error("Failed to accept trade:", error)
      toast.error("Failed to accept trade")
    },
  })
}

export function useCancelTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tradeId,
      userId,
    }: { tradeId: string; userId: string }) => {
      const { data: tradeData, error: fetchError } = await client
        .from("trade_sessions")
        .select("initiator_id")
        .eq("id", tradeId)
        .single()

      if (fetchError) throw fetchError

      const status =
        tradeData.initiator_id === userId
          ? "cancelled_by_initiator"
          : "rejected_by_receiver"

      const { data, error } = await client
        .from("trade_sessions")
        .update({ status })
        .eq("id", tradeId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["tradeSession", data.id] })
      queryClient.invalidateQueries({ queryKey: ["chatSession", data.id] })
      toast.success(MESSAGES.SUCCESS.TRADE_CANCELLED)
    },
    onError: error => {
      console.error("Failed to cancel trade:", error)
      toast.error("Failed to cancel trade")
    },
  })
}

export function useSendTradeAction() {
  const sendMessage = useSendMessage()

  return useMutation({
    mutationFn: async ({
      channelUrl,
      action,
      tradeId,
    }: {
      channelUrl: string
      action: TradeAction
      tradeId: string
    }) => {
      const actionMessages = {
        accept: "Trade accepted! 🎉",
        modify: "Trade modified",
        cancel: "Trade cancelled",
        add_card: "Added card to trade",
        remove_card: "Removed card from trade",
      }

      const message = actionMessages[action.type]
      const customData = JSON.stringify({
        type: "trade_action",
        action,
        tradeId,
      })

      return sendMessage.mutateAsync({
        channelUrl,
        message,
        customType: "trade_action",
        data: customData,
        currentUserId: "system",
      })
    },
    onError: error => {
      console.error("Failed to send trade action:", error)
      toast.error("Failed to send trade action")
    },
  })
}
