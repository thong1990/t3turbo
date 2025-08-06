import { memo } from "react"
import { View } from "react-native"
import { Skeleton } from "~/shared/components/ui/skeleton"

export const TradeMatchSkeleton = memo(function TradeMatchSkeleton() {
  return (
    <View className="mb-4 rounded-2xl border border-border bg-card p-5">
      {/* Header with user info */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <View className="ml-3">
            <Skeleton className="h-4 w-24 rounded" />
          </View>
        </View>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </View>

      {/* Card rows */}
      <View className="space-y-4">
        <View>
          <Skeleton className="mb-2 h-4 w-20 rounded" />
          <View className="flex-row space-x-2">
            <Skeleton className="h-16 w-12 rounded" />
            <Skeleton className="h-16 w-12 rounded" />
          </View>
        </View>
        <View>
          <Skeleton className="mb-2 h-4 w-20 rounded" />
          <View className="flex-row space-x-2">
            <Skeleton className="h-16 w-12 rounded" />
            <Skeleton className="h-16 w-12 rounded" />
          </View>
        </View>
      </View>

      {/* Trade button */}
      <View className="mt-5 border-border border-t pt-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </View>
    </View>
  )
})

export const TradeListSkeleton = memo(function TradeListSkeleton() {
  return (
    <View className="flex-1 px-4 pt-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <TradeMatchSkeleton key={index} />
      ))}
    </View>
  )
})