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
  showTradeButtons = false,
  tabMode = "cards",
  refreshing = false,
  onRefresh,
  onRemoveSuccess,
  onToggleSuccess,
}: CardGridProps) {
  const renderItem = useCallback(
    ({ item: card }: { item: Card }) => {
      return (
        <CardItem
          card={card}
          selectedCards={selectedCards}
          onSelectCard={actions.onSelectCard}
          onNavigateToCard={actions.onNavigateToCard}
          onPress={actions.onPress}
          showQuantityManager={showQuantityManager}
          showTradeButtons={showTradeButtons}
          tabMode={tabMode}
          onRemoveSuccess={onRemoveSuccess}
          onToggleSuccess={onToggleSuccess}
        />
      )
    },
    [
      selectedCards,
      actions.onSelectCard,
      actions.onNavigateToCard,
      actions.onPress,
      showQuantityManager,
      showTradeButtons,
      tabMode,
      onRemoveSuccess,
      onToggleSuccess,
    ]
  )

  const keyExtractor = useCallback((card: Card) => card.id, [])

  const getItemType = useCallback(() => {
    // Optimize rendering based on content type
    if (showQuantityManager) return "quantityManager"
    if (showTradeButtons) return "tradeButtons"
    return "basic"
  }, [showQuantityManager, showTradeButtons])

  return (
    <View className="flex-1">
      <FlashList
        data={cards}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        numColumns={3}
        estimatedItemSize={showQuantityManager || showTradeButtons ? 280 : 160}
        contentContainerStyle={{
          paddingVertical: 12,
          paddingBottom: 100,
        }}
        keyboardShouldPersistTaps="handled"
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
