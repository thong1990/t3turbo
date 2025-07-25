import { z } from "zod"

/**
 * Trade filters validation schemas
 */

export interface TradeFilters {
  rarity: string[]
  elements: string[]
  cardType: string[]
  pack: string[]
}

export const tradeFiltersSchema = z.object({
  rarity: z.array(z.string()),
  elements: z.array(z.string()),
  cardType: z.array(z.string()),
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

export const tradeUrlSearchParamsSchema = z.object({
  search: z.string().optional().default(""),
  rarity: stringToArray.default([]),
  elements: stringToArray.default([]),
  cardType: stringToArray.default([]),
  pack: stringToArray.default([]),
})

export const createDefaultTradeFilters = (): TradeFilters => ({
  rarity: [],
  elements: [],
  cardType: [],
  pack: [],
})
