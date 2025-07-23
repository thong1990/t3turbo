import { View } from "react-native"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface TradeActionButtonsProps {
  selectedCardsCount: number
  isLoading: boolean
  onCopyId: () => void
  onExchangeCards: () => void
}

export function TradeActionButtons({
  selectedCardsCount,
  isLoading,
  onCopyId,
  onExchangeCards,
}: TradeActionButtonsProps) {
  return (
    <View className="mt-1 border-border border-t pt-1.5">
      <View className="flex-row gap-2">
        <Button
          onPress={onCopyId}
          variant="outline"
          size="sm"
          className="h-8 flex-1"
        >
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="copy-outline" size={14} className="text-primary" />
            <Text className="font-medium text-primary text-xs">Copy ID</Text>
          </View>
        </Button>

        <Button
          onPress={onExchangeCards}
          variant={selectedCardsCount === 0 ? "outline" : "primary"}
          size="sm"
          className="h-8 flex-1"
          disabled={selectedCardsCount === 0 || isLoading}
        >
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              className={
                selectedCardsCount === 0
                  ? "text-muted-foreground"
                  : "text-primary-foreground"
              }
            />
            <Text
              className={`font-semibold text-xs ${
                selectedCardsCount === 0
                  ? "text-muted-foreground"
                  : "text-primary-foreground"
              }`}
            >
              {isLoading ? "Sending..." : "Exchange"}
            </Text>
          </View>
        </Button>
      </View>
    </View>
  )
}
