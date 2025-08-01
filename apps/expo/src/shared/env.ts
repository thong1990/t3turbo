import { createEnv } from "@t3-oss/env-core"
import * as z from "zod"

export default createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    EXPO_PUBLIC_API_URL: z.string().optional(),
    EXPO_PUBLIC_SUPABASE_URL: z.string().optional(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    EXPO_PUBLIC_SENDBIRD_APP_ID: z.string().optional(),
    EXPO_PUBLIC_SENDBIRD_API_URL: z.string().optional(),
    EXPO_PUBLIC_SENDBIRD_API_TOKEN: z.string().optional(),
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().optional(),
    EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: z.string().optional(),
    // Sentry configuration
    EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
    EXPO_PUBLIC_SENTRY_ORGANIZATION: z.string().optional(),
    EXPO_PUBLIC_SENTRY_PROJECT: z.string().optional(),
    EXPO_PUBLIC_SENTRY_AUTH_TOKEN: z.string().optional(),
    EXPO_PUBLIC_SENTRY_URL: z.string().optional(),
    // AdMob configuration
    EXPO_PUBLIC_ADMOB_ANDROID_APP_ID: z.string().optional(),
    EXPO_PUBLIC_ADMOB_IOS_APP_ID: z.string().optional(),
    EXPO_PUBLIC_ADMOB_BANNER_ANDROID: z.string().optional(),
    EXPO_PUBLIC_ADMOB_BANNER_IOS: z.string().optional(),
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID: z.string().optional(),
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS: z.string().optional(),
    EXPO_PUBLIC_ADMOB_NATIVE_ANDROID: z.string().optional(),
    EXPO_PUBLIC_ADMOB_NATIVE_IOS: z.string().optional(),
    EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID: z.string().optional(),
    EXPO_PUBLIC_ADMOB_APP_OPEN_IOS: z.string().optional(),
    // OneSignal configuration
    EXPO_PUBLIC_ONESIGNAL_APP_ID: z.string().optional(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  extends: [],
  runtimeEnv: process.env,
})
