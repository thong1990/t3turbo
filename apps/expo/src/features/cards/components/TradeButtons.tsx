import { cn } from "@acme/ui"
import * as Haptics from "expo-haptics"
import { memo } from "react"
import { Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"
import { ELIGIBLE_GIVE_WANT_RARITIES } from "../constants"
import { useTradeActions } from "../hooks/use-trade-actions"
import type { Card } from "../types"

type TradeButtonsProps = {
  card: Card
  tabMode: "cards" | "give" | "want"
  onRemoveSuccess?: () => void
  onToggleSuccess?: () => void
}

export const TradeButtons = memo(function TradeButtons({
  card,
  tabMode,
  onRemoveSuccess,
  onToggleSuccess,
}: TradeButtonsProps) {
  const {
    isGiving,
    isWanting,
    toggleGive,
    toggleWant,
    removeFromGive,
    removeFromWant,
    isLoading,
  } = useTradeActions(card.id, onToggleSuccess)

  const isTradeableRarity = ELIGIBLE_GIVE_WANT_RARITIES.includes(
    card.rarity as (typeof ELIGIBLE_GIVE_WANT_RARITIES)[number]
  )

  const handleToggleGive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    toggleGive()
  }

  const handleToggleWant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    toggleWant()
  }

  // Show trade buttons in cards tab only
  if (tabMode === "cards") {
    if (!isTradeableRarity) {
      return (
        <View className="mt-2">
          <View className="rounded-lg bg-gray-100 px-3 py-2">
            <Text className="text-center text-gray-500 text-xs">
              Not tradeable (rarity: {card.rarity})
            </Text>
          </View>
        </View>
      )
    }

    return (
      <View className="mt-2 flex-row gap-2">
        <Pressable
          onPress={handleToggleGive}
          disabled={isLoading}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={cn(
            "flex-1 items-center justify-center rounded-lg border py-4",
            isGiving
              ? "border-green-700 bg-green-700"
              : "border-green-500 bg-transparent"
          )}
        >
          <Ionicons
            name={isGiving ? "gift" : "gift-outline"}
            size={24}
            color={isGiving ? "white" : "rgb(34 197 94)"}
          />
        </Pressable>

        <Pressable
          onPress={handleToggleWant}
          disabled={isLoading}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={cn(
            "flex-1 items-center justify-center rounded-lg border py-4",
            isWanting
              ? "border-blue-700 bg-blue-700"
              : "border-blue-500 bg-transparent"
          )}
        >
          <Ionicons
            name={isWanting ? "heart" : "heart-outline"}
            size={24}
            color={isWanting ? "white" : "rgb(59 130 246)"}
          />
        </Pressable>
      </View>
    )
  }

  // Show remove buttons in give/want tabs
  const isRemoveTab = tabMode === "give" || tabMode === "want"
  if (!isRemoveTab) return null

  const handleRemove = () => {


    if (tabMode === "give") {
      removeFromGive()
      // Force refresh parent queries after successful removal
      setTimeout(() => {

        onRemoveSuccess?.()
      }, 200)
    } else {
      removeFromWant()
      // Force refresh parent queries after successful removal
      setTimeout(() => {

        onRemoveSuccess?.()
      }, 200)
    }
  }

  return (
    <View className="mt-2">
      <Pressable
        onPress={handleRemove}
        disabled={isLoading}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="flex-row items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-3"
      >
        <Ionicons name="trash-outline" size={16} color="white" />
        <Text className="font-medium text-sm text-white">Remove</Text>
      </Pressable>
    </View>
  )
})
