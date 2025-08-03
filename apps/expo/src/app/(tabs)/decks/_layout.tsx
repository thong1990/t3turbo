import { Stack } from "expo-router"
import { Header } from "~/shared/components/header"

export default function DecksLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          title: "Decks",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="filters"
        options={{
          presentation: "fullScreenModal",
          title: "Filter Decks",
          header: () => <Header title="Filter Decks" hasBackButton />,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: false,
          title: "Create Deck",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
          title: "Edit Deck",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack>
  )
}
