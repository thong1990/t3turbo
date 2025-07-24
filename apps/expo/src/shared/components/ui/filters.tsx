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
                "flex-row flex-wrap gap-2",
                section.type === "toggle" && "flex-col gap-4"
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
                      className="flex-row items-center justify-between"
                    >
                      <Text className="font-medium">{item.label}</Text>
                      <Toggle value={isSelected} onValueChange={handlePress} />
                    </Pressable>
                  )
                }

                if (section.type === "image") {
                  return (
                    <Pressable key={item.value} onPress={handlePress}>
                      <ImageWithFallback
                        source={item.image}
                        className={cn(
                          "h-12 w-12 rounded-md border",
                          isSelected ? "border-primary" : "border-transparent"
                        )}
                      />
                    </Pressable>
                  )
                }

                return (
                  <Pressable
                    key={item.value}
                    onPress={handlePress}
                    className={cn(
                      "rounded-full border px-4 py-2",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <Text
                      className={cn(
                        "font-medium capitalize",
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
