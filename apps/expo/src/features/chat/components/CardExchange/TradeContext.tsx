import { useState } from "react"
import { Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"
import { useTradeContext } from "../../hooks/use-trade-context"
import type { TradeContextProps } from "../../types"
import { TradeActionButtons } from "./TradeActionButtons"
import { TradeCardRow } from "./TradeCardRow"

interface EnhancedTradeContextProps extends TradeContextProps {
  chatChannelUrl?: string
  onToggle?: (isExpanded: boolean) => void
}

export function TradeContext({
  tradeSession,
  partnerName,
  partnerAvatar,
  chatChannelUrl,
  onToggle,
}: EnhancedTradeContextProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const {
    myCards,
    partnerCards,
    selectedCards,
    currentUserGameName,
    isLoading,
    toggleCardSelection,
    sendCardExchange,
    copyGameId,
  } = useTradeContext(tradeSession, chatChannelUrl)

  const toggleExpanded = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onToggle?.(newExpanded)
  }

  return (
    <View className="border-border border-b bg-background">
      {/* Collapse Header */}
      <Pressable
        onPress={toggleExpanded}
        className="flex-row items-center justify-between px-3 py-2"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="swap-horizontal-outline"
            size={16}
            className="text-muted-foreground"
          />
          <Text className="font-medium text-muted-foreground text-xs">
            Trade Cards ({myCards.length + partnerCards.length})
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {!isExpanded && selectedCards.size > 0 && (
            <View className="h-4 w-4 items-center justify-center rounded-full bg-blue-500">
              <Text className="font-bold text-white text-xs">
                {selectedCards.size}
              </Text>
            </View>
          )}
          <View className="h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50">
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              className="text-foreground"
            />
          </View>
        </View>
      </Pressable>

      {/* Expandable Content */}
      {isExpanded && (
        <View className="px-3 pb-2">
          <View className="rounded-lg bg-card p-3">
            <TradeCardRow
              title={`${partnerName} offers:`}
              cards={partnerCards}
              selectedCards={selectedCards}
              onCardPress={toggleCardSelection}
            />

            <TradeCardRow
              title={`${currentUserGameName} offers:`}
              cards={myCards}
              selectedCards={selectedCards}
              onCardPress={toggleCardSelection}
            />

            <TradeActionButtons
              selectedCardsCount={selectedCards.size}
              isLoading={isLoading}
              onCopyId={copyGameId}
              onExchangeCards={sendCardExchange}
            />
          </View>
        </View>
      )}
    </View>
  )
}
