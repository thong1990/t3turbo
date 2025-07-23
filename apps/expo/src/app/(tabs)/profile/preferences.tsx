import { Stack } from "expo-router"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import {
  ListMenu,
  ListMenuItem,
  ListMenuSection,
} from "~/shared/components/ui/list-menu"
import { ThemeToggle } from "~/shared/components/ui/theme-toggle"
import { Toggle } from "~/shared/components/ui/toggle"

export default function ProfilePreferencesScreen() {
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
              <ListMenuItem key="appearance" label="Theme" showChevron={false}>
                <ThemeToggle />
              </ListMenuItem>,
              <ListMenuItem
                key="currency"
                label="Local currency"
                value="USD"
              />,
              <ListMenuItem key="language" label="Language" value="English" />,
              <ListMenuItem
                key="haptics"
                label="Haptic feedback"
                showChevron={false}
              >
                <Toggle value={true} onValueChange={() => {}} />
              </ListMenuItem>,
            ]}
          />
        </ListMenu>
      </Container>
    </>
  )
}
