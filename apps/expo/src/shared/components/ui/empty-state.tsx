import { Ionicons } from "~/shared/components/ui/icons"
import type { ComponentProps } from "react"
import { View } from "react-native"
import { Text } from "~/shared/components/ui/text"

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>["name"]
  message: string
  description?: string
}

export function EmptyState({ icon, message, description }: EmptyStateProps) {
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
        <Text variant="subhead" className="mt-2">
          {description}
        </Text>
      )}
    </View>
  )
}
