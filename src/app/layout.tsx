import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://orinlabi.com"),
  title: {
    default: "Orinlabí – Global Music Distribution for Independent Artists",
    template: "%s – Orinlabí",
  },
  description:
    "Orinlabí is an invitation-based music distribution platform for independent artists. Release your music on 150+ platforms worldwide — Spotify, Apple Music, TikTok, and more. Keep 100% of your royalties.",
  keywords: [
    "music distribution",
    "independent artist distribution",
    "global music distribution",
    "distribute music online",
    "release music worldwide",
    "keep 100% royalties",
  ],
  openGraph: {
    title: "Orinlabí – Global Music Distribution for Independent Artists",
    description:
      "Release unlimited music on 150+ platforms worldwide. Keep 100% of your royalties. Every application personally reviewed by our team.",
    siteName: "Orinlabí",
    type: "website",
    url: "https://orinlabi.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Orinlabí – Global Music Distribution",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orinlabí – Global Music Distribution for Independent Artists",
    description:
      "Release unlimited music on 150+ platforms worldwide. Keep 100% of your royalties. Every submission reviewed by our team.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} h-full antialiased`}>
      <head>
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
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
