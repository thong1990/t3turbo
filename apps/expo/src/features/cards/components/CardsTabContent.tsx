import { ActivityIndicator, View } from "react-native"
import { EmptyState } from "~/shared/components/ui/empty-state"
import { Text } from "~/shared/components/ui/text"
import type { Card, CardGridActions, TradeMode } from "../types"
import { CardGrid } from "./CardGrid"

type CardsTabContentProps = {
  tabType: TradeMode
  data: Card[]
  isLoading: boolean
  isError: boolean
  error?: Error | null
  hasActiveFilters: boolean
  gridActions: CardGridActions
  refreshing: boolean
  onRefresh: () => void
  onRemoveSuccess?: () => void
  onToggleSuccess?: () => void
}

export function CardsTabContent({
  tabType,
  data,
  isLoading,
  isError,
  error,
  hasActiveFilters,
  gridActions,
  refreshing,
  onRefresh,
  onRemoveSuccess,
  onToggleSuccess,
}: CardsTabContentProps) {
  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="hsl(var(--primary))" />
        <Text className="mt-2 text-muted-foreground">Loading...</Text>
      </View>
    )
  }

  // Error state
  if (isError) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        message="Error loading cards"
        description={error?.message}
      />
    )
  }

  // Empty state
  if (data.length === 0) {
    const emptyStateContent = getEmptyStateContent(tabType, hasActiveFilters)
    return <EmptyState {...emptyStateContent} />
  }

  // Content
  return (
    <CardGrid
      cards={data}
      actions={gridActions}
      showTradeButtons={true}
      tabMode={tabType}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onRemoveSuccess={onRemoveSuccess}
      onToggleSuccess={onToggleSuccess}
    />
  )
}

function getEmptyStateContent(tabType: TradeMode, hasActiveFilters: boolean) {
  if (tabType === "give") {
    return {
      icon: "gift-outline" as const,
      message: "No cards to give",
      description: "Mark cards you want to trade away in the Cards tab.",
    }
  }

  if (tabType === "want") {
    return {
      icon: "heart-outline" as const,
      message: "No cards wanted",
      description: "Mark cards you want to collect in the Cards tab.",
    }
  }

  if (hasActiveFilters) {
    return {
      icon: "search-outline" as const,
      message: "No cards found",
      description: "Try adjusting your search or filters.",
    }
  }

  return {
    icon: "layers-outline" as const,
    message: "No cards available",
  }
}
