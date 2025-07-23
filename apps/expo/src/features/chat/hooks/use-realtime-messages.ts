import { useQueryClient } from "@tanstack/react-query"
import * as Notifications from "expo-notifications"
import { useEffect, useRef } from "react"
import { AppState } from "react-native"

import { GetSendbirdSDK } from "../factory"
import type { Message } from "../types"

// Track message membership failures for debugging
const membershipFailures = new Map<string, number>()

export const recordChatMembershipFailure = (channelUrl: string) => {
  const current = membershipFailures.get(channelUrl) || 0
  membershipFailures.set(channelUrl, current + 1)
}

// Export function to check if channel needs recreation due to persistent failures
export const shouldRecreateChannel = (channelUrl: string): boolean => {
  // If we've had multiple failures for this specific channel, it should be recreated
  const failureCount = membershipFailures.get(channelUrl) || 0
  return failureCount >= 2
}

// Export function to reset tracking for a specific channel (after successful recreation)
export const resetChannelFailures = (channelUrl: string) => {
  membershipFailures.delete(channelUrl)
}

// Type definitions for SendBird objects
interface SendBirdChannelType {
  url: string
  name?: string
}

interface SendBirdMessageType {
  messageId: number
  message: string
  createdAt: number
  sender: {
    userId: string
    nickname?: string
  }
}

export const useRealtimeMessages = (channelUrl: string, enabled = true) => {
  const queryClient = useQueryClient()
  const listenerRef = useRef<(() => void) | null>(null)
  const channelRef = useRef<unknown>(null)

  useEffect(() => {
    if (!enabled || !channelUrl) return

    const sdk = GetSendbirdSDK()
    if (!sdk) {
      console.warn("SendBird SDK not initialized")
      return
    }

    const setupRealtimeListener = async () => {
      try {
        // Get the channel
        const channel = await sdk.groupChannel.getChannel(channelUrl)
        channelRef.current = channel

        // Create message handler
        const messageHandler = {
          onMessageReceived: (
            channel: SendBirdChannelType,
            message: SendBirdMessageType
          ) => {
            // Show push notification if app is in background
            if (AppState.currentState !== "active") {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: message.sender.nickname || "New Message",
                  body: message.message,
                  data: {
                    channelUrl: channel.url,
                    messageId: message.messageId,
                    type: "chat_message",
                  },
                },
                trigger: null, // Show immediately
              })
            }

            // Convert to our Message type
            const newMessage: Message = {
              id: message.messageId?.toString() || `received-${Date.now()}`,
              channelUrl: channel.url,
              senderId: message.sender.userId,
              message: message.message,
              timestamp: new Date(message.createdAt),
              messageType: "text",
            }

            // Update cache with new message
            queryClient.setQueryData(
              ["messages", channelUrl],
              (
                old:
                  | {
                      pages: Array<{ messages: Message[] }>
                      pageParams: unknown[]
                    }
                  | undefined
              ) => {
                if (!old) return old

                // Add to the first page (newest messages)
                const updatedPages = [...old.pages]
                if (updatedPages[0]) {
                  updatedPages[0] = {
                    ...updatedPages[0],
                    messages: [...updatedPages[0].messages, newMessage],
                  }
                } else {
                  updatedPages[0] = { messages: [newMessage] }
                }

                return {
                  ...old,
                  pages: updatedPages,
                }
              }
            )

            // Force refetch chat list to update last message
            const { clearLatestMessageCache } = require("../queries/chat-list")
            clearLatestMessageCache(channel.url)

            // Force immediate refetch instead of just invalidating
            queryClient.refetchQueries({
              queryKey: ["chatList"],
              type: "active",
            })
          },
          onMessageUpdated: (
            _channel: SendBirdChannelType,
            message: SendBirdMessageType
          ) => {
            // Handle message updates if needed
          },
          onMessageDeleted: (
            _channel: SendBirdChannelType,
            messageId: number
          ) => {
            // Handle message deletion if needed
          },
        }

        // Use the correct SendBird UIKit Chat SDK API
        // For SendBird UIKit, the method is different
        try {
          // Cast SDK to access handler methods
          const sdkWithHandlers = sdk as unknown as {
            addChannelHandler?: (id: string, handler: unknown) => void
            removeChannelHandler?: (id: string) => void
            addEventHandler?: (id: string, handler: unknown) => void
            removeEventHandler?: (id: string) => void
            eventHandlers?: {
              addChannelHandler?: (id: string, handler: unknown) => void
              removeChannelHandler?: (id: string) => void
            }
            onMessageReceived?: (
              channel: SendBirdChannelType,
              message: SendBirdMessageType
            ) => void
          }

          // Try the newer SendBird Chat SDK v4 API first
          if (typeof sdkWithHandlers.addChannelHandler === "function") {
            sdkWithHandlers.addChannelHandler(channelUrl, messageHandler)
          } else if (typeof sdkWithHandlers.addEventHandler === "function") {
            // Alternative method for some versions
            sdkWithHandlers.addEventHandler(channelUrl, messageHandler)
          } else if (
            sdkWithHandlers.eventHandlers &&
            typeof sdkWithHandlers.eventHandlers.addChannelHandler ===
              "function"
          ) {
            // Another possible structure
            sdkWithHandlers.eventHandlers.addChannelHandler(
              channelUrl,
              messageHandler
            )
          } else {
            // Try direct assignment approach for UIKit
            console.warn(
              "⚠️ Standard handler methods not found, trying alternative approaches"
            )

            // For some versions of SendBird UIKit, you might need to use a different approach
            // Let's try setting up a global handler
            if (sdkWithHandlers.onMessageReceived) {
              sdkWithHandlers.onMessageReceived =
                messageHandler.onMessageReceived
            } else {
              console.warn(
                "⚠️ Could not set up real-time listener - API not available"
              )
              // Don't throw error, just log and continue without real-time
              return
            }
          }

          // Store cleanup function
          listenerRef.current = () => {
            try {
              if (typeof sdkWithHandlers.removeChannelHandler === "function") {
                sdkWithHandlers.removeChannelHandler(channelUrl)
              } else if (
                typeof sdkWithHandlers.removeEventHandler === "function"
              ) {
                sdkWithHandlers.removeEventHandler(channelUrl)
              } else if (
                sdkWithHandlers.eventHandlers &&
                typeof sdkWithHandlers.eventHandlers.removeChannelHandler ===
                  "function"
              ) {
                sdkWithHandlers.eventHandlers.removeChannelHandler(channelUrl)
              }
            } catch (cleanupError) {
              console.warn("⚠️ Error during handler cleanup:", cleanupError)
            }
          }
        } catch (handlerError) {
          console.warn(
            "⚠️ Failed to set up message handler, but continuing:",
            handlerError
          )
          // Don't fail the whole setup, just log the warning
          // The app can still function without real-time updates
        }
      } catch (error) {
        console.error("❌ Failed to setup realtime listener:", error)
        recordChatMembershipFailure(channelUrl)
      }
    }

    setupRealtimeListener()

    // Cleanup function
    return () => {
      if (listenerRef.current) {
        listenerRef.current()
        listenerRef.current = null
      }
      channelRef.current = null
    }
  }, [channelUrl, enabled, queryClient])

  // Return channel reference for external use
  return { channel: channelRef.current }
}
