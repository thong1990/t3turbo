import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner-native"

import { MESSAGES, SENDBIRD_CUSTOM_TYPES } from "../constants"
import { GetSendbirdSDK } from "../factory"
import type { ChatListItem, Message } from "../types"
import {
  createErrorFromSendbirdError,
  createOptimisticMessage,
  isValidMessage,
  storeDemoMessage,
} from "../utils"

// Type for infinite query data structure
type InfiniteMessagesData = {
  pages: Array<{ messages: Message[]; nextCursor?: unknown }>
  pageParams: unknown[]
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      channelUrl,
      message,
      customType,
      data,
      currentUserId,
    }: {
      channelUrl: string
      message: string
      customType?: string
      data?: string
      currentUserId: string
    }) => {
      const sdk = GetSendbirdSDK()
      if (!sdk) {
        console.error("❌ SendBird SDK not available")
        throw new Error(MESSAGES.ERROR.SENDBIRD_NOT_INITIALIZED)
      }

      if (!channelUrl) throw new Error(MESSAGES.ERROR.CHANNEL_URL_REQUIRED)
      if (!isValidMessage(message))
        throw new Error(MESSAGES.ERROR.MESSAGE_REQUIRED)

      try {
        // Check if this is a demo/mock channel
        if (channelUrl.startsWith("demo-channel-")) {
          const demoMessage = {
            id: `demo-msg-${Date.now()}`,
            channelUrl,
            senderId: currentUserId,
            message: message,
            timestamp: new Date(),
            messageType: "text" as const,
            customData: undefined,
          }

          // Store the message locally for persistence
          storeDemoMessage(channelUrl, demoMessage)

          return demoMessage
        }

        const channel = await sdk.groupChannel.getChannel(channelUrl)

        const params = {
          message: message.trim(),
          ...(customType?.trim() && { customType: customType.trim() }),
          ...(data?.trim() && { data: data.trim() }),
        }

        const sentMessage = await channel.sendUserMessage(params)

        // Return optimistic message since SendBird response might not have immediate data
        return {
          id: `sent-${Date.now()}`,
          channelUrl,
          senderId: currentUserId,
          message: message,
          timestamp: new Date(),
          messageType: "text" as const,
          customData:
            customType === SENDBIRD_CUSTOM_TYPES.CARD_EXCHANGE && data
              ? (JSON.parse(data) as Message["customData"])
              : undefined,
        }
      } catch (error) {
        console.error("❌ Failed to send message:", error)
        console.error("❌ Error details:", {
          name: (error as Error).name,
          message: (error as Error).message,
          code: (error as unknown as { code?: string }).code,
        })
        throw createErrorFromSendbirdError(error)
      }
    },
    onMutate: async variables => {
      await queryClient.cancelQueries({
        queryKey: ["messages", variables.channelUrl],
      })

      const previousMessages = queryClient.getQueryData([
        "messages",
        variables.channelUrl,
      ])
      const optimisticMessage = createOptimisticMessage(
        variables.channelUrl,
        variables.currentUserId,
        variables.message,
        variables.customType,
        variables.data
      )

      queryClient.setQueryData(
        ["messages", variables.channelUrl],
        (old: InfiniteMessagesData | undefined) => {
          if (!old)
            return {
              pages: [{ messages: [optimisticMessage] }],
              pageParams: [null],
            }

          const newPages = [...old.pages]
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              messages: [...newPages[0].messages, optimisticMessage],
            }
          } else {
            newPages[0] = { messages: [optimisticMessage] }
          }

          return { ...old, pages: newPages }
        }
      )

      return { previousMessages }
    },
    onError: (err, variables, context) => {
      console.error("❌ Failed to send message:", err)
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", variables.channelUrl],
          context.previousMessages
        )
      }
      toast.error(MESSAGES.ERROR.FAILED_TO_SEND_MESSAGE)
    },
    onSuccess: (sentMessage, variables) => {
      queryClient.setQueryData(
        ["messages", variables.channelUrl],
        (old: InfiniteMessagesData | undefined) => {
          if (!old) return old

          const newPages = [...old.pages]
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              messages: newPages[0].messages.map((msg: Message) =>
                msg.id.startsWith("temp-") &&
                msg.message === sentMessage.message
                  ? sentMessage
                  : msg
              ),
            }
          }

          return { ...old, pages: newPages }
        }
      )

      queryClient.setQueryData(
        ["chatList", variables.currentUserId],
        (oldData: ChatListItem[] | undefined) => {
          if (!oldData) return oldData

          return oldData.map(chat => {
            const matchesChannel = chat.channelUrl === variables.channelUrl
            if (matchesChannel) {
              return {
                ...chat,
                lastMessage: sentMessage.message,
                lastMessageAt: sentMessage.timestamp.toISOString(),
                unreadCount: 0,
              }
            }
            return chat
          })
        }
      )

      // Background sync without disrupting UI
      setTimeout(() => {
        const { clearLatestMessageCache } = require("../queries/chat-list")
        clearLatestMessageCache(variables.channelUrl)
        queryClient.invalidateQueries({
          queryKey: ["chatList", variables.currentUserId],
          refetchType: "none", // Don't refetch immediately
        })
      }, 2000)
    },
  })
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: async (channelUrl: string) => {
      const sdk = GetSendbirdSDK()
      if (!sdk) throw new Error(MESSAGES.ERROR.SENDBIRD_NOT_INITIALIZED)

      try {
        const channel = await sdk.groupChannel.getChannel(channelUrl)
        await channel.markAsRead()

        return { channelUrl, markedAt: Date.now() }
      } catch (error) {
        throw error
      }
    },
    onError: error => {},
  })
}
