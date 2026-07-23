import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the OrinlabÍ Records team. We're here to help with distribution questions, support, and partnership inquiries.",
  openGraph: {
    title: "Contact OrinlabÍ Records",
    description:
      "Get in touch with our team for distribution questions, support, and partnership inquiries.",
    url: "https://orinlabi.com/contact",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact OrinlabÍ Records",
    description:
      "Get in touch with our team for distribution questions, support, and partnership inquiries.",
  },
  alternates: {
    canonical: "https://orinlabi.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
