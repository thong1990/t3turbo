import { useEffect, useState } from "react"
import { useUser } from "~/features/supabase/hooks"
import type { CONNECTION_STATES } from "../constants"
import { GetSendbirdSDK } from "../services/sendbird-factory"
import { useSendbirdAuth } from "../services/sendbird-auth"

type ConnectionStatus = (typeof CONNECTION_STATES)[number]

export function useSendbirdConnection() {
  const { data: user } = useUser()
  const { connectUser } = useSendbirdAuth()
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting")
  const [sendbirdConnected, setSendbirdConnected] = useState(false)

  // Check SendBird connection status
  useEffect(() => {
    let previousConnectionState = false

    function checkSendbirdConnection() {
      const sdk = GetSendbirdSDK()
      const isCurrentlyConnected = !!sdk?.currentUser

      if (isCurrentlyConnected !== previousConnectionState) {
        if (isCurrentlyConnected) {
          setSendbirdConnected(true)
        } else {
          setSendbirdConnected(false)
        }
        previousConnectionState = isCurrentlyConnected
      }
    }

    checkSendbirdConnection()
    const interval = setInterval(checkSendbirdConnection, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-connect to SendBird if not connected
  useEffect(() => {
    const sdk = GetSendbirdSDK()

    if (
      !sendbirdConnected &&
      user &&
      sdk && // Make sure SDK is available
      connectionStatus !== "sendbird_disconnected"
    ) {
      setConnectionStatus("sendbird_disconnected")

      connectUser()
        .then(() => {
          setSendbirdConnected(true)
          setConnectionStatus("connecting")
        })
        .catch(error => {
          console.error("❌ Failed to connect to SendBird:", error)
          setConnectionStatus("error")
        })
    }
  }, [sendbirdConnected, user, connectUser, connectionStatus])

  return {
    user,
    connectionStatus,
    setConnectionStatus,
    sendbirdConnected,
    isConnecting: connectionStatus === "connecting",
    isConnected: connectionStatus === "connected",
    hasError: connectionStatus === "error",
  }
}