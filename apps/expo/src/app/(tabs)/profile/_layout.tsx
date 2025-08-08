import { Stack } from "expo-router"
import { Header } from "~/shared/components/header"

export default function ProfileLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "modal",
          title: "Edit Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preferences"
        options={{
          presentation: "modal",
          title: "Preferences",
          header: () => <Header title="Preferences" hasBackButton />,
        }}
      />
      <Stack.Screen
        name="revenuecat-paywall"
        options={{
          presentation: "modal",
          title: "Upgrade",
          header: () => <Header title="Upgrade" hasBackButton />,
        }}
      />
    </Stack>
  )
}
