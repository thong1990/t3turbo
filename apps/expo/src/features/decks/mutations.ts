import {
  useDeleteMutation,
  useInsertMutation,
  useUpdateMutation,
  useUpsertMutation,
} from "@supabase-cache-helpers/postgrest-react-query"

import { client } from "~/features/supabase/client"
import type { Database } from "~/features/supabase/database.types"

type DeckInsert = Database["public"]["Tables"]["decks"]["Insert"]
type DeckUpdate = Database["public"]["Tables"]["decks"]["Update"]
type DeckCardInsert = Database["public"]["Tables"]["deck_cards"]["Insert"]
type UserDeckInteractionInsert =
  Database["public"]["Tables"]["user_deck_interactions"]["Insert"]

export function useInsertDeckMutation() {
  return useInsertMutation(
    client.from("decks"),
    ["id"],
    "id,name,description,is_public,user_id,views,created_at,updated_at"
  )
}

export function useUpdateDeckMutation() {
  return useUpdateMutation(
    client.from("decks"),
    ["id"],
    "id,name,description,is_public,user_id,views,created_at,updated_at"
  )
}

export function useDeleteDeckMutation() {
  return useDeleteMutation(client.from("decks"), ["id"], "id")
}

export function useUpsertDeckCardsMutation() {
  return useUpsertMutation(
    client.from("deck_cards"),
    ["deck_id", "card_id"],
    "deck_id,card_id,quantity"
  )
}

export function useDeleteDeckCardsMutation() {
  return useDeleteMutation(
    client.from("deck_cards"),
    ["deck_id", "card_id"],
    "deck_id,card_id"
  )
}

export function useInsertDeckInteractionMutation() {
  return useInsertMutation(
    client.from("user_deck_interactions"),
    ["id"],
    "id,user_id,deck_id,interaction_type,created_at"
  )
}

export function useDeleteDeckInteractionMutation() {
  return useDeleteMutation(client.from("user_deck_interactions"), ["id"], "id")
}

export function useUpdateDeckViewsMutation() {
  return useUpdateMutation(client.from("decks"), ["id"], "id,views")
}
