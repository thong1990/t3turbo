import { useQuery } from "@tanstack/react-query"

import { client } from "~/features/supabase/client"

export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  game_account_id: string | null
  game_account_ign: string | null
  total_trades: number | null
  successful_trades: number | null
  failed_trades: number | null
  created_at: string | null
  updated_at: string | null
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["chat-user-profile", userId],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null

      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist, return null
          return null
        }
        throw error
      }

      return data
    },
    enabled: !!userId && userId.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
