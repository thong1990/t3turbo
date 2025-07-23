import { useLocalSearchParams } from "expo-router"
import { ActivityIndicator, ScrollView, View } from "react-native"
import { useUser } from "~/features/supabase/hooks"
import { Container } from "~/shared/components/container"
import { EmptyState } from "~/shared/components/ui/empty-state"
import { Text } from "~/shared/components/ui/text"

import { CardDisplay } from "~/features/cards/components/CardDisplay"
import { CardQuantityManager } from "~/features/cards/components/CardQuantityManager"
import { useCardQuery } from "~/features/cards/queries"

export default function CardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: user } = useUser()

  // This check is important, especially with strict types
  if (!id) {
    return (
      <Container>
        <EmptyState
          icon="alert-circle-outline"
          message="No Card ID"
          description="The card you're looking for could not be found."
        />
      </Container>
    )
  }

  const { data: card, isLoading: isLoadingCard } = useCardQuery({
    id,
    userId: user?.id,
  })

  if (isLoadingCard) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="hsl(var(--primary))" />
          <Text className="mt-2 text-muted-foreground">Loading card...</Text>
        </View>
      </Container>
    )
  }

  if (!card) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <EmptyState
            icon="alert-circle-outline"
            message="Card not found"
            description="The card you're looking for doesn't exist or has been removed."
          />
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <ScrollView>
        <View className="flex-1 gap-y-4 p-4">
          <CardDisplay card={card} />
          <CardQuantityManager cardId={id} />
        </View>
      </ScrollView>
    </Container>
  )
}
