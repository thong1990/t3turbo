// Messaging configuration - all timing and limits
export const MESSAGING_CONFIG = {
  CHAT_SESSION_DURATION_HOURS: 24,
  MESSAGE_POLLING_INTERVAL: 30000,
  ONLINE_STATUS_CHECK_INTERVAL: 5000,
  USER_INACTIVITY_TIMEOUT: 120000,
  REFRESH_COOLDOWN: 5000,
  SENDBIRD_CONNECTION_CHECK_INTERVAL: 3000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000,
  MAX_RETRY_DELAY: 10000,
  CHANNEL_RECREATION_FAILURE_THRESHOLD: 2,
  MAX_MESSAGE_LENGTH: 1000,
  MESSAGES_PER_PAGE: 50,
  SEARCH_DEBOUNCE_DELAY: 300,
  FLATLIST_INITIAL_RENDER: 8,
  FLATLIST_WINDOW_SIZE: 10,
  FLATLIST_MAX_TO_RENDER_BATCH: 10,
  FLATLIST_UPDATE_CELLS_BATCHING_PERIOD: 50,
} as const

// Status enums as readonly arrays (following coding style)
export const CHAT_STATUSES = ["active", "expired", "pending"] as const
export const CONNECTION_STATES = [
  "connecting",
  "connected",
  "error",
  "sendbird_disconnected",
] as const
export const ONLINE_STATUSES = ["online", "recently_online", "offline"] as const
export const MESSAGE_TYPES = [
  "text",
  "trade_action",
  "system",
  "card_exchange",
] as const
export const TRADE_ACTIONS = [
  "accept",
  "modify",
  "cancel",
  "add_card",
  "remove_card",
] as const

// SendBird custom types
export const SENDBIRD_CUSTOM_TYPES = {
  TRADE_ACTION: "trade_action",
  CARD_EXCHANGE: "card_exchange",
} as const

// Error and success messages
export const MESSAGES = {
  ERROR: {
    SENDBIRD_NOT_INITIALIZED: "SendBird SDK not initialized",
    CHANNEL_NOT_FOUND: "Chat channel not found. Please refresh and try again.",
    USER_NOT_MEMBER:
      "You are not a member of this chat. Please refresh and try again.",
    INVALID_MESSAGE_FORMAT: "Invalid message format. Please try again.",
    MESSAGE_REQUIRED: "Message content is required",
    CHANNEL_URL_REQUIRED: "Channel URL is required",
    CHANNEL_NEEDS_RECREATION: "CHANNEL_NEEDS_RECREATION",
    FAILED_TO_LOAD_CHATS: "Failed to load chats",
    FAILED_TO_SEND_MESSAGE: "Failed to send message",
    FAILED_TO_CREATE_CHAT: "Failed to create chat session",
  },
  SUCCESS: {
    TRADE_ACCEPTED: "Trade accepted successfully!",
    TRADE_CANCELLED: "Trade cancelled",
    CHAT_STARTED: "Chat started for trade!",
    MESSAGE_SENT: "Message sent successfully",
  },
} as const

// Mock configuration
export const MOCK_CONFIG = {
  ENABLED: __DEV__,
  USER_PREFIX: "mock-user-",
  TRADE_PREFIX: "mock-trade-",
  CHANNEL_PREFIX: "mock-channel-",
  DEMO_PREFIX: "demo-trade-",
} as const