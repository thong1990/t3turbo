import { client } from "~/features/supabase/client"
import { GetSendbirdSDK, SendbirdAPI } from "./sendbird-factory"
import { trackUserConnection } from "../hooks/use-online-status"

import { useUser } from "~/features/supabase/hooks"

export const useSendbirdAuth = () => {
  const { data: user } = useUser()

  const connectUser = async () => {
    if (!user) throw new Error("No authenticated user")

    const sdk = GetSendbirdSDK()
    if (!sdk) throw new Error("SendBird SDK not initialized")

    try {
      // Get user profile for display name and avatar
      const { data: profile } = await client
        .from("user_profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single()

      // Get session token from SendBird API
      const { token } = await SendbirdAPI.getSessionToken(user.id)

      // Connect user to SendBird
      const sendbirdUser = await sdk.connect(user.id, token)

      // Update user profile if needed
      await sdk.updateCurrentUserInfo({
        nickname: profile?.display_name || user.email || user.id,
        profileUrl: profile?.avatar_url || undefined,
      })

      // Track this user connection for recently online detection
      trackUserConnection(user.id)

      return sendbirdUser
    } catch (error) {
      console.error("❌ Failed to connect to SendBird:", error)
      throw error
    }
  }

  const disconnectUser = async () => {
    const sdk = GetSendbirdSDK()
    if (sdk?.currentUser) {
      try {
        // Track the user before disconnecting for recently online status
        trackUserConnection(sdk.currentUser.userId)

        await sdk.disconnect()
      } catch (error) {
        console.error("❌ Failed to disconnect from SendBird:", error)
      }
    }
  }

  return { connectUser, disconnectUser }
}