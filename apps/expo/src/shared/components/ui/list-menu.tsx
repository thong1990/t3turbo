import { Ionicons } from "~/shared/components/ui/icons"
import { cn } from "@init/utils/ui"
import * as React from "react"
import { Pressable, View } from "react-native"
import { useColorScheme } from "~/shared/hooks"
import { Separator } from "./separator"
import { Text } from "./text"

// Main container for the list menu
function ListMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
}

// Title component for list sections
function ListMenuTitle({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "mb-4 font-semibold text-base text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
}

// Section component that takes an array of items
function ListMenuSection({
  items,
  className,
  ...props
}: {
  items: React.ReactNode[]
} & React.ComponentProps<typeof View>) {
  return (
    <View className={cn("", className)} {...props}>
      {items.map((item, index) => {
        const key =
          React.isValidElement(item) && item.key ? item.key : `item-${index}`
        return (
          <View key={key}>
            {item}
            {index < items.length - 1 && <Separator className="mx-4" />}
          </View>
        )
      })}
    </View>
  )
}

// Individual menu item component
function ListMenuItem({
  label,
  value,
  showChevron = true,
  onPress,
  disabled = false,
  children,
  className,
  ...props
}: {
  label: string
  value?: string
  showChevron?: boolean
  onPress?: () => void
  disabled?: boolean
  children?: React.ReactNode
} & React.ComponentProps<typeof View>) {
  const { colorScheme } = useColorScheme()

  const Component = onPress ? Pressable : View

  return (
    <Component
      onPress={disabled ? undefined : onPress}
      className={cn(
        "min-h-[44px] flex-row items-center justify-between px-4 py-3",
        onPress && !disabled && "active:bg-muted/50",
        disabled && "opacity-50",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <View className="flex-1 flex-row items-center justify-between">
        <Text
          variant="body"
          className={cn("text-foreground", disabled && "text-muted-foreground")}
        >
          {label}
        </Text>

        <View className="flex-row items-center gap-2">
          {value && (
            <Text variant="body" className="text-muted-foreground">
              {value}
            </Text>
          )}

          {children}

          {showChevron && onPress && (
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
            />
          )}
        </View>
      </View>
    </Component>
  )
}

export { ListMenu, ListMenuTitle, ListMenuSection, ListMenuItem }
