import React from "react"
import { StyleSheet } from "react-native"
import { useColorScheme } from "react-native"
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  Easing,
} from "react-native-reanimated"
import Svg, { Circle, Path } from "react-native-svg"

type Props = {
  size?: number
  className?: string
}

const SpinningLoader = ({ size = 24, className }: Props) => {
  const rotation = useSharedValue(0)
  const colorScheme = useColorScheme()
  const color = colorScheme === "dark" ? "#FFFFFF" : "#111827" // dark:text-white : text-gray-900

  // biome-ignore lint/correctness/useExhaustiveDependencies: rotation is a stable Reanimated shared value
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    )

    return () => {
      rotation.value = 0
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View
      className={className}
      style={[styles.container, { width: size, height: size }, animatedStyle]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="4"
          opacity={0.25}
        />
        <Path
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill={color}
          opacity={0.75}
        />
      </Svg>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
})

export default SpinningLoader
