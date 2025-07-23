import { useSendbirdChat } from "@sendbird/uikit-react-native"
import type { SendbirdGroupChannel, SendbirdUser } from "@sendbird/uikit-utils"
import { useMemo } from "react"
import { Pressable, View } from "react-native"

import { useUserProfile } from "~/features/messages/queries"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "~/shared/components/ui/avatar"
import { Text } from "~/shared/components/ui/text"

type OnlineStatus = "online" | "recently_online" | "offline"

function getPartnerInfo(
    channel?: SendbirdGroupChannel,
    currentUserId?: string
) {
    if (!channel?.members) return null

    const partner = channel.members.find(
        (member: SendbirdUser) => member.userId !== currentUserId
    )

    return partner
        ? {
            id: partner.userId,
            name: partner.nickname || partner.userId,
            avatarUrl: partner.profileUrl,
            connectionStatus: partner.connectionStatus || "offline",
        }
        : null
}

function getOnlineStatus(connectionStatus: string): OnlineStatus {
    switch (connectionStatus) {
        case "online":
            return "online"
        case "offline":
            return "offline"
        default:
            return "recently_online"
    }
}

function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    // If today, show time only
    if (date >= today) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    // If yesterday, show "Yesterday"
    if (date >= yesterday) {
        return "Yesterday"
    }

    // For all other dates, show day/month/year format
    return date.toLocaleDateString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

interface CustomChannelPreviewProps {
    channel: SendbirdGroupChannel
    onPress: () => void
}

export function CustomChannelPreview({
    channel,
    onPress,
}: CustomChannelPreviewProps) {
    const { sdk } = useSendbirdChat()

    const partnerInfo = useMemo(
        () => getPartnerInfo(channel, sdk?.currentUser?.userId),
        [channel, sdk?.currentUser?.userId]
    )

    // Fetch partner's profile data to get game name
    const { data: partnerProfile } = useUserProfile(partnerInfo?.id || "")

    const partnerOnlineStatus = getOnlineStatus(
        partnerInfo?.connectionStatus || "offline"
    )

    const lastMessage = channel.lastMessage
    const lastMessageText = useMemo(() => {
        if (!lastMessage) return "No messages yet"

        if (lastMessage.messageType === "user") {
            return lastMessage.message || "Message"
        }
        if (lastMessage.messageType === "file") {
            return "📎 File"
        }
        return "Message"
    }, [lastMessage])

    const timestamp = lastMessage?.createdAt || channel.createdAt || 0
    const formattedTime = formatTimestamp(timestamp)

    // Determine display name from profile data
    const displayName = useMemo(() => {
        if (partnerProfile?.game_account_ign) {
            return partnerProfile.game_account_ign
        }
        if (partnerProfile?.display_name) {
            return partnerProfile.display_name
        }
        return partnerInfo?.name || "Unknown"
    }, [partnerProfile, partnerInfo])

    // Use profile avatar if available
    const avatarUrl = partnerProfile?.avatar_url || partnerInfo?.avatarUrl

    if (!partnerInfo) {
        return (
            <Pressable
                onPress={onPress}
                className="flex-row items-center border-border border-b bg-background px-4 py-3"
            >
                <Avatar alt="" className="mr-3 h-12 w-12">
                    <AvatarFallback>
                        <Text className="text-sm">?</Text>
                    </AvatarFallback>
                </Avatar>
                <View className="flex-1">
                    <Text className="font-medium text-base" numberOfLines={1}>
                        Loading...
                    </Text>
                    <Text className="mt-1 text-muted-foreground text-sm" numberOfLines={1}>
                        {lastMessageText}
                    </Text>
                </View>
                <Text className="text-muted-foreground text-xs">
                    {formattedTime}
                </Text>
            </Pressable>
        )
    }

    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center border-border border-b bg-background px-4 py-3"
        >
            <View className="relative mr-3">
                <Avatar alt="" className="h-12 w-12">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                        <Text className="text-sm">{displayName[0]?.toUpperCase()}</Text>
                    </AvatarFallback>
                </Avatar>

                {partnerOnlineStatus !== "offline" && (
                    <View
                        className={`-right-0.5 -top-0.5 absolute h-3 w-3 rounded-full border-2 border-background ${partnerOnlineStatus === "online"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                            }`}
                    />
                )}
            </View>

            <View className="flex-1">
                <Text className="font-medium text-base" numberOfLines={1}>
                    {displayName}
                </Text>
                <Text className="mt-1 text-muted-foreground text-sm" numberOfLines={1}>
                    {lastMessageText}
                </Text>
            </View>

            <View className="items-end">
                <Text className="text-muted-foreground text-xs">
                    {formattedTime}
                </Text>
                {channel.unreadMessageCount > 0 && (
                    <View className="mt-1 min-w-5 items-center justify-center rounded-full bg-primary px-2 py-1">
                        <Text className="font-medium text-primary-foreground text-xs">
                            {channel.unreadMessageCount > 99 ? "99+" : channel.unreadMessageCount}
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    )
} 