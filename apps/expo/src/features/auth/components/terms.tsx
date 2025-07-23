import { View } from "react-native"
import { ExternalLink } from "~/shared/components/external-link"
import { Text } from "~/shared/components/ui/text"

export function Terms() {
  return (
    <View>
      <Text className="text-center leading-normal">
        By continuing, you agree to the{" "}
        <ExternalLink
          className="text-muted-foreground"
          href="https://poketrade.com/terms-of-service"
        >
          <Text>Terms of Service</Text>
        </ExternalLink>{" "}
        and consent to the{" "}
        <ExternalLink
          className="text-muted-foreground"
          href="https://poketrade.com/privacy-policy"
        >
          <Text>Privacy Policy</Text>
        </ExternalLink>
        .
      </Text>
    </View>
  )
}
