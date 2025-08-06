import { memo } from "react"
import { View } from "react-native"
import { Skeleton } from "~/shared/components/ui/skeleton"

export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <View className="flex-1 px-1 pb-3">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="mt-2 h-4 w-3/4 rounded" />
    </View>
  )
})

export const CardGridSkeleton = memo(function CardGridSkeleton() {
  return (
    <View className="flex-1 px-4 pt-4">
      <View className="flex-row flex-wrap justify-between">
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} className="w-[31%] mb-4">
            <CardSkeleton />
          </View>
        ))}
      </View>
    </View>
  )
})