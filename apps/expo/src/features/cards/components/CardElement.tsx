import { Image } from "react-native"
import { CARD_ELEMENTS, ELEMENT_IMAGES } from "../constants"
import { cn } from "@acme/ui"

type CardElementProps = {
  element?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const

export function CardElement({
  element,
  size = "md",
  className = "",
}: CardElementProps) {
  const key = (element ?? "").toLowerCase() as (typeof CARD_ELEMENTS)[number]
  if (!CARD_ELEMENTS.includes(key)) {
    return null
  }
  return (
    <Image
      source={ELEMENT_IMAGES[key]}
      className={cn(sizeMap[size], className)}
      resizeMode="contain"
    />
  )
}
