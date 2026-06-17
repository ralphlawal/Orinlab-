import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeroSettings = {
  badge: string;
  headline: string;
  highlight: string;
  subheadline: string;
  stats: { value: string; label: string }[];
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export type ArtistsPageSettings = {
  heading: string;
  body: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  whatsapp_url: string;
  instagram: string;
  instagram_url: string;
  twitter: string;
  twitter_url: string;
  address: string;
  hours: string;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_HERO: HeroSettings = {
  badge: "Now accepting artist applications",
  headline: "Release Your Music",
  highlight: "Worldwide.",
  subheadline:
    "Invitation-based global distribution for independent African artists. Apply, get selected, and release to 150+ platforms — completely free.",
  stats: [
    { value: "150+", label: "Platforms" },
    { value: "50+", label: "Countries" },
    { value: "100%", label: "Ownership" },
  ],
};

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: "Temi Adeyemi",
    role: "Afrobeats Artist, Lagos",
    quote:
      "Orinlabí made my global debut possible. My single was live on Spotify, Apple Music, and Boomplay within 48 hours. The support team actually cares.",
  },
  {
    name: "Kwame Asante",
    role: "Highlife Producer, Accra",
    quote:
      "Finally a distributor that understands the African market. The royalty transparency and playlist promotion are top-tier. I am not going anywhere else.",
  },
  {
    name: "Zara Musa",
    role: "Afropop Vocalist, Abuja",
    quote:
      "The release strategy team helped me plan my EP rollout from start to finish. Streams went up 400% compared to my previous release. Incredible.",
  },
];

export const DEFAULT_ARTISTS_PAGE: ArtistsPageSettings = {
  heading: "Voices of Africa.",
  body: "Independent African artists who are reaching the world through Orinlabí. Selected. Supported. Global.",
};

export const DEFAULT_CONTACT: ContactInfo = {
  email: "info@orinlabi.com",
  phone: "+234 811 469 1172",
  whatsapp_url: "https://wa.me/2348114691172",
  instagram: "@orinlabimusic",
  instagram_url: "https://instagram.com/orinlabimusic",
  twitter: "@orinlabimusic",
  twitter_url: "https://x.com/orinlabimusic",
  address: "Lagos, Nigeria · Ralph Lawal Group",
  hours: "Monday – Friday, 9am – 6pm (WAT)",
};

// ─── Fetch helper (works in both server and client components) ─────────────────

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return (data?.value as T) ?? fallback;
  } catch {
    return fallback;
  }
}
