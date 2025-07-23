import { Ionicons as RNIonicons } from "@expo/vector-icons"
import { cssInterop } from "react-native-css-interop"

/**
 * Custom interop for Image
 * DO NOT REMOVE
 */
export const Ionicons = cssInterop(RNIonicons, {
  className: {
    target: "style",
  },
})
