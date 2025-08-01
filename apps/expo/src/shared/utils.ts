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
  env.EXPO_PUBLIC_API_URL || "localhost:3000",
  isProduction ? "https" : "http"
)

// URL parameter normalization utilities
/**
 * Normalizes search parameters from useLocalSearchParams() for Zod validation.
 * Converts arrays to comma-separated strings to match schema expectations.
 */
export const normalizeSearchParams = (
  params: Record<string, string | string[]>
): Record<string, string> => {
  const normalized: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      // Convert array to comma-separated string, filtering out empty values
      normalized[key] = value.filter(Boolean).join(",")
    } else if (typeof value === "string") {
      normalized[key] = value
    }
  }
  
  return normalized
}
