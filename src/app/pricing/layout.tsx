import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music Distribution Plans & Pricing",
  description:
    "Simple, transparent pricing for global music distribution. Choose a plan that fits your releases — keep 100% of your royalties and distribute to 150+ platforms worldwide.",
  openGraph: {
    title: "Pricing – OrinlabÍ Records",
    description:
      "Simple, transparent pricing for global music distribution. Keep 100% of your royalties and distribute to 150+ platforms worldwide.",
    url: "https://orinlabi.com/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing – OrinlabÍ Records",
    description:
      "Simple, transparent pricing for global music distribution. Keep 100% of your royalties and distribute to 150+ platforms worldwide.",
  },
  alternates: {
    canonical: "https://orinlabi.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
