import { cn } from "@acme/ui"
import { Tabs, useRouter, useSegments } from "expo-router"
import type React from "react"
import { useCallback } from "react"
import { View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { NAVIGATION_THEME } from "~/shared/constants"
import { useColorScheme } from "~/shared/hooks"
import { useCleanTabBar } from "~/shared/hooks/use-adaptive-tab-bar"
import { ModernTabBar } from "~/shared/components/ui/modern-tab-bar"

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
  const { isDarkColorScheme } = useColorScheme()
  const router = useRouter()
  const segments = useSegments()
  
  // Get current active tab from route segments
  const activeTab = segments[1] || "trade"
  
  // 🎨 Clean user-friendly tab bar attached to bottom
  const { tabBarStyle, metrics } = useCleanTabBar(Object.keys(TAB_ICONS).length)
  
  // Convert TAB_ICONS to array format for ModernTabBar
  const tabsArray = Object.entries(TAB_ICONS).map(([name, config]) => ({
    name,
    icon: config.icon,
    label: config.label,
  }))

  const handleTabPress = useCallback((tabName: string) => {
    // Use replace instead of push to prevent navigation stack buildup
    router.replace(`/(tabs)/${tabName}`)
  }, [router])

  return (
    <>
      {/* Hidden Expo Router Tabs for navigation structure */}
      <Tabs
        initialRouteName="trade"
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar
        }}
      >
        {Object.entries(TAB_ICONS).map(([name, { label }]) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: label,
              headerShown: false,
            }}
          />
        ))}
      </Tabs>
      
      {/* Custom Clean Tab Bar */}
      <ModernTabBar
        tabs={tabsArray}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        style={tabBarStyle}
        metrics={metrics}
        isDarkMode={isDarkColorScheme}
      />
    </>
  )
}
