import { z } from "@init/utils/schema"
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
  .string()
  .optional()
  .transform(val => val?.split(",").filter(Boolean) ?? [])

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
