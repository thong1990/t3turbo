import { Stack, router, useLocalSearchParams } from "expo-router"
import * as React from "react"
import { ScrollView, View } from "react-native"
import * as Haptics from "expo-haptics"

import {
  CARD_ELEMENTS,
  CARD_RARITIES,
  CARD_SETS,
  CARD_TYPES,
  ELEMENT_IMAGES,
  SET_INFO,
} from "~/features/cards/constants"
import type { CardFilters } from "~/features/cards/types"
import { cardUrlSearchParamsSchema } from "~/features/cards/validation"
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
    options: CARD_RARITIES.map(r => ({ value: r, label: r })),
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

export default function CardFiltersScreen() {
  const params = useLocalSearchParams()

  // Use URL params as source of truth
  const urlFilters = React.useMemo<Partial<CardFilters>>(() => {
    const parsed = cardUrlSearchParamsSchema.safeParse(params)
    return parsed.success ? parsed.data : {}
  }, [params])

  // Use URL params as source of truth - keeping it simple to avoid infinite loops
  const filters = urlFilters

  const handleToggle = React.useCallback((key: string, value: string) => {
    // Add haptic feedback for better UX
    Haptics.selectionAsync().catch(console.error)
    
    const filterKey = key as keyof CardFilters
    const currentValues = (filters[filterKey] as string[]) ?? []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value]

    // Update URL params for immediate UI update
    const newParams: Record<string, string | undefined> = {
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      ),
    }

    if (newValues.length > 0) {
      newParams[filterKey] = newValues.join(",")
    } else {
      newParams[filterKey] = undefined
    }

    router.setParams(newParams)
  }, [filters, params])

  const handleApply = () => {
    // Get the return path from params, default to cards page
    const returnTo = typeof params.returnTo === "string" ? params.returnTo : "/(tabs)/cards"
    
    // Prepare parameters for the target page (exclude returnTo)
    const { returnTo: _, ...targetParams } = params
    
    // Build the final parameters object
    const finalParams: Record<string, string | undefined> = {}
    
    // Add search parameter if it exists
    if (targetParams.search && typeof targetParams.search === "string") {
      finalParams.search = targetParams.search
    }
    
    // Preserve tab state to prevent jumping between tabs
    if (targetParams.tab && typeof targetParams.tab === "string") {
      finalParams.tab = targetParams.tab
    }
    
    // Add filter parameters based on current filter state
    for (const section of filterSections) {
      const key = section.key as keyof CardFilters
      const value = filters[key] as string[]
      if (value && value.length > 0) {
        finalParams[key] = value.join(",")
      } else {
        // Explicitly clear filters that have no values
        finalParams[key] = undefined
      }
    }
    
    // For create deck page, preserve selected cards by including them in params
    if (returnTo === "/(tabs)/decks/create" && targetParams.selectedCards) {
      finalParams.selectedCards = Array.isArray(targetParams.selectedCards) 
        ? targetParams.selectedCards[0] 
        : targetParams.selectedCards
    }

    // Navigate to the correct page with updated parameters
    router.replace({
      pathname: returnTo as any, // Type assertion for dynamic routes
      params: finalParams,
    })
  }

  const handleClear = () => {
    // Add haptic feedback for clear action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(console.error)
    
    // Build params object that explicitly clears all filter keys
    const newParams: Record<string, string | undefined> = {}

    // Preserve essential navigation parameters
    if (params.search && typeof params.search === "string") {
      newParams.search = params.search
    }
    if (params.returnTo && typeof params.returnTo === "string") {
      newParams.returnTo = params.returnTo
    }
    if (params.tab && typeof params.tab === "string") {
      newParams.tab = params.tab
    }

    // Explicitly clear all filter section parameters by setting to undefined
    for (const section of filterSections) {
      newParams[section.key] = undefined
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
        <Header hasBackButton title="Filter cards" />
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
