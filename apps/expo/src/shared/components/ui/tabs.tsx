import { cn } from "@acme/ui"
import * as TabsPrimitive from "@rn-primitives/tabs"
import type * as React from "react"
import { TextClassContext } from "./text"

function Tabs({ className, ...props }: TabsPrimitive.RootProps) {
  return (
    <TabsPrimitive.Root
      className={cn("flex-1 flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & {
  ref?: React.RefObject<TabsPrimitive.ListRef>
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        "web:inline-flex h-10 native:h-12 items-center justify-center gap-x-2 rounded-xl bg-muted p-1 native:px-1.5 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TriggerProps & {
  ref?: React.RefObject<TabsPrimitive.TriggerRef>
}) {
  const { value } = TabsPrimitive.useRootContext()
  return (
    <TextClassContext.Provider
      value={cn(
        "font-medium native:text-base text-muted-foreground text-red-500 text-sm web:transition-all",
        value === props.value && "text-foreground"
      )}
    >
      <TabsPrimitive.Trigger
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-3 py-2 font-medium text-sm shadow-none dark:text-muted-foreground",
          props.disabled && "web:pointer-events-none opacity-50",
          props.value === value &&
            "border-primary/20 bg-background text-foreground shadow-foreground/10 shadow-lg",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & {
  ref?: React.RefObject<TabsPrimitive.ContentRef>
}) {
  return (
    <TabsPrimitive.Content
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
