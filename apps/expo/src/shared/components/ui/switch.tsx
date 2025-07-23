import { cn } from "@init/utils/ui"
import { Switch as RNSwitch } from "react-native"

type SwitchProps = {
  isChecked: boolean
  onCheckedChange: (isChecked: boolean) => void
  className?: string
}

export function Switch({ isChecked, onCheckedChange, className }: SwitchProps) {
  return (
    <RNSwitch
      value={isChecked}
      onValueChange={onCheckedChange}
      className={cn(className)}
      trackColor={{ false: "#767577", true: "#81b0ff" }}
      thumbColor={isChecked ? "#f5dd4b" : "#f4f3f4"}
    />
  )
}
