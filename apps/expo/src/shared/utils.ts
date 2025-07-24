import env from "~/shared/env"

// Environment utilities
export const isProduction = env.NODE_ENV === "production"

// URL utilities
export const createUrlBuilder = (baseUrl: string, protocol: string = "https") => {
  return (path: string = "") => {
    const cleanBase = baseUrl.replace(/^https?:\/\//, "")
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${protocol}://${cleanBase}${cleanPath}`
  }
}

export const buildApiUrl = createUrlBuilder(
  env.EXPO_PUBLIC_API_URL,
  isProduction ? "https" : "http"
)
