import { create } from "zustand"

type ChatState = {
  activeChannelUrl: string | null
  isConnected: boolean
  setActiveChannel: (channelUrl: string | null) => void
  setConnectionStatus: (connected: boolean) => void
}

export const useChatStore = create<ChatState>(set => ({
  activeChannelUrl: null,
  isConnected: false,
  setActiveChannel: channelUrl => set({ activeChannelUrl: channelUrl }),
  setConnectionStatus: connected => set({ isConnected: connected }),
}))
