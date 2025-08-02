import { FlashList } from "@shopify/flash-list"
import { useCallback } from "react"
import { RefreshControl, View } from "react-native"
import type { Card, CardGridActions, TradeMode } from "../types"
import { CardItem } from "./CardItem"

interface CardGridProps {
  cards: Card[]
  actions?: CardGridActions
  selectedCards?: string[]
  showQuantityManager?: boolean
  showDeckQuantityManager?: boolean
  showTradeButtons?: boolean
  tabMode?: TradeMode
  refreshing?: boolean
  onRefresh?: () => void
  onRemoveSuccess?: () => void
  onToggleSuccess?: () => void
}

export function CardGrid({
  cards,
  actions = {},
  selectedCards = [],
  showQuantityManager = false,
  showDeckQuantityManager = false,
  showTradeButtons = false,
  tabMode = "cards",
  refreshing = false,
  onRefresh,
  onRemoveSuccess,
  onToggleSuccess,
}: CardGridProps) {
  // Destructure actions to ensure stable references
  const { onSelectCard, onNavigateToCard, onRemoveCard, onPress } = actions
  
  const renderItem = ({ item: card }: { item: Card }) => {
    return (
      <CardItem
        card={card}
        selectedCards={selectedCards}
        onSelectCard={onSelectCard}
        onNavigateToCard={onNavigateToCard}
        onPress={onPress}
        showQuantityManager={showQuantityManager}
        showDeckQuantityManager={showDeckQuantityManager}
        onRemoveCard={onRemoveCard}
        showTradeButtons={showTradeButtons}
        tabMode={tabMode}
        onRemoveSuccess={onRemoveSuccess}
        onToggleSuccess={onToggleSuccess}
      />
    )
  }

  const keyExtractor = useCallback((card: Card) => card.id, [])

  const getItemType = useCallback(() => {
    // Optimize rendering based on content type
    if (showQuantityManager) return "quantityManager"
    if (showDeckQuantityManager) return "deckQuantityManager"
    if (showTradeButtons) return "tradeButtons"
    return "basic"
  }, [showQuantityManager, showDeckQuantityManager, showTradeButtons])

  return (
    <View className="flex-1">
      <FlashList
        data={cards}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        numColumns={3}
        estimatedItemSize={showQuantityManager || showDeckQuantityManager || showTradeButtons ? 280 : 160}
        contentContainerStyle={{
          paddingVertical: 12,
          paddingBottom: 100,
        }}
        keyboardShouldPersistTaps="handled"
        // Force re-render when selectedCards changes
        extraData={selectedCards}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="hsl(var(--primary))"
              title="Pull to refresh"
              titleColor="hsl(var(--muted-foreground))"
            />
          ) : undefined
        }
      />
    </View>
  )
}
