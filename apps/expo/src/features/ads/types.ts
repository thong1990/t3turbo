export type AdType =
  | "banner"
  | "interstitial"
  | "rewarded"
  | "native"
  | "app-open"

export type AdPlacement =
  | "home-bottom"
  | "cards-bottom"
  | "decks-bottom"
  | "chat-bottom"
  | "profile-bottom"
  | "deck-creation"
  | "trade-completion"
  | "chat-transition"
  | "app-launch"
  | "cards-feed"
  | "decks-feed"

export interface AdConfig {
  androidAdUnitId: string
  iosAdUnitId: string
  isTestMode: boolean
}

export interface AdEvent {
  type: "impression" | "click" | "load" | "error" | "close"
  adType: AdType
  placement: AdPlacement
  timestamp: number
  revenue?: number
  errorMessage?: string
}

export interface AdState {
  isLoaded: boolean
  isLoading: boolean
  isShowing: boolean
  error: string | null
  lastLoadTime: number | null
}

// AdContextType removed - use useAdMob hook directly instead

export interface AdUnitIds {
  banner: {
    android: string
    ios: string
  }
  interstitial: {
    android: string
    ios: string
  }
  rewarded: {
    android: string
    ios: string
  }
  native: {
    android: string
    ios: string
  }
  appOpen: {
    android: string
    ios: string
  }
}
