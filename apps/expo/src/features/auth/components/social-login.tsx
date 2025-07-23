import Ionicons from "@expo/vector-icons/Ionicons"
import { Text } from "~/shared/components/ui/text"
import { View } from "react-native"
import { Button } from "~/shared/components/ui/button"
import { useSignInWithProvider } from "~/features/supabase/hooks/use-sign-in-with-provider"

export function SocialLogin() {
  const { mutateAsync: signInWithProvider } = useSignInWithProvider()

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    await signInWithProvider({ provider })
  }

  return (
    <View className="flex w-full justify-center gap-y-4">
      <Button
        variant="secondary"
        className="relative flex-row items-center px-4 py-2"
        onPress={() => handleSocialLogin("google")}
        style={{ paddingLeft: 48 }}
      >
        <View
          style={{
            position: "absolute",
            left: 16,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Ionicons name="logo-google" size={24} className="text-foreground" />
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text>Continue with Google</Text>
        </View>
      </Button>
      <Button
        variant="secondary"
        className="relative flex-row items-center px-4 py-2"
        onPress={() => handleSocialLogin("facebook")}
        style={{ paddingLeft: 48 }}
      >
        <View
          style={{
            position: "absolute",
            left: 16,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Ionicons
            name="logo-facebook"
            size={24}
            className="text-foreground"
          />
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text>Continue with Facebook</Text>
        </View>
      </Button>
    </View>
  )
}
