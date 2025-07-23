import * as CheckboxPrimitive from "@rn-primitives/checkbox"
import { useControllableState } from "@rn-primitives/hooks"
import * as React from "react"
import { Ionicons } from "~/shared/components/ui/icons"

import { cn } from "@init/utils/ui"

type CheckboxProps = Omit<
  CheckboxPrimitive.RootProps,
  "checked" | "onCheckedChange"
> & {
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  isMultiChoice?: boolean
}

const Checkbox = React.forwardRef<CheckboxPrimitive.RootRef, CheckboxProps>(
  (
    {
      className,
      checked: checkedProps,
      onCheckedChange: onCheckedChangeProps,
      defaultChecked = false,
      isMultiChoice = false,
      ...props
    },
    ref
  ) => {
    const [checked = false, onCheckedChange] = useControllableState({
      prop: checkedProps,
      defaultProp: defaultChecked,
      onChange: onCheckedChangeProps,
    })
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "h-[18px] ios:h-[18px] ios:w-[18px] w-[18px] ios:rounded-full rounded-full border border-muted-foreground/40",
          isMultiChoice && "ios:rounded-sm rounded-sm",
          checked && "border-0 bg-primary",
          props.disabled && "opacity-50",
          className
        )}
        checked={checked}
        onCheckedChange={onCheckedChange}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("h-full w-full items-center justify-center")}
        >
          <Ionicons name="checkmark" size={18} className="text-white" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
  }
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
