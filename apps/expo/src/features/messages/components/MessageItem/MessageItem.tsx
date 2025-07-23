import type { SendbirdMessage } from "@sendbird/uikit-utils"
import { CardExchangeMessage } from "./CardExchangeMessage"
import { RegularMessage } from "./RegularMessage"
import { SystemMessage } from "./SystemMessage"

export type MessageItemProps = {
  message: SendbirdMessage
}

export function MessageItem({ message }: MessageItemProps) {
  switch (message.customType) {
    case "card_exchange":
      return <CardExchangeMessage message={message} />
    case "system":
      return <SystemMessage message={message} />
    default:
      return <RegularMessage message={message} />
  }
}
