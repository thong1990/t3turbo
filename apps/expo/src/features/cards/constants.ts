import type { ImageSourcePropType } from "react-native"

// Card classification options
export const CARD_TYPES = ["Pokemon", "Item", "Supporter", "Tool"] as const

export const CARD_MECHANICS = ["EX"] as const

export const CARD_STAGES = ["Basic", "Stage 1", "Stage 2"] as const

export const CARD_SETS = ["A1", "A1a", "A2", "A2a", "A2b", "P-A"] as const

export const CARD_RARITIES = [
  "◊",
  "◊◊",
  "◊◊◊",
  "◊◊◊◊",
  "☆",
  "☆☆",
  "☆☆☆",
  "Crown Rare",
  "Promo",
] as const

// Rarities eligible for Give/Want functionality
export const ELIGIBLE_GIVE_WANT_RARITIES = [
  "◊", // 1 diamond
  "◊◊", // 2 diamond
  "◊◊◊", // 3 diamond
  "◊◊◊◊", // 4 diamond
  "☆", // 1 star
] as const

export const CARD_ART_STYLES = [
  "Illustration Art",
  "Special Illustration Art",
  "Full Art",
  "Immersive Art",
  "Shiny",
  "Shiny Full Art",
]

// Elements used for filtering and image mapping (match lowercase asset filenames)
export const CARD_ELEMENTS = [
  "grass",
  "fire",
  "water",
  "lightning",
  "psychic",
  "fighting",
  "darkness",
  "metal",
  "dragon",
  "colorless",
  // Add "water", "fairy", etc. if needed
] as const

// Energy element image map
export const ELEMENT_IMAGES: Record<
  (typeof CARD_ELEMENTS)[number],
  ImageSourcePropType
> = {
  grass: require("~/features/cards/assets/energy/grass.png"),
  fire: require("~/features/cards/assets/energy/fire.png"),
  water: require("~/features/cards/assets/energy/water.png"),
  lightning: require("~/features/cards/assets/energy/lightning.png"),
  psychic: require("~/features/cards/assets/energy/psychic.png"),
  fighting: require("~/features/cards/assets/energy/fighting.png"),
  darkness: require("~/features/cards/assets/energy/darkness.png"),
  metal: require("~/features/cards/assets/energy/metal.png"),
  dragon: require("~/features/cards/assets/energy/dragon.png"),
  colorless: require("~/features/cards/assets/energy/colorless.png"),
}

export type SetCode = (typeof CARD_SETS)[number]

export interface SetInfo {
  displayName: string
  image: ImageSourcePropType
}

export const SET_INFO: Record<SetCode, SetInfo> = {
  A2b: {
    displayName: "Shining Revelry",
    image: require("~/features/cards/assets/sets/a2b.png"),
  },
  A2a: {
    displayName: "Triumphant Light",
    image: require("~/features/cards/assets/sets/a2a.png"),
  },
  A2: {
    displayName: "Space-Time Smackdown",
    image: require("~/features/cards/assets/sets/a2.png"),
  },
  A1a: {
    displayName: "Mythical Island",
    image: require("~/features/cards/assets/sets/a1a.png"),
  },
  A1: {
    displayName: "Genetic Apex",
    image: require("~/features/cards/assets/sets/a1.png"),
  },
  "P-A": {
    displayName: "Promo-A",
    image: require("~/features/cards/assets/sets/p-a.png"),
  },
}

export type CARD_FILTERS = {
  name: string
  cardType: string[]
  rarity: string[]
  elements: string[]
  pack: string[]
}

// Deck constants
export const DECK_CONSTANTS = {
  MAX_CARDS: 20,
  MAX_COPIES: 2,
} as const
