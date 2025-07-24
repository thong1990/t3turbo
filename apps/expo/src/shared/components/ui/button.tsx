import * as Slot from "@rn-primitives/slot"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  View,
  type ViewStyle,
} from "react-native"

import { cn } from "@acme/ui"

import { TextClassContext } from "~/shared/components/ui/text"
import { useColorScheme } from "~/shared/hooks"
import { COLORS } from "~/shared/theme/colors"

const buttonVariants = cva("flex-row items-center justify-center gap-2", {
  variants: {
    variant: {
      primary:
        "bg-primary text-primary-foreground ios:active:opacity-80 dark:ios:active:bg-primary/80",
      muted: "bg-muted text-muted-foreground ios:active:bg-muted/80",
      tonal:
        "bg-primary/10 text-primary ios:active:bg-primary/20 dark:bg-primary/20 dark:ios:active:bg-primary/30",
      outline:
        "border border-border text-foreground ios:active:bg-border/20 dark:ios:active:bg-border/10",
      ghost:
        "bg-transparent text-foreground ios:active:bg-muted/10 dark:ios:active:bg-muted/10",
      destructive:
        "bg-destructive text-destructive-foreground ios:active:opacity-80",
      link: "bg-transparent underline-offset-4 text-primary underline ios:active:opacity-70",
      plain: "bg-transparent text-foreground ios:active:opacity-70",
    },
    size: {
      none: "",
      xxs: "py-0 px-0 rounded-md text-xxs",
      xs: "py-1 px-2 rounded-md text-xs",
      sm: "py-1.5 px-2.5 rounded-md text-sm",
      md: "py-2 px-4 rounded-md text-sm",
      lg: "py-2.5 px-5 rounded-md text-base",
      xl: "py-3 px-6 rounded-md text-base",
      icon: "h-10 w-10 rounded-md",
    },
  },
  defaultVariants: {
    variant: "tonal",
    size: "md",
  },
})

const androidRootVariants = cva("overflow-hidden", {
  variants: {
    size: {
      none: "",
      icon: "rounded-full",
      xs: "rounded-full",
      sm: "rounded-full",
      md: "rounded-full",
      lg: "rounded-xl",
      xl: "rounded-xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "ios:text-primary text-foreground",
      tonal: "ios:text-foreground text-foreground",
      plain: "text-foreground",
      muted: "text-muted-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
      link: "text-primary",
    },
    size: {
      none: "",
      icon: "",
      xs: "text-[15px] leading-5",
      sm: "text-[15px] leading-5",
      md: "text-[17px] leading-7",
      lg: "text-[17px] leading-7",
      xl: "text-[17px] leading-7",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

function convertToRGBA(rgb: string, opacity: number): string {
  const rgbValues = rgb.match(/\d+/g)
  if (!rgbValues || rgbValues.length !== 3) {
    throw new Error("Invalid RGB color format")
  }
  const red = Number.parseInt(rgbValues[0], 10)
  const green = Number.parseInt(rgbValues[1], 10)
  const blue = Number.parseInt(rgbValues[2], 10)
  if (opacity < 0 || opacity > 1) {
    throw new Error("Opacity must be a number between 0 and 1")
  }
  return `rgba(${red},${green},${blue},${opacity})`
}

const ANDROID_RIPPLE = {
  dark: {
    primary: {
      color: convertToRGBA(COLORS.dark.grey3, 0.4),
      borderless: false,
    },
    secondary: {
      color: convertToRGBA(COLORS.dark.grey5, 0.8),
      borderless: false,
    },
    plain: { color: convertToRGBA(COLORS.dark.grey5, 0.8), borderless: false },
    tonal: { color: convertToRGBA(COLORS.dark.grey5, 0.8), borderless: false },
  },
  light: {
    primary: {
      color: convertToRGBA(COLORS.light.grey4, 0.4),
      borderless: false,
    },
    secondary: {
      color: convertToRGBA(COLORS.light.grey5, 0.4),
      borderless: false,
    },
    plain: { color: convertToRGBA(COLORS.light.grey5, 0.4), borderless: false },
    tonal: { color: convertToRGBA(COLORS.light.grey6, 0.4), borderless: false },
  },
}

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: "continuous",
}

type ButtonVariantProps = Omit<
  VariantProps<typeof buttonVariants>,
  "variant"
> & {
  variant?: Exclude<VariantProps<typeof buttonVariants>["variant"], null>
}

type AndroidOnlyButtonProps = {
  /**
   * ANDROID ONLY: The class name of root responsible for hidding the ripple overflow.
   */
  androidRootClassName?: string
}

type ButtonProps = PressableProps & ButtonVariantProps & AndroidOnlyButtonProps

const Root = Platform.OS === "android" ? View : Slot.Pressable

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      className,
      variant = "primary",
      size,
      style = BORDER_CURVE,
      androidRootClassName,
      ...props
    },
    ref
  ) => {
    const { colorScheme } = useColorScheme()

    return (
      <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
        <Pressable
          className={cn(
            props.disabled && "opacity-50",
            buttonVariants({ variant, size, className })
          )}
          ref={ref}
          style={style}
          {...props}
        />
      </TextClassContext.Provider>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonTextVariants, buttonVariants }
export type { ButtonProps }
