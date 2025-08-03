import { View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { CreateDeckForm } from "~/features/decks/components/CreateDeckForm"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"

export default function CreateDeckScreen() {
  const params = useLocalSearchParams()
  
  const handleBackPress = () => {
    // Get the tab they came from, default to 'my-decks'
    const fromTab = typeof params.fromTab === "string" ? params.fromTab : "my-decks"
    
    // Navigate back to the originating tab without filter parameters
    router.replace({
      pathname: "/(tabs)/decks",
      params: { tab: fromTab }
    })
  }

  return (
    <>
      <Container>
        <Header 
          hasBackButton 
          title="Create Deck"
          onBackPress={handleBackPress}
        />
        <View className="flex-1 px-4 py-4">
          <CreateDeckForm />
        </View>
      </Container>
    </>
  )
}
