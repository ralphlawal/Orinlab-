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

export type SpotlightArtist = {
  name: string;
  genre: string;
  country: string;
  streams: string;
  image_url: string;
};

export type FeatureCard = {
  title: string;
  desc: string;
};

export type WhyCard = {
  title: string;
  desc: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_HERO: HeroSettings = {
  badge: "Global Music Distribution · 150+ Platforms",
  headline: "Release Your Music",
  highlight: "Worldwide.",
  subheadline:
    "Get your music on Spotify, Apple Music, TikTok, and 150+ platforms globally. Apply today — our team personally reviews every submission.",
  stats: [
    { value: "150+", label: "Platforms" },
    { value: "∞",    label: "Releases" },
    { value: "100%", label: "Ownership" },
  ],
};

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: "Temi Adeyemi",
    role: "Afrobeats Artist",
    quote:
      "Orinlabí made my global debut possible. My single was live on Spotify, Apple Music, and TikTok within 48 hours. The support team actually cares.",
  },
  {
    name: "Kwame Asante",
    role: "Music Producer",
    quote:
      "The royalty transparency and playlist promotion are top-tier. I'm hitting new markets every month without a label. I am not going anywhere else.",
  },
  {
    name: "Zara Musa",
    role: "Independent Vocalist",
    quote:
      "The release strategy team helped me plan my EP rollout from start to finish. Streams went up 400% compared to my previous release. Incredible.",
  },
];

export const DEFAULT_ARTISTS_PAGE: ArtistsPageSettings = {
  heading: "Independent artists. Global reach.",
  body: "Independent artists who are reaching the world through Orinlabí. Selected. Supported. Global.",
};

export const DEFAULT_CONTACT: ContactInfo = {
  email: "info@orinlabi.com",
  phone: "+234 811 469 1172",
  whatsapp_url: "https://wa.me/2348114691172",
  instagram: "@orinlabimusic",
  instagram_url: "https://instagram.com/orinlabimusic",
  twitter: "@orinlabimusic",
  twitter_url: "https://x.com/orinlabimusic",
  address: "Ralph Lawal Group",
  hours: "Monday – Friday, 9am – 6pm",
};

export const DEFAULT_SPOTLIGHT: SpotlightArtist[] = [
  { name: "Temi Adeyemi",  genre: "Afrobeats",  country: "Nigeria",  streams: "2.4M streams", image_url: "" },
  { name: "Kwame Asante",  genre: "Highlife",    country: "Ghana",    streams: "1.8M streams", image_url: "" },
  { name: "Zara Musa",     genre: "R&B",         country: "UK",       streams: "3.1M streams", image_url: "" },
  { name: "Amara Diallo",  genre: "Afro-soul",   country: "Senegal",  streams: "900K streams", image_url: "" },
];

export const DEFAULT_FEATURES: FeatureCard[] = [
  {
    title: "Global Distribution",
    desc: "Get your music on 150+ streaming platforms across 50+ countries including Spotify, Apple Music, Boomplay, and more.",
  },
  {
    title: "100% Ownership",
    desc: "You own your masters. Always. We distribute your music without taking your rights or intellectual property.",
  },
  {
    title: "Royalty Collection",
    desc: "Collect every dollar you earn from streams, downloads, and sync placements across all platforms.",
  },
  {
    title: "Artist Marketing",
    desc: "Dedicated marketing campaigns, playlist pitching, and press coverage to amplify your release.",
  },
  {
    title: "Playlist Promotion",
    desc: "Get your music placed on curated playlists that reach thousands of targeted listeners.",
  },
  {
    title: "Artist Development",
    desc: "Expert guidance on release strategy, brand building, and growing a sustainable music career.",
  },
];

export const DEFAULT_WHY: WhyCard[] = [
  {
    title: "Artist-First",
    desc: "Built for independent artists worldwide — everything we do starts with what's best for you, not the platform.",
  },
  {
    title: "Fast Delivery",
    desc: "Your music goes live on platforms within 24–48 hours after approval.",
  },
  {
    title: "Real-Time Analytics",
    desc: "Track your streams, earnings, and audience growth across all platforms.",
  },
  {
    title: "Curated Selection",
    desc: "Every application is reviewed by our team. We select based on sound quality and artistic vision — not follower counts.",
  },
];

export const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "How does Orinlabí distribute my music?",
    a: "You submit an application with your release details. Our team reviews it personally and if selected, we deliver your music to 150+ platforms worldwide — Spotify, Apple Music, Boomplay, Audiomack, and more.",
  },
  {
    q: "Do I keep ownership of my music?",
    a: "Absolutely. You retain 100% ownership of your masters and copyright. Orinlabí only facilitates distribution and services — your music always belongs to you.",
  },
  {
    q: "How long does it take for my music to go live?",
    a: "Most releases go live within 24–48 hours after approval. We recommend submitting at least 2 weeks before your intended release date for best results.",
  },
  {
    q: "How do I receive my royalties?",
    a: "Royalties are tracked and paid out monthly. You can view your earnings in your artist dashboard and withdraw to your preferred payment method.",
  },
  {
    q: "What genres do you support?",
    a: "We support all genres — Pop, Hip-Hop, R&B, Afrobeats, Electronic, Gospel, Rock, Indie, Latin, and more. If it's music, we can distribute it.",
  },
  {
    q: "Can I release an album or EP?",
    a: "Yes. We support singles, EPs, and full albums. Once selected, you can submit releases to us and each one goes through our standard review and distribution process.",
  },
];

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
