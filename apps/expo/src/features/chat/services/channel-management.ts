import { client } from "~/features/supabase/client"
import { GetSendbirdSDK } from "../factory"
import {
  resetChannelFailures,
  shouldRecreateChannel,
} from "../hooks/use-realtime-messages"

export const createTradeChannel = async (
  tradeId: string,
  initiatorId: string,
  receiverId: string
) => {
  const sdk = GetSendbirdSDK()
  if (!sdk) throw new Error("SendBird SDK not initialized")

  try {
    // Validate user IDs first
    if (!initiatorId || !receiverId) {
      throw new Error("Invalid user IDs provided for channel creation")
    }

    if (initiatorId === receiverId) {
      throw new Error(
        "Cannot create channel with same user as both participants"
      )
    }

    // Use simpler, more standard parameters that SendBird definitely accepts
    const params = {
      userIds: [initiatorId, receiverId],
      isDistinct: false, // Don't reuse channels - each trade gets its own
      name: `Trade Chat - ${tradeId.substring(0, 8)}`,
      data: JSON.stringify({
        type: "trade",
        tradeId,
        users: [initiatorId, receiverId],
        created: Date.now(),
      }),
    }

    const channel = await sdk.groupChannel.createChannel(params)

    // Verify both users are members immediately after creation

    // Double-check that both users are actually members
    const channelMembers = channel.members || []
    const initiatorIsMember = channelMembers.some(
      member =>
        member &&
        typeof member === "object" &&
        "userId" in member &&
        member.userId === initiatorId
    )
    const receiverIsMember = channelMembers.some(
      member =>
        member &&
        typeof member === "object" &&
        "userId" in member &&
        member.userId === receiverId
    )

    // If either user is not a member, try to add them explicitly
    const usersToAdd = []
    if (!initiatorIsMember) {
      console.warn("⚠️ Initiator not found in members, will add explicitly")
      usersToAdd.push(initiatorId)
    }
    if (!receiverIsMember) {
      console.warn("⚠️ Receiver not found in members, will add explicitly")
      usersToAdd.push(receiverId)
    }

    if (usersToAdd.length > 0) {
      try {
        await channel.inviteWithUserIds(usersToAdd)
      } catch (inviteError) {
        console.warn("⚠️ Failed to add users, but channel exists:", inviteError)
        // Don't fail the whole operation if invite fails
      }
    }

    // Set operators after channel creation (safer than during creation)
    try {
      await channel.addOperators([initiatorId, receiverId])
    } catch (operatorError) {
      console.warn(
        "⚠️ Failed to set operators (channel still works):",
        operatorError
      )
      // Don't fail if operator setting fails
    }

    // Update trade session with channel URL
    const { error } = await client
      .from("trade_sessions")
      .update({ sendbird_channel_url: channel.url })
      .eq("id", tradeId)

    if (error) throw error

    return channel.url
  } catch (error) {
    console.error("❌ Failed to create trade channel:", error)
    console.error("❌ Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      tradeId,
      initiatorId,
      receiverId,
    })
    throw error
  }
}

export const getOrCreateTradeChannel = async (
  tradeId: string,
  initiatorId: string,
  receiverId: string
) => {
  try {
    // First check if channel already exists in database for this specific trade
    const { data: tradeSession } = await client
      .from("trade_sessions")
      .select("sendbird_channel_url")
      .eq("id", tradeId)
      .single()

    if (tradeSession?.sendbird_channel_url) {
      return tradeSession.sendbird_channel_url
    }

    // Always create new channel for each trade to ensure complete isolation
    // No reusing of channels between different trades

    return await createTradeChannel(tradeId, initiatorId, receiverId)
  } catch (error) {
    console.error("❌ Failed to get or create trade channel:", error)
    throw error
  }
}

/**
 * Clean up duplicate chat sessions for a trade, keeping only the one with a real SendBird channel
 */
export async function cleanupDuplicateChatSessions(
  tradeId: string
): Promise<void> {
  try {
    // Get all chat sessions for this trade
    const { data: chatSessions, error } = await client
      .from("chat_sessions")
      .select("id, channel_url, created_at")
      .eq("trade_id", tradeId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch chat sessions for cleanup:", error)
      return
    }

    if (!chatSessions || chatSessions.length <= 1) {
      return
    }

    // Find the session with a real SendBird channel
    const realSendbirdSession = chatSessions.find(session =>
      session.channel_url?.startsWith("sendbird_")
    )

    if (!realSendbirdSession) {
      return
    }

    // Delete all other sessions (placeholder ones)
    const sessionsToDelete = chatSessions.filter(
      session => session.id !== realSendbirdSession.id
    )

    if (sessionsToDelete.length > 0) {
      const { error: deleteError } = await client
        .from("chat_sessions")
        .delete()
        .in(
          "id",
          sessionsToDelete.map(s => s.id)
        )

      if (deleteError) {
        console.error("Failed to delete duplicate chat sessions:", deleteError)
      } else {
      }
    }
  } catch (error) {
    console.error("Error during chat session cleanup:", error)
  }
}

/**
 * Ensure a user is a member of a SendBird channel
 */
export async function ensureUserIsMember(
  channelUrl: string,
  userId: string
): Promise<void> {
  const sdk = GetSendbirdSDK()
  if (!sdk) throw new Error("SendBird SDK not initialized")

  try {
    // Check if this channel should be recreated due to persistent failures
    if (shouldRecreateChannel(channelUrl)) {
      // Try to get trade information to recreate the channel
      try {
        const { data: tradeSession } = await client
          .from("trade_sessions")
          .select("id, initiator_id, receiver_id")
          .eq("sendbird_channel_url", channelUrl)
          .single()

        if (tradeSession) {
          // Recreate the channel with both users as members
          const newChannelUrl = await recreateChannelWithMembers(
            tradeSession.id,
            tradeSession.initiator_id,
            tradeSession.receiver_id,
            channelUrl
          )

          // Reset failure tracking for this channel
          resetChannelFailures(channelUrl)
          resetChannelFailures(newChannelUrl) // Also reset for new channel

          return
        }
      } catch (recreateError) {
        console.warn(
          "Failed to recreate channel, falling back to normal membership logic:",
          recreateError
        )
      }
    }

    // Get the channel
    const channel = await sdk.groupChannel.getChannel(channelUrl)

    // Check if user is already a member with more robust checking
    const channelMembers = channel.members || []
    const isMember = channelMembers.some(
      member =>
        member &&
        typeof member === "object" &&
        "userId" in member &&
        member.userId === userId
    )

    if (isMember) {
      return
    }

    // Add user to channel with retry logic
    try {
      await channel.inviteWithUserIds([userId])

      // Verify the user was actually added
      const updatedChannel = await sdk.groupChannel.getChannel(channelUrl)
      const updatedMembers = updatedChannel.members || []
      const nowIsMember = updatedMembers.some(
        member =>
          member &&
          typeof member === "object" &&
          "userId" in member &&
          member.userId === userId
      )

      if (!nowIsMember) {
        console.warn("⚠️ User was not successfully added to channel")
        throw new Error("User was not successfully added to channel")
      }
    } catch (inviteError) {
      console.error("❌ Failed to invite user to channel:", inviteError)

      // If invite fails, try alternative approach: make current user rejoin
      try {
        // For group channels, we might need to handle this differently
        // Let's try getting fresh channel data first
        const freshChannel = await sdk.groupChannel.getChannel(channelUrl)
        const freshMembers = freshChannel.members || []
        const stillNotMember = !freshMembers.some(
          member =>
            member &&
            typeof member === "object" &&
            "userId" in member &&
            member.userId === userId
        )

        if (stillNotMember) {
          console.error("❌ User is still not a member after all attempts")
          throw inviteError
        }
      } catch (finalError) {
        console.error("❌ All membership attempts failed:", finalError)
        throw finalError
      }
    }
  } catch (error) {
    console.error("❌ Failed to ensure user is member:", error)

    // If this is a membership/authorization error, suggest channel recreation
    const errorMessage = String(error)
    if (
      errorMessage.includes("User must be a member") ||
      errorMessage.includes("Not authorized")
    ) {
    }

    throw error
  }
}

export async function recreateChannelWithMembers(
  tradeId: string,
  initiatorId: string,
  receiverId: string,
  oldChannelUrl?: string
): Promise<string> {
  const sdk = GetSendbirdSDK()
  if (!sdk) throw new Error("SendBird SDK not initialized")

  try {
    if (oldChannelUrl) {
      try {
        const oldChannel = await sdk.groupChannel.getChannel(oldChannelUrl)
        await oldChannel.delete()
      } catch (error) {
        console.warn("Could not delete old channel (this is okay):", error)
      }
    }

    const params = {
      userIds: [initiatorId, receiverId],
      isDistinct: false,
      name: `Trade ${tradeId?.substring(0, 8) || "Unknown"}`,
      data: JSON.stringify({ tradeId, type: "trade", recreated: true }),
    }

    const newChannel = await sdk.groupChannel.createChannel(params)

    try {
      await newChannel.addOperators([initiatorId, receiverId])
    } catch (operatorError) {}

    const { error } = await client
      .from("trade_sessions")
      .update({ sendbird_channel_url: newChannel.url })
      .eq("id", tradeId)

    if (error) throw error

    const { error: chatError } = await client
      .from("chat_sessions")
      .update({ channel_url: newChannel.url })
      .eq("trade_id", tradeId)

    if (chatError) throw chatError

    return newChannel.url
  } catch (error) {
    console.error("❌ Failed to recreate channel:", error)
    throw error
  }
}
