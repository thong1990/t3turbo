import { Ionicons } from "~/shared/components/ui/icons"
import type { ComponentProps, ReactNode } from "react"
import { View } from "react-native"
import { Text } from "~/shared/components/ui/text"

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>["name"]
  message: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, message, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      {icon && (
        <Ionicons
          name={icon}
          size={48}
          className="mb-4 text-muted-foreground"
        />
      )}
      <Text variant="heading" className="text-center">
        {message}
      </Text>
      {description && (
        <Text variant="subhead" className="mt-2 text-center text-muted-foreground">
          {description}
        </Text>
      )}
      {action && (
        <View className="mt-6">
          {action}
        </View>
      )}
    </View>
  )
}
