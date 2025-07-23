import type { Database } from "~/features/supabase/database.types"

export interface Card {
  id: string
  name: string
  image_url: string
  rarity: string
  type?: string // Pokemon element type (grass, fire, water, etc.)
  card_type?: string // Card category (Pokemon, Trainer, etc.)
  hp?: number | null
  retreat_cost?: number | null
  weakness?: string | null
  is_ex?: boolean | null
  is_fullart?: boolean | null
  pack_type?: string | null // Set/pack identifier (A1, A1a, etc.)
  artist?: string | null
  created_at?: string
  updated_at?: string
}

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]

// Tradeable rarities only
export const TRADEABLE_RARITIES = ["◊", "◊◊", "◊◊◊", "◊◊◊◊", "☆"] as const
export type TradeableRarity = (typeof TRADEABLE_RARITIES)[number]

export interface TradeMatch {
  partnerId: string
  partnerName: string
  partnerGameIGN?: string // Add game IGN for display
  partnerAvatar?: string
  rarity: TradeableRarity
  cardsIWant: Card[] // Cards they're giving that I want (same rarity)
  cardsIGive: Card[] // Cards I'm giving that they want (same rarity)
  matchScore: number // Algorithm-calculated compatibility score
}

export interface TradeOpportunity {
  id: string
  match: TradeMatch
  createdAt: string
}

export interface RarityTradeGroup {
  rarity: TradeableRarity
  matches: TradeMatch[]
}

export interface TradeSession {
  id: string
  initiatorId: string
  receiverId: string
  status:
    | "pending_acceptance"
    | "active"
    | "completed"
    | "cancelled_by_initiator"
    | "rejected_by_receiver"
    | "expired"
  sendbirdChannelUrl?: string
  expiredAt?: string
  createdAt: string
  updatedAt: string
  tradeSessionCards?: TradeSessionCard[]
}

export interface TradeSessionCard {
  id: string
  tradeSessionId: string
  userId: string
  cardId: string
  quantity: number
  createdAt: string
}

export interface TradeSessionWithCards extends TradeSession {
  tradeSessionCards?: TradeSessionCard[]
}
