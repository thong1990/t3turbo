import type { SupabaseClient } from "@supabase/supabase-js"

import { client } from "../client"
import type { Database } from "../database.types"

export function useSupabase<Db = Database>(): SupabaseClient<Db> {
  return client as SupabaseClient<Db>
}
