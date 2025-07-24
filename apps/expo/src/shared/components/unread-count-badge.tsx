import { Text } from "~/shared/components/ui/text"
import { cn } from "@acme/ui"
import { View } from "react-native"

interface UnreadCountBadgeProps {
  count: number
  prominent?: boolean
}

export const UnreadCountBadge = ({
  count,
  prominent = false,
}: UnreadCountBadgeProps) => {
  // If count is greater than 9, show 9+
  const displayCount = count > 9 ? "9+" : count
  return (
    <View
      className={cn("rounded-md bg-secondary px-2 py-1", {
        "bg-primary": prominent,
      })}
    >
      <Text
        // style={{ fontVariant: ["tabular-nums"] }}
        className={cn("font-bold text-[12px] text-foreground", {
          "text-white": prominent,
        })}
      >
        {displayCount}
      </Text>
    </View>
  )
}
