import { memo } from "react"
import { FlatList, RefreshControl } from "react-native"

import type { TradeMatch } from "../types"
import { TradeMatchItem } from "./TradeMatchItem"

interface TradeMatchListProps {
  matches: TradeMatch[]
  onTrade: (match: TradeMatch) => void
  isCreatingTrade: boolean
  onRefresh: () => void
  isRefreshing: boolean
}

export const TradeMatchList = memo<TradeMatchListProps>(function TradeMatchList({
  matches,
  onTrade,
  isCreatingTrade,
  onRefresh,
  isRefreshing,
}) {
  return (
    <FlatList
      data={matches}
      renderItem={({ item }) => (
        <TradeMatchItem
          match={item}
          onTrade={onTrade}
          isCreatingTrade={isCreatingTrade}
        />
      )}
      keyExtractor={item => `${item.partnerId}-${item.rarity}`}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    />
  )
})
