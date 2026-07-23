import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://orinlabi.com"),
  title: {
    default: "OrinlabÍ Records – Global Music Distribution for Independent Artists",
    template: "%s – OrinlabÍ Records",
  },
  description:
    "OrinlabÍ Records is a music distribution platform for independent artists. Submit your music and get approved to release on 150+ platforms worldwide — Spotify, Apple Music, Boomplay, TikTok, and more. Keep ownership of your masters.",
  keywords: [
    "music distribution",
    "independent artist distribution",
    "global music distribution",
    "distribute music online",
    "release music worldwide",
    "african music distribution",
    "afrobeats distribution",
  ],
  openGraph: {
    title: "OrinlabÍ Records – Global Music Distribution for Independent Artists",
    description:
      "Distribute your music to 150+ platforms worldwide. Keep 100% of your royalties, own your masters, and reach fans everywhere.",
    siteName: "OrinlabÍ Records",
    type: "website",
    url: "https://orinlabi.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrinlabÍ Records – Global Music Distribution for Independent Artists",
    description:
      "Submit your music and get approved to release on 150+ platforms worldwide. Keep ownership of your masters.",
  },
};

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OrinlabÍ Records",
  url: "https://orinlabi.com",
  logo: "https://orinlabi.com/icon.png",
  sameAs: [],
  description:
    "OrinlabÍ Records is a global music distribution platform for independent artists. Distribute to 150+ platforms worldwide — Spotify, Apple Music, Boomplay, TikTok, and more.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "info@orinlabi.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4ZMQXJ9ESE"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4ZMQXJ9ESE');
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col bg-black text-white overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#007bff] focus:text-white focus:font-semibold focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:outline-none"
        >
          Skip to content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
