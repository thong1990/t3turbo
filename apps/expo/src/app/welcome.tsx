import { Ionicons } from "~/shared/components/ui/icons"
import { Link } from "expo-router"
import { View, ImageBackground } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { FadeIn } from "react-native-reanimated"

import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { useColorScheme } from "~/shared/hooks"

export default function WelcomeScreen() {
  const { colors } = useColorScheme()

  return (
    <ImageBackground
      source={require("~/shared/assets/images/bg-gradient-poke.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <Animated.View
          entering={FadeIn}
          className="flex-1 justify-between px-6 py-8"
        >
          <View className="items-center gap-2">
            <Ionicons name="leaf-outline" size={64} color={colors.primary} />
            <Text
              variant="largeTitle"
              className="text-center font-bold text-primary"
            >
              Welcome to PokeTrade
            </Text>
            <Text
              variant="body"
              className="text-center text-secondary-foreground"
            >
              Your trusted platform for trading Pokémon cards
            </Text>
          </View>

          <View className="gap-6">
            {FEATURES.map(feature => (
              <View key={feature.title} className="flex-row items-start gap-4">
                <Ionicons
                  name={feature.icon}
                  size={32}
                  color={colors.primary}
                />
                <View className="flex-1">
                  <Text className="font-semibold">{feature.title}</Text>
                  <Text variant="subhead" className="text-muted-foreground">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="gap-4">
            <Link href="/(tabs)/trade" replace asChild>
              <Button size="lg" variant="plain">
                <Text>Get Started</Text>
              </Button>
            </Link>
            <Text variant="caption" className="text-center">
              By continuing, you agree to our{" "}
              <Link href="/terms-of-service" asChild>
                <Text variant="caption" className="text-primary underline">
                  Terms
                </Text>
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" asChild>
                <Text variant="caption" className="text-primary underline">
                  Privacy
                </Text>
              </Link>
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  )
}

const FEATURES = [
  {
    title: "Profile Management",
    description:
      "Easily update and manage your personal information, settings, and preferences",
    icon: "person-circle-outline",
  },
  {
    title: "Secure Messaging",
    description: "Chat securely with friends and family in real-time.",
    icon: "chatbubbles",
  },
  {
    title: "Activity Tracking",
    description:
      "Monitor your daily activities and track your progress over time.",
    icon: "stats-chart",
  },
] as const
