import { Ionicons } from "~/shared/components/ui/icons"
import { Pressable, View } from "react-native"
import Animated, {
  LayoutAnimationConfig,
  ZoomInRotate,
} from "react-native-reanimated"

import { cn } from "@acme/ui"

import { useColorScheme } from "~/shared/hooks"
import { COLORS } from "~/shared/theme/colors"

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme()

  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View
        className="items-center justify-center"
        key={`toggle-${colorScheme}`}
        entering={ZoomInRotate}
      >
        <Pressable
          onPress={() => {
            setColorScheme(colorScheme === "dark" ? "light" : "dark")
          }}
          className="opacity-80"
        >
          {colorScheme === "dark"
            ? ({ pressed }) => (
                <View className={cn("px-0.5", pressed && "opacity-50")}>
                  <Ionicons name="moon" color={COLORS.dark.foreground} size={16} />
                </View>
              )
            : ({ pressed }) => (
                <View className={cn("px-0.5", pressed && "opacity-50")}>
                  <Ionicons name="sunny" color={COLORS.black} size={16} />
                </View>
              )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  )
}
