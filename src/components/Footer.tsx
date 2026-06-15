import Link from "next/link";
import { AtSign, Mail, MessageCircle } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Artists", href: "/artists" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const services = [
  "Music Distribution",
  "Artist Marketing",
  "Release Strategy",
  "Playlist Promotion",
  "Brand Development",
  "Graphics Design",
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#007bff] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-white font-bold text-xl">Orinlabi</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              The leading African-owned music distribution and artist services
              platform. Release. Grow. Own.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:info@orinlabi.com"
                className="w-9 h-9 bg-white/5 hover:bg-[#007bff] rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Email"
              >
                <Mail size={16} className="text-white/70" />
              </a>
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#007bff] rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} className="text-white/70" />
              </a>
              <a
                href="https://instagram.com/orinlabi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#007bff] rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Instagram"
              >
                <AtSign size={16} className="text-white/70" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Get Started
            </h4>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Ready to release your music to the world? Submit your release
              today.
            </p>
            <Link
              href="/submit"
              className="inline-block bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors duration-200"
            >
              Distribute Now
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            ℗ 2026 Orinlabi · © 2026 Orinlabi · A Ralph Lawal Group Company
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
