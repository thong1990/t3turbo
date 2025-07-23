import Constants from "expo-constants"
import { LogLevel, OneSignal } from "react-native-onesignal"

OneSignal.Debug.setLogLevel(LogLevel.Verbose)
OneSignal.initialize(Constants.expoConfig?.extra?.oneSignalAppId)

// Also need enable notifications to complete OneSignal setup
OneSignal.Notifications.requestPermission(true)
OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID)
