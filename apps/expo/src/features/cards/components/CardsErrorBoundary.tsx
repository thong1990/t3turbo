import { memo, type ReactNode } from "react"
import { View } from "react-native"

import { ErrorBoundary } from "~/shared/components/error-boundary"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"

interface CardsErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

const CardsErrorFallback = memo(function CardsErrorFallback({
  onReset,
}: {
  onReset?: () => void
}) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-center text-xl font-semibold text-foreground">
        Cards Error
      </Text>
      <Text className="mb-6 text-center text-muted-foreground">
        Unable to load your cards. Please check your connection and try again.
      </Text>
      {onReset && (
        <Button onPress={onReset}>
          <Text>Retry</Text>
        </Button>
      )}
    </View>
  )
})

export const CardsErrorBoundary = memo<CardsErrorBoundaryProps>(
  function CardsErrorBoundary({ children, onReset }) {
    return (
      <ErrorBoundary
        fallback={<CardsErrorFallback onReset={onReset} />}
        onReset={onReset}
      >
        {children}
      </ErrorBoundary>
    )
  }
)