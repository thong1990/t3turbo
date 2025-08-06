import { Ionicons } from "~/shared/components/ui/icons"
import { Link } from "expo-router"
import { Platform, View } from "react-native"

import * as Sentry from "@sentry/react-native"
const { captureException } = Sentry

import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { useColorScheme } from "~/shared/hooks"

export default function PrivacyPolicyScreen() {
  const { colors } = useColorScheme()

  return (
    <Container>
      <Header title="Privacy Policy" hasBackButton />
      <View className="mx-auto max-w-sm flex-1 justify-between gap-4 px-8 py-4">
        <View className="ios:pt-8 pt-12">
          <Text
            variant="largeTitle"
            className="ios:text-left text-center font-bold ios:font-black"
          >
            Privacy Policy
          </Text>
          <Text className="mt-4 text-center text-foreground text-lg">
            How we collect, use, and protect your information
          </Text>
        </View>
        <View className="gap-8">
          {PRIVACY_SECTIONS.map(section => (
            <View key={section.title} className="flex-row gap-4">
              <View className="pt-px">
                <Ionicons
                  name={section.icon}
                  size={38}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold">{section.title}</Text>
                <Text variant="caption">{section.description}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="gap-4">
          <View className="items-center">
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={colors.primary}
            />
            <Text variant="caption" className="pt-1 text-center">
              We are committed to protecting your privacy. Read our{" "}
              <Link href="/terms-of-service">
                <Text variant="caption" className="text-primary">
                  Terms of Service
                </Text>
              </Link>{" "}
              for more information about your rights and responsibilities.
            </Text>
          </View>
          <Button
            onPress={() =>
              captureException(new Error("Tracking first error!!!"))
            }
            variant="tonal"
          >
            <Text>Report an error</Text>
          </Button>
          <Link href="/(tabs)/trade" replace asChild>
            <Button
              size={Platform.select({ ios: "lg", default: "md" })}
              variant="tonal"
            >
              <Text>Continue</Text>
            </Button>
          </Link>
        </View>
      </View>
    </Container>
  )
}

const PRIVACY_SECTIONS = [
  {
    title: "Data Collection",
    description:
      "We collect information you provide directly to us, such as when you create an account or make a trade.",
    icon: "document-text-outline",
  },
  {
    title: "Data Usage",
    description:
      "We use your information to provide, maintain, and improve our services and user experience.",
    icon: "analytics-outline",
  },
  {
    title: "Data Protection",
    description:
      "We implement appropriate security measures to protect your personal information from unauthorized access.",
    icon: "lock-closed-outline",
  },
] as const
