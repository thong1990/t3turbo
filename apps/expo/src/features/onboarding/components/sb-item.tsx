import React from "react"
import type {
  ImageSourcePropType,
  StyleProp,
  ViewProps,
  ViewStyle,
} from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import type { AnimatedProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"

import Constants from "expo-constants"

import { SlideItem } from "./slide-item"

interface Props extends AnimatedProps<ViewProps> {
  style?: StyleProp<ViewStyle>
  index?: number
  pretty?: boolean
  showIndex?: boolean
  img?: ImageSourcePropType
  rounded?: boolean
}

export const SBItem: React.FC<Props> = props => {
  const {
    style,
    showIndex = true,
    index,
    pretty,
    img,
    rounded = true,
    testID,
    ...animatedViewProps
  } = props
  const enablePretty = Constants?.expoConfig?.extra?.enablePretty || false
  const [isPretty, setIsPretty] = React.useState(pretty || enablePretty)
  return (
    <GestureDetector
      gesture={Gesture.LongPress().onEnd(() => {
        setIsPretty(!isPretty)
      })}
    >
      <Animated.View testID={testID} style={{ flex: 1 }} {...animatedViewProps}>
        <SlideItem index={index} rounded={rounded} source={img} />
      </Animated.View>
    </GestureDetector>
  )
}
