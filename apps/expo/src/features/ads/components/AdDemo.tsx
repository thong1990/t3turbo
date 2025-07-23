import { View } from "react-native"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"

import { useAdMob } from "../hooks/use-ad-mob"

export function AdDemo() {
  const { showInterstitialAd } = useAdMob()

  return (
    <View className="p-4">
      <Text className="mb-4 font-semibold text-lg">Ad Demo</Text>

      <Button
        onPress={() => showInterstitialAd("deck-creation")}
        className="mb-4"
      >
        <Text>Create Deck (with Ad)</Text>
      </Button>

      <Button
        onPress={() => showInterstitialAd("trade-completion")}
        className="mb-4"
      >
        <Text>Complete Trade (with Ad)</Text>
      </Button>

      <Button
        onPress={() => showInterstitialAd("chat-transition")}
      >
        <Text>Open Chat (with Ad)</Text>
      </Button>
    </View>
  )
}
