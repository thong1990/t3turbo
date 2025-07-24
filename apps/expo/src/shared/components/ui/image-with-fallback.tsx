import { cn } from "@acme/ui"
import type { ImageProps } from "expo-image"
import { memo, useState } from "react"
import { type ImageSourcePropType, View } from "react-native"
import { Image } from "~/shared/components/image"
import { Ionicons } from "~/shared/components/ui/icons"
import { Skeleton } from "./skeleton"

type ImageWithFallbackProps = Omit<ImageProps, "source"> & {
  uri?: string
  source?: ImageSourcePropType | string
  fallbackIcon?: React.ComponentProps<typeof Ionicons>["name"]
  showLoadingIndicator?: boolean
}

export const ImageWithFallback = memo(function ImageWithFallback({
  uri,
  source,
  fallbackIcon = "image-outline",
  showLoadingIndicator = true,
  className,
  ...imageProps
}: ImageWithFallbackProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoadEnd = () => {
    setLoading(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  // Determine the actual source to use
  let imageSource: ImageSourcePropType | undefined

  // Handle source prop (string URL or ImageSourcePropType)
  if (source !== null && source !== undefined && source !== "") {
    imageSource = typeof source === "string" ? { uri: source } : source
  }
  // Handle uri prop (string URL only)
  else if (uri !== null && uri !== undefined && uri !== "") {
    imageSource = { uri }
  }

  return (
    <View className={cn("relative overflow-hidden rounded", className)}>
      {error || !imageSource ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name={fallbackIcon}
            size={24}
            className="text-muted-foreground"
          />
        </View>
      ) : (
        <>
          <Image
            source={imageSource}
            className={cn("", className)}
            contentFit="cover"
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            transition={300}
            placeholderContentFit="cover"
            {...imageProps}
          />
          {showLoadingIndicator && loading && (
            <Skeleton className="absolute inset-0" />
          )}
        </>
      )}
    </View>
  )
})
