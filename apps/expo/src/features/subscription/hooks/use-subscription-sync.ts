import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabase } from "~/features/supabase/hooks/use-supabase"
import Purchases from "react-native-purchases"
import { useUser } from "~/features/supabase/hooks/use-user"

// Official RevenueCat pattern - simple sync on customer info changes
export async function useSubscriptionSync() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: user } = useUser()

  const callMethod = async (methodName: string, method: () => Promise<any>, params?: any) => {
    try {
      const result = await method();
    } catch (error) {
    }
  };

  const customerInfo = callMethod('getCustomerInfo', () => Purchases.getCustomerInfo())

  const syncSubscription = useMutation({
    mutationFn: async () => {
      if (!user?.id || !customerInfo) throw new Error("User not authenticated or no customer info")

      const { data, error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          status: customerInfo.activeSubscriptions.length > 0 ? "active" : "inactive",
          payment_provider: "revenuecat",
          payment_data: {
            revenue_cat_user_id: customerInfo.originalAppUserId,
            entitlements: Object.keys(customerInfo.entitlements.active),
            updated_at: new Date().toISOString(),
          },
          started_at: customerInfo.activeSubscriptions.length > 0 ? new Date().toISOString() : null,
          expires_at: null, // You can update this if you have expiration info
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
  }, [user?.id, customerInfo?.originalAppUserId])

  return {
    syncSubscription,
    isLoading: syncSubscription.isPending,
    error: syncSubscription.error,
  }
}