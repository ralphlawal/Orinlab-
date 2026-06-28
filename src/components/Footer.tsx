import Link from "next/link";
import Image from "next/image";
import { AtSign, Mail, MessageCircle, X } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

const GET_STARTED = [
  { label: "Apply for Distribution", href: "/submit" },
  { label: "How It Works",           href: "/pricing" },
  { label: "Artist Portal",          href: "/portal" },
  { label: "Label Portal",           href: "/labels/portal" },
  { label: "Check Status",           href: "/status" },
  { label: "Support",                href: "/contact" },
];

const FEATURES = [
  { label: "Music Distribution",  href: "/pricing" },
  { label: "Pre-Save Links",      href: "/submit" },
  { label: "Smart Links",         href: "/submit" },
  { label: "Royalty Tracking",    href: "/pricing" },
  { label: "Playlist Pitching",   href: "/services" },
  { label: "Artist Marketing",    href: "/services" },
];

const COMPANY = [
  { label: "About",   href: "/about" },
  { label: "Artists", href: "/artists" },
  { label: "Labels",  href: "/labels" },
  { label: "Blog",    href: "/blog" },
  { label: "FAQ",     href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.07] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex mb-5">
              <Image
                src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
                alt="Orinlabí"
                width={110}
                height={30}
                className="object-contain"
              />
            </Link>
            <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
              Orinlabí is the home of independent artists. Distribute, monetize and grow your music. Keep everything you earn and stay independent.
            </p>
            <div className="flex items-center gap-2.5 mb-8">
              {[
                { href: "mailto:info@orinlabi.com", icon: <Mail size={15} />, label: "Email" },
                { href: "https://wa.me/2348114691172", icon: <MessageCircle size={15} />, label: "WhatsApp" },
                { href: "https://instagram.com/orinlabimusic", icon: <AtSign size={15} />, label: "Instagram" },
                { href: "https://x.com/orinlabimusic", icon: <X size={15} />, label: "X" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  className="w-8 h-8 bg-white/[0.05] hover:bg-[#007bff] rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="text-white/25 text-xs mb-2">Get weekly music industry insights:</p>
            <NewsletterForm compact />
          </div>

          {/* Get Started */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">Get Started</h4>
            <ul className="space-y-3">
              {GET_STARTED.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/45 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">Features</h4>
            <ul className="space-y-3">
              {FEATURES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/45 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">Company</h4>
            <ul className="space-y-3">
              {COMPANY.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/45 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.07] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © 2026 Orinlabí · A{" "}
            <a href="https://ralphlawalgroup.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">
              Ralph Lawal Group
            </a>{" "}
            Company. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/25 hover:text-white/60 text-xs transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="text-white/25 hover:text-white/60 text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
