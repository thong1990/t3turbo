import { memo, type ReactNode } from "react"
import { View } from "react-native"

import { ErrorBoundary } from "~/shared/components/error-boundary"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"

interface TradeErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

const TradeErrorFallback = memo(function TradeErrorFallback({
  onReset,
}: {
  onReset?: () => void
}) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-center text-xl font-semibold text-foreground">
        Trade Error
      </Text>
      <Text className="mb-6 text-center text-muted-foreground">
        Something went wrong loading trade data. Please try again.
      </Text>
      {onReset && (
        <Button onPress={onReset}>
          <Text>Try Again</Text>
        </Button>
      )}
    </View>
  )
})

export const TradeErrorBoundary = memo<TradeErrorBoundaryProps>(
  function TradeErrorBoundary({ children, onReset }) {
    return (
      <ErrorBoundary
        fallback={<TradeErrorFallback onReset={onReset} />}
        onReset={onReset}
      >
        {children}
      </ErrorBoundary>
    )
  }
)