import type { SendbirdMessage } from "@sendbird/uikit-utils"
import { View } from "react-native"
import { useUser } from "~/features/supabase/hooks"
import { RelativeDateTime } from "~/shared/components/ui/relative-date-time"
import { Text } from "~/shared/components/ui/text"

interface RegularMessageProps {
  message: SendbirdMessage
}

export function RegularMessage({ message }: RegularMessageProps) {
  const { data: user } = useUser()
  const isMe = message.sender.userId === user?.id

  return (
    <View className={`mb-2 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
      <View
        className={`max-w-[80%] rounded-lg px-4 py-2 ${isMe ? "bg-primary" : "bg-muted"
          }`}
      >
        <Text
          className={`text-base ${isMe ? "text-primary-foreground" : "text-foreground"
            }`}
        >
          {message.message || "No message"}
        </Text>
        <View className="mt-1 flex-row justify-end">
          <RelativeDateTime
            date={message.createdAt}
            className={`text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
          />
        </View>
      </View>
    </View>
  )
}
