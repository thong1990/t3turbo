import { router, useLocalSearchParams } from "expo-router"
import { memo, useMemo } from "react"
import { ActivityIndicator, View } from "react-native"

import { BannerAd } from "~/features/ads/components/BannerAd"
import { useUser } from "~/features/supabase/hooks"
import { TradeMatchList } from "~/features/trades/components/TradeMatchList"
import { useTradeInteractions, useTradesQuery } from "~/features/trades/hooks"
import { filterTradeMatches } from "~/features/trades/utils"
import { tradeUrlSearchParamsSchema } from "~/features/trades/validation"
import { Container } from "~/shared/components/container"
import { EmptyState } from "~/shared/components/ui/empty-state"
import { SearchBar } from "~/shared/components/ui/search-bar"
import { Text } from "~/shared/components/ui/text"
import { APP_CONFIG } from "~/shared/constants/app"

// Memoized header component to prevent unnecessary re-renders
const TradeScreenHeader = memo(() => (
  <View className="flex-row items-center justify-center py-3">
    <Text className="text-center font-semibold text-2xl text-foreground">
      {APP_CONFIG?.NAME || "PokeTradeTCG"}
    </Text>
  </View>
))

function TradeScreen() {
  const { data: user } = useUser()
  const rawParams = useLocalSearchParams()

  // Parse parameters using validation schema
  const parsed = tradeUrlSearchParamsSchema.safeParse(rawParams)
  const { search: searchQuery = "", ...filters } = parsed.success
    ? parsed.data
    : { search: "", rarity: [], elements: [], cardType: [], pack: [] }

  const {
    data: tradeMatches,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useTradesQuery({ userId: user?.id })

  const { startTrade, isStartingTrade } = useTradeInteractions(user?.id)

  const filteredMatches = useMemo(() => {
    if (!tradeMatches) return []

    // Convert filters to match the expected format
    const tradeFilters = {
      cardType: filters.cardType,
      rarity: filters.rarity,
      elements: filters.elements,
      sets: filters.pack, // Map pack to sets
    }

    return filterTradeMatches(tradeMatches, searchQuery, tradeFilters)
  }, [
    tradeMatches,
    searchQuery,
    filters.cardType,
    filters.rarity,
    filters.elements,
    filters.pack,
  ])

  const activeFilterCount = useMemo(() => 
    Object.values(filters).reduce(
      (total, filterArray) =>
        total + (Array.isArray(filterArray) ? filterArray.length : 0),
      0
    ), [filters]
  )

  const setSearchQuery = (search: string) => {
    router.setParams({ ...rawParams, search: search || undefined })
  }

  const handleFilterPress = () => {
    router.push({
      pathname: "/(modal)/trade-filters",
      params: rawParams,
    })
  }

  if (isLoading) {
    return (
      <Container edges={["top"]}>
        <View className="flex-1 gap-y-2 px-4 pt-4">
          <TradeScreenHeader />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <Text className="mt-2">Finding trade matches...</Text>
          </View>
        </View>
      </Container>
    )
  }

  if (error) {
    return (
      <Container edges={["top"]}>
        <View className="flex-1 gap-y-2 px-4 pt-4">
          <TradeScreenHeader />
          <EmptyState message="Something went wrong. Please try again." />
        </View>
      </Container>
    )
  }

  return (
    <>
      <Container edges={["top"]}>
        <View className="flex-1 gap-y-2 px-4 pt-4">
          <TradeScreenHeader />

          <SearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            placeholder="Search cards, rarities..."
            activeFiltersCount={activeFilterCount}
            onFilterPress={handleFilterPress}
          />

          <View className="flex-1">
            {!tradeMatches?.length && (
              <EmptyState message="No trade matches found." />
            )}

            {tradeMatches &&
              filteredMatches.length === 0 &&
              (searchQuery || activeFilterCount > 0) && (
                <EmptyState message="No trades match your filters." />
              )}

            {filteredMatches.length > 0 && (
              <TradeMatchList
                matches={filteredMatches}
                onTrade={startTrade}
                isCreatingTrade={isStartingTrade}
                onRefresh={refetch}
                isRefreshing={isFetching}
              />
            )}
          </View>
        </View>
      </Container>
      <BannerAd placement="home-bottom" />
    </>
  )
}

export default memo(TradeScreen)
