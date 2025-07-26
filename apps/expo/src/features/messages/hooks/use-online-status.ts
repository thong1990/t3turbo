import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { GetSendbirdSDK } from "../services/sendbird-factory"

export interface OnlineStatus {
  onlineStatus: "online" | "recently_online" | "offline"
  lastSeenAt?: string
}

// Hook to get a single user's online status
export const useUserOnlineStatus = (userId: string) => {
  return useQuery({
    queryKey: ["userOnlineStatus", userId],
    queryFn: () => getUserOnlineStatusFromSendBird(userId),
    enabled: !!userId && userId.length > 0, // Only run if userId is valid
    staleTime: 120000, // Consider data stale after 2 minutes (increased from 30 seconds)
    refetchInterval: false, // Don't auto-refetch, we'll handle this manually
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Limit retries to prevent cascading failures
      if (failureCount >= 2) return false
      console.warn(`⚠️ Online status query retry ${failureCount + 1}:`, error)
      return true
    },
  })
}

// Hook to get multiple users' online status efficiently
export const useMultipleUsersOnlineStatus = (userIds: string[]) => {
  return useQuery({
    queryKey: ["multipleUsersOnlineStatus", userIds.sort()],
    queryFn: async () => {
      const result = await getMultipleUsersOnlineStatusFromSendBird(userIds)
      return result
    },
    enabled:
      Array.isArray(userIds) &&
      userIds.length > 0 &&
      userIds.every(id => id && id.length > 0), // Defensive check
    staleTime: 120000, // Consider data stale after 2 minutes (increased from 30 seconds)
    refetchInterval: false, // Don't auto-refetch, we'll handle this manually
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Limit retries to prevent cascading failures and handle rate limiting
      if (failureCount >= 2) return false

      // Check if it's a rate limiting error
      const errorMessage = (error as Error).message || ""
      if (errorMessage.includes("Too many requests")) {
        console.warn("⚠️ Rate limited, stopping retries")
        return false
      }

      console.warn(
        "⚠️ Multiple users online status query retry",
        failureCount + 1,
        ":",
        error
      )
      return true
    },
  })
}

// Simplified hook for refreshing online status on reconnection
export const useOnlineStatusRefresh = (userIds: string[]) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Defensive checks
    if (!queryClient || !Array.isArray(userIds) || userIds.length === 0) {
      return
    }

    // Only refresh if all userIds are valid
    const validUserIds = userIds.filter(id => id && id.length > 0)
    if (validUserIds.length === 0) {
      return
    }

    const interval = setInterval(() => {
      try {
        // Background refresh for online status
        queryClient.invalidateQueries({
          queryKey: ["userOnlineStatus"],
          exact: false,
        })
        queryClient.invalidateQueries({
          queryKey: ["multipleUsersOnlineStatus"],
          exact: false,
        })
      } catch (error) {
        console.warn("⚠️ Error in background online status refresh:", error)
      }
    }, 30000) // Refresh every 30 seconds (reduced from 5 seconds to prevent rate limiting)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [queryClient, userIds])
}

// Hook to force refresh online status (useful for account switching)
export const useForceRefreshOnlineStatus = () => {
  const queryClient = useQueryClient()

  const forceRefresh = () => {
    try {
      // Defensive check - ensure queryClient is available
      if (!queryClient) {
        console.warn("⚠️ QueryClient not available, skipping refresh")
        return
      }

      queryClient.invalidateQueries({
        queryKey: ["userOnlineStatus"],
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: ["multipleUsersOnlineStatus"],
        exact: false,
      })

      // Also trigger immediate refetch with error handling
      queryClient
        .refetchQueries({
          queryKey: ["userOnlineStatus"],
          exact: false,
        })
        .catch(error => {
          console.warn("⚠️ Failed to refetch userOnlineStatus:", error)
        })

      queryClient
        .refetchQueries({
          queryKey: ["multipleUsersOnlineStatus"],
          exact: false,
        })
        .catch(error => {
          console.warn("⚠️ Failed to refetch multipleUsersOnlineStatus:", error)
        })
    } catch (error) {
      console.warn("⚠️ Failed to force refresh online status:", error)
    }
  }

  return { forceRefresh }
}

// Core function to get online status from SendBird
export async function getUserOnlineStatusFromSendBird(
  userId: string
): Promise<OnlineStatus> {
  try {
    const sdk = GetSendbirdSDK()
    if (!sdk) {
      console.warn("⚠️ SendBird SDK not available for online status")
      return { onlineStatus: "offline" }
    }

    // Handle mock users for development
    if (userId.startsWith("mock-") || userId.startsWith("demo-")) {
      return getMockOnlineStatus(userId)
    }

    try {
      // Use SendBird's application user API to get user info including connection status
      const query = sdk.createApplicationUserListQuery({
        userIdsFilter: [userId],
      })

      const users = await query.next()
      const user = users.find(u => u.userId === userId)

      if (!user) {
        console.warn("⚠️ User not found in SendBird:", userId)
        return { onlineStatus: "offline" }
      }

      // Convert SendBird connection status to our format
      const now = Date.now()
      const lastSeenAt = user.lastSeenAt || 0
      const timeSinceLastSeen = now - lastSeenAt

      // More generous thresholds for better UX
      const RECENTLY_ONLINE_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours
      const VERY_RECENT_THRESHOLD = 5 * 60 * 1000 // 5 minutes

      // Check if user is currently online
      if (user.connectionStatus === "online") {
        return { onlineStatus: "online" }
      }

      // If user was seen very recently (within 5 minutes), show as recently online
      if (timeSinceLastSeen < VERY_RECENT_THRESHOLD) {
        return {
          onlineStatus: "recently_online",
          lastSeenAt: new Date(lastSeenAt).toISOString(),
        }
      }

      // If user was seen within 24 hours, show as recently online
      if (timeSinceLastSeen < RECENTLY_ONLINE_THRESHOLD && lastSeenAt > 0) {
        return {
          onlineStatus: "recently_online",
          lastSeenAt: new Date(lastSeenAt).toISOString(),
        }
      }

      // Fallback: if this is the current user who just switched accounts,
      // they should be recently online
      if (sdk.currentUser && sdk.currentUser.userId !== userId) {
        // Check if this user was recently the current user
        const recentlyConnectedUsers = getRecentlyConnectedUsers()
        if (recentlyConnectedUsers.includes(userId)) {
          return {
            onlineStatus: "recently_online",
            lastSeenAt: new Date(now - 30 * 1000).toISOString(), // 30 seconds ago
          }
        }
      }

      return {
        onlineStatus: "offline",
        lastSeenAt:
          lastSeenAt > 0 ? new Date(lastSeenAt).toISOString() : undefined,
      }
    } catch (error) {
      console.warn("⚠️ Failed to get user online status from SendBird:", error)

      // Enhanced fallback logic
      if (sdk.currentUser && sdk.currentUser.userId === userId) {
        return {
          onlineStatus:
            sdk.connectionState === "OPEN" ? "online" : "recently_online",
        }
      }

      // Check if this user was recently connected
      const recentlyConnectedUsers = getRecentlyConnectedUsers()
      if (recentlyConnectedUsers.includes(userId)) {
        return {
          onlineStatus: "recently_online",
          lastSeenAt: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
        }
      }

      return { onlineStatus: "offline" }
    }
  } catch (error) {
    console.warn("⚠️ Error in getUserOnlineStatusFromSendBird:", error)
    return { onlineStatus: "offline" }
  }
}

// Track recently connected users for better account switching detection
let recentlyConnectedUsers: string[] = []

function getRecentlyConnectedUsers(): string[] {
  return recentlyConnectedUsers
}

export function trackUserConnection(userId: string) {
  if (!recentlyConnectedUsers.includes(userId)) {
    recentlyConnectedUsers.push(userId)
  }

  // Keep only the last 5 connected users
  if (recentlyConnectedUsers.length > 5) {
    recentlyConnectedUsers = recentlyConnectedUsers.slice(-5)
  }

  // Clean up old entries after 10 minutes
  setTimeout(
    () => {
      recentlyConnectedUsers = recentlyConnectedUsers.filter(
        id => id !== userId
      )
    },
    10 * 60 * 1000
  )
}

// Optimized function to get multiple users' status in one call
async function getMultipleUsersOnlineStatusFromSendBird(
  userIds: string[]
): Promise<Record<string, OnlineStatus>> {
  try {
    const sdk = GetSendbirdSDK()

    if (!sdk || userIds.length === 0) {
      if (!sdk) {
      }
      return {}
    }

    // Separate mock users from real users
    const mockUsers = userIds.filter(
      id => id.startsWith("mock-") || id.startsWith("demo-")
    )
    const realUsers = userIds.filter(
      id => !id.startsWith("mock-") && !id.startsWith("demo-")
    )

    const results: Record<string, OnlineStatus> = {}

    // Handle mock users
    for (const userId of mockUsers) {
      results[userId] = getMockOnlineStatus(userId)
    }

    // Handle real users if any
    if (realUsers.length > 0) {
      try {
        const query = sdk.createApplicationUserListQuery({
          userIdsFilter: realUsers,
        })

        const users = await query.next()
        const now = Date.now()
        const RECENTLY_ONLINE_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours

        // Process found users
        for (const user of users) {
          const lastSeenAt = user.lastSeenAt || 0
          const timeSinceLastSeen = now - lastSeenAt

          // More generous thresholds for better UX
          const VERY_RECENT_THRESHOLD = 5 * 60 * 1000 // 5 minutes

          if (user.connectionStatus === "online") {
            results[user.userId] = { onlineStatus: "online" }
          } else if (timeSinceLastSeen < VERY_RECENT_THRESHOLD) {
            results[user.userId] = {
              onlineStatus: "recently_online",
              lastSeenAt: new Date(lastSeenAt).toISOString(),
            }
          } else if (
            timeSinceLastSeen < RECENTLY_ONLINE_THRESHOLD &&
            lastSeenAt > 0
          ) {
            results[user.userId] = {
              onlineStatus: "recently_online",
              lastSeenAt: new Date(lastSeenAt).toISOString(),
            }
          } else {
            // Check if this user was recently connected (account switching)
            const recentlyConnectedUsers = getRecentlyConnectedUsers()
            if (recentlyConnectedUsers.includes(user.userId)) {
              results[user.userId] = {
                onlineStatus: "recently_online",
                lastSeenAt: new Date(now - 30 * 1000).toISOString(),
              }
            } else {
              results[user.userId] = {
                onlineStatus: "offline",
                lastSeenAt:
                  lastSeenAt > 0
                    ? new Date(lastSeenAt).toISOString()
                    : undefined,
              }
            }
          }
        }

        // Handle users not found (check if they were recently connected)
        for (const userId of realUsers) {
          if (!results[userId]) {
            const recentlyConnectedUsers = getRecentlyConnectedUsers()
            if (recentlyConnectedUsers.includes(userId)) {
              results[userId] = {
                onlineStatus: "recently_online",
                lastSeenAt: new Date(now - 60 * 1000).toISOString(),
              }
            } else {
              results[userId] = { onlineStatus: "offline" }
            }
          }
        }
      } catch (error) {
        console.warn("⚠️ Failed to get multiple users online status:", error)
        // Set all real users as offline on error
        for (const userId of realUsers) {
          results[userId] = { onlineStatus: "offline" }
        }
      }
    }

    return results
  } catch (error) {
    console.warn("⚠️ Error in getMultipleUsersOnlineStatusFromSendBird:", error)
    return {}
  }
}

// Mock status generator for development
function getMockOnlineStatus(userId: string): OnlineStatus {
  // Simulate different user statuses based on user ID patterns
  const now = Date.now()
  const minute = 60 * 1000
  const hour = 60 * minute

  // Check if this user was recently connected (simulates account switching)
  const recentlyConnectedUsers = getRecentlyConnectedUsers()
  if (recentlyConnectedUsers.includes(userId)) {
    return {
      onlineStatus: "recently_online",
      lastSeenAt: new Date(now - Math.random() * 5 * minute).toISOString(), // 0-5 minutes ago
    }
  }

  // Mock online users (always show as online)
  const alwaysOnlineUsers = ["user1", "user2", "mock-user-1", "demo-user-1"]
  if (alwaysOnlineUsers.includes(userId)) {
    return { onlineStatus: "online" }
  }

  // Simulate realistic patterns based on user ID hash
  const userHash = userId.split("").reduce((hash, char) => {
    const newHash = (hash << 5) - hash + char.charCodeAt(0)
    return newHash & newHash
  }, 0)

  const randomFactor = Math.abs(userHash) % 100

  if (randomFactor < 25) {
    // 25% online
    return { onlineStatus: "online" }
  }

  if (randomFactor < 65) {
    // 40% recently online (better simulation of recent activity)
    const recentTime = now - Math.random() * 6 * hour // 0-6 hours ago
    return {
      onlineStatus: "recently_online",
      lastSeenAt: new Date(recentTime).toISOString(),
    }
  }

  // 35% offline (last seen more than 24 hours ago)
  const oldTime = now - (24 * hour + Math.random() * 7 * 24 * hour) // 1-8 days ago
  return {
    onlineStatus: "offline",
    lastSeenAt: new Date(oldTime).toISOString(),
  }
}