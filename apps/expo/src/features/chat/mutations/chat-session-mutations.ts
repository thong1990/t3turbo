import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner-native"

import { client } from "~/features/supabase/client"
import { MESSAGES } from "../constants"
import type { ChatSession } from "../types"
import { getExpirationTime } from "../utils"

export function useCreateChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tradeId,
      participants,
      channelUrl,
    }: {
      tradeId: string
      participants: string[]
      channelUrl: string
    }): Promise<ChatSession> => {
      const { data, error } = await client
        .from("chat_sessions")
        .insert({
          trade_id: tradeId,
          channel_url: channelUrl,
          participants,
          expires_at: getExpirationTime().toISOString(),
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        tradeId: data.trade_id,
        channelUrl: data.channel_url,
        participants: data.participants,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
        status: data.status as "active" | "expired",
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
      queryClient.invalidateQueries({ queryKey: ["chatList"] })
      queryClient.invalidateQueries({ queryKey: ["chatSession", data.tradeId] })
    },
    onError: error => {
      console.error("Failed to create chat session:", error)
      toast.error(MESSAGES.ERROR.FAILED_TO_CREATE_CHAT)
    },
  })
}

export function useExpireChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tradeId: string) => {
      const { data, error } = await client
        .from("chat_sessions")
        .update({ status: "expired" })
        .eq("trade_id", tradeId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
      queryClient.invalidateQueries({ queryKey: ["chatList"] })
      queryClient.invalidateQueries({
        queryKey: ["chatSession", data.trade_id],
      })
    },
    onError: error => console.error("Failed to expire chat session:", error),
  })
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chatSessionId: string) => {
      const { error } = await client
        .from("chat_sessions")
        .delete()
        .eq("id", chatSessionId)
      if (error) throw error
      return { id: chatSessionId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
      queryClient.invalidateQueries({ queryKey: ["chatList"] })
      toast.success("Chat deleted")
    },
    onError: error => {
      console.error("Failed to delete chat session:", error)
      toast.error("Failed to delete chat")
    },
  })
}

export function useDeleteAllChatSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await client
        .from("chat_sessions")
        .delete()
        .contains("participants", [userId])
        .eq("status", "active")

      if (error) throw error

      return { userId, deletedAt: new Date().toISOString() }
    },
    onSuccess: () => {
      // Invalidate all chat-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
      queryClient.invalidateQueries({ queryKey: ["chatList"] })
      queryClient.removeQueries({ queryKey: ["chatSession"] })

      try {
        const { clearDemoMessages } = require("../utils")
      } catch (error) {
        console.warn("Could not clear demo messages:", error)
      }

      toast.success("All chats deleted successfully")
    },
    onError: error => {
      console.error("Failed to delete all chat sessions:", error)
      toast.error("Failed to delete all chats")
    },
  })
}
