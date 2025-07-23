import type { TradeSession } from "~/features/trades/types"

// SendBird types
export interface SendBirdChannel {
  url: string
  name: string
  memberCount: number
  unreadMessageCount: number
  lastMessage?: SendBirdMessage
  createdAt: number
  updatedAt: number
}

export interface SendBirdMessage {
  messageId: number
  message: string
  messageType: "MESG" | "FILE" | "ADMM"
  customType?: string
  data?: string
  createdAt: number
  updatedAt: number
  sender: SendBirdUser
  mentionedUsers?: SendBirdUser[]
  reactions?: SendBirdReaction[]
}

export interface SendBirdUser {
  userId: string
  nickname: string
  profileUrl?: string
  connectionStatus: "online" | "offline"
  lastSeenAt?: number
}

export interface SendBirdReaction {
  key: string
  userIds: string[]
}

// Chat session types
export interface ChatSession {
  id: string
  tradeId: string
  channelUrl: string // SendBird channel URL
  participants: string[]
  createdAt: Date
  expiresAt: Date
  status: "active" | "expired"
  tradeSession?: TradeSession
}

// Message types
export interface Message {
  id: string
  channelUrl: string
  senderId: string
  message: string
  timestamp: Date
  messageType: "text" | "trade_action" | "system"
  customData?: {
    tradeAction?: TradeAction
    cardIds?: string[]
    // Card exchange data
    type?: string
    cards?: Array<{
      id: string
      name: string
      imageUrl: string
      userId: string
    }>
    tradeId?: string
    users?: {
      currentUserId: string
      currentUserName: string
      partnerUserId: string
      partnerUserName: string
    }
    // Allow any additional custom data
    [key: string]: unknown
  }
}

export interface TradeAction {
  type: "accept" | "modify" | "cancel" | "add_card" | "remove_card"
  data?: {
    cardId?: string
    quantity?: number
    reason?: string
  }
}

// Chat list types
export interface ChatListItem {
  id: string
  name: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  avatarUrl?: string
  onlineStatus: "online" | "recently_online" | "offline"
  lastSeenAt?: string // When they were last seen (for recently online status)
  tradeId: string
  tradeStatus: string
  partnerId: string
  channelUrl?: string // The actual channel URL used for messaging
}

// Component props
export interface ChatScreenProps {
  tradeId: string
}

export interface TradeActionsProps {
  tradeId: string
  tradeStatus: TradeSession["status"]
  onAccept: () => void
  onModify: () => void
  onCancel: () => void
}

export interface MessageInputProps {
  channelUrl: string
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export interface MessageListProps {
  messages: Message[]
  currentUserId: string
  loading?: boolean
}

export interface TradeContextProps {
  tradeSession: TradeSession
  partnerName: string
  partnerAvatar?: string
}

// Typing indicator types
export interface TypingIndicator {
  channelUrl: string
  userId: string
  isTyping: boolean
  startedAt?: Date
}

export interface TypingUser {
  userId: string
  nickname: string
}
