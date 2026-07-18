"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "How It Works", href: "/pricing" },
  { label: "Services",     href: "/services" },
  { label: "Artists",      href: "/artists" },
  { label: "Blog",         href: "/blog" },
  { label: "About",        href: "/about" },
];

function AnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative overflow-hidden" style={{ background: "linear-gradient(90deg, #1a56ff 0%, #7c3aed 50%, #db2777 100%)" }}>
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }}
      />
      <div className="max-w-7xl mx-auto px-10 sm:px-8 flex items-center justify-center h-9 gap-2.5 relative">
        <Sparkles size={12} className="text-white/80 flex-shrink-0" />
        <p className="text-white text-[11px] sm:text-xs font-semibold tracking-wide text-center">
          <span className="hidden sm:inline">Your first release is completely FREE — no credit card required.</span>
          <span className="sm:hidden">First release is FREE — no card needed.</span>
          <Link href="/submit" className="ml-2 underline underline-offset-2 hover:no-underline font-bold opacity-90 hover:opacity-100">
            Apply now →
          </Link>
        </p>
        <button
          onClick={onDismiss}
          className="absolute right-3 sm:right-5 text-white/60 hover:text-white transition-colors p-1 rounded"
          aria-label="Dismiss announcement"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!sessionStorage.getItem("orinlabi_banner_v1")) setShowBanner(true);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  function dismissBanner() {
    sessionStorage.setItem("orinlabi_banner_v1", "1");
    setShowBanner(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      {showBanner && <AnnouncementBar onDismiss={dismissBanner} />}

      <nav className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 md:h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
            alt="OrinlabÍ Records"
            width={110}
            height={30}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={`relative text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-150 ${
                    active
                      ? "text-white bg-white/[0.07]"
                      : "text-white/55 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#007bff] rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/portal/login"
            className="text-[13px] text-white/70 hover:text-white font-semibold px-4 py-2 rounded-lg border border-white/[0.1] hover:border-white/25 transition-all duration-150"
          >
            Artist Login
          </Link>
          <Link
            href="/pricing"
            className="relative inline-flex items-center gap-1.5 text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-200 overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #007bff, #7c3aed)",
              boxShadow: "0 0 0 0 rgba(0,123,255,0)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 22px rgba(0,123,255,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 rgba(0,123,255,0)"; }}
          >
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
            <span className="relative">Get Started</span>
            <ArrowRight size={13} className="relative group-hover:translate-x-0.5 transition-transform duration-150" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white p-2 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-black/98 backdrop-blur-xl border-t border-white/[0.07] px-5 pb-6 pt-3">
          <ul className="space-y-0.5 mb-4">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={`flex items-center justify-between text-sm font-medium py-2.5 px-3 rounded-lg transition-all ${
                      active
                        ? "text-white bg-white/[0.07]"
                        : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {l.label}
                    {active && <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.07]">
            <Link
              href="/portal/login"
              className="block text-center text-white/70 hover:text-white text-sm font-semibold px-5 py-3 rounded-full border border-white/[0.15] hover:border-white/30 transition-all"
            >
              Artist Login
            </Link>
            <Link
              href="/pricing"
              className="block text-center text-white text-sm font-bold px-5 py-3 rounded-full transition-all"
              style={{ background: "linear-gradient(135deg, #007bff, #7c3aed)" }}
            >
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
