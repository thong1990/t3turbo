import { Text, View } from "react-native"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"

export default function FileViewerScreen() {
  return (
    <Container>
      <Header title="File Viewer" hasBackButton />
      <View className="flex-1 items-center justify-center">
        <Text>File Viewer Screen</Text>
      </View>
    </Container>
  )
}
