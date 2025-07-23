import { useLocalSearchParams } from "expo-router"
import {} from "react"
import { ActivityIndicator, View } from "react-native"
import { EditDeckForm } from "~/features/decks/components/EditDeckForm"
import { useDeck } from "~/features/decks/hooks"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import { EmptyState } from "~/shared/components/ui/empty-state"

export default function EditDeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: deck, isLoading, error } = useDeck(id)

  if (isLoading) {
    return (
      <>
        <Container>
          <Header hasBackButton title="Edit Deck" />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        </Container>
      </>
    )
  }

  if (error || !deck) {
    return (
      <>
        <Container>
          <Header hasBackButton title="Edit Deck" />
          <View className="flex-1 px-4 py-4">
            <EmptyState
              icon="alert-circle-outline"
              message="Deck not found"
              description={error?.message}
            />
          </View>
        </Container>
      </>
    )
  }

  return (
    <>
      <Container>
        <Header hasBackButton title="Edit Deck" />
        <View className="flex-1 px-4 py-4">
          <EditDeckForm deck={deck} />
        </View>
      </Container>
    </>
  )
}
