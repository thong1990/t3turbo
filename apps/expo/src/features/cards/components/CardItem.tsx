import { cn } from "@acme/ui"
import { memo } from "react"
import { Pressable, View } from "react-native"
import { ImageWithFallback } from "~/shared/components/ui/image-with-fallback"
import { Text } from "~/shared/components/ui/text"
import type { Card, TradeMode } from "../types"
import { CardQuantityManager } from "./CardQuantityManager"
import { DeckCardQuantityManager } from "~/features/decks/components/DeckCardQuantityManager"
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
  showDeckQuantityManager?: boolean
  onRemoveCard?: (cardId: string) => void
  showTradeButtons?: boolean
  tabMode?: TradeMode
  onRemoveSuccess?: () => void
  onToggleSuccess?: () => void
}

export const CardItem = memo<CardItemProps>(function CardItem({
  card,
  selectedCards = [],
  onSelectCard,
  onNavigateToCard,
  isPreview = false,
  onPress,
  showCardName = false,
  showQuantityManager = false,
  showDeckQuantityManager = false,
  onRemoveCard,
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

    // If deck quantity manager is shown, don't allow direct card taps
    // User should use the +/- buttons instead
    if (showDeckQuantityManager) {
      return
    }

    if (onSelectCard) {
      // Always call onSelectCard and let parent handle validation
      onSelectCard(card.id)
      return
    }

    onNavigateToCard?.(card.id)
  }

  return (
    <View className="relative flex-1 p-1">
      <View className="relative">
        <Pressable onPress={handleCardPress} hitSlop={4}>
          <View
            className={cn(
              "items-center rounded overflow-hidden",
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

            {!isPreview && cardCount > 0 && !showDeckQuantityManager && (
              <View className="absolute top-1 right-1 rounded-full bg-primary px-1.5 py-0.5">
                <Text className="font-bold text-primary-foreground text-xs">
                  {cardCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
        
        {/* Deck quantity manager overlays the card */}
        {showDeckQuantityManager && onSelectCard && onRemoveCard && (
          <DeckCardQuantityManager
            cardId={card.id}
            selectedCards={selectedCards}
            onAdd={onSelectCard}
            onRemove={onRemoveCard}
          />
        )}
      </View>

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
