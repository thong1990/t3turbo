import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { Text as RNText } from "react-native"

import { cn } from "@acme/ui"

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      largeTitle: "text-3xl", // ~32px
      title1: "text-2xl", // ~24px
      title2: "text-xl", // ~20px
      heading: "text-lg font-semibold", // ~18px
      body: "text-base", // ~16px
      subhead: "text-sm", // ~14px
      caption: "text-xs", // ~12px
    },
    color: {
      primary: "",
      secondary: "text-secondary-foreground/90",
      tertiary: "text-muted-foreground/90",
      quarternary: "text-muted-foreground/50",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "primary",
  },
})

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
  className,
  variant,
  color,
  ...props
}: React.ComponentPropsWithoutRef<typeof RNText> &
  VariantProps<typeof textVariants>) {
  const textClassName = React.useContext(TextClassContext)
  return (
    <RNText
      className={cn(textVariants({ variant, color }), textClassName, className)}
      {...props}
    />
  )
}

export { Text, TextClassContext, textVariants }
