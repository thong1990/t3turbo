import { useState } from "react"
import { Keyboard } from "react-native"
import { useUser } from "~/features/supabase/hooks"
import { useSendMessage } from "../mutations"

export function useMessageInput(channelUrl: string, disabled: boolean) {
  const [value, setValue] = useState("")
  const { data: user } = useUser()
  const sendMessage = useSendMessage()

  async function handleSend() {
    if (!value.trim()) {
      return
    }

    if (disabled) {
      return
    }

    if (!user?.id) {
      return
    }

    try {
      await sendMessage.mutateAsync({
        channelUrl,
        message: value.trim(),
        currentUserId: user.id,
      })

      setValue("")
      Keyboard.dismiss()
    } catch (error) {
      console.error("❌ Failed to send message:", error)
    }
  }

  async function sendTemplate(template: string) {
    if (disabled || !user?.id) return

    try {
      await sendMessage.mutateAsync({
        channelUrl,
        message: template,
        currentUserId: user.id,
      })
    } catch (error) {
      console.error("Failed to send template message:", error)
    }
  }

  const canSend = !!value.trim() && !disabled && !sendMessage.isPending

  return {
    value,
    setValue,
    handleSend,
    sendTemplate,
    isLoading: sendMessage.isPending,
    canSend,
  }
}
