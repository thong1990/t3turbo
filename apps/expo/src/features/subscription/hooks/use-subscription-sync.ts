import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabase } from "~/features/supabase/hooks/use-supabase"
import { useSubscription } from "./use-subscription"
import { useUser } from "~/features/supabase/hooks/use-user"

// Official RevenueCat pattern - simple sync on customer info changes
export function useSubscriptionSync() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: user } = useUser()
  const { isSubscribed, customerInfo } = useSubscription()

  const syncSubscription = useMutation({
    mutationFn: async () => {
      if (!user?.id || !customerInfo) throw new Error("User not authenticated or no customer info")

      const { data, error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          is_active: isSubscribed,
          revenue_cat_user_id: customerInfo.originalAppUserId,
          payment_provider: "revenuecat",
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
    },
    onError: (error) => {
      console.error('Subscription sync failed:', error)
    },
  })

  // Sync when subscription status changes
  useEffect(() => {
    if (user?.id && customerInfo) {
      syncSubscription.mutate()
    }
  }, [isSubscribed, user?.id, customerInfo?.originalAppUserId])

  return {
    syncSubscription,
    isLoading: syncSubscription.isPending,
    error: syncSubscription.error,
  }
}