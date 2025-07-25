// @ts-expect-error -- Nativewind is not typed
import nativewind from "nativewind/preset"
import { hairlineWidth, platformSelect } from "nativewind/theme"
import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [nativewind],
  theme: {
    extend: {
      colors: {
        border: withOpacity("border"),
        input: withOpacity("input"),
        ring: withOpacity("ring"),
        background: withOpacity("background"),
        foreground: withOpacity("foreground"),
        primary: {
          DEFAULT: withOpacity("primary"),
          foreground: withOpacity("primary-foreground"),
        },
        secondary: {
          DEFAULT: withOpacity("secondary"),
          foreground: withOpacity("secondary-foreground"),
        },
        destructive: {
          DEFAULT: withOpacity("destructive"),
          foreground: withOpacity("destructive-foreground"),
        },
        muted: {
          DEFAULT: withOpacity("muted"),
          foreground: withOpacity("muted-foreground"),
        },
        accent: {
          DEFAULT: withOpacity("accent"),
          foreground: withOpacity("accent-foreground"),
        },
        popover: {
          DEFAULT: withOpacity("popover"),
          foreground: withOpacity("popover-foreground"),
        },
        card: {
          DEFAULT: withOpacity("card"),
          foreground: withOpacity("card-foreground"),
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        sans: ["CalSans-SemiBold", "sans-serif"],
      },
      borderRadius: {
        xs: "10px",
        sm: "12px",
        md: "14px",
        lg: "16px",
        xl: "20px",
      },
    },
  },
  plugins: [],
} satisfies Config

// biome-ignore lint/suspicious/noExplicitAny: Nativewind UI requires this.
function withOpacity(variableName: string): any {
  return ({ opacityValue }: { opacityValue: number }) => {
    if (opacityValue !== undefined) {
      return platformSelect({
        ios: `hsl(var(--${variableName}) / ${opacityValue})`,
        android: `hsl(var(--android-${variableName}) / ${opacityValue})`,
      })
    }
    return platformSelect({
      ios: `hsl(var(--${variableName}))`,
      android: `hsl(var(--android-${variableName}))`,
    })
  }
}
