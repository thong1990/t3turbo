import { Feather } from "@expo/vector-icons"
import type { RefObject } from "react"
import { type FlatList, Pressable, StyleSheet } from "react-native"
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated"

const theme = {
  colors: {
    backgroundColor: "#f8e9b0",
    backgroundHighlightColor: "#f7a641",
    textColor: "#1b1b1b",
    textHighlightColor: "#f0f0f0",
  },
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type ButtonProps = {
  flatListRef: RefObject<FlatList>
  flatListIndex: SharedValue<number>
  dataLength: number
}

export function Button({
  dataLength,
  flatListIndex,
  flatListRef,
}: ButtonProps) {
  const buttonAnimationStyle = useAnimatedStyle(() => {
    const isLastScreen = flatListIndex.value === dataLength - 1
    return {
      width: isLastScreen ? withSpring(140) : withSpring(60),
      height: 60,
    }
  })

  const arrowAnimationStyle = useAnimatedStyle(() => {
    const isLastScreen = flatListIndex.value === dataLength - 1
    return {
      opacity: isLastScreen ? withTiming(0) : withTiming(1),
      transform: [
        { translateX: isLastScreen ? withTiming(100) : withTiming(0) },
      ],
    }
  })

  const textAnimationStyle = useAnimatedStyle(() => {
    const isLastScreen = flatListIndex.value === dataLength - 1
    return {
      opacity: isLastScreen ? withTiming(1) : withTiming(0),
      transform: [
        { translateX: isLastScreen ? withTiming(0) : withTiming(-100) },
      ],
    }
  })

  const handleNextScreen = () => {
    const isLastScreen = flatListIndex.value === dataLength - 1
    if (!isLastScreen) {
      flatListRef.current?.scrollToIndex({ index: flatListIndex.value + 1 })
    }
  }

  return (
    <AnimatedPressable
      onPress={handleNextScreen}
      style={[styles.container, buttonAnimationStyle]}
    >
      <Animated.Text style={[styles.text, textAnimationStyle]}>
        Get Started
      </Animated.Text>

      <Animated.View style={[styles.arrow, arrowAnimationStyle]}>
        <Feather
          name="arrow-right"
          size={30}
          color={theme.colors.textHighlightColor}
        />
      </Animated.View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.backgroundHighlightColor,
    padding: 10,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  arrow: {
    position: "absolute",
  },
  text: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.textHighlightColor,
  },
})
