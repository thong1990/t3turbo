import { StyleSheet, View } from "react-native"
import Animated, {
  Extrapolation,
  type SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated"

import type { OnboardingItem } from "~/features/onboarding/config"

const theme = {
  colors: {
    backgroundColor: "#f8e9b0",
    backgroundHighlightColor: "#f7a641",
    textColor: "#1b1b1b",
    textHighlightColor: "#f0f0f0",
  },
}

type PaginationCompProps = {
  index: number
  x: SharedValue<number>
  screenWidth: number
}

const PaginationComp = ({ index, x, screenWidth }: PaginationCompProps) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      x.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [10, 20, 10],
      Extrapolation.CLAMP
    )

    const opacityAnimation = interpolate(
      x.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    )

    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    }
  })

  return <Animated.View style={[styles.dots, animatedDotStyle]} />
}

type PaginationProps = {
  data: OnboardingItem[]
  x: SharedValue<number>
  screenWidth: number
}

export function Pagination({ data, screenWidth, x }: PaginationProps) {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <PaginationComp
          key={item.id}
          index={index}
          x={x}
          screenWidth={screenWidth}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.backgroundHighlightColor,
    marginHorizontal: 10,
  },
})
