import { memo, useState } from "react"
import { Image, View } from "react-native"
import type { Card } from "../types"

interface CardRowProps {
  cards: Card[]
  maxCards?: number
}

export const CardRow = memo<CardRowProps>(function CardRow({
  cards,
  maxCards = 5,
}) {
  // Show up to maxCards, fill remaining slots with placeholders
  const displayCards = [...cards.slice(0, maxCards)]
  const placeholderCount = Math.max(0, maxCards - displayCards.length)
  const placeholders = Array(placeholderCount).fill(null)

  return (
    <View className="flex-row justify-between">
      {displayCards.map((card, idx) => (
        <CardSlot key={`${card.id}-${idx}`} card={card} />
      ))}
      {placeholders.map((_, idx) => (
        <CardSlot key={`placeholder-${displayCards.length + idx}`} />
      ))}
    </View>
  )
})

interface CardSlotProps {
  card?: Card
}

const CardSlot = memo<CardSlotProps>(function CardSlot({ card }) {
  const [imageError, setImageError] = useState(false)

  if (!card) {
    // Empty placeholder slot
    return (
      <View className="h-24 w-16 items-center justify-center rounded-md border border-border bg-muted">
        {/* Empty placeholder */}
      </View>
    )
  }

  return (
    <View className="h-24 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
      {imageError ? (
        <View className="h-full w-full items-center justify-center bg-muted-foreground/20">
          {/* Fallback for broken images */}
          <View className="h-8 w-8 rounded bg-muted-foreground/40" />
        </View>
      ) : (
        <Image
          source={{ uri: card.image_url }}
          className="h-full w-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  )
})
