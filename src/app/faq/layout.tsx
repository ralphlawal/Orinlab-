import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to the most common questions about OrinlabÍ Records — music distribution, royalties, platform delivery timelines, ISRC codes, and more.",
  openGraph: {
    title: "FAQ – OrinlabÍ Records",
    description:
      "Answers to the most common questions about OrinlabÍ Records — distribution, royalties, platform timelines, ISRC codes, and more.",
    url: "https://orinlabi.com/faq",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ – OrinlabÍ Records",
    description:
      "Answers to the most common questions about OrinlabÍ Records — distribution, royalties, platform timelines, ISRC codes, and more.",
  },
  alternates: {
    canonical: "https://orinlabi.com/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
