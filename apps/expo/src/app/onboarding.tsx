import { Link } from "expo-router"
import { View } from "react-native"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"

import { Container } from "~/shared/components/container"

export default function OnboardingScreen() {
  return (
    <Container>
      <View className="flex-1 items-center justify-center p-8">
        <View className="w-full max-w-sm">
          <View className="mb-16 items-center">
            <Text className="font-bold text-4xl text-foreground">
              Get started
            </Text>
            <Text className="mt-4 text-center text-foreground text-lg">
              Trade Pokémon cards with collectors around the world
            </Text>
          </View>

          <View className="gap-4">
            <Link href="/(tabs)/trade" asChild replace>
              <Button className="w-full">
                <Text className="font-medium text-lg text-primary-foreground">
                  Start trading
                </Text>
              </Button>
            </Link>
          </View>
        </View>
      </View>
    </Container>
  )
}
