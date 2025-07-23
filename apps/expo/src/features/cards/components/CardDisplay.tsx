import { Pressable, View } from "react-native"
import { ImageWithFallback } from "~/shared/components/ui/image-with-fallback"
import { Text } from "~/shared/components/ui/text"
import type { Card } from "../types"

type CardDisplayProps = {
  card: Card
  onPress?: () => void
}

export function CardDisplay({ card, onPress }: CardDisplayProps) {
  return (
    <Pressable onPress={onPress}>
      <View className="items-center gap-y-2">
        <ImageWithFallback
          uri={card.image_url ?? undefined}
          className="aspect-[63/88] w-full rounded-lg"
        />
        <Text className="font-bold text-xl">{card.name}</Text>
      </View>
    </Pressable>
  )
}
