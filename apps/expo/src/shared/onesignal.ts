import Constants from "expo-constants"
import { LogLevel, OneSignal } from "react-native-onesignal"

OneSignal.Debug.setLogLevel(LogLevel.Verbose)

// Use environment variable first, fallback to Constants
const oneSignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || Constants.expoConfig?.extra?.oneSignalAppId

if (oneSignalAppId) {
  OneSignal.initialize(oneSignalAppId)
  // Also need enable notifications to complete OneSignal setup
  OneSignal.Notifications.requestPermission(true)
} else {
  console.warn("OneSignal App ID not found. Push notifications will not work.")
}
