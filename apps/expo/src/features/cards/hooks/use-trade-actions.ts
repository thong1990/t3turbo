import { useUser } from "~/features/supabase/hooks"
import { useUpsertUserCardMutation } from "../mutations"
import { useUserCardQuery } from "../queries"

export function useTradeActions(cardId: string, onToggleSuccess?: () => void) {
  const { data: user } = useUser()
  const {
    data: userCard,
    isLoading: isLoadingUserCard,
    refetch: refetchUserCard,
  } = useUserCardQuery({ cardId, userId: user?.id ?? "" }, !!user)
  const {
    mutate: upsert,
    isPending: isUpserting,
    error: mutationError,
  } = useUpsertUserCardMutation()

  const isGiving = (userCard?.quantity_tradeable ?? 0) > 0
  const isWanting = (userCard?.quantity_desired ?? 0) > 0

  // Explicit remove functions for tab remove buttons
  const removeFromGive = () => {
    if (!user) {
      return
    }

    const payload = {
      id: userCard?.id,
      user_id: user.id,
      card_id: cardId,
      quantity_tradeable: 0, // Always set to 0 to remove
      quantity_owned: userCard?.quantity_owned ?? 0,
      quantity_desired: userCard?.quantity_desired ?? 0,
    }

    upsert([payload], {
      onSuccess: data => {
        // Force refetch user card data after a short delay
        setTimeout(() => {
          refetchUserCard()
        }, 100)
      },
      onError: error => {},
    })
  }

  const removeFromWant = () => {
    if (!user) {
      return
    }

    const payload = {
      id: userCard?.id,
      user_id: user.id,
      card_id: cardId,
      quantity_desired: 0, // Always set to 0 to remove
      quantity_owned: userCard?.quantity_owned ?? 0,
      quantity_tradeable: userCard?.quantity_tradeable ?? 0,
    }

    upsert([payload], {
      onSuccess: data => {
        // Force refetch user card data after a short delay
        setTimeout(() => {
          refetchUserCard()
        }, 100)
      },
      onError: error => {},
    })
  }

  const toggleGive = () => {
    if (!user) {
      return
    }

    const newQuantityTradeable = isGiving ? 0 : 1
    const currentQuantityOwned = userCard?.quantity_owned ?? 0

    // Ensure quantity_owned is at least equal to quantity_tradeable
    const newQuantityOwned = Math.max(
      currentQuantityOwned,
      newQuantityTradeable
    )

    const payload = {
      id: userCard?.id,
      user_id: user.id,
      card_id: cardId,
      quantity_tradeable: newQuantityTradeable,
      quantity_owned: newQuantityOwned,
      quantity_desired: userCard?.quantity_desired ?? 0,
    }

    upsert([payload], {
      onSuccess: data => {
        // Trigger refresh after successful toggle
        setTimeout(() => {
          onToggleSuccess?.()
        }, 200)
      },
      onError: error => {},
    })
  }

  const toggleWant = () => {
    if (!user) {
      return
    }

    const newQuantityDesired = isWanting ? 0 : 1

    const payload = {
      id: userCard?.id,
      user_id: user.id,
      card_id: cardId,
      quantity_desired: newQuantityDesired,
      quantity_owned: userCard?.quantity_owned ?? 0,
      quantity_tradeable: userCard?.quantity_tradeable ?? 0,
    }

    upsert([payload], {
      onSuccess: data => {
        // Trigger refresh after successful toggle
        setTimeout(() => {
          onToggleSuccess?.()
        }, 200)
      },
      onError: error => {},
    })
  }

  return {
    userCard,
    isLoading: isLoadingUserCard || isUpserting,
    isGiving,
    isWanting,
    toggleGive,
    toggleWant,
    removeFromGive,
    removeFromWant,
    error: mutationError,
  }
}
