import React from "react"
import { View } from "react-native"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    retry = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback
            return <FallbackComponent error={this.state.error} retry={this.retry} />
        }

        return this.props.children
    }
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
    return (
        <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="alert-circle-outline" size={64} className="text-red-500" />
            <Text className="mt-4 text-center font-semibold text-foreground text-lg">
                Something went wrong
            </Text>
            <Text className="mt-2 text-center text-muted-foreground text-sm">
                {error?.message || "An unexpected error occurred"}
            </Text>
            <Button onPress={retry} className="mt-6">
                <Text className="text-primary-foreground">Try Again</Text>
            </Button>
        </View>
    )
} 