import { cn } from "@acme/ui"
import { Tabs } from "expo-router"
import type React from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "~/shared/components/ui/icons"
import { NAVIGATION_THEME } from "~/shared/constants"
import { useColorScheme } from "~/shared/hooks"

const TAB_ICONS: Record<
  string,
  { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }
> = {
  trade: { icon: "home", label: "Trade" },
  cards: { icon: "library-outline", label: "Dex" },
  decks: { icon: "layers-outline", label: "Decks" },
  messages: { icon: "chatbubbles-outline", label: "Messages" },
  profile: { icon: "person-outline", label: "Profile" },
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme
    ? NAVIGATION_THEME.dark
    : NAVIGATION_THEME.light

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 16 + insets.bottom,
          paddingTop: 8,
          height: 72,
          backgroundColor: theme.background,
        },
      }}
    >
      {Object.entries(TAB_ICONS).map(([name, { icon, label }]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={icon}
                size={24}
                color={focused ? theme.primary : theme.border}
                className={cn(
                  focused ? "text-primary" : "text-muted-foreground"
                )}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
