import { router, useLocalSearchParams } from "expo-router"
import { useMemo } from "react"
import { View } from "react-native"

import { BannerAd } from "~/features/ads/components/BannerAd"
import { CardsTabContent } from "~/features/cards/components/CardsTabContent"
import { useCardsTabs } from "~/features/cards/hooks/use-cards-tabs"
import { cardUrlSearchParamsSchema } from "~/features/cards/validation"
import { Container } from "~/shared/components/container"
import { EmptyState } from "~/shared/components/ui/empty-state"
import { SearchBar } from "~/shared/components/ui/search-bar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/shared/components/ui/tabs"
import { Text } from "~/shared/components/ui/text"

export default function CardsScreen() {
  const rawParams = useLocalSearchParams()

  const parsedParams = cardUrlSearchParamsSchema.safeParse(rawParams)

  if (!parsedParams.success) {
    return <EmptyState message="Invalid filters" />
  }

  const { search, ...filters } = parsedParams.data

  // Use URL param for tab state, default to 'cards'
  const activeTab = typeof rawParams.tab === "string" ? rawParams.tab : "cards"

  const { getTabState, handleRefresh, handleSilentRefresh, isRefreshing } =
    useCardsTabs({
      filters,
      searchQuery: search,
    })

  const activeFilterCount = Object.values(filters).reduce(
    (acc, arr) => acc + (arr?.length ?? 0),
    0
  )
  const hasActiveFilters = activeFilterCount > 0

  const gridActions = useMemo(
    () => ({
      onNavigateToCard: (cardId: string) =>
        router.push(`/(tabs)/cards/${cardId}`),
    }),
    []
  )

  const setSearchQuery = (search: string) => {
    router.setParams({ ...rawParams, search: search || undefined })
  }

  const handleFilterPress = () => {
    router.push({
      pathname: "/(modal)/card-filters",
      params: {
        ...rawParams,
        returnTo: "/(tabs)/cards",
      },
    })
  }

  const handleTabChange = (tab: string) => {
    router.setParams({ ...rawParams, tab })
  }

  return (
    <Container edges={["top"]}>
      <View className="flex-1 gap-y-2 px-4 pt-4">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-1"
        >
          <TabsList className="flex-row">
            <TabsTrigger className="flex-1" value="cards">
              <Text>Cards</Text>
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="give">
              <Text>Give</Text>
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="want">
              <Text>Want</Text>
            </TabsTrigger>
          </TabsList>

          <SearchBar
            searchQuery={search}
            onSearchQueryChange={setSearchQuery}
            placeholder="Search cards"
            activeFiltersCount={activeFilterCount}
            onFilterPress={handleFilterPress}
          />

          <TabsContent value="cards" className="flex-1">
            <CardsTabContent
              tabType="cards"
              {...getTabState("cards")}
              hasActiveFilters={hasActiveFilters}
              gridActions={gridActions}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              onToggleSuccess={handleSilentRefresh}
            />
          </TabsContent>

          <TabsContent value="give" className="flex-1">
            <CardsTabContent
              tabType="give"
              {...getTabState("give")}
              hasActiveFilters={hasActiveFilters}
              gridActions={gridActions}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              onRemoveSuccess={handleSilentRefresh}
            />
          </TabsContent>

          <TabsContent value="want" className="flex-1">
            <CardsTabContent
              tabType="want"
              {...getTabState("want")}
              hasActiveFilters={hasActiveFilters}
              gridActions={gridActions}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              onRemoveSuccess={handleSilentRefresh}
            />
          </TabsContent>
        </Tabs>

        <BannerAd placement="cards-bottom" className="mt-4" />
      </View>
    </Container>
  )
}
