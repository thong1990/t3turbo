import { Platform } from "react-native"

const IOS_SYSTEM_COLORS = {
  white: "rgb(255, 255, 255)",
  black: "rgb(0, 0, 0)",
  light: {
    grey6: "rgb(242, 242, 247)",
    grey5: "rgb(230, 230, 235)",
    grey4: "rgb(210, 210, 215)",
    grey3: "rgb(199, 199, 204)",
    grey2: "rgb(175, 176, 180)",
    grey: "rgb(142, 142, 147)",
    background: "rgb(242, 242, 247)",
    foreground: "rgb(0, 0, 0)",
    root: "rgb(255, 255, 255)",
    card: "rgb(255, 255, 255)",
    destructive: "rgb(255, 56, 43)",
    primary: "rgb(0, 123, 254)",
  },
  dark: {
    grey6: "rgb(41, 43, 47)",
    grey5: "rgb(51, 54, 60)",
    grey4: "rgb(61, 65, 73)",
    grey3: "rgb(71, 76, 86)",
    grey2: "rgb(88, 94, 107)",
    grey: "rgb(115, 123, 140)",
    background: "rgb(33, 35, 39)",
    foreground: "rgb(242, 242, 242)",
    root: "rgb(26, 28, 31)",
    card: "rgb(41, 43, 47)",
    destructive: "rgb(239, 68, 68)",
    primary: "rgb(59, 130, 246)",
  },
} as const

const ANDROID_COLORS = {
  white: "rgb(255, 255, 255)",
  black: "rgb(0, 0, 0)",
  light: {
    grey6: "rgb(249, 249, 255)",
    grey5: "rgb(215, 217, 228)",
    grey4: "rgb(193, 198, 215)",
    grey3: "rgb(113, 119, 134)",
    grey2: "rgb(65, 71, 84)",
    grey: "rgb(24, 28, 35)",
    background: "rgb(249, 249, 255)",
    foreground: "rgb(0, 0, 0)",
    root: "rgb(255, 255, 255)",
    card: "rgb(255, 255, 255)",
    destructive: "rgb(186, 26, 26)",
    primary: "rgb(0, 112, 233)",
  },
  dark: {
    grey6: "rgb(38, 40, 44)",
    grey5: "rgb(46, 49, 55)",
    grey4: "rgb(56, 60, 68)",
    grey3: "rgb(66, 71, 81)",
    grey2: "rgb(82, 88, 100)",
    grey: "rgb(108, 116, 133)",
    background: "rgb(31, 33, 36)",
    foreground: "rgb(237, 237, 237)",
    root: "rgb(24, 26, 29)",
    card: "rgb(38, 40, 44)",
    destructive: "rgb(239, 68, 68)",
    primary: "rgb(59, 130, 246)",
  },
} as const

const COLORS = Platform.OS === "ios" ? IOS_SYSTEM_COLORS : ANDROID_COLORS

export { COLORS }
