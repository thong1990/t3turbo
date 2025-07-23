import { View } from "react-native"
import { CreateDeckForm } from "~/features/decks/components/CreateDeckForm"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"

export default function CreateDeckScreen() {
  return (
    <>
      <Container>
        <Header hasBackButton title="Create Deck" />
        <View className="flex-1 px-4 py-4">
          <CreateDeckForm />
        </View>
      </Container>
    </>
  )
}
