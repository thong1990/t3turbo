import * as SeparatorPrimitive from "@rn-primitives/separator"
import type { SlottableViewProps } from "@rn-primitives/types"
import { cn } from "@acme/ui"

type SeparatorProps = SlottableViewProps

function Separator({ className, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      decorative={true}
      orientation="horizontal"
      className={cn("shrink-0 bg-foreground/10", "h-[1px] w-full", className)}
      {...props}
    />
  )
}

export { Separator }
