import { Ionicons } from "~/shared/components/ui/icons"
import * as Haptics from "expo-haptics"
import { Pressable, TouchableOpacity, View } from "react-native"
import { TextField } from "~/shared/components/ui/text-field"

interface TradeSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onShowFilters: () => void
  activeFiltersCount: number
}

export function TradeSearchBar({
  searchQuery,
  onSearchChange,
  onShowFilters,
  activeFiltersCount,
}: TradeSearchBarProps) {
  return (
    <View className="px-4 py-3">
      <View className="flex-row items-center space-x-2">
        {/* Search Input */}
        <View className="flex-1 flex-row items-center rounded-lg border border-border bg-background px-3 py-2">
          <Ionicons name="search" size={20} className="text-muted-foreground" />
          <TextField
            className="ml-2 flex-1 text-foreground"
            placeholder="Search Cards..."
            placeholderTextColor="hsl(var(--muted-foreground))"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => onSearchChange("")}
              className="p-1"
            >
              <Ionicons
                name="close-circle"
                size={20}
                className="text-muted-foreground"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button - Fixed positioning for badge */}
        <View className="relative">
          <Pressable
            onPress={() => {
              onShowFilters()
              Haptics.selectionAsync()
            }}
            className="flex-row items-center justify-center rounded-lg border border-border bg-card px-4 py-2"
            hitSlop={20}
            pressRetentionOffset={50}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Ionicons
              name="options-outline"
              size={20}
              className="text-foreground"
            />
          </Pressable>
          {/* Badge positioned absolutely relative to the parent View */}
          {activeFiltersCount > 0 && (
            <View className="-right-1 -top-1 absolute h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1">
              <Text className="font-semibold text-white text-xs">
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
