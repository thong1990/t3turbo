import { useLocalSearchParams } from "expo-router"
import { Fragment } from "react"
import { ActivityIndicator, View } from "react-native"
import { CardGrid } from "~/features/cards/components/CardGrid"
import { useDeck } from "~/features/decks/hooks"
import type { DeckCard } from "~/features/decks/types"
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
            cards={deck.deck_cards.map((dc: DeckCard) => ({
              ...dc.cards,
              count: dc.quantity,
            }))}
          />
        </View>
      </Container>
    </Fragment>
  )
}
