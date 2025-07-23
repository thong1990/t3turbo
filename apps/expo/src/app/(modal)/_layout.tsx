import { Stack } from "expo-router"

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen name="card-filters" options={{ headerShown: false }} />
    </Stack>
  )
}
