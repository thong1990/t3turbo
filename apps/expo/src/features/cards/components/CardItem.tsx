import { cn } from "@init/utils/ui"
import { memo } from "react"
import { Pressable, View } from "react-native"
import { ImageWithFallback } from "~/shared/components/ui/image-with-fallback"
import { Text } from "~/shared/components/ui/text"
import type { Card, TradeMode } from "../types"
import { CardQuantityManager } from "./CardQuantityManager"
import { TradeButtons } from "./TradeButtons"

const MAX_COPIES = 2

type CardItemProps = {
  card: Card
  selectedCards?: string[]
  onSelectCard?: (cardId: string) => void
  onNavigateToCard?: (cardId: string) => void
  isPreview?: boolean
  onPress?: () => void
  showCardName?: boolean
  showQuantityManager?: boolean
  showTradeButtons?: boolean
  tabMode?: TradeMode
  onRemoveSuccess?: () => void
  onToggleSuccess?: () => void
}

export const CardItem = memo(function CardItem({
  card,
  selectedCards = [],
  onSelectCard,
  onNavigateToCard,
  isPreview = false,
  onPress,
  showCardName = false,
  showQuantityManager = false,
  showTradeButtons = false,
  tabMode = "cards",
  onRemoveSuccess,
  onToggleSuccess,
}: CardItemProps) {
  const cardCount = selectedCards.filter(id => id === card.id).length

  const handleCardPress = () => {
    if (isPreview) {
      onPress?.()
      return
    }

    if (onSelectCard) {
      if (cardCount < MAX_COPIES) {
        onSelectCard(card.id)
      }
      return
    }

    onNavigateToCard?.(card.id)
  }

  return (
    <View className="relative flex-1 p-1">
      <Pressable onPress={handleCardPress} hitSlop={4}>
        <View
          className={cn(
            "items-center rounded",
            !isPreview && cardCount > 0
              ? "border-primary"
              : "border-muted dark:border-muted-foreground/30"
          )}
        >
          <ImageWithFallback
            source={card.image_url ?? undefined}
            className="aspect-[63/88] w-full"
          />

          {!showCardName && (
            <Text className="mt-1 py-1 text-center text-sm" numberOfLines={1}>
              {card.name}
            </Text>
          )}

          {!isPreview && cardCount > 0 && (
            <View className="absolute top-1 right-1 rounded-full bg-primary px-1.5 py-0.5">
              <Text className="font-bold text-primary-foreground text-xs">
                {cardCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {showTradeButtons && (
        <TradeButtons
          card={card}
          tabMode={tabMode}
          onRemoveSuccess={onRemoveSuccess}
          onToggleSuccess={onToggleSuccess}
        />
      )}

      {showQuantityManager && (
        <View className="mt-2">
          <CardQuantityManager cardId={card.id} />
        </View>
      )}
    </View>
  )
})
