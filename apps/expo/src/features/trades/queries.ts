import { useSubscription } from "@supabase-cache-helpers/postgrest-react-query"
import { client } from "~/features/supabase/client"
import type { TradeMatch } from "./types"
import { calculateMatchScore, isTradeableRarity } from "./utils"

export function useTradeCardsSubscription(userId?: string) {
  const { status } = useSubscription(
    client,
    `trade-user-cards-${userId}`,
    {
      event: "*",
      table: "user_cards",
      schema: "public",
    },
    ["id"],
    {
      callback: payload => {},
    }
  )

  return { status }
}

export function getTradeMatchesQuery(
  supabaseClient: typeof client,
  currentUserId?: string
) {
  return supabaseClient
    .from("user_cards")
    .select(
      `
      card_id,
      quantity_tradeable,
      cards (
        id,
        name,
        image_url,
        rarity,
        type,
        card_type,
        pack_type
      )
    `
    )
    .eq("user_id", currentUserId || "")
    .gt("quantity_tradeable", 0)
}

// Main function to get trade matches - updated for correct schema
export async function getTradeMatches(
  currentUserId: string
): Promise<TradeMatch[]> {
  try {
    // Get current user's tradeable cards (quantity_tradeable > 0)
    const { data: myTradeableCards, error: myCardsError } = await client
      .from("user_cards")
      .select(
        `
        card_id,
        quantity_tradeable,
        cards (
          id,
          name,
          image_url,
          rarity,
          type,
          card_type,
          pack_type
        )
      `
      )
      .eq("user_id", currentUserId)
      .gt("quantity_tradeable", 0)

    if (myCardsError) {
      console.error("❌ Error fetching tradeable cards:", myCardsError)
      throw myCardsError
    }

    // Get current user's wishlist (quantity_desired > 0)
    const { data: myWishlist, error: wishlistError } = await client
      .from("user_cards")
      .select(
        `
        card_id,
        quantity_desired,
        priority,
        cards (
          id,
          name,
          image_url,
          rarity,
          type,
          card_type,
          pack_type
        )
      `
      )
      .eq("user_id", currentUserId)
      .gt("quantity_desired", 0)

    if (wishlistError) {
      console.error("❌ Error fetching wishlist:", wishlistError)
      throw wishlistError
    }

    // Filter for tradeable rarities only
    const myTradeableCardsFiltered =
      myTradeableCards?.filter(item => {
        const card = Array.isArray(item.cards) ? item.cards[0] : item.cards
        return card && card.rarity && isTradeableRarity(card.rarity)
      }) || []

    const myWishlistFiltered =
      myWishlist?.filter(item => {
        const card = Array.isArray(item.cards) ? item.cards[0] : item.cards
        return card && card.rarity && isTradeableRarity(card.rarity)
      }) || []

    if (
      myTradeableCardsFiltered.length === 0 ||
      myWishlistFiltered.length === 0
    ) {
      return []
    }

    // Get card IDs for matching
    const myTradeableCardIds = myTradeableCardsFiltered.map(
      item => item.card_id
    )
    const myWantedCardIds = myWishlistFiltered.map(item => item.card_id)

    // Find users who want my tradeable cards (they have quantity_desired > 0 for my tradeable cards)
    const { data: usersWhoWantMyCards, error: error1 } = await client
      .from("user_cards")
      .select(
        `
        user_id,
        card_id,
        quantity_desired,
        priority,
        user_profiles (
          id,
          display_name,
          avatar_url,
          game_account_ign
        )
      `
      )
      .in("card_id", myTradeableCardIds)
      .gt("quantity_desired", 0)
      .neq("user_id", currentUserId)

    if (error1) throw error1

    // Find users who have cards I want (they have quantity_tradeable > 0 for cards I want)
    const { data: usersWhoHaveMyWantedCards, error: error2 } = await client
      .from("user_cards")
      .select(
        `
        user_id,
        card_id,
        quantity_tradeable,
        cards (
          id,
          name,
          image_url,
          rarity,
          type,
          card_type,
          pack_type
        )
      `
      )
      .in("card_id", myWantedCardIds)
      .gt("quantity_tradeable", 0)
      .neq("user_id", currentUserId)

    if (error2) throw error2

    // Find mutual matches
    const matches: TradeMatch[] = []

    // Group users who want my cards
    const usersWantingMyCards = new Set<string>()
    if (usersWhoWantMyCards) {
      for (const item of usersWhoWantMyCards) {
        usersWantingMyCards.add(item.user_id)
      }
    }

    // Group users who have cards I want
    const usersWithMyWantedCards = new Set<string>()
    if (usersWhoHaveMyWantedCards) {
      for (const item of usersWhoHaveMyWantedCards) {
        usersWithMyWantedCards.add(item.user_id)
      }
    }

    // Find mutual users (users who both want my cards AND have cards I want)
    const mutualUsers = new Set<string>()
    for (const userId of usersWantingMyCards) {
      if (usersWithMyWantedCards.has(userId)) {
        mutualUsers.add(userId)
      }
    }

    // Create matches for each mutual user
    for (const partnerId of mutualUsers) {
      // Get partner profile from the first record (they should all have the same profile)
      const partnerRecord = usersWhoWantMyCards?.find(
        item => item.user_id === partnerId
      )
      const partnerProfile = partnerRecord?.user_profiles

      if (!partnerProfile) continue

      // Get cards they want from me
      const cardsTheyWant =
        usersWhoWantMyCards?.filter(item => item.user_id === partnerId) || []

      // Get cards they have that I want
      const cardsTheyHave =
        usersWhoHaveMyWantedCards?.filter(item => item.user_id === partnerId) ||
        []

      // Group by rarity for same-rarity trading
      const rarityGroups = new Map<
        string,
        {
          cardsIGive: import("./types").Card[]
          cardsIWant: import("./types").Card[]
        }
      >()

      // Process cards I can give them
      for (const wantedCard of cardsTheyWant) {
        const myCard = myTradeableCardsFiltered.find(
          item => item.card_id === wantedCard.card_id
        )
        if (myCard?.cards) {
          const card = Array.isArray(myCard.cards)
            ? myCard.cards[0]
            : myCard.cards
          if (card && card.rarity) {
            const rarity = card.rarity
            if (!rarityGroups.has(rarity)) {
              rarityGroups.set(rarity, { cardsIGive: [], cardsIWant: [] })
            }
            const group = rarityGroups.get(rarity)
            if (group) {
              group.cardsIGive.push(card as import("./types").Card)
            }
          }
        }
      }

      // Process cards I want from them
      for (const availableCard of cardsTheyHave) {
        if (availableCard.cards) {
          const card = Array.isArray(availableCard.cards)
            ? availableCard.cards[0]
            : availableCard.cards
          if (card && card.rarity) {
            const rarity = card.rarity
            if (!rarityGroups.has(rarity)) {
              rarityGroups.set(rarity, { cardsIGive: [], cardsIWant: [] })
            }
            const group = rarityGroups.get(rarity)
            if (group) {
              group.cardsIWant.push(card as import("./types").Card)
            }
          }
        }
      }

      // Create matches for each rarity that has both give and want cards
      for (const [rarity, cards] of rarityGroups) {
        if (cards.cardsIGive.length > 0 && cards.cardsIWant.length > 0) {
          matches.push({
            partnerId,
            partnerName: partnerProfile.display_name || "Unknown User",
            partnerGameIGN: partnerProfile.game_account_ign || undefined,
            partnerAvatar: partnerProfile.avatar_url || undefined,
            rarity: rarity as import("./types").TradeableRarity,
            cardsIWant: cards.cardsIWant,
            cardsIGive: cards.cardsIGive,
            matchScore: calculateMatchScore(cards.cardsIWant, cards.cardsIGive),
          })
        }
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore)
  } catch (error) {
    console.error("❌ Error getting trade matches:", error)
    throw error
  }
}
