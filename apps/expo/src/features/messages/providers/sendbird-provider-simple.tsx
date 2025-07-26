import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useSendbirdChat } from "@sendbird/uikit-react-native"
import { SetSendbirdSDK } from "../services/sendbird-factory"

const SendbirdContext = createContext<{
  currentChannelUrl: string | null
  setCurrentChannelUrl: (url: string | null) => void
}>({
  currentChannelUrl: null,
  setCurrentChannelUrl: () => { },
})

export const useSendbirdContext = () => useContext(SendbirdContext)

export const SendbirdProvider = ({ children }: React.PropsWithChildren) => {
  const [currentChannelUrl, setCurrentChannelUrl] = useState<string | null>(null)
  const { sdk } = useSendbirdChat()

  useEffect(() => {
    if (sdk) {
      console.log("✅ Sendbird SDK initialized")
      SetSendbirdSDK(sdk)
    }
  }, [sdk])

  return (
    <SendbirdContext.Provider value={{ currentChannelUrl, setCurrentChannelUrl }}>
      {children}
    </SendbirdContext.Provider>
  )
}