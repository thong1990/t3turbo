import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useSupabase } from "./use-supabase"

export function useSignOut() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await client.auth.signOut()
      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
