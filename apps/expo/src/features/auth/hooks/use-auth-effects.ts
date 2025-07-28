import { useEffect } from "react"
import { useSendbirdAuth } from "~/features/messages/services/sendbird-auth"
import { useUser } from "~/features/supabase/hooks"

export const useAuthEffects = () => {
  const { data: user } = useUser()
  const { connectUser, disconnectUser } = useSendbirdAuth()

  useEffect(() => {
    if (user) {
      // Connect to SendBird when user logs in
      connectUser().catch(error => {
        console.error("Failed to connect to SendBird:", error)
      })
    } else {
      // Disconnect when user logs out
      disconnectUser().catch(error => {
        console.error("Failed to disconnect from SendBird:", error)
      })
    }
  }, [user, connectUser, disconnectUser])
}
