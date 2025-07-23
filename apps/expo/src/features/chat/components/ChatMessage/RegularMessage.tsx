import { View } from "react-native"
import { RelativeDateTime } from "~/shared/components/datetime-relative"
import { Text } from "~/shared/components/ui/text"

interface RegularMessageProps {
  message: string
  timestamp: Date
  isMe: boolean
}

export function RegularMessage({
  message,
  timestamp,
  isMe,
}: RegularMessageProps) {
  return (
    <View className={`mb-2 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
      <View
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isMe ? "bg-primary" : "bg-muted"
        }`}
      >
        <Text
          className={`text-base ${
            isMe ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {message}
        </Text>
        <View className="mt-1 flex-row justify-end">
          <RelativeDateTime
            date={timestamp.toISOString()}
            className={`text-xs ${
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          />
        </View>
      </View>
    </View>
  )
}
