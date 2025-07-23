export type OnboardingItem = {
  id: number
  title: string
  description: string
  image: string
}

export const ONBOARDING_ITEMS: OnboardingItem[] = [
  {
    id: 1,
    title: "Trade Cards With Real Players",
    description:
      "Post your cards, find matches, and complete trades with nearby or remote collectors.",
    image: require("~/features/onboarding/assets/unnamed.png"),
  },
  {
    id: 2,
    title: "Discover & Search Cards Easily",
    description:
      "Explore the full database of Pocket cards. Filter by rarity, set, element, or keyword.",
    image: require("~/features/onboarding/assets/unnamed.png"),
  },
  {
    id: 3,
    title: "Built-in Chat for Every Trade",
    description:
      "Every trade has a dedicated chat so you can negotiate, confirm, and stay updated.",
    image: require("~/features/onboarding/assets/unnamed.png"),
  },
  {
    id: 4,
    title: "See What Decks Are Trending",
    description:
      "Browse trending, pro-level, or custom decks. Save your favorites or build your own.",
    image: require("~/features/onboarding/assets/unnamed.png"),
  },
  {
    id: 5,
    title: "Ready to Join the Trade?",
    description: "Create your profile and start trading your cards today.",
    image: require("~/features/onboarding/assets/unnamed.png"),
  },
]
