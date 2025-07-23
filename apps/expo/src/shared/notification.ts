import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { Platform } from "react-native"

import {
  isSendbirdNotification,
  parseSendbirdNotification,
} from "@sendbird/uikit-utils"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

// Define a type for the Sendbird notification data payload
type SendbirdNotificationData = { [key: string]: string | object }

export const onForeground = () => {
  const onNotification = (
    notification: Notifications.NotificationResponse | null
  ) => {
    if (!notification) return // Guard against null response

    // Assert data type instead of using any
    const data = notification?.notification?.request?.content?.data as
      | SendbirdNotificationData
      | undefined

    if (data && isSendbirdNotification(data)) {
      const sendbird = parseSendbirdNotification(data)
      // Navigation logic removed as Expo Router handles deep linking
      // TODO: Implement navigation logic using Expo Router's Href or router.push
      // Example: router.push({ pathname: '/group-channel/[channelUrl]', params: { channelUrl: sendbird.channel.channel_url } });
    }
  }

  const checkAppOpenedWithNotification = async () => {
    const response = await Notifications.getLastNotificationResponseAsync()
    onNotification(response) // Pass potentially null response
  }

  checkAppOpenedWithNotification()
  return Notifications.addNotificationResponseReceivedListener(onNotification)
    .remove
}

if (Platform.OS === "android") {
  // Set channel
  const channelId = "default"
  Notifications.setNotificationChannelAsync(channelId, {
    name: "Default Channel",
    importance: Notifications.AndroidImportance.MAX, // Use enum for importance
  })

  // Set background message handler
  const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK"

  // Task executor must be async or return a Promise
  TaskManager.defineTask(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data: taskData, error }) => {
      if (error) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error("Background notification task error:", error)
        return
      }
      if (!taskData) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.warn("Background notification task received no data.")
        return
      }

      if (Platform.OS !== "android") {
        return
      }

      // biome-ignore lint/suspicious/noConsole: <explanation>
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>

      // Explicitly cast taskData before passing to isSendbirdNotification
      const notificationData = taskData as SendbirdNotificationData

      if (isSendbirdNotification(notificationData)) {
        const sendbird = parseSendbirdNotification(notificationData)

        await Notifications.scheduleNotificationAsync({
          identifier: String(sendbird.message_id),
          content: {
            title: `[RN]${
              sendbird.channel.name ||
              sendbird.sender?.name ||
              "Message received"
            }`,
            body: sendbird.message,
            data: notificationData, // Pass the original typed data
          },
          trigger: null,
        })
      }
    }
  )
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK)
}
