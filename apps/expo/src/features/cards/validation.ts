import { z } from "zod"
import type { CardFilters } from "./types"

/**
 * ONLY ZOD SCHEMA!
 */

export const cardFiltersSchema = z.object({
  userInteractions: z.array(z.enum(["owned", "desired", "tradable"])),
  cardType: z.array(z.string()),
  rarity: z.array(z.string()),
  elements: z.array(z.string()),
  pack: z.array(z.string()),
})

const stringToArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform(val => {
    if (Array.isArray(val)) {
      // If it's already an array, filter out empty values
      return val.filter(Boolean)
    }
    // If it's a string, split by comma and filter out empty values
    return val?.split(",").filter(Boolean) ?? []
  })

export const cardUrlSearchParamsSchema = z.object({
  search: z.string().optional().default(""),
  userInteractions: stringToArray
    .pipe(z.array(z.enum(["owned", "desired", "tradable"])))
    .default([]),
  cardType: stringToArray.default([]),
  rarity: stringToArray.default([]),
  elements: stringToArray.default([]),
  pack: stringToArray.default([]),
})

export const createDefaultFilters = (): CardFilters => ({
  userInteractions: [],
  cardType: [],
  rarity: [],
  elements: [],
  pack: [],
})
