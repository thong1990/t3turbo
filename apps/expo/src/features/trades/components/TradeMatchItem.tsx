import { memo } from "react"
import { ActivityIndicator, Image, View } from "react-native"

import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

import type { TradeMatch, TradeableRarity } from "../types"
import { getRarityDisplayName } from "../utils"
import { CardRow } from "./card-row"

interface TradeMatchItemProps {
  match: TradeMatch
  onTrade: (match: TradeMatch) => void
  isCreatingTrade?: boolean
}

const RarityDisplay = memo<{ rarity: TradeableRarity }>(function RarityDisplay({ rarity }) {
  const displayName = getRarityDisplayName(rarity)
  const isStarRarity = rarity === "☆"
  const bgColor = isStarRarity ? "bg-amber-100" : "bg-blue-100"
  const textColor = isStarRarity ? "text-amber-800" : "text-blue-800"

  return (
    <View className={`flex-row items-center rounded-lg ${bgColor} px-3 py-2`}>
      <Text className={`mr-2 font-medium ${textColor}`}>{displayName}</Text>
      <Text className={`font-bold ${textColor}`}>{rarity}</Text>
    </View>
  )
})

export const TradeMatchItem = memo<TradeMatchItemProps>(function TradeMatchItem({
  match,
  onTrade,
  isCreatingTrade = false,
}) {
  return (
    <View className="mb-4 rounded-2xl border border-border bg-card p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {match.partnerAvatar ? (
            <Image
              source={{ uri: match.partnerAvatar }}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Ionicons
                name="person"
                size={20}
                className="text-muted-foreground"
              />
            </View>
          )}
          <View className="ml-3">
            <Text className="font-semibold text-base text-foreground">
              {match.partnerGameIGN || match.partnerName}
            </Text>
          </View>
        </View>
        <RarityDisplay rarity={match.rarity} />
      </View>

      <View className="space-y-4">
        <View>
          <Text className="mb-2 font-semibold text-base text-green-700">
            ↱ They give you
          </Text>
          <CardRow cards={match.cardsIWant} />
        </View>
        <View>
          <Text className="mb-2 font-semibold text-base text-orange-700">
            ↱ You give them
          </Text>
          <CardRow cards={match.cardsIGive} />
        </View>
      </View>

      <View className="mt-5 border-border border-t pt-4">
        <Button
          size="lg"
          onPress={() => onTrade(match)}
          disabled={isCreatingTrade}
          className="h-12 w-full"
        >
          {isCreatingTrade ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text>Start Trade</Text>
          )}
        </Button>
      </View>
    </View>
  )
})
