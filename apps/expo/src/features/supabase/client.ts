import AsyncStorage from "@react-native-async-storage/async-storage"
import { type SupabaseClient, createClient } from "@supabase/supabase-js"
import { Platform } from "react-native"
import type { Database } from "./database.types"
import { LargeSecureStore } from "./large-secure-store"

// const storage = Platform.OS === "web" ? AsyncStorage : new LargeSecureStore()

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? AsyncStorage : new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type TypedSupabaseClient = SupabaseClient<Database>

// AppState.addEventListener("change", state => {
//   if (state === "active") {
//     client.auth.startAutoRefresh()
//   } else {
//     client.auth.stopAutoRefresh()
//   }
// })
