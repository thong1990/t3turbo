import { Ionicons } from "~/shared/components/ui/icons"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { CardItem } from "~/features/cards/components/CardItem"
import type { Card } from "~/features/cards/types"

interface SelectedCardsGridProps {
  selectedCards: string[]
  cards: Card[] | undefined
  onSelectCard: (cardId: string) => void
}

export function SelectedCardsGrid({
  selectedCards,
  cards,
  onSelectCard,
}: SelectedCardsGridProps) {
  // State to track grid size
  const [showExpandedGrid, setShowExpandedGrid] = useState(false)

  // Get unique cards with their counts
  const uniqueCardsWithCount = selectedCards.reduce(
    (acc, cardId) => {
      if (acc[cardId]) {
        acc[cardId].count++
      } else {
        acc[cardId] = { count: 1, index: Object.keys(acc).length }
      }
      return acc
    },
    {} as Record<string, { count: number; index: number }>
  )

  // Unique card IDs (not counting duplicates)
  const uniqueCardIds = Object.keys(uniqueCardsWithCount)

  // Expand grid if we have more than 10 unique cards selected
  useEffect(() => {
    // Show expanded grid (3 rows) when we have more than 10 unique cards
    setShowExpandedGrid(uniqueCardIds.length > 10)
  }, [uniqueCardIds.length])

  // Calculate columns per row based on number of unique cards
  // Per PRD: 10-15 card grid with 2-3 rows based on quantity
  const calculateLayout = () => {
    // If we have 3 rows, we need to adjust columns to fit cards better
    if (showExpandedGrid) {
      return {
        rows: 3,
        columnsPerRow: 5,
      }
    }

    // If we have fewer cards, use 2 rows
    return {
      rows: 2,
      columnsPerRow: 5,
    }
  }

  const layout = calculateLayout()
  const rowIndices = Array.from({ length: layout.rows }, (_, i) => i)

  // Function to handle removing a card
  const handleRemoveCard = (cardId: string) => {
    onSelectCard(cardId)
  }

  // Generate unique keys for grid cells
  const generateCellKey = (
    rowIndex: number,
    colIndex: number,
    cardId?: string
  ) => {
    return cardId
      ? `card-${cardId}-${rowIndex}-${colIndex}`
      : `empty-cell-${rowIndex}-${colIndex}`
  }

  // Calculate total cells in grid
  const totalCells = layout.rows * layout.columnsPerRow

  // Create an array representing all cells in the grid
  const gridCells = Array.from({ length: totalCells }, (_, index) => {
    const rowIndex = Math.floor(index / layout.columnsPerRow)
    const colIndex = index % layout.columnsPerRow

    // If we have a card for this position, use it
    if (index < uniqueCardIds.length) {
      const cardId = uniqueCardIds[index]
      return {
        rowIndex,
        colIndex,
        cardId,
        empty: false,
      }
    }

    // Otherwise this is an empty cell
    return {
      rowIndex,
      colIndex,
      empty: true,
    }
  })

  return (
    <View className="px-2 py-2">
      <View className="flex flex-wrap gap-y-0.5">
        {rowIndices.map(rowIndex => (
          <View
            key={`selected-grid-row-${rowIndex}`}
            className="w-full flex-row justify-between"
          >
            {Array.from({ length: layout.columnsPerRow }, (_, colIndex) => {
              const position = rowIndex * layout.columnsPerRow + colIndex
              const uniqueCardId = uniqueCardIds[position]
              const cardInfo = uniqueCardId
                ? uniqueCardsWithCount[uniqueCardId]
                : null
              const card = uniqueCardId
                ? cards?.find(c => c.id === uniqueCardId)
                : null

              return (
                <View
                  key={generateCellKey(rowIndex, colIndex, uniqueCardId)}
                  className="relative px-0.5"
                >
                  <View className="h-[80px] w-[70px] rounded bg-muted">
                    {card ? (
                      <>
                        <CardItem
                          card={card}
                          selectedCards={[uniqueCardId]}
                          onSelectCard={onSelectCard}
                          isPreview={true}
                          onPress={() => handleRemoveCard(card.id)}
                          showCardName={true}
                        />
                        {/* Count badge for duplicate cards */}
                        {cardInfo && cardInfo.count > 1 && (
                          <View className="absolute bottom-1 left-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 shadow-sm">
                            <Text className="font-semibold text-gray-900 text-xs">
                              x{cardInfo.count}
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      // Empty slot with plus icon
                      <View className="flex-1 items-center justify-center">
                        <Ionicons
                          name="add-circle-outline"
                          size={24}
                          color="#999"
                        />
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}
