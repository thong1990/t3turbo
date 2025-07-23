import { useUpsertMutation } from "@supabase-cache-helpers/postgrest-react-query"
import { client } from "~/features/supabase/client"

export const useUpsertUserCardMutation = () => {
  return useUpsertMutation(client.from("user_cards"), ["user_id", "card_id"])
}
