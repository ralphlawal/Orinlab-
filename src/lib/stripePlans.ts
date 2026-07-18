export type PlanKey = "artist" | "pro" | "label_5" | "label_10" | "label_15" | "label_20" | "label_30" | "label_40";
export type AddonKey = "addon_priority" | "addon_pitch" | "addon_video" | "addon_cover" | "addon_publishing";

export interface Plan {
  key: PlanKey;
  name: string;
  priceId: string;
  amountNgn: number;
  artistsLimit: number;
  features: string[];
  highlight?: boolean;
}

export interface Addon {
  key: AddonKey;
  name: string;
  priceId: string;
  amountNgn: number;
  description: string;
}

export const PLANS: Plan[] = [
  {
    key: "artist",
    name: "Starter",
    priceId: "price_1TuVvKAQoQeWz6I9D7rvn8Iu",
    amountNgn: 29900,
    artistsLimit: 1,
    features: [
      "1 artist",
      "Unlimited releases",
      "150+ platforms",
      "100% streaming royalties",
      "Pre-save SmartLinks",
      "Analytics & fan data",
      "Auto-split royalties",
      "Playlist submission tools",
      "Instant Spotify verification",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    priceId: "price_1TuVvLAQoQeWz6I9V8EpK6wz",
    amountNgn: 89900,
    artistsLimit: 2,
    highlight: true,
    features: [
      "Up to 2 artists",
      "Unlimited releases",
      "150+ platforms",
      "100% streaming royalties",
      "Everything in Starter",
      "Sync licensing pitching",
      "Publishing royalty collection",
      "YouTube Content ID & OAC",
      "Exact release times",
      "Release Protection",
      "Priority support",
      "Compilation releases",
    ],
  },
  {
    key: "label_5",
    name: "Label 5",
    priceId: "price_1TuVvLAQoQeWz6I9xakbaccX",
    amountNgn: 169900,
    artistsLimit: 5,
    features: [
      "Up to 5 artists",
      "Unlimited releases for all artists",
      "Everything in Pro",
      "Label management dashboard",
      "Release Protection",
    ],
  },
  {
    key: "label_10",
    name: "Label 10",
    priceId: "price_1TuVvMAQoQeWz6I9KjKKHNjI",
    amountNgn: 219900,
    artistsLimit: 10,
    features: [
      "Up to 10 artists",
      "Unlimited releases for all artists",
      "Everything in Pro",
      "Label management dashboard",
      "Release Protection",
    ],
  },
  {
    key: "label_15",
    name: "Label 15",
    priceId: "price_1TuVvMAQoQeWz6I9KFTSaNcK",
    amountNgn: 279900,
    artistsLimit: 15,
    features: [
      "Up to 15 artists",
      "Unlimited releases for all artists",
      "Everything in Pro",
      "Label management dashboard",
      "Release Protection",
    ],
  },
  {
    key: "label_20",
    name: "Label 20",
    priceId: "price_1TuVvNAQoQeWz6I9Rq7GTccM",
    amountNgn: 349900,
    artistsLimit: 20,
    features: [
      "Up to 20 artists",
      "Unlimited releases for all artists",
      "Everything in Pro",
      "Label management dashboard",
      "Release Protection",
    ],
  },
  {
    key: "label_30",
    name: "Label 30",
    priceId: "price_1TuVvNAQoQeWz6I9JACRLb9v",
    amountNgn: 429900,
    artistsLimit: 30,
    features: [
      "Up to 30 artists",
      "Unlimited releases for all artists",
      "Everything in Pro",
      "Label management dashboard",
      "Release Protection",
    ],
  },
  {
    key: "label_40",
    name: "Label 40",
    priceId: "price_1TuVvOAQoQeWz6I9o1Vtn0qv",
    amountNgn: 509900,
    artistsLimit: 40,
    features: [
      "Up to 40 artists",
      "Unlimited releases for all artists",
      "Everything in Pro",
      "Label management dashboard",
      "Release Protection",
    ],
  },
];

export const ADDONS: Addon[] = [
  {
    key: "addon_priority",
    name: "Expedited Release",
    priceId: "price_1TuVvPAQoQeWz6I9Mw6yAa7d",
    amountNgn: 95000,
    description: "Delivered to all platforms within 3 days (instead of 2+ weeks)",
  },
  {
    key: "addon_publishing",
    name: "Music Publishing",
    priceId: "price_publishing_placeholder",
    amountNgn: 59900,
    description: "Publishing royalty collection — Starter plan add-on, billed annually",
  },
  {
    key: "addon_pitch",
    name: "Playlist Pitch",
    priceId: "price_1TuVvPAQoQeWz6I9fztaAgNJ",
    amountNgn: 14900,
    description: "Pitch your release to curated playlists",
  },
  {
    key: "addon_video",
    name: "Music Video Distribution",
    priceId: "price_1TuVvQAQoQeWz6I9b6NJ6Oho",
    amountNgn: 29900,
    description: "Distribute your video to YouTube, Vevo & more",
  },
  {
    key: "addon_cover",
    name: "Cover Song Licence",
    priceId: "price_1TuVvQAQoQeWz6I9HA3Oufsh",
    amountNgn: 22900,
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
