import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "~/features/supabase/client"
import { useUser } from "~/features/supabase/hooks"

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

export interface UpdateProfileData {
  display_name?: string | null
  avatar_url?: string | null
  game_account_id?: string | null
  game_account_ign?: string | null
}

export function useUserProfile() {
  const { data: user } = useUser()
  const queryClient = useQueryClient()

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.id) return null

      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
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
    enabled: !!user?.id,
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<UserProfile> => {
      if (!user?.id) throw new Error("User not authenticated")

      const { data: updatedProfile, error } = await client
        .from("user_profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error
      return updatedProfile
    },
    onSuccess: updatedProfile => {
      queryClient.setQueryData(["user-profile", user?.id], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] })
    },
  })

  const createProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<UserProfile> => {
      if (!user?.id) throw new Error("User not authenticated")

      const { data: newProfile, error } = await client
        .from("user_profiles")
        .insert({
          id: user.id,
          display_name:
            data.display_name || user.email?.split("@")[0] || "User",
          avatar_url: data.avatar_url,
          game_account_id: data.game_account_id,
          game_account_ign: data.game_account_ign,
          total_trades: 0,
          successful_trades: 0,
          failed_trades: 0,
        })
        .select()
        .single()

      if (error) throw error
      return newProfile
    },
    onSuccess: newProfile => {
      queryClient.setQueryData(["user-profile", user?.id], newProfile)
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] })
    },
  })

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    createProfile: createProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    isCreating: createProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    createError: createProfileMutation.error,
  }
}
