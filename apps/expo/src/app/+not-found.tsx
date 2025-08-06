import { Link, usePathname } from "expo-router"
import { View } from "react-native"
import { Button } from "~/shared/components/ui/button"

import { Text } from "~/shared/components/ui/text"

export default function RootNotFoundScreen() {
  const pathname = usePathname()

  return (
    <>
      <View className="flex flex-1 items-center justify-center gap-y-6 bg-background p-4">
        <View className="items-center gap-y-2">
          <Text variant="title1">This page doesn't exist</Text>
          <Text className="text-center">Page Not Found</Text>
          <Text variant="caption" className="text-center">
            The page you are looking for doesn't exist or has been moved.
          </Text>
          <Text variant="caption" className="text-center">
            {pathname}
          </Text>
        </View>
        <Link href="/" asChild replace>
          <Button>
            <Text>Go to Home</Text>
          </Button>
        </Link>
      </View>
    </>
  )
}
