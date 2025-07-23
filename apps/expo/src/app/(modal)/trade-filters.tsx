import { Stack, router, useLocalSearchParams } from "expo-router"
import * as React from "react"
import { ScrollView, View } from "react-native"

import {
  CARD_ELEMENTS,
  CARD_SETS,
  CARD_TYPES,
  ELEMENT_IMAGES,
  SET_INFO,
} from "~/features/cards/constants"
import { TRADEABLE_RARITIES } from "~/features/trades/types"
import type { TradeFilters } from "~/features/trades/validation"
import { tradeUrlSearchParamsSchema } from "~/features/trades/validation"
import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import { Badge } from "~/shared/components/ui/badge"
import { Button } from "~/shared/components/ui/button"
import {
  FilterOptions,
  type FilterSectionConfig,
} from "~/shared/components/ui/filters"
import { Text } from "~/shared/components/ui/text"

const filterSections: FilterSectionConfig[] = [
  {
    key: "rarity",
    title: "Rarity",
    type: "text",
    options: TRADEABLE_RARITIES.map(r => ({ value: r, label: r })),
  },
  {
    key: "elements",
    title: "Element",
    type: "image",
    options: CARD_ELEMENTS.map(e => ({
      value: e,
      label: e,
      image: ELEMENT_IMAGES[e],
    })),
  },
  {
    key: "cardType",
    title: "Card Type",
    type: "text",
    options: CARD_TYPES.map(t => ({ value: t, label: t })),
  },
  {
    key: "pack",
    title: "Set",
    type: "text",
    options: CARD_SETS.map(s => ({
      value: s,
      label: SET_INFO[s]?.displayName ?? s,
    })),
  },
]

export default function TradeFiltersScreen() {
  const params = useLocalSearchParams()

  // Use URL params as source of truth instead of useState
  const filters = React.useMemo<Partial<TradeFilters>>(() => {
    const parsed = tradeUrlSearchParamsSchema.safeParse(params)
    return parsed.success ? parsed.data : {}
  }, [params])

  const handleToggle = (key: string, value: string) => {
    const filterKey = key as keyof TradeFilters
    const currentValues = (filters[filterKey] as string[]) ?? []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value]

    // Update URL params directly
    const newParams: Record<string, string | undefined> = {
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      ),
    }

    if (newValues.length > 0) {
      newParams[filterKey] = newValues.join(",")
    } else {
      delete newParams[filterKey]
    }

    router.setParams(newParams)
  }

  const handleApply = () => {
    const newParams: Record<string, string | undefined> = {}

    if (params.search && typeof params.search === "string") {
      newParams.search = params.search
    }

    for (const section of filterSections) {
      const key = section.key as keyof TradeFilters
      const value = filters[key] as string[]
      if (value && value.length > 0) {
        newParams[key] = value.join(",")
      }
    }

    router.replace({
      pathname: "/(tabs)/trade",
      params: newParams,
    })
  }

  const handleClear = () => {
    // Clear all filter params from URL
    const newParams: Record<string, string | undefined> = {}

    if (params.search && typeof params.search === "string") {
      newParams.search = params.search
    }

    router.setParams(newParams)
  }

  const selectedCount = Object.values(filters).reduce(
    (acc: number, val) => acc + ((val as string[])?.length ?? 0),
    0
  )

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Container>
        <Header hasBackButton title="Filter trades" />
        <ScrollView>
          <View className="flex-1 p-4">
            <FilterOptions
              sections={filterSections}
              filters={filters}
              onToggleItem={handleToggle}
            />
          </View>
        </ScrollView>

        <View className="flex-row gap-2 border-border border-t p-4">
          <Button variant="outline" className="flex-1" onPress={handleClear}>
            <Text>Clear</Text>
          </Button>
          <Button className="flex-1 flex-row gap-2" onPress={handleApply}>
            <Text>Apply Filters</Text>
            {selectedCount > 0 && (
              <Badge variant="secondary">
                <Text>{selectedCount}</Text>
              </Badge>
            )}
          </Button>
        </View>
      </Container>
    </>
  )
}
