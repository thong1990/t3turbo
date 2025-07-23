import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { toast } from "sonner-native"

import {
  createTradeSession,
  useAcceptTradeSessionMutation,
  useCancelTradeSessionMutation,
  useRejectTradeSessionMutation,
} from "../mutations"
import type { TradeMatch } from "../types"

export function useTradeInteractions(currentUserId?: string) {
  const queryClient = useQueryClient()

  // Custom mutation for creating trade sessions (complex logic)
  const createTradeSessionMutation = useMutation({
    mutationFn: async ({
      match,
      currentUserId,
    }: {
      match: TradeMatch
      currentUserId: string
    }) => {
      return await createTradeSession(match, currentUserId)
    },
    onSuccess: () => {
      // Invalidate trade matches to refresh the list
      queryClient.invalidateQueries({ queryKey: ["trade-matches"] })
    },
  })

  // Simple update mutations
  const acceptTradeSession = useAcceptTradeSessionMutation()
  const rejectTradeSession = useRejectTradeSessionMutation()
  const cancelTradeSession = useCancelTradeSessionMutation()

  const startTrade = async (match: TradeMatch) => {
    if (!currentUserId) {
      toast.error("Please log in to start trading")
      return
    }

    await createTradeSessionMutation.mutateAsync(
      { match, currentUserId },
      {
        onSuccess: tradeSession => {
          toast.success("Trade session created!")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

          // Route to the SendBird channel URL if available, otherwise use trade session ID
          const channelUrl =
            tradeSession.sendbird_channel_url || tradeSession.id

          router.push(`/messages/${channelUrl}`)
        },
        onError: error => {
          console.error("Error creating trade session:", error)
          toast.error("Failed to create trade session")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const acceptTrade = async (tradeSessionId: string) => {
    await acceptTradeSession.mutateAsync(
      { id: tradeSessionId, status: "active" },
      {
        onSuccess: () => {
          toast.success("Trade accepted!")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        },
        onError: error => {
          console.error("Error accepting trade:", error)
          toast.error("Failed to accept trade")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const rejectTrade = async (tradeSessionId: string) => {
    await rejectTradeSession.mutateAsync(
      { id: tradeSessionId, status: "rejected_by_receiver" },
      {
        onSuccess: () => {
          toast.success("Trade rejected")
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        onError: error => {
          console.error("Error rejecting trade:", error)
          toast.error("Failed to reject trade")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const cancelTrade = async (tradeSessionId: string) => {
    await cancelTradeSession.mutateAsync(
      { id: tradeSessionId, status: "cancelled_by_initiator" },
      {
        onSuccess: () => {
          toast.success("Trade cancelled")
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        onError: error => {
          console.error("Error cancelling trade:", error)
          toast.error("Failed to cancel trade")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  return {
    // Actions
    startTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,

    // Loading states
    isStartingTrade: createTradeSessionMutation.isPending,
    isAcceptingTrade: acceptTradeSession.isPending,
    isRejectingTrade: rejectTradeSession.isPending,
    isCancellingTrade: cancelTradeSession.isPending,
    isLoading:
      createTradeSessionMutation.isPending ||
      acceptTradeSession.isPending ||
      rejectTradeSession.isPending ||
      cancelTradeSession.isPending,
  }
}
