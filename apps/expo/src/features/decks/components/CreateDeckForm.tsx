import { z } from "zod/v4"
import * as Haptics from "expo-haptics"
import { router, useLocalSearchParams } from "expo-router"
import { useState, useMemo, useCallback, useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import { toast } from "sonner-native"
import { CardGrid } from "~/features/cards/components/CardGrid"
import { DECK_CONSTANTS } from "~/features/cards/constants"
import { useCardsQuery } from "~/features/cards/queries"
import { createDefaultFilters } from "~/features/cards/validation"
import { useDeckCrud } from "~/features/decks/hooks"
import { useUser } from "~/features/supabase/hooks"
import { Button } from "~/shared/components/ui/button"
import { useAppForm } from "~/shared/components/ui/form"
import { SearchBar } from "~/shared/components/ui/search-bar"
import { Text } from "~/shared/components/ui/text"
import { SelectedCardsGrid } from "./SelectedCardsGrid"

const { MAX_CARDS, MAX_COPIES } = DECK_CONSTANTS

const stringToArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform(val => {
    if (Array.isArray(val)) {
      // If it's already an array, filter out empty values
      return val.filter(Boolean)
    }
    // If it's a string, split by comma and filter out empty values
    return val?.split(",").filter(Boolean) ?? []
  })

const deckCreateParams = z.object({
  search: z.string().optional().default(""),
  userInteractions: stringToArray
    .pipe(z.array(z.enum(["owned", "desired", "tradable"])))
    .default([]),
  cardType: stringToArray.default([]),
  rarity: stringToArray.default([]),
  elements: stringToArray.default([]),
  pack: stringToArray.default([]),
})

export function CreateDeckForm() {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const { data: user } = useUser()
  const { createDeck, isCreating } = useDeckCrud()

  const rawParams = useLocalSearchParams()
  const parsedParams = deckCreateParams.safeParse(rawParams)
  
  // Handle parsing errors gracefully
  if (!parsedParams.success) {
    console.warn("CreateDeckForm - URL params parsing failed, using defaults")
  }
  
  // Use safe defaults from validation schema
  const parseResult = parsedParams.success
    ? parsedParams.data
    : deckCreateParams.parse({})
    
  const { search = "", ...filterData } = parseResult
  
  // Use URL search parameter as source of truth for search query
  const [searchQuery, setSearchQuery] = useState(search)
  
  // Sync search query with URL parameter when it changes
  useEffect(() => {
    setSearchQuery(search)
  }, [search])
  
  // Create safe filters with fallback to defaults
  const defaultFilters = createDefaultFilters()
  const filters = {
    cardType: filterData?.cardType ?? defaultFilters.cardType,
    rarity: filterData?.rarity ?? defaultFilters.rarity,
    elements: filterData?.elements ?? defaultFilters.elements,
    pack: filterData?.pack ?? defaultFilters.pack,
    userInteractions: filterData?.userInteractions ?? defaultFilters.userInteractions,
  }

  const {
    data: allCards,
    error: fetchError,
    isLoading: isLoadingCards,
    isError: isFetchError,
  } = useCardsQuery({ 
    filters: filters || createDefaultFilters(), 
    searchQuery: searchQuery, 
    userId: user?.id 
  })

  const { data: allCardsForSelection = [] } = useCardsQuery({ 
    filters: createDefaultFilters() 
  })

  const form = useAppForm({
    defaultValues: {
      name: "My Deck",
      description: "",
      isPublic: true,
    },
    onSubmit: async ({ value }) => {
      if (selectedCards.length !== MAX_CARDS) {
        toast.error(`Please select exactly ${MAX_CARDS} cards`)
        return
      }
      if (!user?.id) {
        toast.error("You must be logged in to create a deck.")
        return
      }

      try {
        // Transform selectedCards array to CardInDeck format
        const cardCounts: Record<string, number> = {}
        for (const cardId of selectedCards) {
          cardCounts[cardId] = (cardCounts[cardId] || 0) + 1
        }

        const cards = Object.entries(cardCounts).map(([cardId, count]) => ({
          id: cardId,
          count,
        }))

        await createDeck({
          ...value,
          userId: user.id,
          cards,
        })

        router.replace("/(tabs)/decks?tab=my-decks")
      } catch (error) {
        // Error handling is done in the hook
      }
    },
  })

  const handleCardAdd = useCallback((cardId: string) => {
    setSelectedCards(prev => {
      const cardCount = prev.filter(id => id === cardId).length
      
      // Check if adding this card would exceed limits
      if (cardCount >= MAX_COPIES) {
        toast.error(`Maximum ${MAX_COPIES} copies of this card allowed`)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        return prev // Return unchanged state
      }
      
      if (prev.length >= MAX_CARDS) {
        toast.error(`Deck is full! Maximum ${MAX_CARDS} cards allowed`)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        return prev // Return unchanged state
      }
      
      const newCards = [...prev, cardId]
      Haptics.selectionAsync().catch(console.error)
      return newCards
    })
  }, [])

  const handleCardRemove = useCallback((cardId: string) => {
    setSelectedCards(prev => {
      const index = prev.indexOf(cardId)
      if (index === -1) return prev
      const newCards = [...prev]
      newCards.splice(index, 1)
      return newCards
    })
    Haptics.selectionAsync().catch(console.error)
  }, [])

  const activeFilterCount = Object.values(filters).filter(
    f => f.length > 0
  ).length

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
  }

  const handleFilterPress = () => {
    router.push({
      pathname: "/(modal)/card-filters",
      params: {
        ...rawParams,
        returnTo: "/(tabs)/decks/create",
      },
    })
  }

  const progress = selectedCards.length / MAX_CARDS
  const isComplete = selectedCards.length === MAX_CARDS

  // Memoize actions to prevent unnecessary re-renders
  const cardGridActions = useMemo(() => ({
    onSelectCard: handleCardAdd,
    onRemoveCard: handleCardRemove,
  }), [handleCardAdd, handleCardRemove])

  return (
    <form.AppForm>
      <View className="flex-1">
        {/* Progress indicator */}
        <View className="mb-4 h-1 w-full bg-muted">
          <View
            className={`h-full ${
              isComplete
                ? "bg-primary"
                : selectedCards.length > MAX_CARDS
                  ? "bg-destructive"
                  : "bg-primary/70"
            }`}
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </View>

        <SelectedCardsGrid
          selectedCards={selectedCards}
          cards={allCardsForSelection}
          onSelectCard={handleCardRemove}
        />

        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchChange}
          placeholder="Search for cards to add"
          activeFiltersCount={activeFilterCount}
          onFilterPress={handleFilterPress}
        />

        <View className="flex-1 pb-[80px]">
          {isLoadingCards && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" className="my-4" />
            </View>
          )}
          {isFetchError && (
            <Text className="my-4 text-center text-destructive">
              Error loading cards: {fetchError?.message}
            </Text>
          )}
          {allCards && (
            <CardGrid
              cards={allCards}
              selectedCards={selectedCards}
              showQuantityManager={false}
              showDeckQuantityManager={true}
              showTradeButtons={false}
              actions={cardGridActions}
            />
          )}
        </View>
      </View>

      <View className="absolute right-0 bottom-0 left-0 border-border border-t bg-background px-4 py-3">
        <Button
          className="w-full bg-primary"
          onPress={() => form.handleSubmit()}
          disabled={isCreating}
        >
          <Text className="font-semibold text-primary-foreground">
            {isCreating ? "Saving..." : "Save Deck"}
          </Text>
        </Button>
      </View>
    </form.AppForm>
  )
}
