import type { SignInWithPasswordlessCredentials } from "@supabase/supabase-js"

import { useMutation } from "@tanstack/react-query"

import { useSupabase } from "./use-supabase"

export function useSignInWithOtp() {
  const client = useSupabase()
  const mutationKey = ["auth", "sign-in-with-otp"]

  const mutationFn = async (credentials: SignInWithPasswordlessCredentials) => {
    const result = await client.auth.signInWithOtp(credentials)

    if (result.error) {
      if (shouldIgnoreError(result.error.message)) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.warn(
          `Ignoring error during development: ${result.error.message}`
        )

        return {} as never
      }

      throw result.error.message
    }

    return result.data
  }

  return useMutation({
    mutationFn,
    mutationKey,
  })
}

function shouldIgnoreError(error: string) {
  return isSmsProviderNotSetupError(error)
}

function isSmsProviderNotSetupError(error: string) {
  return error.includes("SMS Provider could not be found")
}
