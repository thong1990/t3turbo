import { useEffect } from "react"
import { useSendbirdAuth } from "~/features/messages/services/sendbird-auth"
import { useUser } from "~/features/supabase/hooks"

export const useAuthEffects = () => {
  const { data: user } = useUser()
  const { connectUser, disconnectUser } = useSendbirdAuth()

  useEffect(() => {
    console.log("🔐 Auth effects running:", { hasUser: !!user, userId: user?.id })
    
    if (user) {
      // Connect to SendBird when user logs in
      console.log("🔗 Attempting to connect user to Sendbird...")
      connectUser()
        .then(() => {
          console.log("✅ Successfully connected to Sendbird")
        })
        .catch(error => {
          console.error("❌ Failed to connect to SendBird:", error)
        })
    } else {
      // Disconnect when user logs out
      console.log("🔌 Disconnecting from Sendbird...")
      disconnectUser().catch(error => {
        console.error("❌ Failed to disconnect from SendBird:", error)
      })
    }
  }, [user, connectUser, disconnectUser])
}
