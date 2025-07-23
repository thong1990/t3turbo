import { StyleSheet } from "react-native"

import { BlurViewDynamic } from "~/shared/components/blur-view"

const node = (
  <BlurViewDynamic
    style={{
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      backgroundColor: "transparent",
    }}
  />
)

export const BlurEffect = () => {
  return node
}
