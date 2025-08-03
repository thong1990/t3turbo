import { Stack } from "expo-router"

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen name="card-filters" options={{ headerShown: false }} />
      <Stack.Screen name="deck-filters" options={{ headerShown: false }} />
      <Stack.Screen name="trade-filters" options={{ headerShown: false }} />
    </Stack>
  )
}
