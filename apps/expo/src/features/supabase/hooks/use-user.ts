import { useQuery } from "@tanstack/react-query"

import { useSupabase } from "./use-supabase"

export function useUser() {
  const client = useSupabase()
  const queryKey = ["supabase", "user"]

  const queryFn = async () => {
    const response = await client.auth.getUser()

    // this is most likely a session error or the user is not logged in
    if (response.error) {
      return null
    }

    if (response.data?.user) {
      return response.data.user
    }

    return null // Return null instead of rejecting to prevent error loops
  }

  return useQuery({
    queryFn,
    queryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, // Don't retry on failure to prevent loops
  })
}
