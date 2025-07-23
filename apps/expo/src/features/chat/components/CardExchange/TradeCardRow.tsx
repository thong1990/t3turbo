import { ScrollView, View } from "react-native"
import { Text } from "~/shared/components/ui/text"
import { TradeCardSlot } from "./TradeCardSlot"

interface TradeCard {
  id: string
  user_id: string
  card_id: string
  quantity: number
  cards?: {
    id: string
    name: string
    image_url: string
    rarity: string
  }
}

interface TradeCardRowProps {
  title: string
  cards: TradeCard[]
  selectedCards: Set<string>
  onCardPress: (cardId: string) => void
}

export function TradeCardRow({
  title,
  cards,
  selectedCards,
  onCardPress,
}: TradeCardRowProps) {
  return (
    <View className="mb-2">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="font-medium text-muted-foreground text-xs">
          {title}
        </Text>
        {cards.length > 5 && (
          <Text className="font-medium text-muted-foreground text-xs">
            {cards.length} cards
          </Text>
        )}
      </View>

      {cards.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
          className="flex-row"
        >
          {cards.map(card => (
            <TradeCardSlot
              key={card.id}
              card={card}
              isSelected={selectedCards.has(card.id)}
              onPress={() => onCardPress(card.id)}
              showQuantity
            />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-row items-center gap-1.5">
          <TradeCardSlot />
          <TradeCardSlot />
        </View>
      )}
    </View>
  )
}
