import * as ExpoAV from "expo-av"
import * as ExpoClipboard from "expo-clipboard"
import * as ExpoDocumentPicker from "expo-document-picker"
import * as ExpoFS from "expo-file-system"
import * as ExpoImageManipulator from "expo-image-manipulator"
import * as ExpoImagePicker from "expo-image-picker"
import * as ExpoMediaLibrary from "expo-media-library"
import * as ExpoNotifications from "expo-notifications"
import * as ExpoVideoThumbnail from "expo-video-thumbnails"
import { Platform, StatusBar } from "react-native"

import {
  type SendbirdUIKitContainerProps,
  createExpoClipboardService,
  createExpoFileService,
  createExpoMediaService,
  createExpoNotificationService,
  createExpoPlayerService,
  createExpoRecorderService,
} from "@sendbird/uikit-react-native"
import type { SendbirdChatSDK } from "@sendbird/uikit-utils"

import env from "~/shared/env"

let AppSendbirdSDK: SendbirdChatSDK
export const GetSendbirdSDK = () => AppSendbirdSDK
// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
export const SetSendbirdSDK = (sdk: SendbirdChatSDK) => (AppSendbirdSDK = sdk)

export const platformServices: SendbirdUIKitContainerProps["platformServices"] =
  {
    clipboard: createExpoClipboardService(ExpoClipboard),
    notification: createExpoNotificationService(ExpoNotifications),
    file: createExpoFileService({
      fsModule: ExpoFS,
      imagePickerModule: ExpoImagePicker,
      mediaLibraryModule: ExpoMediaLibrary,
      documentPickerModule: ExpoDocumentPicker,
    }),
    media: createExpoMediaService({
      avModule: ExpoAV,
      thumbnailModule: ExpoVideoThumbnail,
      imageManipulator: ExpoImageManipulator,
      fsModule: ExpoFS,
    }),
    player: createExpoPlayerService({
      avModule: ExpoAV,
    }),
    recorder: createExpoRecorderService({
      avModule: ExpoAV,
    }),
  }

export const GetTranslucent = (state = true) => {
  Platform.OS === "android" && StatusBar.setTranslucent(state)
  return Platform.select({ ios: state, android: state })
}

const createSendbirdAPI = (appId: string, apiToken: string) => {
  const MIN = 60 * 1000
  const endpoint = (path: string) =>
    `https://api-${appId}.sendbird.com/v3${path}`
  const getHeaders = (headers?: object) => ({
    "Api-Token": apiToken,
    ...headers,
  })

  return {
    getSessionToken(
      userId: string,
      expires_at = Date.now() + 10 * MIN
    ): Promise<{ user_id: string; token: string; expires_at: number }> {
      return fetch(endpoint(`/users/${userId}/token`), {
        method: "post",
        headers: getHeaders(),
        body: JSON.stringify({ expires_at }),
      }).then(res => res.json())
    },
  }
}

/**
 * API_TOKEN - {@link https://sendbird.com/docs/chat/v3/platform-api/prepare-to-use-api#2-authentication}
 * This is sample code for testing or example.
 * We recommend higher that you use sendbird platform api on your server instead of the client side.
 * */
export const SendbirdAPI = createSendbirdAPI(
  env.EXPO_PUBLIC_SENDBIRD_APP_ID || "",
  env.EXPO_PUBLIC_SENDBIRD_API_TOKEN || ""
)