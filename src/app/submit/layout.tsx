import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Your Music",
  description:
    "Submit your release to OrinlabÍ Records and get distributed to Spotify, Apple Music, Boomplay, TikTok, and 150+ platforms worldwide. Keep 100% of your royalties.",
  openGraph: {
    title: "Submit Your Music – OrinlabÍ Records",
    description:
      "Get distributed to 150+ platforms worldwide. Keep 100% of your royalties and own your masters.",
    url: "https://orinlabi.com/submit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit Your Music – OrinlabÍ Records",
    description:
      "Get distributed to 150+ platforms worldwide. Keep 100% of your royalties and own your masters.",
  },
  alternates: {
    canonical: "https://orinlabi.com/submit",
  },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
