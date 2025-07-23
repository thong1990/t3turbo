import { cn } from "@init/utils/ui"
import Animated, { FadeIn } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

export const Container = ({
  children,
  className,
  edges = ["top"],
}: {
  children: React.ReactNode
  className?: string
  edges?: ("top" | "bottom" | "left" | "right")[]
}) => {
  return (
    <SafeAreaView
      className={cn("flex-1 bg-background text-foreground")}
      edges={edges}
    >
      <Animated.View entering={FadeIn} className={cn("flex-1", className)}>
        {children}
      </Animated.View>
    </SafeAreaView>
  )
}

export const ScrollContainer = ({
  children,
  className,
  contentContainerClassName,
}: {
  children: React.ReactNode
  className?: string
  contentContainerClassName?: string
}) => {
  return (
    <SafeAreaView
      className={cn("flex-1 bg-background text-foreground", className)}
    >
      <Animated.ScrollView
        entering={FadeIn}
        className="flex-1"
        contentContainerClassName={contentContainerClassName}
      >
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
