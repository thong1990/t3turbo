import * as Haptics from "expo-haptics"
import { toast } from "sonner-native"

import {
  useDeleteDeckInteractionMutation,
  useInsertDeckInteractionMutation,
} from "../mutations"
import type { Database } from "~/features/supabase/database.types"

type UserDeckInteractionInsert = Database["public"]["Tables"]["user_deck_interactions"]["Insert"]
import {
  useDeckInteractionCountsQuery,
  useDeckInteractionStatusQuery,
} from "../queries"

export function useDeckInteractions(deckId: string, userId: string) {
  const { data: interactionCounts } = useDeckInteractionCountsQuery(deckId)
  const { data: likeStatus } = useDeckInteractionStatusQuery(
    deckId,
    userId,
    "upvote"
  )
  const { data: favoriteStatus } = useDeckInteractionStatusQuery(
    deckId,
    userId,
    "favorite"
  )

  const insertMutation = useInsertDeckInteractionMutation()
  const deleteMutation = useDeleteDeckInteractionMutation()

  const isLiked = !!likeStatus
  const isFavorite = !!favoriteStatus

  // Calculate counts from interactions
  const counts = {
    likes:
      interactionCounts?.filter(i => i.interaction_type === "upvote").length ||
      0,
    favorites:
      interactionCounts?.filter(i => i.interaction_type === "favorite")
        .length || 0,
    shares:
      interactionCounts?.filter(i => i.interaction_type === "share").length ||
      0,
  }

  const toggleInteraction = async (
    type: "upvote" | "favorite",
    isActive: boolean,
    existingId?: string
  ) => {
    if (isActive && existingId) {
      await deleteMutation.mutateAsync(
        { id: existingId },
        {
          onSuccess: () => {
            if (type === "upvote") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            } else {
              toast.success("Removed from favorites")
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
            }
          },
          onError: error => {
            console.error(`Error toggling deck ${type}:`, error)
            if (type === "favorite") {
              toast.error("Failed to update favorites")
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          },
        }
      )
    } else {
      const interactionData: UserDeckInteractionInsert = {
        user_id: userId,
        deck_id: deckId,
        interaction_type: type,
      }
      await insertMutation.mutateAsync(
        [interactionData],
        {
          onSuccess: () => {
            if (type === "upvote") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            } else {
              toast.success("Added to favorites")
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
            }
          },
          onError: error => {
            console.error(`Error toggling deck ${type}:`, error)
            if (type === "favorite") {
              toast.error("Failed to update favorites")
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          },
        }
      )
    }
  }

  const shareDeck = async () => {
    const shareData: UserDeckInteractionInsert = {
      user_id: userId,
      deck_id: deckId,
      interaction_type: "share",
    }
    await insertMutation.mutateAsync(
      [shareData],
      {
        onSuccess: () => {
          toast.success("Deck shared successfully!")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        },
        onError: error => {
          console.error("Error sharing deck:", error)
          toast.error("Failed to share deck")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  return {
    // Status
    isLiked,
    isFavorite,
    counts,

    // Actions
    toggleLike: () => toggleInteraction("upvote", isLiked, likeStatus?.id),
    toggleFavorite: () =>
      toggleInteraction("favorite", isFavorite, favoriteStatus?.id),
    shareDeck,

    // Loading states
    isLoading: insertMutation.isPending || deleteMutation.isPending,
  }
}
