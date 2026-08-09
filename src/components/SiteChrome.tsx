"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";
import GlobalTilt from "./GlobalTilt";
import { SpotifyPreviewDrawer } from "./SpotifyPreviewDrawer";

// Routes that should render with no navbar, footer, or banners
const STANDALONE_PREFIXES = ["/presave/", "/listen/"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isStandalone = STANDALONE_PREFIXES.some((p) => pathname.startsWith(p));

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <>
      <GlobalTilt />
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
      <SpotifyPreviewDrawer />
    </>
  );
}
