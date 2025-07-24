import { cn } from "@acme/ui"
import { router } from "expo-router"
import { View } from "react-native"
import { Pressable } from "react-native-gesture-handler"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"
import { TextField } from "~/shared/components/ui/text-field"

type HeaderAction = {
  icon?: React.ReactNode
  label?: string
  onPress: () => void
  badgeCount?: number
  disabled?: boolean
}

type HeaderProps = {
  title?: string
  subtitle?: string // Optional subtitle (e.g. location, status)
  hasBackButton?: boolean // Show back button
  actions?: HeaderAction[] // Right-side actions
  leftView?: React.ReactNode // Custom left slot (logo, avatar, etc.)
  rightView?: React.ReactNode // Custom right slot if not using actions
  showSearch?: boolean // Inline search bar
  onSearchPress?: () => void // Search bar tap handler
  searchPlaceholder?: string // Custom placeholder for search
  searchQuery?: string
  onSearchQueryChange?: (text: string) => void
  backgroundStyle?: string // Tailwind class or style override for background
  sticky?: boolean // Enable sticky header behavior
  blurOnScroll?: boolean // Enable blur effect on scroll
  onTitlePress?: () => void // Tap on title for special action (e.g. debug)
  onDoubleBackPress?: () => void // Handle double tap on back button
  collapseOnScroll?: boolean // Collapse header on scroll
  statusBarPadding?: boolean // Add safe-area top padding
  translucent?: boolean // Allow content behind the header
  centered?: boolean // Center the title text
}

export function Header({
  title,
  subtitle,
  hasBackButton = false,
  actions = [],
  leftView,
  rightView,
  showSearch = false,
  onSearchPress,
  searchPlaceholder = "Search...",
  searchQuery,
  onSearchQueryChange,
  backgroundStyle = "bg-background",
  sticky = false,
  blurOnScroll = false,
  onTitlePress,
  onDoubleBackPress,
  collapseOnScroll = false,
  statusBarPadding = false,
  translucent = false,
  centered = false,
}: HeaderProps) {
  const handleBackPress = () => {
    if (router.canDismiss()) {
      router.dismiss()
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(tabs)/trade")
    }
  }

  const handleDoubleBackPress = () => {
    if (onDoubleBackPress) {
      onDoubleBackPress()
    }
  }

  const renderBackButton = () => {
    if (!hasBackButton) {
      return null
    }

    return (
      <View className="pl-4">
        <Pressable
          onPress={handleBackPress}
          onLongPress={handleDoubleBackPress}
          hitSlop={10}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Ionicons name="chevron-back-outline" size={24} color="gray" />
        </Pressable>
      </View>
    )
  }

  const renderLeftSection = () => {
    if (leftView) {
      return <View className="pl-4">{leftView}</View>
    }
    return renderBackButton()
  }

  const renderTitleSection = () => {
    if (showSearch) {
      return (
        <TextField
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder={searchPlaceholder}
          leftView={
            <View className="pl-2">
              <Ionicons name="search-outline" size={20} color="gray" />
            </View>
          }
          materialVariant="filled"
        />
      )
    }

    if (!title && !subtitle) return null

    return (
      <View
        className={cn("flex-row items-center", centered && "justify-center")}
      >
        <Pressable
          onPress={onTitlePress}
          className={cn("flex-1", centered && "items-center")}
          disabled={!onTitlePress}
          style={({ pressed }) => ({
            opacity: onTitlePress && pressed ? 0.7 : 1,
          })}
        >
          <View className={cn(centered && "items-center")}>
            {title && (
              <Text
                className={cn(
                  "font-semibold text-2xl text-foreground",
                  centered && "text-center"
                )}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                className={cn(
                  "mt-1 text-gray-500 text-sm",
                  centered && "text-center"
                )}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    )
  }

  const renderActions = () => {
    if (actions.length === 0) return null

    return (
      <View className="flex-row items-center gap-x-2">
        {actions.map((action, index) => (
          <Pressable
            key={`action-${index}-${action.label || "icon"}`}
            onPress={action.onPress}
            disabled={action.disabled}
            hitSlop={8}
            style={({ pressed }) => ({
              opacity: action.disabled ? 0.3 : pressed ? 0.7 : 1,
            })}
            className="relative"
          >
            {action.icon}
            {action.badgeCount && action.badgeCount > 0 && (
              // biome-ignore lint/nursery/useSortedClasses: <explanation>
              <View className="absolute -right-1 -top-1 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500">
                <Text className="font-medium text-white text-xs">
                  {action.badgeCount > 99 ? "99+" : action.badgeCount}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    )
  }

  const renderRightSection = () => {
    if (rightView) {
      return <View className="pr-4">{rightView}</View>
    }
    return renderActions()
  }

  const containerClasses = cn(
    "flex-row items-center gap-x-4 py-4 text-foreground",
    backgroundStyle,
    statusBarPadding && "pt-12",
    sticky && "sticky top-0 z-50",
    translucent && "bg-opacity-90",
    blurOnScroll && "backdrop-blur-md"
  )

  return (
    <View className={containerClasses}>
      <View className="flex-shrink-0">{renderLeftSection()}</View>
      <View className="flex-1">{renderTitleSection()}</View>
      <View className="flex-shrink-0">{renderRightSection()}</View>
    </View>
  )
}
