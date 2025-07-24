// Placeholder hooks for trades functionality
// TODO: Implement actual hooks when backend API is ready

export const useTradeInteractions = () => {
  return {
    acceptTrade: () => Promise.resolve(),
    rejectTrade: () => Promise.resolve(),
    cancelTrade: () => Promise.resolve(),
  }
}

export const useTradesQuery = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  }
}