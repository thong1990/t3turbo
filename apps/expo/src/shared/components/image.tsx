import { Image as RNImage } from "expo-image"
import { cssInterop } from "react-native-css-interop"

/**
 * Custom interop for Image
 * DO NOT REMOVE
 */
export const Image = cssInterop(RNImage, {
  className: {
    target: "style",
  },
})
