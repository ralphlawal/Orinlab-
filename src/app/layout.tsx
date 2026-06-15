import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Orinlabí – Release Your Music Worldwide",
  description:
    "Global music distribution and artist services built for independent African artists. Release. Grow. Own.",
  keywords: [
    "African music distribution",
    "music distribution Africa",
    "release music worldwide",
    "independent artist distribution",
    "music marketing services",
  ],
  openGraph: {
    title: "Orinlabí – Release Your Music Worldwide",
    description:
      "Global music distribution and artist services built for independent African artists.",
    siteName: "Orinlabí",
    type: "website",
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
      </body>
    </html>
  );
}
