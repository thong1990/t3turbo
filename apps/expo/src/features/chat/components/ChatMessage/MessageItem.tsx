import { useMessageParsing } from "../../hooks/use-message-parsing"
import type { Message } from "../../types"
import { CardExchangeDisplay } from "../CardExchange/CardExchangeDisplay"
import { RegularMessage } from "./RegularMessage"
import { SystemMessage } from "./SystemMessage"

export type MessageItemProps = {
  message: Message
  isMe: boolean
}

export function MessageItem({ message, isMe }: MessageItemProps) {
  const { parseCardExchangeData, getMessageType } = useMessageParsing()
  const { isTradeAction, isSystemMessage, isCardExchange } =
    getMessageType(message)

  if (isCardExchange) {
    const cardExchangeData = parseCardExchangeData(message)
    if (cardExchangeData) {
      return (
        <CardExchangeDisplay
          data={cardExchangeData}
          isMe={isMe}
          timestamp={message.timestamp}
        />
      )
    }
  }

  if (isSystemMessage || isTradeAction) {
    return <SystemMessage message={message.message || ""} />
  }

  return (
    <RegularMessage
      message={message.message || ""}
      timestamp={message.timestamp}
      isMe={isMe}
    />
  )
}
