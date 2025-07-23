import { MessageTemplates } from "~/features/messages/components/MessageInput"
import { useMessageInput } from "../../hooks/use-message-input"
import { MessageInputField } from "./MessageInputField"

interface MessageInputComponentProps {
  channelUrl: string
  disabled?: boolean
}

export function MessageInput({
  channelUrl,
  disabled = false,
}: MessageInputComponentProps) {
  const { value, setValue, handleSend, sendTemplate, isLoading, canSend } =
    useMessageInput(channelUrl, disabled)

  return (
    <MessageInputField
      value={value}
      onChangeText={setValue}
      onSend={handleSend}
      disabled={disabled}
      canSend={canSend}
      isLoading={isLoading}
      templateButton={<MessageTemplates onTemplateSelect={sendTemplate} />}
    />
  )
}
