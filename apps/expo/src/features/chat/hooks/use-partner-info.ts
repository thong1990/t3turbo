import { useEffect } from "react"
import { useUserProfile } from "../queries"
import type { ChatSession } from "../types"
import {
  useForceRefreshOnlineStatus,
  useOnlineStatusRefresh,
  useUserOnlineStatus,
} from "./use-online-status"

export function usePartnerInfo(
  chatSession: ChatSession | null | undefined,
  user: { id: string } | null
) {
  const partnerId = chatSession?.participants.find(id => id !== user?.id) || ""
  const { data: partnerProfile } = useUserProfile(partnerId)
  const { data: partnerOnlineStatus } = useUserOnlineStatus(partnerId)

  useOnlineStatusRefresh(partnerId ? [partnerId] : [])
  const forceRefreshOnlineStatus = useForceRefreshOnlineStatus()

  // Force refresh when partner changes
  useEffect(() => {
    if (partnerId) {
      forceRefreshOnlineStatus.forceRefresh()
    }
  }, [partnerId, forceRefreshOnlineStatus])

  // Debug: Log online status changes
  useEffect(() => {
    if (partnerOnlineStatus && partnerId) {
    }
  }, [partnerOnlineStatus, partnerId, partnerProfile])

  const partnerName =
    partnerProfile?.game_account_ign ||
    partnerProfile?.display_name ||
    "Unknown User"

  return {
    partnerId,
    partnerProfile,
    partnerOnlineStatus,
    partnerName,
  }
}
