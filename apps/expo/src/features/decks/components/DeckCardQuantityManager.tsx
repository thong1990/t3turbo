import { View, Pressable } from "react-native"
import { Text } from "~/shared/components/ui/text"
import { Ionicons } from "~/shared/components/ui/icons"

interface DeckCardQuantityManagerProps {
  cardId: string
  selectedCards: string[]
  onAdd: (cardId: string) => void
  onRemove: (cardId: string) => void
  maxCopies?: number
}

export function DeckCardQuantityManager({ 
  cardId, 
  selectedCards, 
  onAdd, 
  onRemove,
  maxCopies = 2 
}: DeckCardQuantityManagerProps) {
  // Calculate count directly to avoid any caching issues
  const cardCount = selectedCards.filter(id => id === cardId).length
  const isMaxReached = cardCount >= maxCopies
  const isEmpty = cardCount === 0
  
  
  
  return (
    <View className="absolute bottom-6 left-0 right-0 bg-gray-100/90 backdrop-blur-sm rounded-lg mx-1">
      {/* Card overlay controls */}
      <View className="flex-row items-center justify-between px-2 py-1.5">
        {/* Remove Button */}
        <Pressable
          onPress={() => onRemove(cardId)}
          disabled={isEmpty}
          className={`
            items-center justify-center w-7 h-7 rounded-full
            ${isEmpty 
              ? 'bg-gray-300/50' 
              : 'bg-red-500 active:bg-red-600'
            }
          `}
        >
          <Ionicons 
            name="remove" 
            size={16} 
            color={isEmpty ? '#9ca3af' : 'white'} 
          />
        </Pressable>
        
        {/* Count Display */}
        <View className="items-center">
          <Text className="font-bold text-gray-800 text-base">
            {cardCount}
          </Text>
          {/* Progress indicator */}
          <View className="flex-row gap-0.5">
            {Array.from({ length: maxCopies }, (_, index) => (
              <View
                key={index}
                className={`
                  w-1 h-1 rounded-full
                  ${index < cardCount 
                    ? 'bg-gray-700' 
                    : 'bg-gray-400'
                  }
                `}
              />
            ))}
          </View>
        </View>
        
        {/* Add Button */}
        <Pressable
          onPress={() => onAdd(cardId)}
          disabled={isMaxReached}
          className={`
            items-center justify-center w-7 h-7 rounded-full
            ${isMaxReached 
              ? 'bg-gray-300/50' 
              : 'bg-green-500 active:bg-green-600'
            }
          `}
        >
          <Ionicons 
            name="add" 
            size={16} 
            color={isMaxReached ? '#9ca3af' : 'white'} 
          />
        </Pressable>
      </View>
    </View>
  )
}