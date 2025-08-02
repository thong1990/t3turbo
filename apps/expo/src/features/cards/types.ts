import type { Database } from "~/features/supabase/database.types"

export type Card = Database["public"]["Tables"]["cards"]["Row"] & {
  user_cards?: UserCard[]
}

export type NewCard = Database["public"]["Tables"]["cards"]["Insert"]
export type UpdateCard = Database["public"]["Tables"]["cards"]["Update"]

export type UserCard = Database["public"]["Tables"]["user_cards"]["Row"]
export type NewUserCard = Database["public"]["Tables"]["user_cards"]["Insert"]
export type UpdateUserCard =
  Database["public"]["Tables"]["user_cards"]["Update"]

export type CardFilterKey =
  | "userInteractions"
  | "cardType"
  | "rarity"
  | "elements"
  | "pack"

export type CardFilters = {
  cardType: string[]
  rarity: string[]
  elements: string[]
  pack: string[]
  userInteractions: string[]
}

export interface UserCardFilters {
  owned: boolean
  desired: boolean
  tradable: boolean
}

export type TradeMode = "cards" | "give" | "want"

export type CardGridActions = {
  onSelectCard?: (id: string) => void
  onNavigateToCard?: (id: string) => void
  onRemoveCard?: (id: string) => void
  onPress?: () => void
}

export type TabState = {
  data: Card[]
  isLoading: boolean
  isError: boolean
  error?: Error | null
  isRefetching: boolean
}
