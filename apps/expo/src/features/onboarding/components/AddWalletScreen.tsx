import { useRouter } from "expo-router"
import { Image, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const features = [
  {
    icon: "🚀",
    title: "Seamless setup",
    description:
      "Create a wallet using a Google or Apple account and start exploring web3 with ease",
  },
  {
    icon: "🔒",
    title: "Enhanced security",
    description:
      "Your wallet is stored securely and decentralized across multiple factors",
  },
  {
    icon: "💝",
    title: "Easy recovery",
    description:
      "Recover access to your wallet with your Google or Apple account and a 4-digit PIN",
  },
]

export function AddWalletScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="flex-1 px-4">
        {/* Header with back button */}
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center"
        >
          <Text className="text-2xl text-white">←</Text>
        </Pressable>

        {/* Main content */}
        <View className="flex-1 items-center justify-center space-y-4">
          {/* Wallet Icon */}
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-[#1A1A1A]">
            <Image
              source={require("~/features/cards/assets/phantom/wallet.png")}
              className="h-12 w-12"
              resizeMode="contain"
            />
            <View className="-right-2 -top-2 absolute">
              <Text className="text-xl">✨</Text>
            </View>
          </View>

          {/* Title and Subtitle */}
          <Text className="text-center font-bold text-4xl text-white">
            Add a Wallet
          </Text>
          <Text className="mb-8 text-center text-gray-400 text-lg">
            Login or import an existing wallet
          </Text>

          {/* Features List */}
          <View className="w-full space-y-6">
            {features.map(feature => (
              <View
                key={feature.title}
                className="flex-row items-start space-x-4"
              >
                <Text className="text-2xl">{feature.icon}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-white text-xl">
                    {feature.title}
                  </Text>
                  <Text className="text-base text-gray-400">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="mt-8 w-full space-y-4">
            <Pressable
              className="h-14 w-full items-center justify-center rounded-full bg-[#7C3AED]"
              onPress={() => {}}
            >
              <Text className="font-semibold text-lg text-white">
                Continue with Email
              </Text>
            </Pressable>

            <Pressable
              className="h-14 w-full items-center justify-center"
              onPress={() => {}}
            >
              <Text className="text-base text-gray-400">
                Create a seed phrase wallet
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="mt-auto w-full flex-row items-center justify-between py-4">
            <View className="flex-row items-center space-x-2">
              <Image
                source={require("~/features/cards/assets/phantom/logo.png")}
                className="h-6 w-6"
                resizeMode="contain"
              />
              <Text className="font-medium text-lg text-white">Phantom</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-gray-400 text-sm">curated by</Text>
              <Image
                source={require("~/features/cards/assets/phantom/mobbin.png")}
                className="h-4 w-16"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
