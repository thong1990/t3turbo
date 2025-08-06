import { useLocalSearchParams } from "expo-router"
import { Fragment } from "react"
import { ActivityIndicator, View } from "react-native"
import { CardGrid } from "~/features/cards/components/CardGrid"
import { useDeck } from "~/features/decks/hooks"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import { EmptyState } from "~/shared/components/ui/empty-state"

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: deck, isLoading, error } = useDeck(id)

  if (isLoading) {
    return (
      <Fragment>
        <Container>
          <Header hasBackButton />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        </Container>
      </Fragment>
    )
  }

  if (error || !deck) {
    return (
      <Fragment>
        <Container>
          <Header hasBackButton />
          <View className="flex-1 px-4 py-4">
            <EmptyState
              icon="alert-circle-outline"
              message="Deck not found"
              description={error?.message}
            />
          </View>
        </Container>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Container>
        <Header title={deck.name} hasBackButton />
        <View className="flex-1 px-4 py-4">
          <CardGrid
            cards={deck.cards.map(card => ({
              id: card.id,
              name: card.name || "",
              image_url: card.image,
              type: card.type,
              rarity: card.rarity,
              card_type: card.cardType || "",
              // Add all required Card properties from database.types.ts
              card_id: card.id,
              artist: null,
              crafting_cost: null,
              created_at: null,
              evolution_type: null,
              hp: null,
              is_ex: null,
              is_fullart: null,
              pack_type: null,
              retreat_cost: null,
              set_id: null,
              updated_at: null,
              weakness: null,
              count: card.count, // Add count for deck display
            }))}
          />
        </View>
      </Container>
    </Fragment>
  )
}
