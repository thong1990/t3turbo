import { QueryClient } from "@tanstack/react-query"
import { handleError } from "~/shared/utils/error-handler"
import { PERFORMANCE_THRESHOLDS } from "~/shared/constants/app"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: PERFORMANCE_THRESHOLDS.QUERY_STALE_TIME_MS,
      gcTime: PERFORMANCE_THRESHOLDS.QUERY_CACHE_TIME_MS,
      retry: (failureCount, error) => {
        // Don't retry 4xx errors except 408 (timeout)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500 && status !== 408) {
            return false
          }
        }
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
      onError: (error) => {
        handleError(error instanceof Error ? error : new Error(String(error)), {
          action: 'mutation_error',
        })
      },
    },
  },
})
