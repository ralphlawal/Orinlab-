"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, ArrowRight, Sparkles, ChevronDown,
  Music2, Zap, Globe2, DollarSign, BarChart3,
  Megaphone, PlayCircle, Users, FileText, BarChart2, CreditCard,
} from "lucide-react";

type DropdownItem = { icon: React.ReactNode; label: string; desc: string; href: string };
type SideLink = { label: string; href: string };
type NavDropdown = {
  section: string;
  headline: string;
  tagline: string;
  featured: DropdownItem[];
  more?: { heading: string; links: SideLink[] };
};
type NavEntry =
  | { label: string; href: string; dropdown?: undefined }
  | { label: string; href?: undefined; dropdown: NavDropdown };

const NAV: NavEntry[] = [
  {
    label: "Distribute",
    dropdown: {
      section: "01 · DISTRIBUTE",
      headline: "One upload.",
      tagline: "Endless reach.",
      featured: [
        { icon: <Music2 size={20} />, label: "Music Distribution", desc: "Get on Spotify, Apple, TikTok & 150+ stores.", href: "/services" },
        { icon: <Zap size={20} />, label: "Priority Distribution", desc: "Fast-track your release — live in under 3 days.", href: "/pricing" },
        { icon: <Globe2 size={20} />, label: "150+ Stores", desc: "Every major DSP in every territory, one upload.", href: "/services" },
      ],
      more: {
        heading: "MORE TOOLS",
        links: [
          { label: "Pre-Save Links", href: "/presave" },
          { label: "Pricing & Plans", href: "/pricing" },
          { label: "Artist Portal", href: "/portal" },
          { label: "Submit Music", href: "/submit" },
        ],
      },
    },
  },
  {
    label: "Monetize",
    dropdown: {
      section: "02 · MONETIZE",
      headline: "Every stream.",
      tagline: "Every royalty.",
      featured: [
        { icon: <DollarSign size={20} />, label: "Earnings & Royalties", desc: "Keep 100% of what you earn — we never take a cut.", href: "/portal/earnings" },
        { icon: <BarChart3 size={20} />, label: "Analytics", desc: "Track every stream, store and territory.", href: "/portal/analytics" },
        { icon: <FileText size={20} />, label: "Royalty Splits", desc: "Share earnings automatically with collaborators.", href: "/portal/earnings" },
      ],
      more: {
        heading: "MORE REVENUE TOOLS",
        links: [
          { label: "Payout Options", href: "/portal/earnings" },
          { label: "Billing & Plans", href: "/portal/billing" },
          { label: "View Pricing", href: "/pricing" },
        ],
      },
    },
  },
  {
    label: "Grow",
    dropdown: {
      section: "03 · GROW",
      headline: "Turn fans",
      tagline: "into a career.",
      featured: [
        { icon: <Megaphone size={20} />, label: "Music Promotion", desc: "Playlisting, press campaigns & social strategy.", href: "/promotion" },
        { icon: <PlayCircle size={20} />, label: "Pre-Save Links", desc: "Build hype before your release drops.", href: "/presave" },
        { icon: <Users size={20} />, label: "Playlist Pitching", desc: "Submit your music to editorial playlist curators.", href: "/portal/pitch" },
      ],
      more: {
        heading: "EXPLORE",
        links: [
          { label: "Blog & Insights", href: "/blog" },
          { label: "FAQ", href: "/faq" },
          { label: "Contact Us", href: "/contact" },
          { label: "For Labels", href: "/labels" },
        ],
      },
    },
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog",    href: "/blog" },
  { label: "About",   href: "/about" },
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
          <span className="hidden sm:inline">African music, distributed globally — plans from $19/year. Keep 100% of your royalties.</span>
          <span className="sm:hidden">Plans from $19/yr — keep 100% royalties.</span>
          <Link href="/pricing" className="ml-2 underline underline-offset-2 hover:no-underline font-bold opacity-90 hover:opacity-100">
            See plans →
          </Link>
        </p>
        <button
          onClick={onDismiss}
          className="absolute right-3 sm:right-5 text-white/60 hover:text-white transition-colors p-1 rounded"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

function DropdownPanel({ nav, onClose }: { nav: NavDropdown; onClose: () => void }) {
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[780px] max-w-[96vw] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
      style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(24px)" }}
    >
      <div className="flex">
        {/* Left: featured items */}
        <div className="flex-1 p-5">
          <p className="text-[10px] font-semibold tracking-widest text-white/25 uppercase mb-1">{nav.section}</p>
          <p className="text-white font-bold text-lg mb-4">
            {nav.headline}{" "}
            <span style={{ background: "linear-gradient(90deg,#007bff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {nav.tagline}
            </span>
          </p>
          <div className="space-y-1">
            {nav.featured.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-white/50 group-hover:text-[#007bff] transition-colors mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold group-hover:text-[#007bff] transition-colors">{item.label}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: more links */}
        {nav.more && (
          <div className="w-52 border-l border-white/[0.06] p-5 flex-shrink-0">
            <p className="text-[10px] font-semibold tracking-widest text-white/20 uppercase mb-3">{nav.more.heading}</p>
            <ul className="space-y-0.5">
              {nav.more.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="block text-sm text-white/50 hover:text-white py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-all"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <Link
                href="/portal/login"
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors group"
              >
                <CreditCard size={12} />
                Artist Login
                <ArrowRight size={11} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/portal/analytics"
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors group mt-2"
              >
                <BarChart2 size={12} />
                My Analytics
                <ArrowRight size={11} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled]         = useState(false);
  const [showBanner, setShowBanner]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!sessionStorage.getItem("orinlabi_banner_v2")) setShowBanner(true);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [pathname]);

  function dismissBanner() {
    sessionStorage.setItem("orinlabi_banner_v2", "1");
    setShowBanner(false);
  }

  function openMenu(label: string) {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setOpenDropdown(label);
  }

  function scheduleClose() {
    hideTimer.current = setTimeout(() => setOpenDropdown(null), 120);
  }

  const isActive = (entry: NavEntry): boolean => {
    if (entry.href) return pathname === entry.href || pathname.startsWith(entry.href + "/");
    return entry.dropdown!.featured.some((f) => pathname === f.href || pathname.startsWith(f.href + "/"));
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/[0.07]" : "bg-transparent"
      }`}
    >
      {showBanner && <AnnouncementBar onDismiss={dismissBanner} />}

      <nav className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 md:h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
            alt="OrinlabÍ Records" width={110} height={30} className="object-contain" priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-0.5">
          {NAV.map((entry) => {
            const active = isActive(entry);
            return (
              <li
                key={entry.label}
                className="relative"
                onMouseEnter={() => entry.dropdown && openMenu(entry.label)}
                onMouseLeave={() => entry.dropdown && scheduleClose()}
              >
                {entry.href ? (
                  <Link
                    href={entry.href}
                    className={`relative text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-150 flex items-center gap-1 ${
                      active ? "text-white bg-white/[0.07]" : "text-white/55 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {entry.label}
                    {active && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#007bff] rounded-full" />}
                  </Link>
                ) : (
                  <button
                    className={`relative text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-150 flex items-center gap-1 ${
                      active || openDropdown === entry.label
                        ? "text-white bg-white/[0.07]"
                        : "text-white/55 hover:text-white hover:bg-white/[0.05]"
                    }`}
                    onClick={() => setOpenDropdown(openDropdown === entry.label ? null : entry.label)}
                  >
                    {entry.label}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${openDropdown === entry.label ? "rotate-180" : ""}`}
                    />
                  </button>
                )}

                {/* Dropdown panel */}
                {entry.dropdown && openDropdown === entry.label && (
                  <div onMouseEnter={() => openMenu(entry.label)} onMouseLeave={scheduleClose}>
                    <DropdownPanel nav={entry.dropdown} onClose={() => setOpenDropdown(null)} />
                  </div>
                )}
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
            style={{ background: "linear-gradient(135deg, #007bff, #7c3aed)", boxShadow: "0 0 0 0 rgba(0,123,255,0)" }}
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
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-black/98 backdrop-blur-xl border-t border-white/[0.07] px-5 pb-6 pt-3">
          <ul className="space-y-0.5 mb-4">
            {NAV.map((entry) => {
              const active = isActive(entry);
              if (entry.href) {
                return (
                  <li key={entry.label}>
                    <Link
                      href={entry.href}
                      className={`flex items-center justify-between text-sm font-medium py-2.5 px-3 rounded-lg transition-all ${
                        active ? "text-white bg-white/[0.07]" : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      {entry.label}
                      {active && <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />}
                    </Link>
                  </li>
                );
              }
              const sectionOpen = mobileSection === entry.label;
              return (
                <li key={entry.label}>
                  <button
                    onClick={() => setMobileSection(sectionOpen ? null : entry.label)}
                    className={`w-full flex items-center justify-between text-sm font-medium py-2.5 px-3 rounded-lg transition-all ${
                      active ? "text-white bg-white/[0.07]" : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {entry.label}
                    <ChevronDown size={14} className={`transition-transform ${sectionOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sectionOpen && (
                    <div className="mt-1 ml-3 space-y-0.5 border-l border-white/[0.06] pl-3">
                      {entry.dropdown!.featured.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-2 text-sm text-white/50 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.04] transition-all"
                        >
                          <span className="text-white/30">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      {entry.dropdown!.more?.links.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          className="block text-xs text-white/30 hover:text-white/60 py-1.5 px-2 rounded-lg transition-colors"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
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
