import { ScrollView, View } from "react-native"

import type { Database } from "~/features/supabase/database.types"
import { Text } from "~/shared/components/ui/text"
import { TradeCard } from "./TradeCard"

type Card = Database["public"]["Tables"]["trade_session_card"]["Row"] & {
  cards?: Database["public"]["Tables"]["cards"]["Row"]
}

type TradeCardRowProps = {
  title: string
  cards: Card[]
  selectedCards: Set<string>
  onCardPress: (cardId: string) => void
}

export function TradeCardRow({
  title,
  cards,
  selectedCards,
  onCardPress,
}: TradeCardRowProps) {
  // Filter out cards with null user_id for safety
  const validCards = cards.filter(card => card.user_id !== null)

  if (validCards.length === 0) {
    return (
      <View className="mb-3">
        <Text className="mb-2 font-medium text-muted-foreground text-sm">
          {title}
        </Text>
        <Text className="text-muted-foreground text-xs">No cards offered</Text>
      </View>
    )
  }

  return (
    <View className="mb-3">
      <Text className="mb-2 font-medium text-muted-foreground text-sm">
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="gap-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {validCards.map(card => (
          <TradeCard
            key={card.id}
            card={card}
            isSelected={selectedCards.has(card.id)}
            onPress={() => onCardPress(card.id)}
          />
        ))}
      </ScrollView>
    </View>
  )
}
