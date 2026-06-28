"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Distribute", href: "/pricing" },
  { label: "Monetize",   href: "/pricing" },
  { label: "Grow",       href: "/services" },
  { label: "Pricing",    href: "/pricing" },
  { label: "Artists",    href: "/artists" },
  { label: "Blog",       href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 md:h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
            alt="Orinlabí"
            width={110}
            height={30}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-[13px] text-white/60 hover:text-white font-medium px-3.5 py-2 rounded-lg hover:bg-white/[0.05] transition-all duration-150"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/portal/login"
            className="text-[13px] text-white/60 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,123,255,0.4)] group"
          >
            Try For Free
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-screen" : "max-h-0"}`}>
        <div className="bg-black/98 border-t border-white/[0.07] px-5 pb-6 pt-3">
          <ul className="space-y-0.5 mb-4">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="block text-white/70 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/[0.05] transition-all"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.07]">
            <Link
              href="/portal/login"
              className="block text-center text-white/70 hover:text-white text-sm font-medium px-5 py-3 rounded-full border border-white/[0.12] hover:border-white/30 transition-all"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/submit"
              className="block text-center bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-bold px-5 py-3 rounded-full transition-all"
              onClick={() => setOpen(false)}
            >
              Try For Free →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
