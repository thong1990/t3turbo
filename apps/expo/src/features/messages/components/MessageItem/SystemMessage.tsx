import type { SendbirdMessage } from "@sendbird/uikit-utils"
import { View } from "react-native"
import { RelativeDateTime } from "~/shared/components/ui/relative-date-time"
import { Text } from "~/shared/components/ui/text"

interface SystemMessageProps {
  message: SendbirdMessage
}

export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <View className="mb-2 items-center">
      <View className="rounded-full bg-muted/50 px-3 py-1">
        <Text className="text-center text-muted-foreground text-xs">
          {message.message}
        </Text>
        <RelativeDateTime
          date={message.createdAt}
          className="mt-1 text-center text-muted-foreground/60 text-xs"
        />
      </View>
    </View>
  )
}
