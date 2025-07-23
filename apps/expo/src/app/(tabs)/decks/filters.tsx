import { router } from "expo-router"
import { Fragment } from "react"
import { ScrollView, View } from "react-native"
import {
  CARD_ELEMENTS,
  CARD_RARITIES,
  CARD_SETS,
  CARD_TYPES,
  ELEMENT_IMAGES,
  SET_INFO,
} from "~/features/cards/constants"
import { useDecksWithFilters } from "~/features/decks/hooks"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import {
  FilterOptions,
  type FilterSectionConfig,
} from "~/shared/components/ui/filters"
import { Ionicons } from "~/shared/components/ui/icons"

export default function DeckFiltersScreen() {
  const { filters, setFilters, resetFilters, handleToggleItem } =
    useDecksWithFilters()

  const handleReset = () => {
    resetFilters()
  }

  const handleApply = () => {
    router.back()
  }

  const handleToggle = (key: string, value: string) => {
    handleToggleItem(key as keyof typeof filters, value)
  }

  // Convert filters to the format expected by FilterOptions
  const formattedFilters = {
    cardType: filters.cardType,
    rarity: filters.rarity,
    elements: filters.elements,
    pack: filters.pack,
  }

  const filterSections: FilterSectionConfig[] = [
    {
      key: "cardType",
      title: "Type",
      type: "text",
      options: CARD_TYPES.map(type => ({ value: type, label: type })),
    },
    {
      key: "rarity",
      title: "Rarity",
      type: "text",
      options: CARD_RARITIES.map(rarity => ({ value: rarity, label: rarity })),
    },
    {
      key: "elements",
      title: "Elements",
      type: "image",
      options: CARD_ELEMENTS.map(element => ({
        value: element,
        image: ELEMENT_IMAGES[element],
      })),
    },
    {
      key: "pack",
      title: "Sets",
      type: "complex",
      options: CARD_SETS.map(set => ({
        value: set,
        image: SET_INFO[set].image,
        displayName: SET_INFO[set].displayName,
      })),
    },
  ]

  return (
    <Fragment>
      <Container>
        <Header
          title="Filter Decks"
          actions={[
            {
              icon: <Ionicons name="refresh-outline" size={24} />,
              onPress: handleReset,
            },
            {
              icon: <Ionicons name="close" size={24} />,
              onPress: handleApply,
            },
          ]}
        />
        <View className="flex-1 px-4 py-4">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            scrollEventThrottle={16}
          >
            <FilterOptions
              filters={formattedFilters}
              onToggleItem={handleToggle}
              sections={filterSections}
            />
          </ScrollView>
        </View>
      </Container>
    </Fragment>
  )
}
