import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute stale
      retry: 1,
      // Prevent automatic refetching when app regains focus
      refetchOnWindowFocus: false,
    },
  },
})
