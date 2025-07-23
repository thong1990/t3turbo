export { createEnv } from "@t3-oss/env-core"

import * as z from "zod"

export default createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.string(),
    EXPO_PUBLIC_SUPABASE_URL: z.string(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    EXPO_PUBLIC_SENDBIRD_APP_ID: z.string(),
    EXPO_PUBLIC_SENDBIRD_API_TOKEN: z.string(),
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().optional(),
    EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: z.string().optional(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  extends: [],
  runtimeEnv: process.env,
})
