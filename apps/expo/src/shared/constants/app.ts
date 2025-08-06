// App-wide constants for better maintainability
export const APP_CONFIG = {
  NAME: 'PokeTradeTCG',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.futhong.poketradetcg',
} as const

export const PERFORMANCE_THRESHOLDS = {
  RENDER_WARNING_MS: 100,
  INTERACTION_WARNING_MS: 50,
  MEMORY_WARNING_MB: 50,
  QUERY_STALE_TIME_MS: 5 * 60 * 1000, // 5 minutes
  QUERY_CACHE_TIME_MS: 10 * 60 * 1000, // 10 minutes
} as const

export const UI_CONSTANTS = {
  TOAST_DURATION: 1000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  SEARCH_MIN_LENGTH: 2,
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/sign-up',
  ONBOARDING: '/onboarding',
  WELCOME: '/welcome',
  TABS: {
    CARDS: '/(tabs)/cards',
    DECKS: '/(tabs)/decks', 
    TRADE: '/(tabs)/trade',
    MESSAGES: '/(tabs)/messages',
    PROFILE: '/(tabs)/profile',
  },
  MODALS: {
    CARD_FILTERS: '/(modal)/card-filters',
    DECK_FILTERS: '/(modal)/deck-filters',
    TRADE_FILTERS: '/(modal)/trade-filters',
  },
} as const

export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    REGEX: /^[a-zA-Z0-9_-]+$/,
  },
} as const