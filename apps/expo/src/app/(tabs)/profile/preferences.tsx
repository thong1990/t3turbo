import { Stack } from "expo-router"
import { useState, useEffect } from "react"
import * as Notifications from "expo-notifications"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import {
  ListMenu,
  ListMenuItem,
  ListMenuSection,
} from "~/shared/components/ui/list-menu"
import { Switch } from "~/shared/components/ui/switch"
import { useColorScheme } from "~/shared/hooks"
import { toast } from "sonner-native"

export default function ProfilePreferencesScreen() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const [pushNotifications, setPushNotifications] = useState(false)

  // Check current notification permission status
  useEffect(() => {
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync()
    setPushNotifications(status === 'granted')
  }

  const handleThemeToggle = (value: boolean) => {
    setColorScheme(value ? "dark" : "light")
  }

  const handlePushNotificationToggle = async (value: boolean) => {
    if (value) {
      // Request permission to enable notifications
      const { status } = await Notifications.requestPermissionsAsync()
      if (status === 'granted') {
        setPushNotifications(true)
        toast.success("Push notifications enabled!")
      } else {
        setPushNotifications(false)
        toast.error("Permission denied for push notifications")
      }
    } else {
      // Disable notifications (user will need to go to settings to re-enable)
      setPushNotifications(false)
      toast.success("Push notifications disabled")
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          header: () => <Header title="Preferences" hasBackButton />,
        }}
      />
      <Container className="px-4 py-4">
        <ListMenu>
          <ListMenuSection
            items={[
              <ListMenuItem key="appearance" label="Dark Theme" showChevron={false}>
                <Switch 
                  isChecked={colorScheme === "dark"} 
                  onCheckedChange={handleThemeToggle}
                />
              </ListMenuItem>,
              <ListMenuItem key="notifications" label="Push Notifications" showChevron={false}>
                <Switch 
                  isChecked={pushNotifications} 
                  onCheckedChange={handlePushNotificationToggle}
                />
              </ListMenuItem>,
              <ListMenuItem key="language" label="Language" value="English" />,
            ]}
          />
        </ListMenu>
      </Container>
    </>
  )
}
