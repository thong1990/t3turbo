import { cn } from "@acme/ui"
import { type ComponentPropsWithoutRef, useEffect } from "react"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

const duration = 1000

function Skeleton({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Animated.View>, "style">) {
  const sv = useSharedValue(1)

  // biome-ignore lint/correctness/useExhaustiveDependencies: sv is a stable Reanimated shared value
  useEffect(() => {
    sv.value = withRepeat(
      withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })),
      -1,
      true
    )

    return () => {
      sv.value = 1
    }
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
  }))

  return (
    <Animated.View
      style={style}
      className={cn("rounded-md bg-secondary/10 dark:bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
