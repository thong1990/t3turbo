import { Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Badge } from "./badge"
import { Text } from "./text"
import { TextField } from "./text-field"

interface SearchBarProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  placeholder: string
  activeFiltersCount?: number
  onFilterPress: () => void
}

export function SearchBar({
  searchQuery,
  onSearchQueryChange,
  placeholder,
  activeFiltersCount = 0,
  onFilterPress,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-x-2">
      <View className="relative flex-1">
        <TextField
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder={placeholder}
          leftView={
            <Ionicons
              name="search-outline"
              size={24}
              className="ml-2 text-muted-foreground"
            />
          }
        />
      </View>
      <Pressable
        onPress={onFilterPress}
        className="h-10 w-10 items-center justify-center rounded-md border border-border bg-muted"
      >
        <Ionicons
          name="filter-outline"
          size={24}
          className="text-muted-foreground"
        />
        {activeFiltersCount > 0 && (
          <Badge
            variant="default"
            className="-right-1 -top-1 absolute h-4 w-4 justify-center rounded-full p-0"
          >
            <Text className="text-primary-foreground text-xs">
              {activeFiltersCount}
            </Text>
          </Badge>
        )}
      </Pressable>
    </View>
  )
}
