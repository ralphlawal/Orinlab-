import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://orinlabi.com"),
  title: {
    default: "Orinlabí – Apply for Free Global Music Distribution",
    template: "%s – Orinlabí",
  },
  description:
    "Orinlabí is an invitation-based music distribution platform for independent African artists. Selected artists distribute to 150+ platforms worldwide for free.",
  keywords: [
    "African music distribution",
    "free music distribution Africa",
    "independent artist distribution",
    "Afrobeats distribution",
    "music distribution Nigeria Ghana",
    "apply music distribution",
  ],
  openGraph: {
    title: "Orinlabí – Free Global Music Distribution for African Artists",
    description:
      "Invitation-based distribution platform. Apply, get selected, and release your music to 150+ platforms worldwide — completely free.",
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
    title: "Orinlabí – Free Global Music Distribution for African Artists",
    description:
      "Invitation-based distribution platform. Apply and release your music to 150+ platforms — free for selected artists.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
