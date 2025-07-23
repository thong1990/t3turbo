import { Image, View } from "react-native"
import { useUser } from "~/features/supabase/hooks"
import { RelativeDateTime } from "~/shared/components/datetime-relative"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface CardExchangeData {
  type: "card_exchange"
  cards: Array<{
    id: string
    cardId: string
    name?: string
    imageUrl?: string
    rarity?: string
    quantity: number
    userId: string
  }>
  tradeId: string
  users?: {
    currentUserId: string
    currentUserName: string
    partnerUserId: string
    partnerUserName: string
  }
}

interface CardExchangeDisplayProps {
  data: CardExchangeData
  isMe: boolean
  timestamp: Date
}

export function CardExchangeDisplay({
  data,
  isMe,
  timestamp,
}: CardExchangeDisplayProps) {
  const { data: user } = useUser()
  const { cards, users } = data
  const currentUserId = user?.id

  const currentUserCards = users
    ? cards.filter(card => card.userId === users.currentUserId)
    : []
  const partnerUserCards = users
    ? cards.filter(card => card.userId === users.partnerUserId)
    : []

  let leftCards: typeof cards
  let rightCards: typeof cards
  let leftUserName: string
  let rightUserName: string

  // Helper function to create fallback name with game ID format
  const createFallbackName = (userId: string) =>
    userId ? `Player-${userId.slice(-6)}` : "Player"

  if (isMe) {
    leftCards = partnerUserCards
    rightCards = currentUserCards
    leftUserName =
      users?.partnerUserName || createFallbackName(users?.partnerUserId || "")
    rightUserName = users?.currentUserName || "You"
  } else if (currentUserId === users?.currentUserId) {
    leftCards = partnerUserCards
    rightCards = currentUserCards
    leftUserName =
      users?.partnerUserName || createFallbackName(users?.partnerUserId || "")
    rightUserName = users?.currentUserName || "You"
  } else if (currentUserId === users?.partnerUserId) {
    leftCards = currentUserCards
    rightCards = partnerUserCards
    leftUserName =
      users?.currentUserName || createFallbackName(users?.currentUserId || "")
    rightUserName = users?.partnerUserName || "You"
  } else {
    leftCards = partnerUserCards
    rightCards = currentUserCards
    leftUserName =
      users?.partnerUserName || createFallbackName(users?.partnerUserId || "")
    rightUserName = users?.currentUserName || "You"
  }

  return (
    <View className={`mb-2 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
      <View
        className={`max-w-[80%] rounded-lg p-3 ${isMe ? "bg-blue-50" : "bg-gray-50"}`}
      >
        <View className="flex-row items-center justify-center gap-4">
          <View className="items-center">
            <View className="mb-2 flex-row gap-2">
              {leftCards.map(card => (
                <View key={card.id} className="relative">
                  <View className="h-20 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                    {card.imageUrl ? (
                      <Image
                        source={{ uri: card.imageUrl }}
                        className="h-full w-full"
                        resizeMode="cover"
                        onLoad={() =>
                          console.log(`✅ Image loaded: ${card.name}`)
                        }
                        onError={error =>
                          console.log(
                            `❌ Image failed to load: ${card.name}`,
                            error
                          )
                        }
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center bg-gray-100">
                        <Ionicons
                          name="image-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                        <Text className="mt-1 px-1 text-center text-[8px] text-gray-500">
                          {card.name}
                        </Text>
                      </View>
                    )}
                  </View>
                  {card.quantity > 1 && (
                    <View className="-top-1 -right-1 absolute h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <Text className="font-bold text-white text-xs">
                        {card.quantity}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <Text className="font-medium text-gray-600 text-xs">
              {leftUserName}
            </Text>
          </View>

          <View className="h-8 w-8 items-center justify-center rounded-full bg-green-500">
            <Ionicons name="swap-horizontal" size={16} color="white" />
          </View>

          <View className="items-center">
            <View className="mb-2 flex-row gap-2">
              {rightCards.map(card => (
                <View key={card.id} className="relative">
                  <View className="h-20 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                    {card.imageUrl ? (
                      <Image
                        source={{ uri: card.imageUrl }}
                        className="h-full w-full"
                        resizeMode="cover"
                        onLoad={() =>
                          console.log(`✅ Image loaded: ${card.name}`)
                        }
                        onError={error =>
                          console.log(
                            `❌ Image failed to load: ${card.name}`,
                            error
                          )
                        }
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center bg-gray-100">
                        <Ionicons
                          name="image-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                        <Text className="mt-1 px-1 text-center text-[8px] text-gray-500">
                          {card.name}
                        </Text>
                      </View>
                    )}
                  </View>
                  {card.quantity > 1 && (
                    <View className="-top-1 -right-1 absolute h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <Text className="font-bold text-white text-xs">
                        {card.quantity}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <Text className="font-medium text-gray-600 text-xs">
              {rightUserName}
            </Text>
          </View>
        </View>

        <View className="mt-2 flex-row justify-end">
          <RelativeDateTime
            date={timestamp}
            className="text-gray-500 text-xs"
          />
        </View>
      </View>
    </View>
  )
}
