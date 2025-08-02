import { z } from "zod/v4"
import * as Haptics from "expo-haptics"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { toast } from "sonner-native"
import { CardGrid } from "~/features/cards/components/CardGrid"
import { DECK_CONSTANTS } from "~/features/cards/constants"
import { useCardsQuery } from "~/features/cards/queries"
import { useDeckCrud } from "~/features/decks/hooks"
import { Button } from "~/shared/components/ui/button"
import { useAppForm } from "~/shared/components/ui/form"
import { SearchBar } from "~/shared/components/ui/search-bar"
import { Text } from "~/shared/components/ui/text"
import type { Deck } from "../types"
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

const deckEditParams = z.object({
  search: z.string().optional().default(""),
  userInteractions: stringToArray
    .pipe(z.array(z.enum(["owned", "desired", "tradable"])))
    .default([]),
  cardType: stringToArray.default([]),
  rarity: stringToArray.default([]),
  elements: stringToArray.default([]),
  pack: stringToArray.default([]),
})

interface EditDeckFormProps {
  deck: Deck
}

export function EditDeckForm({ deck }: EditDeckFormProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>(
    deck.cards.flatMap(c => Array(c.count).fill(c.id))
  )

  const { updateDeck, isUpdating } = useDeckCrud()

  const rawParams = useLocalSearchParams()
  const parsedParams = deckEditParams.safeParse(rawParams)
  
  // Log parsing results for debugging
  if (!parsedParams.success) {
    console.error("EditDeckForm - Failed to parse URL params:", {
      rawParams,
      errors: parsedParams.error.issues,
      timestamp: new Date().toISOString()
    })
  }
  
  const parseResult = parsedParams.success
    ? parsedParams.data
    : deckEditParams.parse({})
    
  const { search = "", ...filterData } = parseResult
  
  // Ensure filters match CardFilters type structure
  const filters = {
    cardType: filterData.cardType || [],
    rarity: filterData.rarity || [],
    elements: filterData.elements || [],
    pack: filterData.pack || [],
    userInteractions: filterData.userInteractions || [],
  }

  const {
    data: allCards,
    error: fetchError,
    isLoading: isLoadingCards,
    isError: isFetchError,
  } = useCardsQuery({ filters, searchQuery: search })

  const { data: allCardsForSelection = [] } = useCardsQuery({})

  const form = useAppForm({
    defaultValues: {
      name: deck.name,
      description: deck.description ?? "",
      isPublic: deck.is_public,
    },
    onSubmit: async ({ value }) => {
      if (selectedCards.length !== MAX_CARDS) {
        toast.error(`Please select exactly ${MAX_CARDS} cards`)
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

        await updateDeck({
          id: deck.id,
          ...value,
          cards,
        })

        router.replace("/(tabs)/decks?tab=my-decks")
      } catch (error) {
        // Error handling is done in the hook
      }
    },
  })

  const handleCardAdd = (cardId: string) => {
    const cardCount = selectedCards.filter(id => id === cardId).length
    if (cardCount >= MAX_COPIES || selectedCards.length >= MAX_CARDS) {
      return
    }
    setSelectedCards(prev => [...prev, cardId])
    Haptics.selectionAsync().catch(console.error)
  }

  const handleCardRemove = (cardId: string) => {
    const index = selectedCards.indexOf(cardId)
    if (index === -1) return
    setSelectedCards(prev => {
      const newCards = [...prev]
      newCards.splice(index, 1)
      return newCards
    })
    Haptics.selectionAsync().catch(console.error)
  }

  const activeFilterCount = Object.values(filters).filter(
    f => f.length > 0
  ).length

  const setSearchQuery = (search: string) => {
    router.setParams({ ...rawParams, search: search || undefined })
  }

  const handleFilterPress = () => {
    router.push({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pathname: "/(tabs)/cards/filters" as any,
      params: rawParams,
    })
  }

  const progress = selectedCards.length / MAX_CARDS
  const isComplete = selectedCards.length === MAX_CARDS

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
          searchQuery={search}
          onSearchQueryChange={setSearchQuery}
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
              actions={{
                onSelectCard: handleCardAdd,
              }}
            />
          )}
        </View>
      </View>

      <View className="absolute right-0 bottom-0 left-0 border-border border-t bg-background px-4 py-3">
        <Button
          className="w-full bg-primary"
          onPress={() => form.handleSubmit()}
          disabled={isUpdating}
        >
          <Text className="font-semibold text-primary-foreground">
            {isUpdating ? "Updating..." : "Update Deck"}
          </Text>
        </Button>
      </View>
    </form.AppForm>
  )
}
