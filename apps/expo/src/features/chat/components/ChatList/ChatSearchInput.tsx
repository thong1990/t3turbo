import { TouchableOpacity, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { TextField } from "~/shared/components/ui/text-field"

interface ChatSearchInputProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClear: () => void
  placeholder?: string
}

export function ChatSearchInput({
  searchQuery,
  onSearchChange,
  onClear,
  placeholder = "Search chats...",
}: ChatSearchInputProps) {
  return (
    <View className="px-4 py-3">
      <View className="relative rounded-lg border border-border bg-background">
        <Ionicons
          name="search"
          size={20}
          className="absolute top-1/2 left-3 z-10 text-muted-foreground"
          style={{ transform: [{ translateY: -10 }] }}
        />

        <TextField
          className="w-full py-3 pr-10 pl-10 text-foreground"
          placeholder={placeholder}
          placeholderTextColor="hsl(var(--muted-foreground))"
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            className="absolute top-1/2 right-3 z-10 p-1"
            style={{ transform: [{ translateY: -10 }] }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              className="text-muted-foreground"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
