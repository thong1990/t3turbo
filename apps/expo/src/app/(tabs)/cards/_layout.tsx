import { Stack } from "expo-router"

export default function CardsLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          title: "Cards",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Card",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
