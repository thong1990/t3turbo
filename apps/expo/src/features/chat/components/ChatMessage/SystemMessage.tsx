import { View } from "react-native"
import { Text } from "~/shared/components/ui/text"

interface SystemMessageProps {
  message: string
}

export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <View className="mb-2 items-center">
      <View className="rounded-full bg-muted/50 px-3 py-1">
        <Text className="text-center text-muted-foreground text-xs">
          {message}
        </Text>
      </View>
    </View>
  )
}
