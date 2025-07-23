import { isProduction } from "@init/utils/environment"
import { createUrlBuilder } from "@init/utils/url"

import env from "~/shared/env"

export const buildApiUrl = createUrlBuilder(
  env.EXPO_PUBLIC_API_URL,
  isProduction ? "https" : "http"
)
