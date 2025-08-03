import { type ImageSourcePropType, Pressable, View } from "react-native"

import { cn } from "@acme/ui"
import { ImageWithFallback } from "./image-with-fallback"
import { Text } from "./text"
import { Toggle } from "./toggle"

export type FilterItemType = "text" | "image" | "toggle"

export interface FilterItem {
  value: string
  label: string
  image?: string | ImageSourcePropType
}

export interface FilterSectionConfig {
  key: string
  title?: string
  type: FilterItemType
  options: FilterItem[]
}

export function FilterOptions({
  filters,
  onToggleItem,
  sections,
}: {
  filters: Record<string, string[] | undefined>
  onToggleItem: (key: string, value: string) => void
  sections: FilterSectionConfig[]
}) {
  return (
    <>
      {sections.map(section => (
        <View key={section.key} className="mb-6">
          {section.title && (
            <Text className="font-semibold text-foreground text-lg">
              {section.title}
            </Text>
          )}
          <View className={cn("pt-4", !section.title && "pt-0")}>
            <View
              className={cn(
                "flex-row flex-wrap",
                section.type === "toggle" ? "flex-col gap-4" : 
                section.type === "image" ? "gap-1" : "gap-2"
              )}
            >
              {section.options.map(item => {
                const isSelected =
                  filters[section.key]?.includes(item.value) || false
                const handlePress = () => onToggleItem(section.key, item.value)

                if (section.type === "toggle") {
                  return (
                    <Pressable
                      key={item.value}
                      onPress={handlePress}
                      className="flex-row items-center justify-between py-2"
                    >
                      <Text className="font-medium">{item.label}</Text>
                      <Toggle value={isSelected} onValueChange={() => {}} />
                    </Pressable>
                  )
                }

                if (section.type === "image") {
                  return (
                    <Pressable 
                      key={item.value} 
                      onPress={handlePress}
                      className={cn(
                        "h-12 w-12 rounded-full border-2",
                        isSelected ? "border-primary" : "border-border"
                      )}
                    >
                      <ImageWithFallback
                        source={item.image}
                        className="h-full w-full rounded-full"
                      />
                    </Pressable>
                  )
                }

                return (
                  <Pressable
                    key={item.value}
                    onPress={handlePress}
                    className={cn(
                      "rounded-full border px-4 py-2.5",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                    android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                  >
                    <Text
                      className={cn(
                        "font-medium capitalize text-center",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </View>
      ))}
    </>
  )
}
