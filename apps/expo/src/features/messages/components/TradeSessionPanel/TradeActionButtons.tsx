import { useState } from "react"
import { View } from "react-native"

import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { CompleteTradeModal } from "./CompleteTradeModal"

type TradeActionButtonsProps = {
  selectedCardsCount: number
  isLoading: boolean
  tradeStatus: string | null
  onCopyId: () => void
  onExchangeCards: () => void
  onCompleteTrade: () => void
}

export function TradeActionButtons({
  selectedCardsCount,
  isLoading,
  tradeStatus,
  onCopyId,
  onExchangeCards,
  onCompleteTrade,
}: TradeActionButtonsProps) {
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // Trade is completed if status is "completed"
  const isCompleted = tradeStatus === "completed"

  // Show complete button for active trades (not for pending_acceptance, completed, cancelled, etc.)
  const canComplete = tradeStatus === "active" || tradeStatus === "pending_acceptance"

  function handleCompletePress() {
    setShowCompleteModal(true)
  }

  function handleConfirmComplete() {
    onCompleteTrade()
    setShowCompleteModal(false)
  }

  function handleCancelComplete() {
    setShowCompleteModal(false)
  }

  return (
    <>
      <View className="flex-row gap-2">
        <Button
          onPress={onCopyId}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          <Text className="text-xs">Copy Game ID</Text>
        </Button>

        <Button
          onPress={onExchangeCards}
          className="flex-1"
          disabled={selectedCardsCount === 0 || isLoading || isCompleted}
        >
          <Text className="text-xs">
            {isLoading ? "Sending..." : `Exchange (${selectedCardsCount})`}
          </Text>
        </Button>

        {canComplete && !isCompleted && (
          <Button
            onPress={handleCompletePress}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            <Text className="text-xs">Complete Trade</Text>
          </Button>
        )}
      </View>

      <CompleteTradeModal
        visible={showCompleteModal}
        isLoading={isLoading}
        onConfirm={handleConfirmComplete}
        onCancel={handleCancelComplete}
      />
    </>
  )
}
