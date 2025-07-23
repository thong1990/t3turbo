import { useQuery } from "@tanstack/react-query"

import { getTradeMatches, useTradeCardsSubscription } from "../queries"

export function useTradesQuery(
  params: {
    userId?: string
    enabled?: boolean
  } = {}
) {
  const { userId, enabled = true } = params

  // Use the proper useSubscription hook for real-time updates
  useTradeCardsSubscription(userId)

  return useQuery({
    queryKey: ["trade-matches", userId],
    queryFn: () => (userId ? getTradeMatches(userId) : []),
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })
}
