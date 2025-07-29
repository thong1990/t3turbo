// import { useEffect } from "react"
// import { useUser as useSupabaseUser } from "~/features/supabase/hooks/use-user"
// import { useRevenueCatAuth } from "./use-revenuecat-auth"
// import { useSubscription } from "../contexts/RevenueCatContext"

// // Official RevenueCat pattern - simple auth integration
// export function useAuthIntegration() {
//   const { data: supabaseUser } = useSupabaseUser()
//   const { logIn, logOut } = useRevenueCatAuth()
//   const { isSubscribed } = useSubscription()

//   useEffect(() => {
//     if (supabaseUser?.id) {
//       logIn(supabaseUser.id)
//     } else {
//       logOut()
//     }
//   }, [supabaseUser?.id, logIn, logOut])

//   return {
//     supabaseUser,
//     isSubscribed,
//   }
// }