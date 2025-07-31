import React from "react"
import { View } from "react-native"
import * as Sentry from "@sentry/react-native"
import { Text } from "~/shared/components/ui/text"
import { Button } from "~/shared/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry if available
    if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }

    // Log to console in development
    if (__DEV__) {
      console.error("ErrorBoundary caught an error:", error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        )
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-background">
          <Text className="text-lg font-semibold text-destructive mb-4">
            Something went wrong
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            {__DEV__ && this.state.error
              ? this.state.error.message
              : "We're sorry, but something unexpected happened. Please try again."}
          </Text>
          <Button onPress={this.resetError} variant="outline">
            <Text>Try Again</Text>
          </Button>
        </View>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack: string }) => {
    if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: errorInfo ? { react: errorInfo } : undefined,
      })
    }

    if (__DEV__) {
      console.error("Error caught by useErrorHandler:", error, errorInfo)
    }
  }
}