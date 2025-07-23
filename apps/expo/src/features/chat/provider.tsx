import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

import { useSendbirdChat } from "@sendbird/uikit-react-native"
import { SetSendbirdSDK } from "./factory"
import { useChatConnection } from "./hooks/use-chat-connection"

const ChatContext = createContext<{
  currentChannelUrl: string | null
  setCurrentChannelUrl: (url: string | null) => void
}>({
  currentChannelUrl: null,
  setCurrentChannelUrl: () => { },
})

export const useChatContext = () => useContext(ChatContext)

// Component to handle SDK initialization
function SendbirdSDKInitializer() {
  const { sdk } = useSendbirdChat()

  useEffect(() => {
    if (sdk) {

      SetSendbirdSDK(sdk)
    } else {

    }
  }, [sdk])

  return null
}

// Component to handle user connection
function SendbirdUserConnection() {
  const { sendbirdConnected, connectionStatus } = useChatConnection()

  useEffect(() => {

  }, [sendbirdConnected, connectionStatus])

  return null
}

export const ChatProvider = ({ children }: React.PropsWithChildren) => {
  const [currentChannelUrl, setCurrentChannelUrl] = useState<string | null>(
    null
  )

  return (
    <ChatContext.Provider value={{ currentChannelUrl, setCurrentChannelUrl }}>
      <SendbirdSDKInitializer />
      <SendbirdUserConnection />
      {children}
    </ChatContext.Provider>
  )
}
