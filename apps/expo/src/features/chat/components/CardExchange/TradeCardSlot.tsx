import { Image, Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

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

interface TradeCardSlotProps {
  card?: TradeCard
  isSelected?: boolean
  onPress?: () => void
  showQuantity?: boolean
}

export function TradeCardSlot({
  card,
  isSelected = false,
  onPress,
  showQuantity = false,
}: TradeCardSlotProps) {
  if (!card) {
    return (
      <View className="h-20 w-14 rounded-lg border-2 border-border border-dashed bg-muted" />
    )
  }

  return (
    <Pressable onPress={onPress} className="relative">
      <View
        className={`h-20 w-14 overflow-hidden rounded-lg shadow-sm ${
          isSelected
            ? "border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/30"
            : "border-2 border-transparent bg-muted"
        }`}
      >
        {card.cards?.image_url ? (
          <Image
            source={{ uri: card.cards.image_url }}
            className={`h-full w-full ${isSelected ? "opacity-80" : ""}`}
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-muted-foreground/20">
            <Ionicons
              name="image-outline"
              size={16}
              className="text-muted-foreground"
            />
          </View>
        )}

        {isSelected && (
          <View className="absolute top-1 right-1 h-4 w-4 items-center justify-center rounded-full bg-blue-500">
            <Ionicons name="checkmark" size={10} color="white" />
          </View>
        )}
      </View>

      {showQuantity && card.quantity > 1 && (
        <View className="-right-1 -bottom-1 absolute h-5 w-5 items-center justify-center rounded-full bg-orange-600 shadow-sm">
          <Text className="font-bold text-white text-xs">{card.quantity}</Text>
        </View>
      )}
    </Pressable>
  )
}
