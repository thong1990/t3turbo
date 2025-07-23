import { useState } from "react"
import { ActivityIndicator, Pressable, View } from "react-native"

import { useTradeContext } from "~/features/messages/hooks/use-trade-context"
import { useTradeSession } from "~/features/messages/queries"
import type { Database } from "~/features/supabase/database.types"
import { useUser } from "~/features/supabase/hooks"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"
import { TradeActionButtons } from "./TradeActionButtons"
import { TradeCardRow } from "./TradeCardRow"
import { TradeStatusBadge } from "./TradeStatusBadge"

type TradeCard = Database["public"]["Tables"]["trade_session_card"]["Row"] & {
  cards?: Database["public"]["Tables"]["cards"]["Row"]
}

type TradeSession = Database["public"]["Tables"]["trade_sessions"]["Row"] & {
  trade_session_card?: TradeCard[]
  tradeSessionCards?: TradeCard[]
}

type TradeSessionPanelProps = {
  isVisible?: boolean
  onToggle?: (isExpanded: boolean) => void
  tradeId?: string | null
}

export function TradeSessionPanel({
  isVisible = true,
  onToggle,
  tradeId: propTradeId,
}: TradeSessionPanelProps) {
  // ALL hooks must be called at the very top in the same order every time
  const [isExpanded, setIsExpanded] = useState(true)
  const { data: user } = useUser()

  // Use the passed tradeId
  const tradeId = propTradeId

  // Always call ALL hooks at the top - no conditional hook calls
  const {
    data: tradeSession,
    isLoading,
    error,
  } = useTradeSession(tradeId || "")

  // Call useTradeContext with tradeSession directly - hook now handles null/undefined
  const {
    myCards,
    partnerCards,
    selectedCards,
    currentUserGameName,
    partnerGameName,
    isLoading: isTradeContextLoading,
    toggleCardSelection,
    sendCardExchange,
    completeTrade,
    copyGameId,
  } = useTradeContext(tradeSession as unknown as TradeSession, undefined)



  function toggleExpanded() {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onToggle?.(newExpanded)
  }

  // Handle all conditions in render section - no early returns
  if (!isVisible) {
    return null
  }

  if (isLoading) {
    return (
      <View className="border-border border-b bg-background">
        <View className="flex-row items-center justify-center px-3 py-4">
          <ActivityIndicator size="small" className="mr-2" />
          <Text className="text-muted-foreground text-sm">
            Loading trade session...
          </Text>
        </View>
      </View>
    )
  }

  if (error || !tradeSession) {
    return (
      <View className="border-border border-b bg-background">
        <View className="flex-row items-center justify-center px-3 py-4">
          <Ionicons
            name="information-circle-outline"
            size={16}
            className="mr-2 text-muted-foreground"
          />
          <Text className="text-muted-foreground text-sm">
            {error ? "Failed to load trade session" : "No active trade session"}
          </Text>
        </View>
      </View>
    )
  }

  const cardCount = myCards.length + partnerCards.length



  return (
    <View className="relative border-border border-b bg-background">
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
            Trade Cards ({cardCount})
          </Text>
          <TradeStatusBadge status={tradeSession.status} />
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

      {/* Overlay panel when expanded - uses absolute positioning */}
      {isExpanded && (
        <View
          className="absolute top-full right-0 left-0 z-50 border-border border-b bg-background shadow-lg"
          style={{
            maxHeight: 300, // Fixed height instead of bottom constraint
            elevation: 10, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <View className="px-3 pb-2">
            <View className="rounded-lg bg-card p-3">
              {cardCount === 0 ? (
                <View className="items-center py-4">
                  <Ionicons
                    name="cube-outline"
                    size={32}
                    className="text-muted-foreground"
                  />
                  <Text className="mt-2 text-muted-foreground text-sm">
                    No cards in this trade session
                  </Text>
                </View>
              ) : (
                <>
                  <TradeCardRow
                    title={`${partnerGameName} offers:`}
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
                    isLoading={isTradeContextLoading}
                    tradeStatus={tradeSession.status}
                    onCopyId={copyGameId}
                    onExchangeCards={sendCardExchange}
                    onCompleteTrade={completeTrade}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
