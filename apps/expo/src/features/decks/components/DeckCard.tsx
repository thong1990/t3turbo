import { cn } from "@init/utils/ui"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { Alert, Image, Pressable, View } from "react-native"
import { useUser } from "~/features/supabase/hooks"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/shared/components/ui/avatar"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"
import { useDeckCrud, useDeckInteractions } from "../hooks"
import type { Deck } from "../types"

interface DeckCardProps {
  deck: Deck
  showEditOptions?: boolean
}

export function DeckCard({ deck, showEditOptions = false }: DeckCardProps) {
  const { data: user } = useUser()
  const { deleteDeck, isDeleting } = useDeckCrud()
  const {
    toggleLike,
    toggleFavorite,
    shareDeck,
    isLiked,
    isFavorite,
    isLoading: isInteractionLoading,
  } = useDeckInteractions(deck.id, user?.id || "")

  const handlePress = () => {
    router.push(`/decks/${deck.id}`)
    Haptics.selectionAsync()
  }

  const handleEditDeck = (deckId: string) => {
    router.push(`/decks/edit_deck?id=${deckId}`)
    Haptics.selectionAsync()
  }

  const handleDeleteDeck = (deckId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert("Delete Deck", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteDeck(deckId),
      },
    ])
  }

  const handleToggleFavorite = () => {
    if (!user?.id) return
    toggleFavorite()
  }

  const handleToggleLike = () => {
    if (!user?.id) return
    toggleLike()
  }

  const handleShareDeck = () => {
    if (!user?.id) return
    shareDeck()
  }

  const cardSlots = deck.cards?.length ?? 0
  const displayCount = Math.max(cardSlots, 10)

  return (
    <Pressable onPress={handlePress}>
      <View className="mb-6 gap-2 overflow-hidden rounded-2xl bg-card p-4 shadow-sm">
        <View className="flex-row justify-between">
          <View className="flex-row items-center gap-x-2">
            <Avatar alt={deck.author}>
              <AvatarImage src="https://robohash.org/set_set3/bgset_bg1/3.14159?size=500x500s" />
              <AvatarFallback>
                <Text>CN</Text>
              </AvatarFallback>
            </Avatar>
            <View>
              <Text className="font-semibold text-card-foreground text-xl">
                {deck.name}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {deck.author}
              </Text>
            </View>
          </View>

          {showEditOptions && (
            <View className="flex-row">
              <Button
                variant="ghost"
                size="icon"
                onPress={() => handleEditDeck(deck.id)}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  className="text-foreground"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onPress={() => handleDeleteDeck(deck.id)}
              >
                <Ionicons name="trash-outline" size={16} />
              </Button>
            </View>
          )}
        </View>

        <View className="-mx-[2px] flex-row flex-wrap pt-2">
          {Array.from({ length: displayCount }).map((_, i) => {
            const card = deck.cards?.[i]
            return (
              <View
                key={card ? `${card.id}-${i}` : `empty-${i}`}
                className="mb-[4px] w-1/5 px-[2px]"
              >
                <View className="aspect-[5/7] overflow-hidden rounded-md border border-border/20 shadow-sm">
                  {card ? (
                    <>
                      {card.image ? (
                        <Image
                          source={{ uri: card.image }}
                          className="aspect-[5/7] w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="aspect-[5/7] w-full items-center justify-center bg-muted">
                          <Ionicons
                            name="image-outline"
                            size={20}
                            className="text-muted-foreground"
                          />
                        </View>
                      )}
                      {card.count > 1 && (
                        <View className="absolute right-1 bottom-1 h-4 w-4 items-center justify-center rounded-full bg-secondary">
                          <Text className="font-bold text-primary-foreground text-xs">
                            {card.count}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <View className="aspect-[5/7] w-full animate-pulse bg-muted" />
                  )}
                </View>
              </View>
            )
          })}
        </View>

        <View className="flex-row gap-2 pt-2">
          <Button
            variant="muted"
            className="flex-1"
            onPress={handleToggleLike}
            disabled={isInteractionLoading}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={16}
              className={cn(
                "mr-1",
                isLiked ? "text-red-500" : "text-foreground"
              )}
            />
            <Text className="font-medium text-sm">Like</Text>
          </Button>

          <Button
            variant="muted"
            className="flex-1"
            onPress={handleToggleFavorite}
            disabled={isInteractionLoading}
          >
            <Ionicons
              name={isFavorite ? "bookmark" : "bookmark-outline"}
              size={16}
              className={cn(
                "mr-1",
                isFavorite ? "text-yellow-500" : "text-foreground"
              )}
            />
            <Text className="font-medium text-sm">Save</Text>
          </Button>

          <Button
            variant="muted"
            className="flex-1"
            onPress={handleShareDeck}
            disabled={isInteractionLoading}
          >
            <Ionicons
              name="share-outline"
              size={16}
              className="mr-1 text-foreground"
            />
            <Text className="font-medium text-sm">Share</Text>
          </Button>
        </View>
      </View>
    </Pressable>
  )
}
