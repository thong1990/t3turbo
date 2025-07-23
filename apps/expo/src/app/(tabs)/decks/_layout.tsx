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
          presentation: "fullScreenModal",
          headerShown: false,
          // title: "Create Deck",
          // header: () => <Header title="Create Deck" hasBackButton />,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "fullScreenModal",
          title: "Edit Deck",
          header: () => <Header title="Edit Deck" hasBackButton />,
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
