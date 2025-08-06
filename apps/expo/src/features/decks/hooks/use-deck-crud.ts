import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { toast } from "sonner-native"

import {
  useDeleteDeckCardsMutation,
  useDeleteDeckMutation,
  useInsertDeckMutation,
  useUpdateDeckMutation,
  useUpsertDeckCardsMutation,
} from "../mutations"
import type { CardInDeck } from "../types"

export function useDeckCrud() {
  const insertDeckMutation = useInsertDeckMutation()
  const updateDeckMutation = useUpdateDeckMutation()
  const deleteDeckMutation = useDeleteDeckMutation()
  const upsertDeckCardsMutation = useUpsertDeckCardsMutation()
  const deleteDeckCardsMutation = useDeleteDeckCardsMutation()

  const createDeck = async (deckData: {
    name: string
    description?: string
    isPublic?: boolean
    userId: string
    cards: CardInDeck[]
  }) => {
    const newDeck = await insertDeckMutation.mutateAsync(
      {
        name: deckData.name,
        description: deckData.description,
        is_public: deckData.isPublic ?? false,
        user_id: deckData.userId,
        views: 0,
      },
      {
        onSuccess: () => {
          toast.success("Deck created successfully!")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        },
        onError: error => {
          console.error("Error creating deck:", error)
          toast.error("Failed to create deck")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )

    if (newDeck?.[0]?.id && deckData.cards.length > 0) {
      const deckCards = deckData.cards.map(card => ({
        deck_id: newDeck?.[0]?.id || "",
        card_id: card.id,
        quantity: card.count,
      }))

      await upsertDeckCardsMutation.mutateAsync(deckCards)
    }

    if (newDeck?.[0]?.id) {
      router.push(`/decks/${newDeck[0].id}`)
    }

    return newDeck
  }

  const updateDeck = async (deckData: {
    id: string
    name?: string
    description?: string
    isPublic?: boolean
    cards?: CardInDeck[]
  }) => {
    // Update deck metadata
    if (
      deckData.name !== undefined ||
      deckData.description !== undefined ||
      deckData.isPublic !== undefined
    ) {
      await updateDeckMutation.mutateAsync(
        {
          id: deckData.id,
          ...(deckData.name !== undefined && { name: deckData.name }),
          ...(deckData.description !== undefined && {
            description: deckData.description,
          }),
          ...(deckData.isPublic !== undefined && {
            is_public: deckData.isPublic,
          }),
        },
        {
          onSuccess: () => {
            toast.success("Deck updated successfully!")
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          },
          onError: error => {
            console.error("Error updating deck:", error)
            toast.error("Failed to update deck")
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          },
        }
      )
    }

    // Update cards if provided
    if (deckData.cards) {
      // First delete all existing cards for this deck
      await deleteDeckCardsMutation.mutateAsync({ deck_id: deckData.id })

      // Then insert the new cards
      if (deckData.cards.length > 0) {
        const deckCards = deckData.cards.map(card => ({
          deck_id: deckData.id,
          card_id: card.id,
          quantity: card.count,
        }))

        await upsertDeckCardsMutation.mutateAsync(deckCards)
      }
    }
  }

  const deleteDeck = async (deckId: string) => {
    await deleteDeckMutation.mutateAsync(
      { id: deckId },
      {
        onSuccess: () => {
          toast.success("Deck deleted successfully!")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          router.push("/decks")
        },
        onError: error => {
          console.error("Error deleting deck:", error)
          toast.error("Failed to delete deck")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  return {
    createDeck,
    updateDeck,
    deleteDeck,
    isLoading:
      insertDeckMutation.isPending ||
      updateDeckMutation.isPending ||
      deleteDeckMutation.isPending ||
      upsertDeckCardsMutation.isPending ||
      deleteDeckCardsMutation.isPending,
    isCreating:
      insertDeckMutation.isPending || upsertDeckCardsMutation.isPending,
    isUpdating:
      updateDeckMutation.isPending ||
      upsertDeckCardsMutation.isPending ||
      deleteDeckCardsMutation.isPending,
    isDeleting: deleteDeckMutation.isPending,
  }
}
