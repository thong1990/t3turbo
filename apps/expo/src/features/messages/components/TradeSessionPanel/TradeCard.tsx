import { Image, Pressable, View } from "react-native"

import type { Database } from "~/features/supabase/database.types"
import { Text } from "~/shared/components/ui/text"

type Card = Database["public"]["Tables"]["trade_session_card"]["Row"] & {
  cards?: Database["public"]["Tables"]["cards"]["Row"]
}

type TradeCardProps = {
  card: Card
  isSelected: boolean
  onPress: () => void
}

export function TradeCard({ card, isSelected, onPress }: TradeCardProps) {
  const cardData = card.cards

  return (
    <Pressable
      onPress={onPress}
      className={`relative rounded-lg border-2 ${isSelected ? "border-blue-500 bg-blue-50" : "border-border bg-card"
        }`}
    >
      <View className="h-20 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        {cardData?.image_url ? (
          <Image
            source={{ uri: cardData.image_url }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-100">
            <Text className="text-muted-foreground text-xs">No Image</Text>
          </View>
        )}
      </View>

      {card.quantity > 1 && (
        <View className="-top-1 -right-1 absolute h-5 w-5 items-center justify-center rounded-full bg-blue-500">
          <Text className="font-bold text-white text-xs">{card.quantity}</Text>
        </View>
      )}
    </Pressable>
  )
}
