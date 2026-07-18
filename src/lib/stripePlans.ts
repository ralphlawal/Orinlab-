export type PlanKey = "artist" | "pro" | "label_5" | "label_10" | "label_15" | "label_20" | "label_30" | "label_40";
export type AddonKey = "addon_priority" | "addon_pitch" | "addon_video" | "addon_cover";

export interface Plan {
  key: PlanKey;
  name: string;
  priceId: string;
  amountUsd: number;
  artistsLimit: number;
  features: string[];
  highlight?: boolean;
}

export interface Addon {
  key: AddonKey;
  name: string;
  priceId: string;
  amountUsd: number;
  description: string;
}

export const PLANS: Plan[] = [
  {
    key: "artist",
    name: "Artist",
    priceId: "price_1TuVvKAQoQeWz6I9D7rvn8Iu",
    amountUsd: 19.99,
    artistsLimit: 1,
    features: [
      "1 artist",
      "Unlimited releases",
      "150+ platforms",
      "Keep 100% royalties",
      "Analytics & fan data",
      "Royalty splits",
      "Pre-save links",
      "Playlist submission tools",
      "Spotify verification support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    priceId: "price_1TuVvLAQoQeWz6I9V8EpK6wz",
    amountUsd: 59.99,
    artistsLimit: 2,
    highlight: true,
    features: [
      "Up to 2 artists",
      "Unlimited releases",
      "150+ platforms",
      "Keep 100% royalties",
      "Everything in Artist",
      "YouTube Content ID",
      "Publishing royalty collection",
      "Sync licensing opportunities",
      "Official Artist Channel support",
      "Priority support",
      "Compilation releases",
    ],
  },
  {
    key: "label_5",
    name: "Label 5",
    priceId: "price_1TuVvLAQoQeWz6I9xakbaccX",
    amountUsd: 109.99,
    artistsLimit: 5,
    features: ["Up to 5 artists", "Unlimited releases", "All Pro features", "Label management tools"],
  },
  {
    key: "label_10",
    name: "Label 10",
    priceId: "price_1TuVvMAQoQeWz6I9KjKKHNjI",
    amountUsd: 139.99,
    artistsLimit: 10,
    features: ["Up to 10 artists", "Unlimited releases", "All Pro features", "Label management tools"],
  },
  {
    key: "label_15",
    name: "Label 15",
    priceId: "price_1TuVvMAQoQeWz6I9KFTSaNcK",
    amountUsd: 179.99,
    artistsLimit: 15,
    features: ["Up to 15 artists", "Unlimited releases", "All Pro features", "Label management tools"],
  },
  {
    key: "label_20",
    name: "Label 20",
    priceId: "price_1TuVvNAQoQeWz6I9Rq7GTccM",
    amountUsd: 219.99,
    artistsLimit: 20,
    features: ["Up to 20 artists", "Unlimited releases", "All Pro features", "Label management tools"],
  },
  {
    key: "label_30",
    name: "Label 30",
    priceId: "price_1TuVvNAQoQeWz6I9JACRLb9v",
    amountUsd: 269.99,
    artistsLimit: 30,
    features: ["Up to 30 artists", "Unlimited releases", "All Pro features", "Label management tools"],
  },
  {
    key: "label_40",
    name: "Label 40",
    priceId: "price_1TuVvOAQoQeWz6I9o1Vtn0qv",
    amountUsd: 319.99,
    artistsLimit: 40,
    features: ["Up to 40 artists", "Unlimited releases", "All Pro features", "Label management tools"],
  },
];

export const ADDONS: Addon[] = [
  {
    key: "addon_priority",
    name: "Priority Distribution",
    priceId: "price_1TuVvPAQoQeWz6I9Mw6yAa7d",
    amountUsd: 14.99,
    description: "Delivered to all platforms within 3 days",
  },
  {
    key: "addon_pitch",
    name: "Playlist Pitch",
    priceId: "price_1TuVvPAQoQeWz6I9fztaAgNJ",
    amountUsd: 9.99,
    description: "Pitch your release to curated playlists",
  },
  {
    key: "addon_video",
    name: "Music Video Distribution",
    priceId: "price_1TuVvQAQoQeWz6I9b6NJ6Oho",
    amountUsd: 19.99,
    description: "Distribute your video to YouTube, Vevo & more",
  },
  {
    key: "addon_cover",
    name: "Cover Song Licence",
    priceId: "price_1TuVvQAQoQeWz6I9HA3Oufsh",
    amountUsd: 15.00,
    description: "Mechanical licence for cover song releases",
  },
];

export function getPlan(key: string): Plan | undefined {
  return PLANS.find(p => p.key === key);
}

export function planArtistsLimit(key: string | null | undefined): number {
  if (!key) return 0;
  return getPlan(key as PlanKey)?.artistsLimit ?? 0;
}

export function hasActivePlan(plan: string | null | undefined): boolean {
  return !!plan && PLANS.some(p => p.key === plan);
}
