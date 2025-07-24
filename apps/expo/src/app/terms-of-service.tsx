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

export default function TermsOfServiceScreen() {
  const { colors } = useColorScheme()

  return (
    <Container>
      <Header title="Terms of Service" hasBackButton />
      <View className="mx-auto max-w-sm flex-1 justify-between gap-4 px-8 py-4">
        <View className="ios:pt-8 pt-12">
          <Text
            variant="largeTitle"
            className="ios:text-left text-center font-bold ios:font-black"
          >
            Terms of Service
          </Text>
          <Text className="mt-4 text-center text-foreground text-lg">
            Please read these terms carefully before using PokeTrade
          </Text>
        </View>
        <View className="gap-8">
          {TERMS_SECTIONS.map(section => (
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
                <Text variant="footnote">{section.description}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="gap-4">
          <View className="items-center">
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text variant="caption2" className="pt-1 text-center">
              By using PokeTrade, you agree to these{" "}
              <Text variant="caption2" className="text-primary">
                Terms of Service
              </Text>{" "}
              and our{" "}
              <Link href="/privacy-policy">
                <Text variant="caption2" className="text-primary">
                  Privacy Policy
                </Text>
              </Link>
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

const TERMS_SECTIONS = [
  {
    title: "Acceptance of Terms",
    description:
      "By accessing and using PokeTrade, you accept and agree to be bound by the terms and provision of this agreement.",
    icon: "checkmark-circle-outline",
  },
  {
    title: "User Conduct",
    description:
      "You agree to use the service only for lawful purposes and in accordance with these Terms.",
    icon: "shield-checkmark",
  },
  {
    title: "Privacy & Data",
    description:
      "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.",
    icon: "lock-closed",
  },
] as const
