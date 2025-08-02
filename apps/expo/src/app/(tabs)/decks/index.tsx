import { router, useLocalSearchParams } from "expo-router"
import { Fragment } from "react"
import { View } from "react-native"
import { BannerAd } from "~/features/ads/components/BannerAd"
import { cardUrlSearchParamsSchema } from "~/features/cards/validation"
import { normalizeSearchParams } from "~/shared/utils"
import { DeckList } from "~/features/decks/components/DeckList"
import {
  useDecks,
  useFavoriteDecks,
  useUserDecks,
} from "~/features/decks/hooks"
import { useUser } from "~/features/supabase/hooks"
import { Container } from "~/shared/components/container"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"
import { SearchBar } from "~/shared/components/ui/search-bar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/shared/components/ui/tabs"
import { Text } from "~/shared/components/ui/text"

export default function DecksScreen() {
  const { data: user } = useUser()
  const rawParams = useLocalSearchParams()
  
  // Normalize params to handle array/string inconsistencies
  const normalizedParams = normalizeSearchParams(rawParams)

  const parsedParams = cardUrlSearchParamsSchema.safeParse(normalizedParams)
  
  // Log parsing results for debugging
  if (!parsedParams.success) {
    console.error("DecksScreen - Failed to parse URL params:", {
      rawParams,
      normalizedParams,
      errors: parsedParams.error.issues,
      timestamp: new Date().toISOString()
    })
  }
  
  const { search, ...filters } = parsedParams.success
    ? parsedParams.data
    : cardUrlSearchParamsSchema.parse({})

  // Use URL param for tab state, default to 'trend'
  const activeTab = (rawParams.tab as string) ?? "trend"

  const activeFilterCount = Object.values(filters).reduce(
    (total, filterArray) =>
      total + (Array.isArray(filterArray) ? filterArray.length : 0),
    0
  )
  const hasActiveFilters = activeFilterCount > 0
  const hasSearchQuery = Boolean(search && search.trim() !== "")

  const {
    data: publicDecks = [],
    isLoading: isLoadingPublic,
    error: publicDecksError,
  } = useDecks({
    isPublic: true,
    ...(hasSearchQuery && { searchQuery: search }),
    ...(hasActiveFilters && { cardFilters: filters }),
  })

  const {
    data: myDecks = [],
    isLoading: isLoadingMy,
    error: myDecksError,
  } = useUserDecks(user?.id ?? "")

  const {
    data: favoriteDecks = [],
    isLoading: isLoadingFavorites,
    error: favoriteDecksError,
  } = useFavoriteDecks(user?.id || "")

  const handleCreateDeck = () => {
    router.push("/(tabs)/decks/create")
  }

  const setSearchQuery = (search: string) => {
    router.setParams({ ...rawParams, search: search || undefined })
  }

  const handleFilterPress = () => {
    router.push({
      pathname: "/(modal)/card-filters",
      params: rawParams,
    })
  }

  const handleTabChange = (tab: string) => {
    router.setParams({ ...rawParams, tab })
  }

  return (
    // biome-ignore lint/style/useFragmentSyntax: <explanation>
    <Fragment>
      <Container edges={["top"]}>
        <View className="flex-1 gap-y-2 px-4 pt-4">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex-1"
          >
            <TabsList className="flex-row">
              <TabsTrigger className="flex-1" value="trend">
                <Text>Trend</Text>
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="favorite">
                <Text>Favorite</Text>
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="my-decks">
                <Text>My Decks</Text>
              </TabsTrigger>
            </TabsList>

            <SearchBar
              searchQuery={search}
              onSearchQueryChange={setSearchQuery}
              placeholder="Search decks or cards"
              activeFiltersCount={activeFilterCount}
              onFilterPress={handleFilterPress}
            />

            <TabsContent value="trend">
              <DeckList
                decks={publicDecks}
                isLoading={isLoadingPublic}
                error={publicDecksError}
                emptyState={{
                  icon: "game-controller-outline",
                  message: "No decks available",
                  description: hasSearchQuery
                    ? "Try a different search term or clear filters."
                    : undefined,
                }}
              />
            </TabsContent>

            <TabsContent value="favorite">
              <DeckList
                decks={favoriteDecks}
                isLoading={isLoadingFavorites}
                error={favoriteDecksError}
                emptyState={{
                  icon: "heart-outline",
                  message: hasSearchQuery
                    ? "No decks found matching your search"
                    : "No favorite decks yet.",
                  description: hasSearchQuery
                    ? "Try a different search term or clear filters."
                    : "Tap the heart icon on a deck to add it to favorites!",
                }}
              />
            </TabsContent>

            <TabsContent value="my-decks">
              <DeckList
                decks={myDecks}
                isLoading={isLoadingMy}
                error={myDecksError}
                showEditOptions={true}
                emptyState={{
                  icon: "add-circle-outline",
                  message: hasSearchQuery
                    ? "No decks found matching your search"
                    : "Create your first deck!",
                  description: hasSearchQuery
                    ? "Try a different search term or clear filters."
                    : "Start building your collection and share it with others.",
                }}
              />
            </TabsContent>
          </Tabs>

          {activeTab === "my-decks" && (
            <Button
              className="absolute right-6 bottom-6 h-14 w-14 items-center justify-center rounded-full shadow-lg"
              onPress={handleCreateDeck}
            >
              <Ionicons
                name="add"
                size={28}
                className="text-primary-foreground"
              />
            </Button>
          )}
        </View>
      </Container>
      <BannerAd placement="decks-bottom" />
    </Fragment>
  )
}
