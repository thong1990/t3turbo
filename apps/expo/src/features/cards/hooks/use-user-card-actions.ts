import { useUser } from "~/features/supabase/hooks"
import { useUpsertUserCardMutation } from "../mutations"
import { useUserCardQuery } from "../queries"

export function useUserCardActions(cardId: string) {
  const { data: user } = useUser()
  const { data: userCard, isLoading: isLoadingUserCard } = useUserCardQuery(
    { cardId, userId: user?.id ?? "" },
    !!user
  )
  const { mutate: upsert, isPending: isUpserting } = useUpsertUserCardMutation()

  const handleUpsert = (values: {
    quantity_owned?: number
    quantity_desired?: number
    quantity_tradeable?: number
  }) => {
    if (!user) return

    upsert([
      {
        id: userCard?.id,
        user_id: user.id,
        card_id: cardId,
        ...values,
      },
    ])
  }

  return {
    userCard,
    isLoading: isLoadingUserCard || isUpserting,
    handleUpsert,
  }
}
