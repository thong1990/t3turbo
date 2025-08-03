import { ActivityIndicator, View, ScrollView } from "react-native"
import { EmptyState } from "~/shared/components/ui/empty-state"
import { DeckCard } from "./DeckCard"
import { NativeAd } from "~/features/ads/components/NativeAd"
import type { Deck } from "../types"
import { Fragment, type ComponentProps, type ReactNode } from "react"
import type { Ionicons } from "~/shared/components/ui/icons"

interface EmptyStateConfig {
  icon: ComponentProps<typeof Ionicons>["name"]
  message: string
  description?: string
  action?: ReactNode
}

interface DeckListProps {
  decks: Deck[]
  isLoading: boolean
  error: Error | null
  showEditOptions?: boolean
  emptyState: EmptyStateConfig
}

export function DeckList({
  decks,
  isLoading,
  error,
  showEditOptions = false,
  emptyState,
}: DeckListProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    // Log error details for debugging
    console.error("DeckList Error:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    })
    
    return (
      <EmptyState
        icon="alert-circle-outline"
        message="Failed to load decks"
        description={`Error: ${error.message}. Check console for details.`}
      />
    )
  }

  if (decks.length === 0) {
    return (
      <EmptyState
        icon={emptyState.icon}
        message={emptyState.message}
        description={emptyState.description}
        action={emptyState.action}
      />
    )
  }

  return (
    <ScrollView>
      {decks.map((deck: Deck, index) => (
        <Fragment key={deck.id || index}>
          <DeckCard deck={deck} showEditOptions={showEditOptions} />
          {(index + 1) % 3 === 0 && index < decks.length - 1 && (
            <NativeAd placement="decks-feed" template="card" className="my-4" />
          )}
        </Fragment>
      ))}
    </ScrollView>
  )
}
