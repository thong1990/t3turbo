import type { Session, User } from "@supabase/supabase-js"
import { router, useSegments } from "expo-router"
import { createContext, useContext, useEffect, useState } from "react"

import type { UserProfile } from "~/features/auth/hooks/use-user-profile"
import { client } from "~/features/supabase/client"

type SupabaseContextProps = {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  initialized?: boolean
  isOnboarded: boolean
}

type SupabaseProviderProps = {
  children: React.ReactNode
}

export const SupabaseContext = createContext<SupabaseContextProps>({
  user: null,
  session: null,
  userProfile: null,
  initialized: false,
  isOnboarded: false,
})

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const segments = useSegments()

  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)

  useEffect(() => {
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session ? session.user : null)
      setInitialized(true)
    })

    client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session ? session.user : null)
    })
  }, [])

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setUserProfile(null)
        setIsOnboarded(false)
        return
      }

      try {
        const { data, error } = await client
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user profile:", error)
          return
        }

        setUserProfile(data || null)
        setIsOnboarded(!!data?.game_account_ign)
      } catch (error) {
        console.error("Error in fetchUserProfile:", error)
        setUserProfile(null)
        setIsOnboarded(false)
      }
    }

    if (initialized) {
      fetchUserProfile()
    }
  }, [user?.id, initialized])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (initialized) {
      const inProtectedGroup = segments[0] === "(tabs)"
      const isOnboardingScreen = segments.some(segment =>
        segment?.includes("onboarding")
      )
      const isVerifyPage = segments.some(segment => segment?.includes("verify"))

      if (session) {
        if (!isOnboarded && !isOnboardingScreen) {
          router.replace("/onboarding")
        } else if (isOnboarded && !inProtectedGroup && !isVerifyPage) {
          router.replace("/(tabs)/trade")
        }
      } else if (!session && inProtectedGroup) {
        router.replace("/welcome")
      }
    }
  }, [initialized, session, isOnboarded])

  return (
    <SupabaseContext.Provider
      value={{ user, session, userProfile, initialized, isOnboarded }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabaseContext must be used within a SupabaseProvider")
  }
  return context
}
