import { cn } from "@init/utils/ui"
import type React from "react"
import { createContext, useContext } from "react"
import { View } from "react-native"
import { Button } from "./button"

type ToggleGroupContextType = {
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  type: "single" | "multiple"
}

const ToggleGroupContext = createContext<ToggleGroupContextType | null>(null)

export function ToggleGroup({
  value,
  onValueChange,
  type = "single",
  children,
  className,
}: {
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  type?: "single" | "multiple"
  children: React.ReactNode
  className?: string
}) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange, type }}>
      <View className={cn("flex-row flex-wrap gap-2", className)}>
        {children}
      </View>
    </ToggleGroupContext.Provider>
  )
}

export function ToggleGroupItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = useContext(ToggleGroupContext)
  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup")
  }

  const { value: contextValue, onValueChange, type } = context
  const isActive = Array.isArray(contextValue)
    ? contextValue.includes(value)
    : contextValue === value

  const handlePress = () => {
    if (type === "multiple" && Array.isArray(contextValue)) {
      const newValue = isActive
        ? contextValue.filter(v => v !== value)
        : [...contextValue, value]
      onValueChange(newValue)
    } else {
      onValueChange(isActive ? "" : value)
    }
  }

  return (
    <Button
      variant={isActive ? "primary" : "outline"}
      onPress={handlePress}
      className={cn(className)}
    >
      {children}
    </Button>
  )
}
