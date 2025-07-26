import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

import { useSendbirdChat } from "@sendbird/uikit-react-native"
import { SetSendbirdSDK } from "../services/sendbird-factory"
import { useSendbirdConnection } from "../hooks/use-sendbird-connection"

const SendbirdContext = createContext<{
  currentChannelUrl: string | null
  setCurrentChannelUrl: (url: string | null) => void
}>({
  currentChannelUrl: null,
  setCurrentChannelUrl: () => { },
})

export const useSendbirdContext = () => useContext(SendbirdContext)

// Component to handle SDK initialization
function SendbirdSDKInitializer() {
  const { sdk } = useSendbirdChat()

  useEffect(() => {
    if (sdk) {
      console.log("✅ Sendbird SDK initialized successfully")
      SetSendbirdSDK(sdk)
    } else {
      console.log("⚠️ Sendbird SDK not available")
    }
  }, [sdk])

  return null
}

// Component to handle user connection
function SendbirdUserConnection() {
  const { sendbirdConnected, connectionStatus } = useSendbirdConnection()

  useEffect(() => {
    console.log("📡 Sendbird connection status:", { sendbirdConnected, connectionStatus })
  }, [sendbirdConnected, connectionStatus])

  return null
}

export const SendbirdProvider = ({ children }: React.PropsWithChildren) => {
  const [currentChannelUrl, setCurrentChannelUrl] = useState<string | null>(
    null
  )

  return (
    <SendbirdContext.Provider value={{ currentChannelUrl, setCurrentChannelUrl }}>
      <SendbirdSDKInitializer />
      <SendbirdUserConnection />
      {children}
    </SendbirdContext.Provider>
  )
}