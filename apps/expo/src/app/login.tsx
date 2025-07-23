import { Link, Stack } from "expo-router"
import { View } from "react-native"
import { SignInForm } from "~/features/auth/components/sign-in-form"
import { SocialLogin } from "~/features/auth/components/social-login"
import { Container } from "~/shared/components/container"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { Header } from "~/shared/components/header"

export default function LoginScreen() {
  return (
    <Container>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Sign in" hasBackButton />
      <View className="flex-1 gap-y-4 px-4 py-4">
        <Text variant="largeTitle" className="font-semibold">
          Welcome back
        </Text>
        <View className="flex-1 items-center gap-y-4">
          <SignInForm />
        </View>
        <View className="gap-y-4">
          <Link asChild href="/sign-up" replace>
            <Button variant="plain">
              <Text>Don't have an account? Sign up</Text>
            </Button>
          </Link>
          <Text className="text-center text-muted-foreground">
            Or continue with
          </Text>
          <SocialLogin />
        </View>
      </View>
    </Container>
  )
}
