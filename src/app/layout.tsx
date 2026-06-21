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
    default: "Orinlabí – Global Music Distribution for African Artists",
    template: "%s – Orinlabí",
  },
  description:
    "Orinlabí is an invitation-based music distribution platform for independent African artists. Selected Worldwide. Curated from Africa. Every application reviewed by our team.",
  keywords: [
    "African music distribution",
    "African music distribution platform",
    "independent artist distribution",
    "Afrobeats distribution",
    "music distribution Nigeria Ghana",
    "apply music distribution",
  ],
  openGraph: {
    title: "Orinlabí – Global Music Distribution for African Artists",
    description:
      "Selected Worldwide. Curated from Africa. Invitation-based distribution platform for independent African artists — apply and release your music to 150+ platforms worldwide.",
    siteName: "Orinlabí",
    type: "website",
    url: "https://orinlabi.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Orinlabí – Global Music Distribution for African Artists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orinlabí – Global Music Distribution for African Artists",
    description:
      "Selected Worldwide. Curated from Africa. Invitation-based distribution platform for independent African artists — every submission reviewed by our team.",
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
