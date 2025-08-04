import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "~/features/auth/hooks/use-user-profile"

export function useProfileUtils() {
  const getDisplayName = (user: User | null, profile: UserProfile | null | undefined) => {
    if (profile?.display_name) return profile.display_name
    if (user?.email) return user.email.split("@")[0]
    return "User"
  }

  const getAvatarUrl = (user: User | null, profile: UserProfile | null | undefined): string | undefined => {
    return profile?.avatar_url ?? (user?.user_metadata as { avatar_url?: string })?.avatar_url
  }

  return {
    getDisplayName,
    getAvatarUrl,
  }
}